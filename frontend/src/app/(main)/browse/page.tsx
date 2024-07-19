"use client";

import Link from "next/link";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as R from "remeda";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stack } from "@/components/ui/stack";
import { H2 } from "@/components/ui/typography";
import VirtualList, { VirtualListRef } from "@/components/VirtualList";
import useQueryCached from "@/hooks/useQueryCached";
import {
  BrowserStoreContext,
  Chromosome,
  Feature,
  FeatureWithIndex,
  Sequence,
} from "@/stores/BrowserStore";

import { itemLength, pxPerBp, seqLength } from "./config";
import Item from "./Item";

/**
 * Get sequence and feature data in chunks from the database
 */
const useDataHook = (index: number, count: number, chromosome?: Chromosome) => {
  // get sequences in this chunk
  const data = useQueryCached(
    chromosome ? `/q?i=${index}&s=${count}&seqid=${chromosome?.seqid}` : null,
    `select * from sequences where seqid='${chromosome?.seqid}' limit ${count} offset ${index}`
  ) as Sequence[] | undefined;

  // get all features in this chunk
  const features = useQueryCached(
    chromosome
      ? `/features?i=${index}&s=${count}&seqid=${chromosome.seqid}`
      : null,
    `select * from features where seqid='${chromosome?.seqid}' and start <= ${
      (index + count) * seqLength
    } and end >= ${index * seqLength}`
  ) as Feature[] | undefined;

  // the vertical index of the features should be consistent, so we need to set
  // it up here
  const featuresWithIndex = features?.map((f, i) => ({
    ...f,
    index: i,
  }));

  const items = data
    ? data.map((s) => ({
        sequence: s,
        features:
          featuresWithIndex?.filter(
            (f: any) => f.start < s.start + seqLength && f.end > s.start
          ) ?? [],
      }))
    : [];
  return items;
};

export default function Browse() {
  // Load the browser store
  const browserStore = useContext(BrowserStoreContext);
  const chromosome =
    browserStore.state.chromosomes?.[
      browserStore.state.selectedChromosomeSeqId ?? ""
    ];
  const scale =
    browserStore.state.chromosomes?.[chromosome?.seqid ?? ""]?.scale ?? 1;
  const location =
    browserStore.state.chromosomes?.[chromosome?.seqid ?? ""]?.location ?? 0;

  // managed location string for the input
  const [locationInput, setLocationInput] = useState("");
  const virtualListRef = useRef<VirtualListRef>(null);

  // chromosome list
  const chromosomeResult = useQueryCached(
    "/features?unique=seqid",
    "select seqid, attributes from features group by seqid having min(rowid) order by rowid",
    (row: any) => {
      row["refSeqId"] = row["seqid"];
      row["chromosomeNumber"] = Number(
        JSON.parse(row["attributes"])["chromosome"]
      );
      delete row["attributes"];
      return row;
    }
  ) as Chromosome[] | undefined;

  const sequenceCountResult = useQueryCached(
    chromosome ? `/sequenceCount?seqId=${chromosome.seqid}` : null,
    `select count(*) as count from sequences where seqid = '${chromosome?.seqid}'`
  ) as { count: number }[] | undefined;
  const sequenceCount = R.pathOr(sequenceCountResult, [0, "count"], 0);

  // --------
  // Handlers
  // --------

  const handleChromosomeChange = useCallback(
    (seqid: string) => {
      browserStore.dispatch({
        chromosomes: browserStore.state.chromosomes,
        selectedChromosomeSeqId: seqid,
      });
    },
    [browserStore]
  );

  /**
   * to avoid a circular dependency, we need to dispatch the location change
   * only when the user scrolls
   */
  const handleLocationChanged = (location: number) => {
    const currentChromosomes = browserStore.state.chromosomes;
    if (chromosome && currentChromosomes) {
      browserStore.dispatch({
        chromosomes: {
          ...currentChromosomes,
          [chromosome?.seqid]: {
            ...currentChromosomes[chromosome?.seqid],
            location,
          },
        },
      });
    }
  };

  const onUserScroll = (index: number) => {
    handleLocationChanged(index * seqLength);
  };

  const handleScaleChanged = (newScale: number) => {
    const currentChromosomes = browserStore.state.chromosomes;
    if (chromosome && currentChromosomes) {
      browserStore.dispatch({
        chromosomes: {
          ...currentChromosomes,
          [chromosome?.seqid]: {
            ...currentChromosomes[chromosome?.seqid],
            scale: newScale,
          },
        },
      });
    }
  };

  // Scroll to the new location. The VirtualList will be responsible for setting
  // `location` in a callback
  const handleScrollToLocation = () => {
    const locationNumber = parseInt(locationInput, 10);
    if (
      isNaN(locationNumber) ||
      locationNumber < 0 ||
      locationNumber >= sequenceCount * seqLength
    ) {
      // TODO switch to a toast
      alert("Please enter a valid location within the chromosome range.");
      return;
    }
    const index = locationNumber / seqLength;
    if (virtualListRef.current) {
      virtualListRef.current.scrollToItem(index);
    }
  };

  const handleZoomIn = () => {
    handleScaleChanged(scale * 2);
  };

  const handleZoomOut = () => {
    handleScaleChanged(scale / 2);
  };

  const handleReset = () => {
    handleScaleChanged(1);
  };

  // ------------
  // Side Effects
  // ------------

  // initialize the browser store, only once
  useEffect(() => {
    if (chromosomeResult && !browserStore.state.chromosomes) {
      browserStore.dispatch({
        chromosomes: R.mapToObj(chromosomeResult, (c) => [
          c.seqid,
          { ...c, location: 0, scale: 1 },
        ]),
      });
    }
  }, [browserStore, chromosomeResult]);

  // initialize the first chromosome
  useEffect(() => {
    const firstChromosome = chromosomeResult?.[0];
    const selectedChromosomeSeqId = browserStore.state.selectedChromosomeSeqId;
    if (firstChromosome && !selectedChromosomeSeqId) {
      handleChromosomeChange(firstChromosome.seqid);
    }
  }, [browserStore, chromosomeResult, handleChromosomeChange]);

  // scroll to location after the view loads or the chromosome is set
  useEffect(() => {
    if (chromosome && location !== undefined && virtualListRef.current) {
      virtualListRef.current.scrollToItem(location / seqLength);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (chromosome && location !== undefined && virtualListRef.current) {
      virtualListRef.current.scrollToItem(location / seqLength);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromosome?.seqid]);

  // ---------------
  // Computed values
  // ---------------

  const itemWidthScaled = itemLength * scale;

  const ItemLoader = ({
    index,
    count,
    children,
  }: {
    index: number;
    count: number;
    children: (items: any) => ReactNode;
  }) => {
    const items = useDataHook(index, count, chromosome);
    return <>{children(items)}</>;
  };

  return (
    <Container>
      <Button asChild variant="outline">
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H2>Plasmodium falciparum (Malaria) Genome</H2>

      <Select
        value={chromosome?.seqid}
        onValueChange={(value) => {
          const selected = chromosomeResult?.find((c) => c.seqid === value);
          if (selected) handleChromosomeChange(selected.seqid);
        }}
      >
        <SelectTrigger className="w-[200px] mb-4">
          <SelectValue placeholder="Select Chromosome" />
        </SelectTrigger>
        <SelectContent>
          {chromosomeResult?.map((c) => (
            <SelectItem key={c.seqid} value={c.seqid}>
              Chromosome {c.chromosomeNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div>Chromosome Number: {chromosome?.chromosomeNumber}</div>
      <div>
        Chromosome RefSeq ID:{" "}
        <Button variant="link" asChild className="p-1">
          <Link
            href={`https://www.ncbi.nlm.nih.gov/nuccore/${chromosome?.refSeqId}/`}
            target="_blank"
          >
            {chromosome?.refSeqId}
          </Link>
        </Button>
      </div>
      <div className="mb-6">
        Length: {((sequenceCount * seqLength) / 1e6).toFixed(3)} Mb
      </div>

      <Stack
        gap={6}
        direction="row"
        className="mb-6"
        wrap
        justifyContent="start"
      >
        <Stack gap={2} direction="row">
          <Button size="sm" onClick={handleZoomIn}>
            Zoom In
          </Button>
          <Button size="sm" onClick={handleZoomOut}>
            Zoom Out
          </Button>
          <Button size="sm" onClick={handleReset} className="mr-6">
            Reset
          </Button>
        </Stack>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScrollToLocation();
          }}
        >
          <Stack gap={2} direction="row">
            <Input
              type="number"
              placeholder="Enter location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-40"
            />
            <Button size="sm" type="submit">
              Go to Location
            </Button>
          </Stack>
        </form>
      </Stack>

      <VirtualList
        ref={virtualListRef}
        count={sequenceCount}
        height={200}
        itemWidth={itemWidthScaled}
        Item={Item}
        ItemLoader={ItemLoader}
        itemConfig={{ scale }}
        onUserScroll={onUserScroll}
      />
    </Container>
  );
}

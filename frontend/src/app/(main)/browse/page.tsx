"use client";

import Link from "next/link";
import React, {
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
import { bpPerItemUnscaled, itemWidthPx, seqSize } from "@/lib/browserConfig";
import { BrowserStoreContext, Chromosome } from "@/stores/BrowserStore";

import Item from "./Item";
import ItemLoader from "./ItemLoader";

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

  // total items should be greater than require items
  // TODO set a min scale value
  const bpPerItem = bpPerItemUnscaled / scale;
  const minItems = (sequenceCount * seqSize) / bpPerItem;
  const itemCount = Math.ceil(minItems);

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
    handleLocationChanged(index * seqSize);
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
      locationNumber >= sequenceCount * seqSize
    ) {
      // TODO switch to a toast
      alert("Please enter a valid location within the chromosome range.");
      return;
    }
    const index = locationNumber / bpPerItem;
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
      virtualListRef.current.scrollToItem(location / seqSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (chromosome && location !== undefined && virtualListRef.current) {
      virtualListRef.current.scrollToItem(location / seqSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromosome?.seqid]);

  // ---------------
  // Computed values
  // ---------------

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
        Length: {((sequenceCount * seqSize) / 1e6).toFixed(3)} Mb
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
        itemCount={itemCount}
        height={200}
        itemWidth={itemWidthPx}
        Item={Item}
        ItemLoader={ItemLoader}
        itemConfig={{ scale, chromosome }}
        onUserScroll={onUserScroll}
      />
    </Container>
  );
}

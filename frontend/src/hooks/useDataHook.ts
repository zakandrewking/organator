import * as R from "remeda";

import { bpPerItemUnscaled, seqSize } from "@/lib/browserConfig";
import { Chromosome, Feature, Sequence } from "@/stores/BrowserStore";

import useQueryCached from "./useQueryCached";

function chunkSubstr(str: string, size: number) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substring(o, o + size);
  }

  return chunks;
}

/**
 * Get sequence and feature data in chunks from the database
 */
export default function useDataHook(
  index: number,
  count: number,
  scale?: number,
  chromosome?: Chromosome
) {
  const bpPerItem = bpPerItemUnscaled / (scale ?? 1);
  const startBp = index * bpPerItem; // 0-indexed
  const endBp = (index + count) * bpPerItem - 1; // 0-indexed

  // get sequences in this chunk
  const offset = Math.floor(startBp / seqSize);
  const limit = Math.ceil((count * bpPerItem) / seqSize) + 1;
  const data = useQueryCached(
    chromosome && scale
      ? `/sequences?offset=${offset}&limit=${limit}&seqid=${chromosome?.seqid}`
      : null,
    `select * from sequences where seqid='${chromosome?.seqid}' limit ${limit} offset ${offset}`
  ) as Sequence[] | undefined;
  const firstStart = (data?.[0].start ?? 1) - 1; // 0-indexed
  const lastEnd = (data?.[data.length - 1].start ?? 1) + seqSize - 2; // 0-indexed

  // get all features in this chunk
  const start = startBp + 1; // 1-indexed
  const end = endBp + 1; // 1-indexed
  const features = useQueryCached(
    chromosome && scale
      ? `/features?start=${start}&end=${end}&seqid=${chromosome.seqid}`
      : null,
    `select * from features where seqid='${chromosome?.seqid}' and start <= ${end} and end >= ${start}`
  ) as Feature[] | undefined;

  // the vertical index of the features should be consistent, so we need to set
  // it up here
  const featuresWithIndex = features?.map((f, i) => ({
    ...f,
    vertical: i, // 0-indexed
  }));

  // we needs a ternary operator because Remeda cannot do the type narrowing
  // here
  const allSeq = data ? R.map(data, (s) => s.seq).join("") : "";
  const allSeqSliced = allSeq.slice(
    startBp - firstStart,
    allSeq.length - (lastEnd - endBp)
  );

  //   TODO we need to splice the items into the correct size too
  const items = chunkSubstr(allSeqSliced, bpPerItem).map((seq, i) => ({
    seq,
    seqid: chromosome?.seqid,
    start: start + i * bpPerItem, // 1-indexed
  }));

  const itemsWithFeatures = items.map((s) => ({
    sequence: s,
    features:
      featuresWithIndex?.filter(
        (f: any) => f.start <= s.start + seqSize && f.end >= s.start
      ) ?? [],
  }));

  return itemsWithFeatures;
}

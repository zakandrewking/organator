"use client";

import { createContext, ReactNode, useReducer } from "react";

/**
 * Persist browser location & zoom across chromosomes
 */

export interface Chromosome {
  refSeqId: string;
  chromosomeNumber: number;
  seqid: string;
}

export interface ChromosomeWithLocation extends Chromosome {
  location: number; // in bp
  scale: number;
}

export interface Sequence {
  seq: string;
  seqid: string;
  start: number;
}

export interface Feature {
  attributes: string;
  bin: number;
  end: number;
  extra: string;
  featuretype: string;
  frame: string;
  id: string;
  score: string;
  seqid: string;
  source: string;
  start: number;
  strand: string;
}

export interface FeatureWithIndex extends Feature {
  index: number;
}

export interface BrowserState {
  chromosomes?: {
    [seqid: string]: ChromosomeWithLocation;
  };
  selectedChromosomeSeqId?: string;
}

export const browserInitialState: BrowserState = {};

function reducer(state: BrowserState, action: Partial<BrowserState>) {
  const newState = {
    ...state,
    ...action,
  };
  return newState;
}

export const BrowserStoreContext = createContext<{
  state: BrowserState;
  dispatch: React.Dispatch<Partial<BrowserState>>;
}>({
  state: browserInitialState,
  dispatch: () => {
    throw Error("BrowserStoreProvider not initialized");
  },
});

export const BrowserStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, browserInitialState);
  return (
    <BrowserStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </BrowserStoreContext.Provider>
  );
};

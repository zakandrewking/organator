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

export interface BrowserState {
  chromosomes?: {
    [seqid: string]: ChromosomeWithLocation;
  };
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

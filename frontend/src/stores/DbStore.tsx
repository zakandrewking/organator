"use client";

import { createContext, ReactNode, useReducer } from 'react';

interface DbStore {
  db: any;
  status: string;
  progress: number;
}

export const dbStoreInitialState = {
  db: null,
  status: "loading sqlite3",
  progress: 0,
};

function reducer(state: DbStore, action: Partial<DbStore>) {
  if (action.status && state.status != action.status) {
    console.log("status", action.status);
  }
  const newState = {
    ...state,
    ...action,
  };
  return newState;
}

export const DbStoreContext = createContext<{
  state: DbStore;
  dispatch: React.Dispatch<Partial<DbStore>>;
}>({
  state: dbStoreInitialState,
  dispatch: () => {
    throw Error("DbStoreProvider not initialized");
  },
});

export const DbStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, dbStoreInitialState);
  return (
    <DbStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </DbStoreContext.Provider>
  );
};

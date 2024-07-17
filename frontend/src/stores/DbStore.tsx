"use client";

import { createContext, ReactNode, useReducer } from "react";

interface DbState {
  db: any;
  status: string;
  progress: number;
}

export const dbStoreInitialState = {
  db: null,
  status: "loading sqlite3",
  progress: 0,
};

function reducer(state: DbState, action: Partial<DbState>) {
  const newState = {
    ...state,
    ...action,
  };
  return newState;
}

export const DbStoreContext = createContext<{
  state: DbState;
  dispatch: React.Dispatch<Partial<DbState>>;
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

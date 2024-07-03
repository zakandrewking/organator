"use client";

import { ReactNode } from "react";

import useDb from "@/hooks/useDb";

import DownloadDb from "./DownloadDb";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { db } = useDb();

  return !db ? (
    <DownloadDb />
  ) : (
    <div className="min-h-screen flex flex-col">
      {/* <NavigationHeader /> */}
      <main className="flex-grow flex flex-col">{children}</main>
    </div>
  );
}

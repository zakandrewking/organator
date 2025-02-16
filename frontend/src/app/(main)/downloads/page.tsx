"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { mutate } from 'swr';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Stack } from '@/components/ui/stack';
import { H2 } from '@/components/ui/typography';
import useIndexedDb from '@/hooks/useIndexedDb';
import { DbStoreContext, dbStoreInitialState } from '@/stores/DbStore';

export default function Downloads() {
  const { deleteFile } = useIndexedDb("db");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { dispatch } = useContext(DbStoreContext);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFile();
    } catch (e) {
      // TODO snackbar
      console.error(e);
      return;
    }
    mutate("/saved-db", true);
    dispatch({ ...dbStoreInitialState, status: "idle" });
    router.push("/");
  };

  return (
    <Container>
      <Button asChild variant="outline">
        <Link href="/">{"<"} Genes</Link>
      </Button>
      <H2>Manage Downloads</H2>
      <Stack direction="col" gap={6} alignItems="start">
        The Plasmodium falciparum (Malaria) Genome database is saved to your
        browser (71.1 Mb){" "}
        <Button onClick={handleDelete} disabled={isDeleting}>
          Delete Database
        </Button>
      </Stack>
    </Container>
  );
}

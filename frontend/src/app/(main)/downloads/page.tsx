"use client";

import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Stack } from '@/components/ui/stack';
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
    dispatch({ ...dbStoreInitialState, status: "idle" });
    router.push("/");
  };

  return (
    <Container>
      <Stack direction="col" alignItems="start">
        Database loaded{" "}
        <Button onClick={handleDelete} disabled={isDeleting}>
          Delete
        </Button>
      </Stack>
    </Container>
  );
}

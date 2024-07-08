"use client";

import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { Progress } from '@/components/ui/progress';
import { H3 } from '@/components/ui/typography';
import useDb from '@/hooks/useDb';
import useIndexedDb from '@/hooks/useIndexedDb';

export default function DownloadDb() {
  const { progress, handleStart, status, canStart } = useDb();

  return (
    <Container gap={2}>
      <H3>
        This will load a 70MB sqlite database into memory & local storage -- use
        with caution!
      </H3>
      <div>
        <Button onClick={handleStart} disabled={!canStart}>
          Start
        </Button>
      </div>
      <Progress value={progress} className="max-w-64" />
      {status}
    </Container>
  );
}

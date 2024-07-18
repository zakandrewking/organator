"use client";

import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import Container from '@/components/ui/container';
import { Progress } from '@/components/ui/progress';
import { Stack } from '@/components/ui/stack';
import { H1 } from '@/components/ui/typography';
import useDb from '@/hooks/useDb';

export default function DownloadDb() {
  const { progress, handleStart, status, canStart } = useDb();

  return (
    <Container gap={2}>
      <H1>
        Organator: a super-simple web-based genome browser with a dumb name
      </H1>
      <Card>
        <CardHeader>
          <CardTitle>
            To get started, let&apos;s download the Plasmodium falciparum
            (Malaria) genome to your browser.
          </CardTitle>
          <CardDescription>
            It&apos;s 71.1 Mb, and you can always delete it later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack direction="col" gap={2} alignItems="start">
            <Button onClick={handleStart} disabled={!canStart}>
              Start
            </Button>
            <Progress value={progress} className="max-w-64 min-w-48" />
          </Stack>
        </CardContent>
        <CardFooter>Status: {status}</CardFooter>
      </Card>
    </Container>
  );
}

"use client";

import { useSearchParams } from 'next/navigation';

import Container from '@/components/ui/container';
import { H3 } from '@/components/ui/typography';

export default function Gene() {
  const searchParams = useSearchParams();

  return (
    <Container>
      <H3>Gene: {searchParams.get("id")}</H3>
    </Container>
  );
}

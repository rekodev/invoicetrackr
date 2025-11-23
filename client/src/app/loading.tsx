'use client';

import { Progress } from '@heroui/react';

export default function Loading() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 w-screen">
      <Progress
        size="sm"
        isIndeterminate
        color="secondary"
        aria-label="Loading..."
      />
    </div>
  );
}

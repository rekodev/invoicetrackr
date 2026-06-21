'use client';

import { ProgressBar } from '@heroui/react';

export default function Loading() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 w-screen">
      <ProgressBar size="sm" isIndeterminate aria-label="Loading..." />
    </div>
  );
}

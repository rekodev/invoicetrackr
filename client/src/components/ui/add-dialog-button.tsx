'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Button, useOverlayState } from '@heroui/react';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  children: (_dialog: { isOpen: boolean; close: () => void }) => ReactNode;
};

const AddDialogButton = ({ label, children }: Props) => {
  const { isOpen, open, close } = useOverlayState();

  return (
    <>
      <Button size="md" onPress={open}>
        <PlusIcon className="size-4" />
        {label}
      </Button>
      {children({ isOpen, close })}
    </>
  );
};

export default AddDialogButton;

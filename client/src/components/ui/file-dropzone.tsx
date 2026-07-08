'use client';

import { Button, Card, Label, cn } from '@heroui/react';
import { type DragEvent as ReactDragEvent, useRef, useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

type Props = {
  label: string;
  title: string;
  hint: string;
  actionLabel: string;
  selectedFile?: File | null;
  accept?: string;
  className?: string;
  onFileChange: (_file: File | null) => void;
};

const FileDropzone = ({
  label,
  title,
  hint,
  actionLabel,
  selectedFile,
  accept,
  className,
  onFileChange
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: ReactDragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label>{label}</Label>
      <Card
        className={cn(
          'border-foreground/25 flex min-h-56 items-center justify-center border border-dashed shadow-none',
          isDragging && 'border-default-foreground bg-default-100'
        )}
        variant="secondary"
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <Card.Content className="flex w-full flex-col items-center justify-center p-4 text-center">
          <CloudArrowUpIcon className="text-muted h-10 w-10" />
          <span className="text-foreground mt-2 block w-full max-w-full truncate text-sm font-semibold">
            {selectedFile?.name ?? title}
          </span>
          <span className="text-muted mt-2 text-xs">{hint}</span>
          <Button
            type="button"
            variant="secondary"
            className="border-surface-foreground/15 mt-2 rounded-full border"
            onPress={() => inputRef.current?.click()}
          >
            {actionLabel}
          </Button>
        </Card.Content>
      </Card>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default FileDropzone;

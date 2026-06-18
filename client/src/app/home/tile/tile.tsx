import { Card, cn } from '@heroui/react';
import { ReactNode } from 'react';

export default function Tile({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        'landing-surface hover:border-default-300 backdrop-blur-xs group relative overflow-hidden border p-6 transition',
        className
      )}
    >
      <Card.Content className="p-0">{children}</Card.Content>
    </Card>
  );
}

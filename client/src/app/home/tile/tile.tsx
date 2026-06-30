import { Card, cn } from '@heroui/react';
import { ReactNode } from 'react';

export default function Tile({
  className,
  children,
  reveal
}: {
  className?: string;
  children: ReactNode;
  reveal?: boolean;
}) {
  return (
    <Card
      data-scroll-reveal={reveal ? '' : undefined}
      className={cn(
        'landing-hover-lift group relative overflow-hidden border p-6 transition',
        className
      )}
    >
      <Card.Content className="p-0">{children}</Card.Content>
    </Card>
  );
}

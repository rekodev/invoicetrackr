import { cn } from '@heroui/react';

type Props = {
  title: string;
  description: string;
  as?: 'h3' | 'h4';
  className?: string;
};

const SectionHeading = ({
  title,
  description,
  as: Heading = 'h3',
  className
}: Props) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <Heading
      className={
        Heading === 'h3' ? 'text-lg font-medium' : 'text-base font-medium'
      }
    >
      {title}
    </Heading>
    <p className="text-muted text-sm">{description}</p>
  </div>
);

export default SectionHeading;

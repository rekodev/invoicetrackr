import { cn } from '@heroui/react';

type Props = {
  title: string;
  as?: 'h2' | 'h3' | 'h4';
  className?: string;
};

const SectionHeading = ({
  title,
  as: Heading = 'h2',
  className
}: Props) => (
  <Heading className={cn('text-base font-medium', className)}>
    {title}
  </Heading>
);

export default SectionHeading;

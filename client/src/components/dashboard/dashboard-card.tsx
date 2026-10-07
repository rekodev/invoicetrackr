import Link from 'next/link';
import type { ReactNode } from 'react';

import MetricCard from '@/components/ui/metric-card';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  text: string;
  iconVariant: 'success' | 'warning' | 'accent';
  href?: string;
  linkLabel?: string;
};

const DashboardCard = ({
  icon,
  title,
  text,
  iconVariant,
  href,
  linkLabel
}: Props) => {
  const card = (
    <MetricCard icon={icon} title={title} text={text} iconVariant={iconVariant} />
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      aria-label={linkLabel}
      className="block rounded-3xl transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
    >
      {card}
    </Link>
  );
};

export default DashboardCard;

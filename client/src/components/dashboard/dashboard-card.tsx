import type { ReactNode } from 'react';

import MetricCard from '@/components/ui/metric-card';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  text: string;
  iconVariant: 'success' | 'warning' | 'accent';
};

const DashboardCard = ({ icon, title, text, iconVariant }: Props) => {
  return (
    <MetricCard
      icon={icon}
      title={title}
      text={text}
      iconVariant={iconVariant}
    />
  );
};

export default DashboardCard;

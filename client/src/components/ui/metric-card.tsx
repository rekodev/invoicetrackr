import { Card } from '@heroui/react';
import type { ReactNode } from 'react';

import IconContainer from '@/components/ui/icon-container';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  text: string;
  iconVariant: 'success' | 'warning' | 'accent';
};

const MetricCard = ({ icon, title, text, iconVariant }: Props) => {
  return (
    <Card className="border">
      <Card.Content className="flex h-full flex-col justify-between">
        <div className="text-muted flex items-center gap-2 text-sm font-medium">
          <IconContainer size="sm" variant={iconVariant}>
            {icon}
          </IconContainer>
          {title}
        </div>
        <p className="mt-5 text-2xl font-semibold tabular-nums">{text}</p>
      </Card.Content>
    </Card>
  );
};

export default MetricCard;

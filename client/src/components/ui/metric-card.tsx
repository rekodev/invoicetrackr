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
      <Card.Content className="gap-heading flex h-full flex-col justify-between">
        <div className="text-muted flex items-center gap-actions text-sm font-medium">
          <IconContainer size="sm" variant={iconVariant}>
            {icon}
          </IconContainer>
          {title}
        </div>
        <p className="text-2xl font-semibold tabular-nums">{text}</p>
      </Card.Content>
    </Card>
  );
};

export default MetricCard;

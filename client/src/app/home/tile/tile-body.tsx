import { Chip } from '@heroui/react';
import IconContainer from '@/components/ui/icon-container';

import { IconComponent } from './types';

export default function TileBody({
  icon: Icon,
  eyebrow,
  title,
  body,
  badge,
  badgeColor = 'warning'
}: {
  icon?: IconComponent;
  eyebrow?: string;
  title: string;
  body: string;
  badge?: string;
  badgeColor?: 'success' | 'warning';
}) {
  return (
    <div>
      {Icon && (
        <IconContainer className="mb-4 rounded-lg">
          <Icon className="h-4 w-4" />
        </IconContainer>
      )}
      {eyebrow && (
        <div className="section-eyebrow text-muted mb-2">{eyebrow}</div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-medium tracking-tight">{title}</h3>
        {badge && (
          <Chip color={badgeColor} size="sm" variant="soft">
            {badge}
          </Chip>
        )}
      </div>
      <p className="text-muted mt-2 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

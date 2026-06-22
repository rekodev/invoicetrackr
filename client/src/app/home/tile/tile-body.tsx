import { Chip } from '@heroui/react';
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
        <div className="bg-default-50 text-muted mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border">
          <Icon className="h-4 w-4" />
        </div>
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

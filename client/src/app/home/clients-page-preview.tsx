import { Card, Chip } from '@heroui/react';
import PreviewToolbar from './preview-toolbar';
import { useTranslations } from 'next-intl';

export default function ClientsPagePreview() {
  const t = useTranslations('home.product.clients_preview');
  const clients = ['first', 'second'] as const;

  return (
    <div className="mt-5 flex flex-col gap-4">
      <PreviewToolbar
        search={t('search')}
        primary={t('add_new')}
        total={t('total')}
      />
      <div className="grid gap-3">
        {clients.map((key) => (
          <Card
            key={key}
            className="hover:border-secondary/50 group relative overflow-hidden border transition hover:shadow-md"
          >
            <Card.Content className="flex h-full flex-col gap-3 px-3 py-2">
              <div className="pr-20">
                <Chip
                  size="sm"
                  color={key === 'first' ? 'accent' : 'success'}
                  variant="soft"
                  className="mb-2"
                >
                  {t(`cards.${key}.type`)}
                </Chip>
                <Card.Title className="truncate text-base font-semibold">
                  {t(`cards.${key}.name`)}
                </Card.Title>
                <div className="text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-wide">
                  <span>{t(`cards.${key}.code`)}</span>
                  <span aria-hidden>·</span>
                  <span>{t(`cards.${key}.vat`)}</span>
                </div>
              </div>
              <div className="text-muted flex flex-col gap-2 text-sm">
                <span className="text-foreground/80 truncate">
                  {t(`cards.${key}.address`)}
                </span>
                <span className="text-foreground/80 truncate">
                  {t(`cards.${key}.email`)}
                </span>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}

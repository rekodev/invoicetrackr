import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';

export default function ContractsSoonPreview() {
  const t = useTranslations('home.product.contract_preview');

  return (
    <Card variant="tertiary" className="mt-6 border border-dashed">
      <Card.Content>
        <span className="text-muted font-mono text-xs">CTR-0014</span>
        <p className="text-muted mt-3 text-sm">{t('description')}</p>
      </Card.Content>
    </Card>
  );
}

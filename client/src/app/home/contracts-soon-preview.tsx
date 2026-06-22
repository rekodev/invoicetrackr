import { useTranslations } from 'next-intl';

export default function ContractsSoonPreview() {
  const t = useTranslations('home.product.contract_preview');

  return (
    <div className="bg-default-50/70 mt-6 rounded-3xl border border-dashed p-5">
      <span className="text-muted font-mono text-xs">CTR-0014</span>
      <p className="text-muted mt-3 text-sm">{t('description')}</p>
    </div>
  );
}

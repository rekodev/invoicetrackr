import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

const points = ['numbering', 'locked', 'sending', 'payments'] as const;

export default function InvoicingPoints() {
  const t = useTranslations('home.product.items.invoices.points');

  return (
    <ul className="mt-6 flex flex-col gap-3 text-sm">
      {points.map((key) => (
        <li key={key} className="flex items-start gap-2.5">
          <CheckCircleIcon className="text-accent mt-0.5 h-4 w-4 shrink-0" />
          <span className="text-foreground/80 leading-relaxed">{t(key)}</span>
        </li>
      ))}
    </ul>
  );
}

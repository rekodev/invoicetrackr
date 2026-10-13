import {
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

const files = [
  { key: 'journal_csv', icon: TableCellsIcon },
  { key: 'journal_xlsx', icon: TableCellsIcon },
  { key: 'annual', icon: DocumentChartBarIcon }
] as const;

export default function ExportsPreview() {
  const t = useTranslations('home.product.exports_preview.files');

  return (
    <ul className="mt-6 flex flex-col gap-2">
      {files.map(({ key, icon: Icon }) => (
        <li
          key={key}
          className="bg-default-50 text-muted flex items-center gap-3 rounded-xl border px-3 py-2.5 font-mono text-[11px]"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-foreground min-w-0 flex-1 truncate">
            {t(key)}
          </span>
          <ArrowDownTrayIcon className="h-3.5 w-3.5 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

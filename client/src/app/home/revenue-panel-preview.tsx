import { useTranslations } from 'next-intl';

export default function RevenuePanelPreview() {
  const t = useTranslations('home.preview.dashboard.revenue');
  const bars = [38, 64, 44, 78, 56, 86, 72, 93, 68, 82, 58, 74];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  return (
    <section className="flex min-h-72 flex-col rounded-3xl border bg-transparent p-5 shadow-none">
      <h3 className="text-base font-semibold">{t('title')}</h3>
      <div className="mt-6 grid min-h-48 grid-cols-12 items-end gap-1.5 border-b border-l px-3 pb-3 sm:gap-2">
        {bars.map((height, index) => (
          <div
            key={index}
            className="bg-accent rounded-t-md"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="text-muted mt-3 flex justify-between text-[10px]">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </section>
  );
}

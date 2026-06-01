import { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  text: string;
  iconClassName: string;
};

const DashboardCard = ({ icon, title, text, iconClassName }: Props) => {
  return (
    <article className="border-default-200 flex min-h-32 flex-col justify-between rounded-xl border p-4 shadow-sm sm:p-5">
      <div className="text-default-500 flex items-center gap-2 text-sm font-medium">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-5 text-2xl font-semibold tabular-nums">{text}</p>
    </article>
  );
};

export default DashboardCard;

import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  text: string;
};

const DashboardCard = ({ title, text }: Props) => {
  return (
    <div className="flex flex-col gap-2 bg-default-400 dark:bg-default-200 p-2 text-white rounded-xl">
      <h4 className="my-1">{title}</h4>
      <div className="bg-default-500 dark:bg-default-300 flex items-center justify-center p-6 rounded-xl text-2xl font-medium">
        {text}
      </div>
    </div>
  );
};

export default DashboardCard;

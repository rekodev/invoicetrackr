import { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  text: string;
};

const DashboardCard = ({ title, text }: Props) => {
  return (
    <div className='flex flex-col gap-2 bg-default-500 p-2 text-gray-950 rounded-md'>
      <h4 className='my-1'>{title}</h4>
      <div className='bg-default-600 flex items-center justify-center p-6 rounded-md text-2xl font-medium'>
        {text}
      </div>
    </div>
  );
};

export default DashboardCard;

import { ReactNode } from 'react';

type Props = {
  icon?: ReactNode;
  title: string;
  description: string | ReactNode;
  actions?: Array<ReactNode>;
};

const EmptyState = ({ title, description, actions, icon }: Props) => {
  return (
    <div className='gap-2 text-center py-6 w-full flex flex-col justify-center items-center'>
      {icon}
      <div>
        <h4 className='mb-2 text-2xl font-semibold text-gray-900 dark:text-white'>
          {title}
        </h4>
        <p className='mb-4 text-gray-600 dark:text-gray-400 max-w-96'>
          {description}
        </p>
      </div>
      {actions && (
        <div className='flex justify-center space-x-2'>{actions}</div>
      )}
    </div>
  );
};

export default EmptyState;

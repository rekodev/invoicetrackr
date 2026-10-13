import { ReactNode } from 'react';

type Props = {
  icon?: ReactNode;
  title: string;
  description: string | ReactNode;
  actions?: Array<ReactNode>;
};

const EmptyState = ({ title, description, actions, icon }: Props) => {
  return (
    <div className="py-section flex w-full flex-col items-center justify-center gap-field text-center">
      {icon}
      <div className="gap-field-content flex flex-col items-center">
        <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="max-w-96 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex justify-center space-x-actions">{actions}</div>
      )}
    </div>
  );
};

export default EmptyState;

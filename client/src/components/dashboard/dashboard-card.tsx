'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  text: string;
};

const DashboardCard = ({ title, text }: Props) => {
  return (
    <Card className="border-default-200 border">
      <CardHeader>
        <h4 className="my-1">{title}</h4>
      </CardHeader>
      <CardBody>
        <div className="bg-default-200 dark:bg-default-200 flex items-center justify-center rounded-xl p-6 text-2xl font-medium">
          {text}
        </div>
      </CardBody>
    </Card>
  );
};

export default DashboardCard;

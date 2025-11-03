import { Spinner, cn } from '@heroui/react';

type Props = {
  fullHeight?: boolean;
};

const Loader = ({ fullHeight }: Props) => {
  return (
    <div
      className={cn(`flex w-full items-center justify-center pt-8`, {
        'h-full': fullHeight
      })}
    >
      <Spinner className="m-auto" color="secondary" />
    </div>
  );
};

export default Loader;

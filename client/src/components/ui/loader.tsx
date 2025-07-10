import { Spinner } from '@heroui/react';

type Props = {
  fullHeight?: boolean;
};

const Loader = ({ fullHeight }: Props) => {
  return (
    <div
      className={`flex w-full items-center justify-center pt-8 ${
        fullHeight && 'h-full'
      }`}
    >
      <Spinner className="m-auto" color="secondary" />
    </div>
  );
};

export default Loader;

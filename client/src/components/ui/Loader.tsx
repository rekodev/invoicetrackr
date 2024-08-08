import { Spinner } from '@nextui-org/react';

type Props = {
  fullHeight?: boolean;
};

const Loader = ({ fullHeight }: Props) => {
  return (
    <div
      className={`w-full flex items-center justify-center pt-8 ${
        fullHeight && 'h-full'
      }`}
    >
      <Spinner className='m-auto' color='secondary' />
    </div>
  );
};

export default Loader;

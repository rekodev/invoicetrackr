import { Spinner } from '@nextui-org/react';

const Loader = () => {
  return (
    <div className='w-full flex items-center justify-center pt-8'>
      <Spinner className='m-auto' color='secondary' />
    </div>
  );
};

export default Loader;

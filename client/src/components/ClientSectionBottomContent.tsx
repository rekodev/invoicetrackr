import { Button, Pagination } from '@nextui-org/react';
import { Dispatch, SetStateAction } from 'react';

const PER_PAGE = 8;
const INITIAL_PAGE = 1;

type Props = {
  clientsLength: number | undefined;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const ClientSectionBottomContent = ({
  clientsLength,
  page,
  setPage,
}: Props) => {
  const pages = clientsLength
    ? Math.ceil(clientsLength / PER_PAGE)
    : INITIAL_PAGE;
  const prevButtonDisabled = page === 1;
  const nextButtonDisabled = page === pages;

  const onNextPage = () => {
    if (page < pages) {
      setPage(page + 1);
    }
  };

  const onPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className='mt-2 flex justify-center items-center relative'>
      <Pagination
        isCompact
        showControls
        color='secondary'
        total={pages}
        page={page}
        className='flex justify-center'
        onChange={setPage}
        isDisabled={!clientsLength}
      />
      <div className='hidden sm:flex w-[30%] justify-end gap-2 absolute right-2'>
        <Button
          isDisabled={prevButtonDisabled}
          size='sm'
          variant='flat'
          onPress={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          isDisabled={nextButtonDisabled}
          size='sm'
          variant='flat'
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ClientSectionBottomContent;

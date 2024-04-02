import { Pagination } from '@nextui-org/react';
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
    <div className='w-full mt-2'>
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
    </div>
  );
};

export default ClientSectionBottomContent;

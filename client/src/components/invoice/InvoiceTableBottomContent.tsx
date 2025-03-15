import { Button, Pagination } from "@heroui/react";
import { Dispatch, SetStateAction, useCallback } from 'react';

type Props = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pages: number;
  selectedKeys: Set<never> | 'all';
  filteredItemsLength: number | undefined;
};

const InvoiceTableBottomContent = ({
  page,
  setPage,
  pages,
  selectedKeys,
  filteredItemsLength,
}: Props) => {
  const prevButtonDisabled = page === 1;
  const nextButtonDisabled = page === pages;

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages, setPage]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  return (
    <div className='py-2 flex justify-between items-center'>
      <div className='absolute w-full flex items-center justify-center'>
        <Pagination
          isCompact
          showControls
          showShadow
          color='secondary'
          page={page}
          total={pages}
          onChange={setPage}
          isDisabled={!filteredItemsLength || filteredItemsLength === 0}
        />
      </div>
      <div className='w-full hidden sm:flex justify-end gap-2'>
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

export default InvoiceTableBottomContent;

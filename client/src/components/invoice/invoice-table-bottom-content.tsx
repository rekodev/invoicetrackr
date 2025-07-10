import { Button, Pagination } from '@heroui/react';
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
  // selectedKeys,
  filteredItemsLength
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
    <div className="flex items-center justify-between py-2">
      <div className="absolute flex w-full items-center justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="secondary"
          page={page}
          total={pages}
          onChange={setPage}
          isDisabled={!filteredItemsLength || filteredItemsLength === 0}
        />
      </div>
      <div className="hidden w-full justify-end gap-2 sm:flex">
        <Button
          isDisabled={prevButtonDisabled}
          size="sm"
          variant="flat"
          onPress={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          isDisabled={nextButtonDisabled}
          size="sm"
          variant="flat"
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default InvoiceTableBottomContent;

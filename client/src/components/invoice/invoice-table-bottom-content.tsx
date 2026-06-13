import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink
} from '@heroui/react';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { useTranslations } from 'next-intl';

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
  filteredItemsLength
}: Props) => {
  const t = useTranslations('invoices.bottom_content');
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
        <Pagination className="flex justify-center" aria-label="Invoice pages">
          <PaginationContent>
            {Array.from({ length: pages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    isDisabled={!filteredItemsLength}
                    onPress={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </PaginationContent>
        </Pagination>
      </div>
      <div className="hidden w-full justify-end gap-2 sm:flex">
        <Button
          isDisabled={prevButtonDisabled}
          size="sm"
          variant="secondary"
          onPress={onPreviousPage}
        >
          {t('previous')}
        </Button>
        <Button
          isDisabled={nextButtonDisabled}
          size="sm"
          variant="secondary"
          onPress={onNextPage}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceTableBottomContent;

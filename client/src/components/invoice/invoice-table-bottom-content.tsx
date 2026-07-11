import { Pagination } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useMemo } from 'react';

type Props = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pages: number;
  rowsPerPage: number;
  filteredItemsLength: number | undefined;
};

const InvoiceTableBottomContent = ({
  page,
  setPage,
  pages,
  rowsPerPage,
  filteredItemsLength = 0
}: Props) => {
  const t = useTranslations('invoices.bottom_content');

  const pageNumbers = useMemo(
    () => Array.from({ length: pages }, (_, index) => index + 1),
    [pages]
  );

  const start = filteredItemsLength === 0 ? 0 : (page - 1) * rowsPerPage + 1;

  const end = Math.min(page * rowsPerPage, filteredItemsLength);

  return (
    <Pagination size="sm" className="w-full justify-between">
      <Pagination.Summary>
        {start} to {end} of {filteredItemsLength} results
      </Pagination.Summary>

      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            isDisabled={page === 1 || filteredItemsLength === 0}
            onPress={() =>
              setPage((currentPage) => Math.max(1, currentPage - 1))
            }
          >
            <Pagination.PreviousIcon />
            {t('previous')}
          </Pagination.Previous>
        </Pagination.Item>

        {pageNumbers.map((pageNumber) => (
          <Pagination.Item key={pageNumber}>
            <Pagination.Link
              isActive={pageNumber === page}
              isDisabled={filteredItemsLength === 0}
              onPress={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Pagination.Link>
          </Pagination.Item>
        ))}

        <Pagination.Item>
          <Pagination.Next
            isDisabled={page === pages || filteredItemsLength === 0}
            onPress={() =>
              setPage((currentPage) => Math.min(pages, currentPage + 1))
            }
          >
            {t('next')}
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
};

export default InvoiceTableBottomContent;

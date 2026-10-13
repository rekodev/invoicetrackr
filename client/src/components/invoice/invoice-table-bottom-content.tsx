import { Pagination } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

type Props = {
  page: number;
  pages: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (_page: number) => void;
};

const InvoiceTableBottomContent = ({
  page,
  pages,
  rowsPerPage,
  total,
  onPageChange
}: Props) => {
  const t = useTranslations('invoices.bottom_content');

  const pageNumbers = useMemo(
    () => Array.from({ length: pages }, (_, index) => index + 1),
    [pages]
  );

  const start = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;

  const end = Math.min(page * rowsPerPage, total);

  return (
    <Pagination size="sm" className="w-full justify-between">
      <Pagination.Summary>
        {t('summary', { start, end, total })}
      </Pagination.Summary>

      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            isDisabled={page === 1 || total === 0}
            onPress={() => onPageChange(Math.max(1, page - 1))}
          >
            <Pagination.PreviousIcon />
            {t('previous')}
          </Pagination.Previous>
        </Pagination.Item>

        {pageNumbers.map((pageNumber) => (
          <Pagination.Item key={pageNumber}>
            <Pagination.Link
              isActive={pageNumber === page}
              isDisabled={total === 0}
              onPress={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Pagination.Link>
          </Pagination.Item>
        ))}

        <Pagination.Item>
          <Pagination.Next
            isDisabled={page >= pages || total === 0}
            onPress={() => onPageChange(Math.min(pages, page + 1))}
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

import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink
} from '@heroui/react';
import { useTranslations } from 'next-intl';

type Props = {
  page: number;
  pages: number;
  onPageChange: (_page: number) => void;
};

const ClientSectionBottomContent = ({ page, pages, onPageChange }: Props) => {
  const t = useTranslations('clients');
  const prevButtonDisabled = page <= 1;
  const nextButtonDisabled = page >= pages;

  const onNextPage = () => {
    if (page < pages) onPageChange(page + 1);
  };

  const onPreviousPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  return (
    <div className="relative mt-4 flex items-center justify-center py-2">
      <div className="absolute flex w-full items-center justify-center">
        <Pagination className="flex justify-center" aria-label={t('a11y.pagination_label')}>
          <PaginationContent>
            {Array.from({ length: pages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onPress={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </PaginationContent>
        </Pagination>
      </div>
      <div className="hidden w-full justify-end gap-actions sm:flex">
        <Button
          isDisabled={prevButtonDisabled}
          size="sm"
          variant="secondary"
          onPress={onPreviousPage}
        >
          {t('bottom_content.previous')}
        </Button>
        <Button
          isDisabled={nextButtonDisabled}
          size="sm"
          variant="secondary"
          onPress={onNextPage}
        >
          {t('bottom_content.next')}
        </Button>
      </div>
    </div>
  );
};

export default ClientSectionBottomContent;

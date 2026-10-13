import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink
} from '@heroui/react';

type Props = {
  page: number;
  pages: number;
  onPageChange: (_page: number) => void;
};

const ClientSectionBottomContent = ({ page, pages, onPageChange }: Props) => {
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
        <Pagination className="flex justify-center" aria-label="Clients pages">
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
          Previous
        </Button>
        <Button
          isDisabled={nextButtonDisabled}
          size="sm"
          variant="secondary"
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ClientSectionBottomContent;

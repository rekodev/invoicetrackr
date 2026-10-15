'use client';

import {
  EllipsisVerticalIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  buttonVariants,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger
} from '@heroui/react';
import type { ClientBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import EmptyState from '@/components/empty-state';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { CLIENT_WORKSPACE_PAGE } from '@/lib/constants/pages';
import useListNavigation from '@/lib/hooks/use-list-navigation';
import {
  type ClientListPageQuery,
  clientListQueryHref
} from '@/lib/utils/client-navigation';

import ClientCard from '../client-card';
import ArchiveClientModal from './archive-client-modal';
import ClientFormDialog from './client-form-dialog';
import ClientSectionBottomContent from './client-section-bottom-content';
import ClientSectionTopContent from './client-section-top-content';

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  userId: number;
  clients: Array<ClientBody>;
  total: number;
  query: ClientListPageQuery;
};

const ClientSection = ({ userId, clients, total, query }: Props) => {
  const t = useTranslations('clients');
  const { update, isPending } = useListNavigation(query, clientListQueryHref);
  const [searchTerm, setSearchTerm] = useState(query.q ?? '');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasFilters = Boolean(query.q || query.businessType);

  const onSearch = (value: string) => {
    setSearchTerm(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => update({ q: value.trim() || undefined, page: 1 }, 'replace'),
      SEARCH_DEBOUNCE_MS
    );
  };

  const [currentClientData, setCurrentClientData] = useState<ClientBody>();
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isArchiveClientModalOpen, setIsArchiveClientModalOpen] =
    useState(false);

  const handleCloseEditClientModal = () => {
    setIsEditClientModalOpen(false);
  };

  const handleOpenArchiveClientModal = (clientData: ClientBody) => {
    setCurrentClientData(clientData);
    setIsArchiveClientModalOpen(true);
  };

  const handleCloseArchiveClientModal = () => {
    setIsArchiveClientModalOpen(false);
  };

  const handleEditClient = (clientData: ClientBody) => {
    setCurrentClientData(clientData);
    setIsEditClientModalOpen(true);
  };

  const renderMobileClientCardActions = (clientData: ClientBody) => (
    <Dropdown>
      <DropdownTrigger
        aria-label={t('a11y.actions_label')}
        className={buttonVariants({
          variant: 'tertiary',
          size: 'sm',
          className:
            'absolute right-2 top-2 flex items-center justify-center p-0 sm:hidden'
        })}
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu>
          <DropdownItem
            key="edit-client"
            id="edit-client"
            textValue={t('edit')}
            onAction={() => handleEditClient(clientData)}
          >
            <div className="flex items-center gap-field-content">
              <PencilIcon className="h-4 w-4" />
              {t('edit')}
            </div>
          </DropdownItem>
          <DropdownItem
            key="archive-client"
            id="archive-client"
            textValue={t('archive')}
            onAction={() => handleOpenArchiveClientModal(clientData)}
          >
            <div className="flex items-center gap-field-content">
              <TrashIcon className="h-4 w-4" />
              {t('archive')}
            </div>
          </DropdownItem>
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );

  const renderClientCardActions = (clientData: ClientBody) => (
    <>
      {renderMobileClientCardActions(clientData)}
      <div className="pointer-events-none absolute right-2 top-2 z-10 hidden gap-actions opacity-0 transition group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 sm:flex">
        <Button
          isIconOnly
          className="min-w-unit-10 w-unit-16 h-unit-8 cursor-pointer [--button-bg-hover:var(--default-hover)]"
          variant="outline"
          size="sm"
          aria-label={t('actions.tooltip_edit')}
          onPress={() => handleEditClient(clientData)}
        >
          <PencilSquareIcon className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          variant="danger-soft"
          size="sm"
          className="min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer"
          aria-label={t('actions.tooltip_archive')}
          onPress={() => handleOpenArchiveClientModal(clientData)}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  const renderClient = (client: ClientBody) => {
    return (
      <ClientCard
        key={client.id}
        fullDetails
        client={client}
        href={CLIENT_WORKSPACE_PAGE(Number(client.id))}
        actions={renderClientCardActions(client)}
      />
    );
  };

  const renderSectionContent = () => {
    if (!clients.length)
      return (
        <EmptyState
          className="min-h-[480px]"
          title={t(hasFilters ? 'empty_state.no_results_title' : 'empty_state.title')}
          description={t(
            hasFilters
              ? 'empty_state.no_results_description'
              : 'empty_state.description'
          )}
        />
      );

    return (
      <>
        <div className="grid grid-cols-1 gap-section md:grid-cols-2 xl:grid-cols-3">
          {clients.map(renderClient)}
        </div>
        <ClientSectionBottomContent
          page={query.page}
          pages={Math.max(1, Math.ceil(total / query.pageSize))}
          pageSize={query.pageSize}
          total={total}
          onPageChange={(page) => update({ page })}
        />
      </>
    );
  };

  return (
    <section
      className={cn('flex flex-col gap-field transition-opacity', {
        'opacity-60': isPending
      })}
      aria-busy={isPending}
    >
      <ClientSectionTopContent
        total={total}
        searchTerm={searchTerm}
        onSearch={onSearch}
        typeFilters={
          new Set(query.businessType ? [query.businessType] : CLIENT_BUSINESS_TYPES)
        }
        onTypeFiltersChange={(types) =>
          update({
            businessType: types.size === 1 ? Array.from(types)[0] : undefined,
            page: 1
          })
        }
      />
      <div className="min-h-[480px]">{renderSectionContent()}</div>
      {currentClientData && isEditClientModalOpen && (
        <ClientFormDialog
          key={currentClientData.id}
          userId={userId}
          isOpen={isEditClientModalOpen}
          onClose={handleCloseEditClientModal}
          mode="edit"
          clientData={currentClientData}
        />
      )}
      {currentClientData && isArchiveClientModalOpen && (
        <ArchiveClientModal
          userId={userId}
          clientData={currentClientData}
          isOpen={isArchiveClientModalOpen}
          onClose={handleCloseArchiveClientModal}
        />
      )}
    </section>
  );
};

export default ClientSection;

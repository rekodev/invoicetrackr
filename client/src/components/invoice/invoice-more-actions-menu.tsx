'use client';

import {
  EllipsisVerticalIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  buttonVariants,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  toast,
  Tooltip
} from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import type { JSX } from 'react';

type Props = {
  invoice: InvoiceBody;
  onRequestDetails: (_invoice: InvoiceBody) => void;
  onEdit: (_invoice: InvoiceBody) => void;
  onDelete: (_invoice: InvoiceBody) => void;
  showLabel?: boolean;
};

type Action = {
  id: string;
  label: string;
  icon: JSX.Element;
  className?: string;
  onAction: () => void;
};

const InvoiceMoreActionsMenu = ({
  invoice,
  onRequestDetails,
  onEdit,
  onDelete,
  showLabel = false
}: Props) => {
  const t = useTranslations('invoices.cell.actions');
  const isDraft = (invoice.lifecycleStatus || 'draft') === 'draft';

  const handleCopyPublicLink = async () => {
    if (!invoice.publicInvoiceToken) return;

    const publicLink = `${window.location.origin}/invoices/public/${invoice.publicInvoiceToken}`;
    await navigator.clipboard.writeText(publicLink);
    toast(t('public_link_copied'), { variant: 'success' });
  };

  const actions: Action[] = [
    ...(invoice.publicInvoiceToken
      ? [
          {
            id: 'copy-public-link',
            label: t('tooltip_copy_public_link'),
            icon: <LinkIcon className="h-4 w-4" />,
            onAction: handleCopyPublicLink
          }
        ]
      : []),
    ...(isDraft
      ? [
          {
            id: 'request-recipient-details',
            label: t('tooltip_request_details'),
            icon: <UserPlusIcon className="h-4 w-4" />,
            onAction: () => onRequestDetails(invoice)
          },
          {
            id: 'edit-invoice',
            label: t('tooltip_edit'),
            icon: <PencilSquareIcon className="h-4 w-4" />,
            onAction: () => onEdit(invoice)
          },
          {
            id: 'delete-invoice',
            label: t('tooltip_delete'),
            icon: <TrashIcon className="h-4 w-4" />,
            className: 'text-danger',
            onAction: () => onDelete(invoice)
          }
        ]
      : [])
  ];

  if (!actions.length) return null;

  const trigger = (
    <DropdownTrigger
      aria-label={t('more_actions')}
      className={buttonVariants({
        variant: showLabel ? 'secondary' : 'tertiary',
        size: 'sm',
        isIconOnly: !showLabel,
        className: showLabel
          ? 'w-full sm:w-auto'
          : 'flex size-8 min-w-8 shrink-0 items-center justify-center p-0'
      })}
    >
      <EllipsisVerticalIcon className="h-5 w-5" />
      {showLabel ? t('more_actions') : null}
    </DropdownTrigger>
  );

  return (
    <Dropdown>
      {showLabel ? (
        trigger
      ) : (
        <Tooltip delay={0}>
          {trigger}
          <Tooltip.Content>{t('more_actions')}</Tooltip.Content>
        </Tooltip>
      )}
      <DropdownPopover>
        <DropdownMenu aria-label={t('more_actions')} items={actions}>
          {(action) => (
            <DropdownItem
              key={action.id}
              id={action.id}
              textValue={action.label}
              className={action.className}
              onAction={action.onAction}
            >
              <div className="flex items-center gap-2">
                {action.icon}
                {action.label}
              </div>
            </DropdownItem>
          )}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
};

export default InvoiceMoreActionsMenu;

'use client';

import {
  EllipsisVerticalIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  toast,
  Tooltip,
  useOverlayState
} from '@heroui/react';
import { dropdownVariants } from '@heroui/styles';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { type JSX, useRef } from 'react';

const dropdownStyles = dropdownVariants();

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
  const menuState = useOverlayState();
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  const triggerButton = (
    <Button
      ref={triggerRef}
      aria-label={t('more_actions')}
      className={showLabel ? 'w-full whitespace-nowrap sm:w-auto' : undefined}
      isIconOnly={!showLabel}
      size="sm"
      variant={showLabel ? 'secondary' : 'tertiary'}
      onPress={menuState.toggle}
    >
      <EllipsisVerticalIcon className="h-5 w-5" />
      {showLabel ? t('more_actions') : null}
    </Button>
  );

  const trigger = showLabel ? (
    triggerButton
  ) : (
    <Tooltip delay={0}>
      {triggerButton}
      <Tooltip.Content>{t('more_actions')}</Tooltip.Content>
    </Tooltip>
  );

  return (
    <>
      {trigger}
      <DropdownPopover
        isOpen={menuState.isOpen}
        onOpenChange={menuState.setOpen}
        triggerRef={triggerRef}
        placement="bottom end"
        className={`${dropdownStyles.popover()} w-max max-w-[calc(100vw-2rem)]`}
      >
        <DropdownMenu
          autoFocus="first"
          aria-label={t('more_actions')}
          className={dropdownStyles.menu()}
          items={actions}
        >
          {(action) => (
            <DropdownItem
              key={action.id}
              id={action.id}
              textValue={action.label}
              className={action.className}
              onAction={() => {
                action.onAction();
                menuState.close();
              }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                {action.icon}
                {action.label}
              </div>
            </DropdownItem>
          )}
        </DropdownMenu>
      </DropdownPopover>
    </>
  );
};

export default InvoiceMoreActionsMenu;

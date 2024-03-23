import { Chip, Tooltip, User } from '@nextui-org/react';
import { Key } from 'react';

import { InvoiceModel, InvoiceStatus } from '@/types/models/invoice';

import DocumentText from './icons/DocumentText';
import DeleteIcon from '../components/icons/DeleteIcon';
import EditIcon from '../components/icons/EditIcon';
import EyeIcon from '../components/icons/EyeIcon';

const statusColorMap: Record<InvoiceStatus, 'success' | 'danger' | 'warning'> =
  {
    paid: 'success',
    pending: 'warning',
    canceled: 'danger',
  };

type Props = {
  invoice: InvoiceModel;
  columnKey: Key;
};

const InvoiceTableCell = ({ invoice, columnKey }: Props) => {
  const cellValue =
    columnKey !== 'actions' && invoice[columnKey as keyof InvoiceModel];

  switch (columnKey) {
    case 'name':
      return (
        <div className='flex'>
          <DocumentText />
          &nbsp;
          <p className='text-bold text-small capitalize'>{cellValue}</p>
        </div>
      );
    case 'company':
      return (
        <div className='flex flex-col'>
          <p className='text-bold text-small capitalize'>{cellValue}</p>
        </div>
      );
    case 'status':
      return (
        <Chip
          className='capitalize'
          color={statusColorMap[invoice.status]}
          size='sm'
          variant='flat'
        >
          {cellValue}
        </Chip>
      );
    case 'actions':
      return (
        <div className='relative flex items-center gap-2'>
          <Tooltip disableAnimation content='Details'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <EyeIcon />
            </span>
          </Tooltip>
          <Tooltip disableAnimation content='Edit user'>
            <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
              <EditIcon />
            </span>
          </Tooltip>
          <Tooltip disableAnimation color='danger' content='Delete user'>
            <span className='text-lg text-danger cursor-pointer active:opacity-50'>
              <DeleteIcon />
            </span>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};

export default InvoiceTableCell;

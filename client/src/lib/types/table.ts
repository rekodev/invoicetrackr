import { Key } from 'react';

export type SortDirection = 'ascending' | 'descending';

export type SortDescriptor = {
  column: Key;
  direction: SortDirection;
};

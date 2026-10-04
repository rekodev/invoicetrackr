import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSyncExternalStore } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expense } from '@/test/expense-fixtures';
import { withIntl } from '@/test/with-intl';

import ExpenseTable from '../expense-table';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(useSyncExternalStore(
  (listener) => { window.addEventListener('expense-url', listener); return () => window.removeEventListener('expense-url', listener); },
  () => window.location.search
)) }));
vi.mock('../expense-form-dialog', () => ({ default: () => null }));
vi.mock('../delete-expense-modal', () => ({ default: () => null }));
beforeEach(() => {
  const replace = window.history.replaceState.bind(window.history);
  vi.spyOn(window.history, 'replaceState').mockImplementation((data, unused, url) => {
    replace(data, unused, url); window.dispatchEvent(new Event('expense-url'));
  });
});
afterEach(() => { vi.restoreAllMocks(); window.history.replaceState(null, '', '/'); });
const expenses = Array.from({ length: 12 }, (_, index) => ({ ...expense, id: index + 1, supplier: `Supplier ${index + 1}`, totalAmount: `${index + 1}.00` }));

describe('expense list context', () => {
  it('restores sorting before pagination and includes the return URL in detail links', () => {
    window.history.replaceState(null, '', '/expenses?sort=totalAmount&direction=descending&page=2&pageSize=5');
    render(withIntl(<ExpenseTable userId={1} expenses={expenses} />));
    expect(screen.getByRole('link', { name: 'Supplier 7' })).toHaveAttribute('href', '/expenses/7?returnTo=%2Fexpenses%3Fsort%3DtotalAmount%26direction%3Ddescending%26page%3D2%26pageSize%3D5');
    expect(screen.queryByRole('link', { name: 'Supplier 12' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('5');
  });

  it('clamps a now-empty page after deletion', async () => {
    window.history.replaceState(null, '', '/expenses?page=3&pageSize=5');
    render(withIntl(<ExpenseTable userId={1} expenses={expenses.slice(0, 10)} />));
    await waitFor(() => expect(new URLSearchParams(window.location.search).get('page')).toBe('2'));
    expect(screen.getAllByRole('link', { name: 'View expense' })).toHaveLength(5);
  });

  it('stores a changed search term in the URL and resets pagination', async () => {
    window.history.replaceState(null, '', '/expenses?page=2');
    render(withIntl(<ExpenseTable userId={1} expenses={expenses} />));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Supplier 12' } });
    await waitFor(() => expect(new URLSearchParams(window.location.search).get('q')).toBe('Supplier 12'));
    expect(new URLSearchParams(window.location.search).get('page')).toBeNull();
    expect(screen.getByRole('link', { name: 'Supplier 12' })).toBeInTheDocument();
  });
});

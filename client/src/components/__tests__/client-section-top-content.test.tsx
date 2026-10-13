import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import AddClientButton from '../client/add-client-button';
import ClientSectionTopContent from '../client/client-section-top-content';

const mockAddClientAction = vi.fn();
const mockUpdateClientAction = vi.fn();

vi.mock('@/lib/actions/client', () => ({
  addClientAction: (...args: Array<unknown>) => mockAddClientAction(...args),
  updateClientAction: (...args: Array<unknown>) =>
    mockUpdateClientAction(...args)
}));

vi.mock('@/components/company-lookup/company-lookup-panel', () => ({
  default: () => null
}));

describe('<ClientSectionTopContent />', () => {
  let props: ComponentProps<typeof ClientSectionTopContent>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      total: 2,
      searchTerm: '',
      onSearch: vi.fn(),
      typeFilters: new Set(['business', 'individual']),
      onTypeFiltersChange: vi.fn()
    };
    mockAddClientAction.mockClear();
    mockUpdateClientAction.mockClear();
  });

  it('renders correctly', () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    expect(
      screen.getByPlaceholderText('Search by name or code...')
    ).toBeDefined();
    expect(screen.queryByText('Add New')).toBeNull();
    expect(screen.getByText('Type')).toBeDefined();
  });

  it('displays correct total client count', () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    expect(screen.getByText('Total 2 clients')).toBeDefined();
  });

  it('displays singular text when there is one client', () => {
    props.total = 1;
    renderHelper(<ClientSectionTopContent {...props} />);

    expect(screen.getByText('Total 1 client')).toBeDefined();
  });

  it('calls onSearch when typing in search input', async () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    const input = screen.getByPlaceholderText('Search by name or code...');
    await userEvent.type(input, 'test');

    expect(props.onSearch).toHaveBeenCalled();
  });

  it('clears the search through onSearch', async () => {
    props.searchTerm = 'test';
    renderHelper(<ClientSectionTopContent {...props} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await userEvent.click(clearButton);

    expect(props.onSearch).toHaveBeenCalledWith('');
  });

  it('narrows the type filter from the Type dropdown', async () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    await userEvent.click(screen.getByText('Type'));
    expect(screen.getByText('Business')).toBeDefined();
    await userEvent.click(screen.getByText('Individual'));

    expect(props.onTypeFiltersChange).toHaveBeenCalledWith(new Set(['business']));
  });
});

describe('<AddClientButton />', () => {
  it('opens the client form dialog from the page header button', async () => {
    render(withIntl(<AddClientButton userId={1} />));

    await userEvent.click(screen.getByRole('button', { name: 'Add New' }));

    expect(screen.getByText('Add')).toBeDefined();
  });
});

import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ClientSectionTopContent from '../client/client-section-top-content';
import { withIntl } from '@/test/with-intl';

const mockAddClientAction = vi.fn();
const mockUpdateClientAction = vi.fn();

vi.mock('@/lib/actions/client', () => ({
  addClientAction: (...args: Array<unknown>) => mockAddClientAction(...args),
  updateClientAction: (...args: Array<unknown>) =>
    mockUpdateClientAction(...args)
}));

describe('<ClientSectionTopContent />', () => {
  let props: ComponentProps<typeof ClientSectionTopContent>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      userId: 1,
      clients: [
        {
          id: 1,
          address: 'Test Client 1',
          name: 'Test Client 1',
          businessNumber: '123',
          businessType: 'business',
          email: 'client1@test.com',
          type: 'receiver'
        },
        {
          id: 2,
          address: 'Test Client 2',
          name: 'Test Client 2',
          businessNumber: '456',
          businessType: 'individual',
          email: 'client2@test.com',
          type: 'receiver'
        }
      ],
      searchTerm: '',
      onSearch: vi.fn(),
      onClear: vi.fn(),
      typeFilters: new Set(['business', 'individual']),
      setTypeFilters: vi.fn()
    };
    mockAddClientAction.mockClear();
    mockUpdateClientAction.mockClear();
  });

  it('renders correctly', () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    expect(screen.getByPlaceholderText('Search by name...')).toBeDefined();
    expect(screen.getByText('Add New')).toBeDefined();
    expect(screen.getByText('Type')).toBeDefined();
  });

  it('displays correct total client count', () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    expect(screen.getByText('Total 2 clients')).toBeDefined();
  });

  it('displays singular text when there is one client', () => {
    props.clients = [props.clients![0]];
    renderHelper(<ClientSectionTopContent {...props} />);

    expect(screen.getByText('Total 1 client')).toBeDefined();
  });

  it('calls onSearch when typing in search input', async () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    const input = screen.getByPlaceholderText('Search by name...');
    await userEvent.type(input, 'test');

    expect(props.onSearch).toHaveBeenCalled();
  });

  it('calls onClear when clearing search input', async () => {
    props.searchTerm = 'test';
    renderHelper(<ClientSectionTopContent {...props} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await userEvent.click(clearButton);

    expect(props.onClear).toHaveBeenCalled();
  });

  it('opens client form dialog when clicking Add New button', async () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    await userEvent.click(screen.getByText('Add New'));

    expect(screen.getByText('Add')).toBeDefined();
  });

  it('opens type filter dropdown when clicking Type button', async () => {
    renderHelper(<ClientSectionTopContent {...props} />);

    await userEvent.click(screen.getByText('Type'));

    expect(screen.getByText('Business')).toBeDefined();
    expect(screen.getByText('Individual')).toBeDefined();
  });
});

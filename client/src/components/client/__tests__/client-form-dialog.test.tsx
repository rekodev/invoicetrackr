import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withIntl } from '@/test/with-intl';

import ClientFormDialog from '../client-form-dialog';

const { mockAddClientAction, mockUpdateClientAction } = vi.hoisted(() => ({
  mockAddClientAction: vi.fn(),
  mockUpdateClientAction: vi.fn()
}));

vi.mock('@/lib/actions/client', () => ({
  addClientAction: mockAddClientAction,
  updateClientAction: mockUpdateClientAction
}));

describe('<ClientFormDialog />', () => {
  let props: ComponentProps<typeof ClientFormDialog>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      userId: 1,
      isOpen: true,
      onClose: vi.fn()
    };
  });

  it('renders add mode correctly', () => {
    renderHelper(<ClientFormDialog {...props} />);

    expect(screen.getByText(/Add New Client/i)).toBeDefined();
    expect(screen.getByText(/Name/i)).toBeDefined();
    expect(screen.getAllByLabelText(/Business Type/i)).toBeDefined();
    expect(screen.getByLabelText(/Business Number/i)).toBeDefined();
  });

  it('renders edit mode correctly with client data', () => {
    const clientData = {
      id: 1,
      name: 'Test Client',
      type: 'receiver' as const,
      businessType: 'business' as const,
      businessNumber: '123456789',
      address: 'Test Address',
      email: 'test@example.com'
    };

    renderHelper(<ClientFormDialog {...props} clientData={clientData} />);

    expect(screen.getByText(/Edit/i)).toBeDefined();
    expect(screen.getByDisplayValue('Test Client')).toBeDefined();
    expect(screen.getByDisplayValue('123456789')).toBeDefined();
    expect(screen.getByDisplayValue('Test Address')).toBeDefined();
    expect(screen.getByDisplayValue('test@example.com')).toBeDefined();
  });

  it('successfully submits form when adding new client', async () => {
    mockAddClientAction.mockResolvedValue({
      ok: true,
      message: 'Success'
    });

    renderHelper(<ClientFormDialog {...props} />);

    await userEvent.type(screen.getByLabelText(/Name/i), 'New Client');
    await userEvent.type(
      screen.getByLabelText(/Business Number/i),
      '987654321'
    );
    await userEvent.type(screen.getByLabelText(/Address/i), 'New Address');
    await userEvent.click(screen.getByRole('button', { name: /Add/i }));

    expect(mockAddClientAction).toHaveBeenCalledWith({
      userId: 1,
      clientData: expect.objectContaining({
        name: 'New Client',
        businessNumber: '987654321',
        type: 'receiver'
      })
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('handles validation errors from server', async () => {
    mockAddClientAction.mockResolvedValue({
      ok: false,
      message: 'Validation failed',
      validationErrors: {
        name: 'Name is required'
      }
    });

    renderHelper(<ClientFormDialog {...props} />);

    const submitButton = screen.getByTestId('client-form-dialog-submit-button');

    expect(submitButton).toBeDisabled();
    await userEvent.type(
      screen.getByLabelText(/Business Number/i),
      '987654321'
    );
    expect(submitButton).not.toBeDisabled();

    await userEvent.click(submitButton);

    expect(await screen.findByText('Name is required')).toBeDefined();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<ClientFormDialog {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });
});

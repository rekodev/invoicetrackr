import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/components/company-lookup/company-lookup-panel', () => ({
  default: ({
    value,
    label,
    errorMessage,
    onInputChange,
    onApply
  }: {
    value: string;
    label: string;
    errorMessage?: string;
    onInputChange: (_value: string) => void;
    onApply: (_result: unknown) => void;
  }) => (
    <>
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(event) => onInputChange(event.target.value)}
        />
      </label>
      {errorMessage ? <span>{errorMessage}</span> : null}
      <button
        type="button"
        onClick={() =>
          onApply({
            companyCode: '987654321',
            legalName: 'VMI Client UAB',
            vatNumber: null,
            registeredAddress: null,
            source: {
              provider: 'vmi',
              label: 'VMI open data via data.gov.lt — CC BY 4.0',
              url: 'https://data.gov.lt/datasets/607/?resource_version=940'
            }
          })
        }
      >
        Apply VMI fixture
      </button>
    </>
  )
}));

describe('<ClientFormDialog />', () => {
  let props: ComponentProps<typeof ClientFormDialog>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    vi.clearAllMocks();
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

    renderHelper(
      <ClientFormDialog {...props} mode="edit" clientData={clientData} />
    );

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

  it('shows the server validation message for an invalid email', async () => {
    mockAddClientAction.mockResolvedValue({
      ok: false,
      message: 'Validation failed',
      validationErrors: {
        email: 'Must be a valid email address'
      }
    });

    renderHelper(<ClientFormDialog {...props} />);

    await userEvent.type(screen.getByLabelText(/Name/i), 'New Client');
    await userEvent.type(
      screen.getByLabelText(/Business Number/i),
      '987654321'
    );
    await userEvent.type(screen.getByLabelText(/Address/i), 'New Address');
    await userEvent.type(screen.getByLabelText(/Email/i), 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    expect(
      await screen.findByText('Must be a valid email address')
    ).toBeDefined();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('requires confirmation before saving a potential duplicate', async () => {
    mockAddClientAction
      .mockResolvedValueOnce({
        ok: false,
        code: 'CONFLICT',
        message: 'A matching client already exists'
      })
      .mockResolvedValueOnce({
        ok: true,
        message: 'Success'
      });

    renderHelper(<ClientFormDialog {...props} />);

    await userEvent.type(screen.getByLabelText(/Name/i), 'Existing Client');
    await userEvent.type(
      screen.getByLabelText(/Business Number/i),
      '987654321'
    );
    await userEvent.type(screen.getByLabelText(/Address/i), 'New Address');
    await userEvent.click(screen.getByRole('button', { name: /^Add$/i }));

    expect(
      await screen.findByText('A matching client already exists')
    ).toBeDefined();
    expect(screen.getByText('Potential Duplicate')).toBeDefined();
    expect(props.onClose).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole('button', { name: /Continue anyway/i })
    );

    expect(mockAddClientAction).toHaveBeenLastCalledWith(
      expect.objectContaining({ duplicateAcknowledged: true })
    );
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<ClientFormDialog {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('applies lookup fields, clears address and duplicate state, and preserves email', async () => {
    const clientData = {
      id: 1,
      name: 'Old Client',
      type: 'receiver' as const,
      businessType: 'business' as const,
      businessNumber: '123456789',
      vatNumber: 'LT123',
      address: 'Old address',
      email: 'billing@example.com'
    };
    renderHelper(
      <ClientFormDialog {...props} mode="edit" clientData={clientData} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Apply VMI fixture' })
    );

    expect(screen.getByLabelText(/Name/i)).toHaveValue('VMI Client UAB');
    expect(screen.getByLabelText(/Business Number/i)).toHaveValue('987654321');
    expect(screen.getByLabelText(/VAT Number/i)).toHaveValue('');
    expect(screen.getByLabelText(/Address/i)).toHaveValue('');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('billing@example.com');
    expect(
      screen.getByText(/Enter the registered address manually/)
    ).toBeVisible();
  });
});

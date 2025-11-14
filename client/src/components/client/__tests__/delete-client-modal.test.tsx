import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DeleteClientModal from '../delete-client-modal';
import { withIntl } from '@/test/with-intl';

const { mockDeleteClientAction } = vi.hoisted(() => ({
  mockDeleteClientAction: vi.fn()
}));

vi.mock('@/lib/actions/client', () => ({
  deleteClientAction: mockDeleteClientAction
}));

describe('<DeleteClientModal />', () => {
  let props: ComponentProps<typeof DeleteClientModal>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      userId: 1,
      clientData: {
        id: 10,
        name: 'Test Client',
        type: 'receiver',
        businessType: 'business',
        businessNumber: '123456',
        address: 'Test Address',
        email: 'test@example.com'
      },
      isOpen: true,
      onClose: vi.fn()
    };

    mockDeleteClientAction.mockResolvedValue({
      ok: true,
      message: 'Client deleted successfully'
    });
  });

  it('renders correctly when open', () => {
    renderHelper(<DeleteClientModal {...props} />);

    expect(screen.getByText(/Test Client/)).toBeDefined();
  });

  it('calls deleteClientAction and onClose when confirm is clicked', async () => {
    renderHelper(<DeleteClientModal {...props} />);

    const confirmButton = screen.getByRole('button', { name: /Delete/i });
    await userEvent.click(confirmButton);

    expect(mockDeleteClientAction).toHaveBeenCalledWith({
      userId: 1,
      clientId: 10
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('does not close modal when deletion fails', async () => {
    mockDeleteClientAction.mockResolvedValue({
      ok: false,
      message: 'Deletion failed'
    });

    renderHelper(<DeleteClientModal {...props} />);

    const confirmButton = screen.getByRole('button', {
      name: /Delete/i
    });
    await userEvent.click(confirmButton);

    expect(mockDeleteClientAction).toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<DeleteClientModal {...props} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(props.onClose).toHaveBeenCalled();
  });
});

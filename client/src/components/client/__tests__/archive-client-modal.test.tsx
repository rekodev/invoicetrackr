import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import ArchiveClientModal from '../archive-client-modal';

const { mockArchiveClientAction } = vi.hoisted(() => ({
  mockArchiveClientAction: vi.fn()
}));

vi.mock('@/lib/actions/client', () => ({
  archiveClientAction: mockArchiveClientAction
}));

describe('<ArchiveClientModal />', () => {
  let props: ComponentProps<typeof ArchiveClientModal>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    vi.clearAllMocks();
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

    mockArchiveClientAction.mockResolvedValue({
      ok: true,
      message: 'Client removed successfully'
    });
  });

  it('renders correctly when open', () => {
    renderHelper(<ArchiveClientModal {...props} />);

    expect(screen.getByText(/Test Client/)).toBeDefined();
  });

  it('calls archiveClientAction and onClose when confirm is clicked', async () => {
    renderHelper(<ArchiveClientModal {...props} />);

    const confirmButton = screen.getByRole('button', { name: /Remove/i });
    await userEvent.click(confirmButton);

    expect(mockArchiveClientAction).toHaveBeenCalledWith({
      userId: 1,
      clientId: 10
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('does not close modal when archiving fails', async () => {
    mockArchiveClientAction.mockResolvedValue({
      ok: false,
      message: 'Archiving failed'
    });

    renderHelper(<ArchiveClientModal {...props} />);

    const confirmButton = screen.getByRole('button', {
      name: /Remove/i
    });
    await userEvent.click(confirmButton);

    expect(mockArchiveClientAction).toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<ArchiveClientModal {...props} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(props.onClose).toHaveBeenCalled();
  });
});

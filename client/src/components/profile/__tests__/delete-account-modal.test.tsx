import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withIntl } from '@/test/with-intl';

import DeleteAccountModal from '../delete-account-modal';

const { mockDeleteUserAccount, mockLogOutAction } = vi.hoisted(() => ({
  mockDeleteUserAccount: vi.fn(),
  mockLogOutAction: vi.fn()
}));

vi.mock('@/api/user', () => ({
  deleteUserAccount: mockDeleteUserAccount
}));

vi.mock('@/lib/actions', () => ({
  logOutAction: mockLogOutAction
}));

describe('<DeleteAccountModal />', () => {
  let props: ComponentProps<typeof DeleteAccountModal>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      userId: 1,
      isOpen: true,
      onClose: vi.fn()
    };
  });

  it('renders correctly', () => {
    renderHelper(<DeleteAccountModal {...props} />);

    expect(screen.getByText(/Delete my account/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Delete my account/i })
    ).toBeDefined();
  });

  it('successfully deletes account', async () => {
    mockDeleteUserAccount.mockResolvedValue({
      status: 200,
      data: { message: 'Account deleted' }
    });

    renderHelper(<DeleteAccountModal {...props} />);

    await userEvent.click(
      screen.getByRole('button', { name: /Delete my account/i })
    );

    expect(mockDeleteUserAccount).toHaveBeenCalledWith(1);
    expect(mockLogOutAction).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it('handles error when deletion fails', async () => {
    mockDeleteUserAccount.mockResolvedValue({
      status: 400,
      data: { errors: [], message: 'Failed to delete' }
    });

    renderHelper(<DeleteAccountModal {...props} />);

    await userEvent.click(
      screen.getByRole('button', { name: /Delete my account/i })
    );

    expect(mockDeleteUserAccount).toHaveBeenCalled();
    // expect(mockLogOutAction).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<DeleteAccountModal {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });
});

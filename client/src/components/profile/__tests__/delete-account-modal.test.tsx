import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import DeleteAccountModal from '../delete-account-modal';

const { mockDeleteUserAccountAction, mockLogOutAction } = vi.hoisted(() => ({
  mockDeleteUserAccountAction: vi.fn(),
  mockLogOutAction: vi.fn()
}));

vi.mock('@/lib/actions/user', () => ({
  deleteUserAccountAction: mockDeleteUserAccountAction
}));

vi.mock('@/lib/actions', () => ({
  logOutAction: mockLogOutAction
}));

describe('<DeleteAccountModal />', () => {
  let props: ComponentProps<typeof DeleteAccountModal>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));
  const deleteButton = () =>
    screen.getByRole('button', { name: /Delete my account/i });
  const emailField = () =>
    screen.getByLabelText('Type owner@example.com to confirm');

  beforeEach(() => {
    props = {
      userId: 1,
      email: 'owner@example.com',
      isOpen: true,
      onClose: vi.fn()
    };
  });

  it('explains the consequences and stays disabled until the account email is typed', async () => {
    renderHelper(<DeleteAccountModal {...props} />);

    expect(screen.getByText('Removed Right Away')).toBeDefined();
    expect(
      screen.getByText('Database backups, which are overwritten within 30 days')
    ).toBeDefined();
    expect(
      screen
        .getByRole('link', { name: /Download My Data/i })
        .getAttribute('href')
    ).toBe('/settings/account-settings/export');
    expect(deleteButton().hasAttribute('disabled')).toBe(true);

    await userEvent.type(emailField(), 'someone@example.com');
    expect(deleteButton().hasAttribute('disabled')).toBe(true);

    await userEvent.clear(emailField());
    await userEvent.type(emailField(), ' Owner@Example.com ');
    expect(deleteButton().hasAttribute('disabled')).toBe(false);
  });

  it('deletes the account with the typed email and signs out', async () => {
    mockDeleteUserAccountAction.mockResolvedValue({
      ok: true,
      message: 'Account deleted'
    });

    renderHelper(<DeleteAccountModal {...props} />);

    await userEvent.type(emailField(), 'owner@example.com');
    await userEvent.click(deleteButton());

    expect(mockDeleteUserAccountAction).toHaveBeenCalledWith({
      userId: 1,
      confirmEmail: 'owner@example.com'
    });
    expect(props.onClose).toHaveBeenCalled();
    expect(mockLogOutAction).toHaveBeenCalled();
  });

  it('keeps the dialog open and shows the server error under the email', async () => {
    mockDeleteUserAccountAction.mockResolvedValue({
      ok: false,
      message: 'The email does not match your account email'
    });

    renderHelper(<DeleteAccountModal {...props} />);

    await userEvent.type(emailField(), 'owner@example.com');
    await userEvent.click(deleteButton());

    expect(
      screen.getAllByText('The email does not match your account email').length
    ).toBeGreaterThan(0);
    expect(props.onClose).not.toHaveBeenCalled();
    expect(mockLogOutAction).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<DeleteAccountModal {...props} />);

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });
});

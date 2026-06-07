import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withIntl } from '@/test/with-intl';

import CreateNewPasswordForm from '../create-new-password-form';
import ForgotPasswordForm from '../forgot-password-form';
import LoginForm from '../login-form';
import SignUpForm from '../sign-up-form';

const mockAuthenticateAction = vi.fn();
const mockCreateNewPasswordAction = vi.fn();
const mockResetPasswordAction = vi.fn();
const mockSignUpAction = vi.fn();

vi.mock('@/lib/actions', () => ({
  authenticateAction: (...args: Array<unknown>) =>
    mockAuthenticateAction(...args),
  createNewPasswordAction: (...args: Array<unknown>) =>
    mockCreateNewPasswordAction(...args),
  resetPasswordAction: (...args: Array<unknown>) =>
    mockResetPasswordAction(...args),
  signUpAction: (...args: Array<unknown>) => mockSignUpAction(...args)
}));

describe('auth forms', () => {
  beforeEach(() => {
    mockAuthenticateAction.mockResolvedValue(undefined);
    mockCreateNewPasswordAction.mockResolvedValue({
      ok: true,
      message: 'Password changed'
    });
    mockResetPasswordAction.mockResolvedValue({
      ok: true,
      message: 'Reset link sent'
    });
    mockSignUpAction.mockResolvedValue({
      ok: true,
      message: ''
    });
  });

  it('keeps signup values and clears the stale password validation error', async () => {
    mockSignUpAction.mockResolvedValue({
      ok: false,
      message: 'Validation failed',
      errors: {
        email: '',
        password: 'Password must contain at least one lowercase character',
        confirmPassword: ''
      }
    });

    render(withIntl(<SignUpForm />));

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), '12345678');
    await userEvent.type(screen.getByLabelText('Confirm Password'), '12345678');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
    expect(mockSignUpAction).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('12345678');
    expect(screen.getByLabelText('Confirm Password')).toHaveValue('12345678');

    fireEvent.submit(screen.getByTestId('sign-up-form').querySelector('form')!);

    await waitFor(() => {
      expect(mockSignUpAction).toHaveBeenCalledTimes(2);
    });

    await userEvent.type(screen.getByLabelText('Password'), 'a');

    expect(
      screen.queryByText(
        'Password must contain at least one lowercase character'
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Validation failed')).not.toBeInTheDocument();
  });

  it('keeps login values and clears the stale error when a field changes', async () => {
    mockAuthenticateAction.mockResolvedValue('Invalid email or password');

    render(withIntl(<LoginForm />));

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), '12345678');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(
      await screen.findByText('Invalid email or password')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('12345678');

    await userEvent.type(screen.getByLabelText('Email'), 'x');

    expect(
      screen.queryByText('Invalid email or password')
    ).not.toBeInTheDocument();
  });

  it('keeps forgot-password email and clears the stale response when edited', async () => {
    render(withIntl(<ForgotPasswordForm />));

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    );

    expect(await screen.findByText('Reset link sent')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');

    await userEvent.type(screen.getByLabelText('Email'), 'x');

    expect(screen.queryByText('Reset link sent')).not.toBeInTheDocument();
  });

  it('keeps new-password values and clears stale field validation when edited', async () => {
    mockCreateNewPasswordAction.mockResolvedValue({
      ok: false,
      message: 'Validation failed',
      validationErrors: {
        newPassword: 'Password must contain at least one lowercase character'
      }
    });

    const { container } = render(
      withIntl(<CreateNewPasswordForm userId={1} token="token" />)
    );

    await userEvent.type(screen.getByLabelText('New Password'), '12345678');
    await userEvent.type(
      screen.getByLabelText('Confirm New Password'),
      '12345678'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /reset password/i })
    );

    await waitFor(() => {
      expect(mockCreateNewPasswordAction).toHaveBeenCalled();
    });
    expect(mockCreateNewPasswordAction).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('New Password')).toHaveValue('12345678');
    expect(screen.getByLabelText('Confirm New Password')).toHaveValue(
      '12345678'
    );

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(mockCreateNewPasswordAction).toHaveBeenCalledTimes(2);
    });

    await userEvent.type(screen.getByLabelText('New Password'), 'a');

    expect(
      screen.queryByText(
        'Password must contain at least one lowercase character'
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Validation failed')).not.toBeInTheDocument();
  });
});

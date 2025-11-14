import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JSX } from 'react';
import userEvent from '@testing-library/user-event';

import { CookieConsentStatus } from '@/lib/types';
import { withIntl } from '@/test/with-intl';

import CookieConsent from '../cookie-consent';

const mockUpdateCookieConsent = vi.fn();

vi.mock('@/lib/hooks/use-cookie-consent', () => ({
  default: () => ({
    cookieConsent: null,
    updateCookieConsent: mockUpdateCookieConsent
  })
}));

describe('<CookieConsent />', () => {
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    mockUpdateCookieConsent.mockClear();
  });

  it('renders correctly when cookieConsent is null', () => {
    renderHelper(<CookieConsent />);

    expect(screen.getByText(/We use cookies/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Accept All/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Decline/i })).toBeDefined();
  });

  it('calls updateCookieConsent with Accepted when accept button is clicked', async () => {
    renderHelper(<CookieConsent />);

    await userEvent.click(screen.getByRole('button', { name: /Accept All/i }));

    expect(mockUpdateCookieConsent).toHaveBeenCalledWith(
      CookieConsentStatus.Accepted
    );
    expect(mockUpdateCookieConsent).toHaveBeenCalledTimes(1);
  });

  it('calls updateCookieConsent with Declined when decline button is clicked', async () => {
    renderHelper(<CookieConsent />);

    await userEvent.click(screen.getByRole('button', { name: /Decline/i }));

    expect(mockUpdateCookieConsent).toHaveBeenCalledWith(
      CookieConsentStatus.Declined
    );
    expect(mockUpdateCookieConsent).toHaveBeenCalledTimes(1);
  });
});

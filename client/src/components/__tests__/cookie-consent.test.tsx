import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JSX } from 'react';
import userEvent from '@testing-library/user-event';

import { withIntl } from '@/test/with-intl';

import CookieConsent from '../cookie-consent';

const { mockUpdateAnalyticsConsentAction, mockUpdateCookieConsent } =
  vi.hoisted(() => ({
    mockUpdateAnalyticsConsentAction: vi.fn().mockResolvedValue({
      ok: true,
      analyticsConsentStatus: 'accepted'
    }),
    mockUpdateCookieConsent: vi.fn()
  }));

vi.mock('@/lib/actions/analytics', () => ({
  updateAnalyticsConsentAction: mockUpdateAnalyticsConsentAction
}));

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
    mockUpdateAnalyticsConsentAction.mockClear();
  });

  it('renders correctly when cookieConsent is null', () => {
    renderHelper(<CookieConsent />);

    expect(screen.getByText(/optional analytics cookies/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Accept All/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Decline/i })).toBeDefined();
  });

  it('calls updateCookieConsent with accepted when accept button is clicked', async () => {
    renderHelper(<CookieConsent />);

    await userEvent.click(screen.getByRole('button', { name: /Accept All/i }));

    expect(mockUpdateCookieConsent).toHaveBeenCalledWith('accepted');
    expect(mockUpdateCookieConsent).toHaveBeenCalledTimes(1);
    expect(mockUpdateAnalyticsConsentAction).toHaveBeenCalledWith('accepted');
  });

  it('calls updateCookieConsent with declined when decline button is clicked', async () => {
    renderHelper(<CookieConsent />);

    await userEvent.click(screen.getByRole('button', { name: /Decline/i }));

    expect(mockUpdateCookieConsent).toHaveBeenCalledWith('declined');
    expect(mockUpdateCookieConsent).toHaveBeenCalledTimes(1);
    expect(mockUpdateAnalyticsConsentAction).toHaveBeenCalledWith('declined');
  });
});

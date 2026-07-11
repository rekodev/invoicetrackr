import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import LanguageSwitcher from '../language-switcher';

vi.mock('next/navigation', () =>
  vi.importActual('next-router-mock/navigation')
);

const { mockGetLocaleCookieAction, mockSetLocaleCookieAction } = vi.hoisted(
  () => ({
    mockGetLocaleCookieAction: vi.fn(),
    mockSetLocaleCookieAction: vi.fn()
  })
);

vi.mock('@/lib/actions', () => ({
  getLocaleCookieAction: mockGetLocaleCookieAction,
  setLocaleCookieAction: mockSetLocaleCookieAction
}));

vi.mock('@/lib/actions/user', () => ({
  updateUserAccountSettingsAction: vi.fn()
}));

describe('<LanguageSwitcher />', () => {
  let props: ComponentProps<typeof LanguageSwitcher>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      user: undefined
    };
    mockRouter.push('/');
    mockGetLocaleCookieAction.mockResolvedValue('lt');
    mockSetLocaleCookieAction.mockResolvedValue(undefined);
  });

  it('renders correctly', async () => {
    renderHelper(<LanguageSwitcher {...props} />);

    expect(
      await screen.findByTestId('language-switcher-trigger')
    ).toBeDefined();
  });

  it('calls setLocaleCookieAction when selecting a language', async () => {
    renderHelper(<LanguageSwitcher {...props} />);

    await screen.findByTestId('language-switcher-trigger');

    await userEvent.click(screen.getByTestId('language-switcher-trigger'));
    const englishOption = await screen.findByText('English');
    await userEvent.click(englishOption);

    expect(mockSetLocaleCookieAction).toHaveBeenCalledWith('en');
  });
});

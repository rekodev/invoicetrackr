import { JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';

import { withIntl } from '@/test/with-intl';
import ThemeSwitcher from '../theme-switcher';

vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}));

describe('<ThemeSwitcher />', () => {
  const mockSetTheme = vi.fn();
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
  });

  it('renders correctly', () => {
    renderHelper(<ThemeSwitcher />);

    expect(screen.getByRole('button')).toBeDefined();
  });

  it('switches to dark theme when clicked in light mode', async () => {
    renderHelper(<ThemeSwitcher />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('switches to light theme when clicked in dark mode', async () => {
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme
    });

    renderHelper(<ThemeSwitcher />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});

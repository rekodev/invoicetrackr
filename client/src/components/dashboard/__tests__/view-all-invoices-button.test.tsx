import { render, screen } from '@testing-library/react';
import { JSX } from 'react';
import { describe, expect, it } from 'vitest';

import { withIntl } from '@/test/with-intl';

import ViewAllInvoicesButton from '../view-all-invoices-button';

describe('<ViewAllInvoicesButton />', () => {
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  it('renders correctly', () => {
    renderHelper(<ViewAllInvoicesButton />);

    expect(screen.getByRole('link', { name: 'View All' })).toBeDefined();
    expect(screen.getByText('View All')).toBeDefined();
  });

  it('has correct href attribute', () => {
    renderHelper(<ViewAllInvoicesButton />);

    const link = screen.getByRole('link', { name: 'View All' });
    expect(link.getAttribute('href')).toBe('/invoices');
  });
});

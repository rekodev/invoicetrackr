import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JSX } from 'react';

import ViewAllInvoicesButton from '../view-all-invoices-button';
import { withIntl } from '@/test/with-intl';

describe('<ViewAllInvoicesButton />', () => {
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  it('renders correctly', () => {
    renderHelper(<ViewAllInvoicesButton />);

    expect(screen.getByRole('button')).toBeDefined();
    expect(screen.getByText('Žiūrėti visas')).toBeDefined();
  });

  it('has correct href attribute', () => {
    renderHelper(<ViewAllInvoicesButton />);

    const link = screen.getByRole('button');
    expect(link.getAttribute('href')).toBe('/invoices');
  });
});

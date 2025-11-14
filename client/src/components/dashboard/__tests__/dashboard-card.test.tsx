import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import DashboardCard from '../dashboard-card';
import { withIntl } from '@/test/with-intl';

describe('<DashboardCard />', () => {
  let props: ComponentProps<typeof DashboardCard>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      title: 'Test Title',
      text: 'Test Text Content'
    };
  });

  it('renders correctly', () => {
    renderHelper(<DashboardCard {...props} />);

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Text Content')).toBeDefined();
  });

  it('renders ReactNode as title', () => {
    props.title = <span data-testid="custom-title">Custom Title</span>;
    props.text = '100';

    renderHelper(<DashboardCard {...props} />);

    expect(screen.getByTestId('custom-title')).toBeDefined();
    expect(screen.getByText('Custom Title')).toBeDefined();
    expect(screen.getByText('100')).toBeDefined();
  });
});

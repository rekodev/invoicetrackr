import { render } from '@testing-library/react';
import { JSX } from 'react';

import { withIntl } from './with-intl';

export const renderHelper = (component: JSX.Element) =>
  render(withIntl(component));

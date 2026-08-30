import { DEFAULT_CURRENCY, type InvoiceBody } from '@invoicetrackr/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { withIntl } from '@/test/with-intl';

import InvoiceServicesTable from '../invoice-services-table';

const services = [
  {
    description: 'Consulting',
    unit: 'hour',
    quantity: 1,
    amount: 10,
    vatRate: 0,
    position: 0
  },
  {
    description: 'Workshop',
    unit: 'service',
    quantity: 1,
    amount: 20,
    vatRate: 0,
    position: 1
  }
];

const Harness = ({ initialServices = services }) => {
  const methods = useForm<InvoiceBody>({
    defaultValues: { services: initialServices }
  });

  return (
    <FormProvider {...methods}>
      <InvoiceServicesTable
        currency={DEFAULT_CURRENCY}
      />
    </FormProvider>
  );
};

describe('<InvoiceServicesTable />', () => {
  it('adds, removes, and protects the final line', async () => {
    const user = userEvent.setup();
    render(withIntl(<Harness initialServices={[services[0]]} />));

    expect(
      screen.getByRole('button', { name: 'Delete service' })
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add Service' }));
    expect(
      screen.getAllByRole('button', { name: 'Delete service' })
    ).toHaveLength(2);

    await user.click(
      screen.getAllByRole('button', { name: 'Delete service' })[1]
    );
    expect(
      screen.getByRole('button', { name: 'Delete service' })
    ).toBeDisabled();
  });

  it('exposes first and last reorder states and moves line values', async () => {
    const user = userEvent.setup();
    render(withIntl(<Harness />));

    const moveUpButtons = screen.getAllByRole('button', {
      name: 'Move service up'
    });
    const moveDownButtons = screen.getAllByRole('button', {
      name: 'Move service down'
    });

    expect(moveUpButtons[0]).toBeDisabled();
    expect(moveDownButtons[1]).toBeDisabled();

    expect(
      screen.getAllByRole('textbox', { name: 'Description' })[0]
    ).toHaveValue('Consulting');
    expect(
      screen.getAllByRole('textbox', { name: 'Description' })[1]
    ).toHaveValue('Workshop');

    await user.click(moveUpButtons[1]);

    const descriptionInputs = screen.getAllByRole('textbox', {
      name: 'Description'
    });
    expect(descriptionInputs[0]).toHaveValue('Workshop');
    expect(descriptionInputs[1]).toHaveValue('Consulting');
  });

  it('uses cent rounding for immediate fractional totals', () => {
    render(
      withIntl(
        <Harness
          initialServices={[
            {
              ...services[0],
              quantity: 1.5,
              amount: 0.01
            }
          ]}
        />
      )
    );

    expect(screen.getAllByText(/0\.02/)).not.toHaveLength(0);
  });
});

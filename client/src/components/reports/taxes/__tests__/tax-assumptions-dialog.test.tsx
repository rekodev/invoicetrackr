import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import TaxAssumptionsDialog from '../tax-assumptions-dialog';

const { mockSaveTaxProfileAction } = vi.hoisted(() => ({
  mockSaveTaxProfileAction: vi.fn()
}));

vi.mock('@/lib/actions/tax', () => ({
  saveTaxProfileAction: mockSaveTaxProfileAction
}));

describe('<TaxAssumptionsDialog />', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirms first-time assumptions and closes after saving', async () => {
    const user = userEvent.setup();
    mockSaveTaxProfileAction.mockResolvedValue({ ok: true, message: 'Tax assumptions saved' });
    render(
      withIntl(
        <TaxAssumptionsDialog userId={1} year={2026} profile={null} isOpen onClose={onClose} />
      )
    );

    expect(screen.getByRole('heading', { name: 'Tax Assumptions · 2026' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '30% of income' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Actual expenses' }));
    await user.click(screen.getByRole('checkbox', { name: /PSD coverage through employment/ }));
    await user.type(screen.getByLabelText('Other Annual Taxable Income (€)'), '30000');
    await user.click(screen.getByRole('button', { name: 'Save assumptions' }));

    expect(mockSaveTaxProfileAction).toHaveBeenCalledWith({
      userId: 1,
      year: 2026,
      profile: {
        expenseMethod: 'actual',
        hasEmploymentPsdCoverage: true,
        hasAdditionalPensionAccumulation: false,
        activityStartDate: null,
        activityEndDate: null,
        otherDeclaredIncome: '30000'
      }
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('prefills saved assumptions and keeps the dialog open on server errors', async () => {
    const user = userEvent.setup();
    mockSaveTaxProfileAction.mockResolvedValue({
      ok: false,
      message: 'Review fields and retry',
      validationErrors: {
        activityEndDate: 'End date must not be before start date.'
      }
    });
    render(
      withIntl(
        <TaxAssumptionsDialog
          userId={1}
          year={2026}
          profile={{
            expenseMethod: 'actual',
            hasEmploymentPsdCoverage: false,
            hasAdditionalPensionAccumulation: true,
            activityStartDate: '2026-04-01',
            activityEndDate: null,
            otherDeclaredIncome: '0.00'
          }}
          isOpen
          onClose={onClose}
        />
      )
    );

    const save = screen.getByRole('button', { name: 'Save assumptions' });
    expect(save).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Actual expenses' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /additional 3% for my pension/ })).toBeChecked();
    expect(screen.getByLabelText('Activity Start Date')).toHaveValue('2026-04-01');

    await user.type(screen.getByLabelText('Activity End Date'), '2026-03-01');
    await user.click(save);

    expect(await screen.findByText('End date must not be before start date.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

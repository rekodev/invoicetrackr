import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { searchCompanyLookupsAction } from '@/lib/actions/company-lookup';
import { withIntl } from '@/test/with-intl';

import CompanyLookupPanel from '../company-lookup-panel';

vi.mock('@/lib/actions/company-lookup', () => ({
  searchCompanyLookupsAction: vi.fn()
}));

const result = {
  companyCode: '123456789',
  legalName: 'Ąžuolas UAB',
  vatNumber: 'LT100001234567',
  registeredAddress: null,
  source: {
    provider: 'vmi' as const,
    label: 'VMI open data via data.gov.lt — CC BY 4.0' as const,
    url: 'https://data.gov.lt/datasets/607/?resource_version=940' as const
  }
};

const renderPanel = (onApply = vi.fn()) => {
  const Harness = () => {
    const [value, setValue] = useState('');

    return (
      <CompanyLookupPanel
        userId={1}
        value={value}
        label="Company name"
        onInputChange={setValue}
        onApply={onApply}
      />
    );
  };

  render(withIntl(<Harness />));
};

describe('<CompanyLookupPanel />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces search, shows VMI attribution, and applies on selection', async () => {
    vi.mocked(searchCompanyLookupsAction).mockResolvedValue({
      ok: true,
      results: [result]
    });
    const onApply = vi.fn();
    renderPanel(onApply);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'ąžuolas' }
    });
    expect(searchCompanyLookupsAction).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(searchCompanyLookupsAction).toHaveBeenCalledWith({
      userId: 1,
      query: 'ąžuolas'
    });
    fireEvent.click(screen.getByRole('button', { name: /Show suggestions/i }));
    expect(screen.getByText('Ąžuolas UAB')).toBeInTheDocument();
    expect(screen.getAllByText(/VMI open data/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('option', { name: /Ąžuolas UAB/ }));
    expect(onApply).toHaveBeenCalledWith(result);
  });

  it('ignores a stale response after the query changes', async () => {
    let resolveFirst: (
      _value: Awaited<ReturnType<typeof searchCompanyLookupsAction>>
    ) => void = () => undefined;
    vi.mocked(searchCompanyLookupsAction)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
      )
      .mockResolvedValueOnce({ ok: true, results: [] });
    renderPanel();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'first' }
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'second' }
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: /Show suggestions/i }));
    expect(screen.getByText(/No active companies matched/)).toBeVisible();

    await act(async () => {
      resolveFirst({ ok: true, results: [result] });
    });

    expect(screen.queryByText('Ąžuolas UAB')).not.toBeInTheDocument();
  });

  it('keeps manual entry available for provider errors', async () => {
    vi.mocked(searchCompanyLookupsAction).mockResolvedValue({
      ok: false,
      message: 'Company lookup is temporarily unavailable.'
    });
    renderPanel();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'ąžuolas' }
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: /Show suggestions/i }));

    expect(
      screen.getByText('Company lookup is temporarily unavailable.')
    ).toBeVisible();
  });
});

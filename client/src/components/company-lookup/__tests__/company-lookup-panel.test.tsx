import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('<CompanyLookupPanel />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces search, shows attribution and preview, then applies explicitly', async () => {
    vi.mocked(searchCompanyLookupsAction).mockResolvedValue({
      ok: true,
      results: [result]
    });
    const onApply = vi.fn();
    render(withIntl(<CompanyLookupPanel userId={1} onApply={onApply} />));

    fireEvent.change(screen.getByRole('searchbox'), {
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
    expect(screen.getByText('Ąžuolas UAB')).toBeInTheDocument();
    expect(
      screen.getByText(/VMI open data via data.gov.lt — CC BY 4.0/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: /Ąžuolas UAB/ }));
    expect(screen.getAllByText('Ąžuolas UAB')).toHaveLength(2);
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply company details' })
    );

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
    render(withIntl(<CompanyLookupPanel userId={1} onApply={vi.fn()} />));

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'first' }
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'second' }
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });
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
    render(withIntl(<CompanyLookupPanel userId={1} onApply={vi.fn()} />));

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'ąžuolas' }
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(
      screen.getByText('Company lookup is temporarily unavailable.')
    ).toBeVisible();
    expect(screen.getByText(/Manual entry remains available/)).toBeVisible();
  });
});

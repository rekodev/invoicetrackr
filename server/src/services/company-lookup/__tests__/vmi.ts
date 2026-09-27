import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CompanyLookupProviderError } from '../types';
import {
  clearVmiCompanyLookupCache,
  createVmiCompanyLookupProvider
} from '../vmi';

const activeRow = {
  ja_kodas: 123456789,
  pavadinimas: 'Ąžuolas UAB',
  klnt_tipas: 'LJA',
  valstybe: 'LTU',
  ireg_data: '2020-01-01',
  isreg_data: null,
  anul_data: null,
  pvm_kodas_pref: 'LT',
  pvm_kodas: '100001234567',
  pvm_iregistruota: '2021-01-01',
  pvm_isregistruota: null
};

const response = (rows: unknown[], ok = true) =>
  ({
    ok,
    json: vi.fn().mockResolvedValue({ _data: rows })
  }) as unknown as Response;

describe('VMI company lookup provider', () => {
  beforeEach(() => clearVmiCompanyLookupCache());

  it('uses exact company-code search and normalizes one active result', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([activeRow]));
    const provider = createVmiCompanyLookupProvider({
      fetchImpl,
      now: () => Date.parse('2026-09-26T00:00:00Z')
    });

    await expect(provider.search(' 123456789 ')).resolves.toEqual([
      expect.objectContaining({
        companyCode: '123456789',
        legalName: 'Ąžuolas UAB',
        vatNumber: 'LT100001234567',
        registeredAddress: null
      })
    ]);
    expect(decodeURIComponent(String(fetchImpl.mock.calls[0][0]))).toContain(
      'ja_kodas=123456789'
    );
    expect(fetchImpl.mock.calls[0][1]).toEqual(
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('lowercases and safely escapes name expressions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([]));
    const provider = createVmiCompanyLookupProvider({ fetchImpl });

    await provider.search("  O'REILLY  LT  ");

    expect(decodeURIComponent(String(fetchImpl.mock.calls[0][0]))).toContain(
      "contains(lower(pavadinimas),'o''reilly lt')"
    );
  });

  it('keeps provider query delimiters inside the escaped name literal', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response([]));
    const provider = createVmiCompanyLookupProvider({ fetchImpl });

    await provider.search('A&B');

    const url = String(fetchImpl.mock.calls[0][0]);
    expect(url).toContain('a%26b');
    expect(url.split('&')).toHaveLength(3);
  });

  it('filters inactive/non-Lithuanian rows, deduplicates activity rows, and selects current VAT', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response([
        { ...activeRow, pvm_kodas: 'OLD', pvm_isregistruota: '2024-01-01' },
        {
          ...activeRow,
          pvm_kodas: '100009999999',
          pvm_iregistruota: '2025-01-01'
        },
        { ...activeRow, ja_kodas: 222222222, isreg_data: '2024-01-01' },
        { ...activeRow, ja_kodas: 333333333, valstybe: 'LVA' },
        { ...activeRow, ja_kodas: 444444444, klnt_tipas: 'FIZ' }
      ])
    );
    const provider = createVmiCompanyLookupProvider({
      fetchImpl,
      now: () => Date.parse('2026-09-26T00:00:00Z')
    });

    const results = await provider.search('ąžuolas');

    expect(results).toHaveLength(1);
    expect(results[0].vatNumber).toBe('LT100009999999');
  });

  it('ranks exact name, prefix, then substring and returns at most eight companies', async () => {
    const names = [
      'Mano Įmonė',
      'Mano Įmonė Grupė',
      'A Mano Įmonė',
      'B Mano Įmonė',
      'C Mano Įmonė',
      'D Mano Įmonė',
      'E Mano Įmonė',
      'F Mano Įmonė',
      'G Mano Įmonė',
      'H Mano Įmonė'
    ];
    const fetchImpl = vi.fn().mockResolvedValue(
      response(
        names.map((pavadinimas, index) => ({
          ...activeRow,
          ja_kodas: 100000000 + index,
          pavadinimas
        }))
      )
    );
    const provider = createVmiCompanyLookupProvider({ fetchImpl });

    const results = await provider.search('MANO ĮMONĖ');

    expect(results).toHaveLength(8);
    expect(results.slice(0, 3).map(({ legalName }) => legalName)).toEqual([
      'Mano Įmonė',
      'Mano Įmonė Grupė',
      'A Mano Įmonė'
    ]);
  });

  it('caches normalized queries for ten minutes and refreshes after expiry', async () => {
    let now = Date.parse('2026-09-26T00:00:00Z');
    const fetchImpl = vi.fn().mockResolvedValue(response([activeRow]));
    const provider = createVmiCompanyLookupProvider({
      fetchImpl,
      now: () => now
    });

    await provider.search('ĄŽUOLAS');
    await provider.search('  ąžuolas ');
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    now += 10 * 60 * 1000;
    await provider.search('ąžuolas');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['provider rejection', () => Promise.resolve(response([], false))],
    [
      'malformed response',
      () =>
        Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue({ unexpected: [] })
        } as unknown as Response)
    ],
    [
      'timeout',
      (_url: string, options?: RequestInit) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Timed out', 'AbortError'))
          );
        })
    ]
  ])('sanitizes %s failures', async (_label, fetchImpl) => {
    const provider = createVmiCompanyLookupProvider({
      fetchImpl: vi.fn(fetchImpl) as typeof fetch,
      requestTimeoutMs: 1
    });

    await expect(provider.search('ąžuolas')).rejects.toBeInstanceOf(
      CompanyLookupProviderError
    );
  });
});

import {
  COMPANY_LOOKUP_SOURCE,
  type CompanyLookupResult
} from '@invoicetrackr/types';
import z from 'zod/v4';

import { CompanyLookupProvider, CompanyLookupProviderError } from './types';

const VMI_ENDPOINT =
  'https://get.data.gov.lt/datasets/gov/vmi/mm_registras/MokesciuMoketojas';
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const REQUEST_TIMEOUT_MS = 5_000;
const RESULT_LIMIT = 8;
const PROVIDER_ROW_LIMIT = 100;
const EXACT_COMPANY_CODE = /^\d{9}$/;

const nullableDateSchema = z.string().nullable().optional();
const vmiRowSchema = z.object({
  ja_kodas: z.union([z.number(), z.string()]),
  pavadinimas: z.string(),
  klnt_tipas: z.string().nullable().optional(),
  valstybe: z.string().nullable().optional(),
  ireg_data: nullableDateSchema,
  isreg_data: nullableDateSchema,
  anul_data: nullableDateSchema,
  pvm_kodas_pref: z.string().nullable().optional(),
  pvm_kodas: z.string().nullable().optional(),
  pvm_iregistruota: nullableDateSchema,
  pvm_isregistruota: nullableDateSchema
});

const vmiResponseSchema = z.object({
  _data: z.array(vmiRowSchema)
});

type VmiRow = z.infer<typeof vmiRowSchema>;
type CacheEntry = { expiresAt: number; results: CompanyLookupResult[] };

const cache = new Map<string, CacheEntry>();

const normalizeQuery = (query: string) =>
  query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('lt-LT');

const escapeExpressionLiteral = (value: string) => value.replaceAll("'", "''");

const isDateActive = (
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  today: string
) => (!startsAt || startsAt <= today) && (!endsAt || endsAt > today);

const isActiveEntity = (row: VmiRow, today: string) =>
  row.klnt_tipas === 'LJA' &&
  row.valstybe === 'LTU' &&
  isDateActive(row.ireg_data, row.isreg_data, today) &&
  (!row.anul_data || row.anul_data > today);

const activeVatNumber = (rows: VmiRow[], today: string) => {
  const row = rows
    .filter(
      (candidate) =>
        candidate.pvm_kodas &&
        isDateActive(
          candidate.pvm_iregistruota,
          candidate.pvm_isregistruota,
          today
        )
    )
    .sort((first, second) =>
      (second.pvm_iregistruota || '').localeCompare(
        first.pvm_iregistruota || ''
      )
    )[0];

  if (!row?.pvm_kodas) return null;
  if (row.pvm_kodas.toUpperCase().startsWith('LT')) {
    return row.pvm_kodas.toUpperCase();
  }

  return `${row.pvm_kodas_pref || 'LT'}${row.pvm_kodas}`.toUpperCase();
};

const getRank = (result: CompanyLookupResult, normalizedQuery: string) => {
  const normalizedName = normalizeQuery(result.legalName);

  if (result.companyCode === normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 1;
  if (normalizedName.startsWith(normalizedQuery)) return 2;
  return 3;
};

const normalizeRows = (
  rows: VmiRow[],
  normalizedQuery: string,
  today: string
) => {
  const rowsByCompany = new Map<string, VmiRow[]>();

  for (const row of rows) {
    if (!isActiveEntity(row, today)) continue;

    const companyCode = String(row.ja_kodas);
    const companyRows = rowsByCompany.get(companyCode) || [];
    companyRows.push(row);
    rowsByCompany.set(companyCode, companyRows);
  }

  return [...rowsByCompany.entries()]
    .map(
      ([companyCode, companyRows]): CompanyLookupResult => ({
        companyCode,
        legalName: companyRows[0].pavadinimas.trim(),
        vatNumber: activeVatNumber(companyRows, today),
        registeredAddress: null,
        source: COMPANY_LOOKUP_SOURCE
      })
    )
    .sort((first, second) => {
      const rankDifference =
        getRank(first, normalizedQuery) - getRank(second, normalizedQuery);
      return (
        rankDifference ||
        first.legalName.localeCompare(second.legalName, 'lt-LT')
      );
    })
    .slice(0, RESULT_LIMIT);
};

const buildProviderUrl = (normalizedQuery: string) => {
  const condition = EXACT_COMPANY_CODE.test(normalizedQuery)
    ? `ja_kodas=${normalizedQuery}`
    : `contains(lower(pavadinimas),'${escapeExpressionLiteral(normalizedQuery)}')`;
  const query = [
    'select(ja_kodas,pavadinimas,klnt_tipas,valstybe,ireg_data,isreg_data,anul_data,pvm_kodas_pref,pvm_kodas,pvm_iregistruota,pvm_isregistruota)',
    condition,
    `limit(${PROVIDER_ROW_LIMIT})`
  ]
    .map(encodeURIComponent)
    .join('&');

  return `${VMI_ENDPOINT}?${query}`;
};

const getCached = (key: string, now: number) => {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= now) {
    cache.delete(key);
    return undefined;
  }

  cache.delete(key);
  cache.set(key, entry);
  return entry.results;
};

const setCached = (
  key: string,
  results: CompanyLookupResult[],
  now: number
) => {
  cache.delete(key);
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, results });

  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
};

type VmiProviderOptions = {
  fetchImpl?: typeof fetch;
  now?: () => number;
  requestTimeoutMs?: number;
};

export const createVmiCompanyLookupProvider = ({
  fetchImpl = fetch,
  now = Date.now,
  requestTimeoutMs = REQUEST_TIMEOUT_MS
}: VmiProviderOptions = {}): CompanyLookupProvider => ({
  async search(query) {
    const normalizedQuery = normalizeQuery(query);
    const currentTime = now();
    const cachedResults = getCached(normalizedQuery, currentTime);
    if (cachedResults) return cachedResults;

    try {
      const response = await fetchImpl(buildProviderUrl(normalizedQuery), {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(requestTimeoutMs)
      });

      if (!response.ok) throw new CompanyLookupProviderError();

      const parsed = vmiResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new CompanyLookupProviderError();

      const today = new Date(currentTime).toISOString().slice(0, 10);
      const results = normalizeRows(parsed.data._data, normalizedQuery, today);
      setCached(normalizedQuery, results, currentTime);
      return results;
    } catch (error) {
      if (error instanceof CompanyLookupProviderError) throw error;
      throw new CompanyLookupProviderError();
    }
  }
});

export const vmiCompanyLookupProvider = createVmiCompanyLookupProvider();

export const clearVmiCompanyLookupCache = () => cache.clear();

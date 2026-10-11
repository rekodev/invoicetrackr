import fastifyCookie from '@fastify/cookie';
import type { TaxProfile } from '@invoicetrackr/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as journalDb from '../../database/journal';
import * as taxDb from '../../database/tax';
import { getTaxEstimateOptions, saveTaxProfileOptions } from '../../options/tax';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { mockCreateAuditEvent } from '../../test/setup';

vi.mock('../../database/journal');
vi.mock('../../database/tax');

const savedProfile: TaxProfile = {
  expenseMethod: 'thirty_percent',
  hasEmploymentPsdCoverage: false,
  hasAdditionalPensionAccumulation: false,
  activityStartDate: null,
  activityEndDate: null,
  otherDeclaredIncome: '0.00'
};

const createApp = ({ withAuth = false } = {}) =>
  createTestApp((fastifyApp) => {
    if (withAuth) fastifyApp.register(fastifyCookie);
    const preHandler = withAuth
      ? getTaxEstimateOptions.preHandler
      : mockAuthMiddleware;
    fastifyApp.get('/api/:userId/tax-estimate', {
      ...getTaxEstimateOptions,
      preHandler
    });
    fastifyApp.put('/api/:userId/tax-profiles/:year', {
      ...saveTaxProfileOptions,
      preHandler
    });
  });

describe('Tax Controller', () => {
  beforeEach(() => {
    vi.mocked(journalDb.getJournalIncomeRowsFromDb).mockResolvedValue([
      {
        paymentId: 1,
        paymentDate: '2026-03-10',
        invoiceId: 10,
        documentNumber: 'SF001',
        receiverName: 'MB Šaltinis',
        receiverBusinessNumber: '',
        descriptions: 'Svetainės kūrimas',
        receivedAmount: '15000.00',
        paidBefore: '0',
        vatAmount: '0.00',
        totalAmount: '15000.00'
      }
    ]);
    vi.mocked(journalDb.getJournalExpenseRowsFromDb).mockResolvedValue([]);
  });

  it('asks for assumptions before estimating and reports unsupported years', async () => {
    vi.mocked(taxDb.getTaxProfileFromDb).mockResolvedValue(null);
    const app = await createApp();

    const needsProfile = await app.inject({
      method: 'GET',
      url: '/api/1/tax-estimate?year=2026'
    });
    expect(needsProfile.statusCode).toBe(200);
    expect(needsProfile.json()).toEqual({
      year: 2026,
      supportedYears: [2026],
      status: 'needs_profile'
    });
    expect(taxDb.getTaxProfileFromDb).toHaveBeenCalledWith(1, 2026);

    const unsupported = await app.inject({
      method: 'GET',
      url: '/api/1/tax-estimate?year=2025'
    });
    expect(unsupported.json()).toEqual({
      year: 2025,
      supportedYears: [2026],
      status: 'unsupported_year'
    });
    expect(journalDb.getJournalIncomeRowsFromDb).not.toHaveBeenCalled();

    await app.close();
  });

  it('estimates both methods from the journal totals once assumptions exist', async () => {
    vi.mocked(taxDb.getTaxProfileFromDb).mockResolvedValue(savedProfile);
    const app = await createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/tax-estimate?year=2026'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ready',
      profile: savedProfile,
      activeMonths: 12,
      methods: {
        actual: { total: '3273.16' },
        thirtyPercent: { gpm: '525.00', vsd: '1183.14', psd: '965.76', total: '2673.90' }
      },
      lowerMethod: 'thirty_percent',
      rules: { version: '2026.1' }
    });
    expect(journalDb.getJournalIncomeRowsFromDb).toHaveBeenCalledWith({
      userId: 1,
      from: '2026-01-01',
      to: '2026-12-31'
    });

    await app.close();
  });

  it('saves assumptions for the year and records an audit event', async () => {
    vi.mocked(taxDb.getTaxProfileFromDb).mockResolvedValue(null);
    vi.mocked(taxDb.upsertTaxProfileInDb).mockResolvedValue({
      ...savedProfile,
      hasEmploymentPsdCoverage: true,
      activityStartDate: '2026-04-01'
    });
    const app = await createApp();
    const body = {
      expenseMethod: 'thirty_percent',
      hasEmploymentPsdCoverage: true,
      hasAdditionalPensionAccumulation: false,
      activityStartDate: '2026-04-01',
      activityEndDate: null,
      otherDeclaredIncome: '0'
    };

    const response = await app.inject({
      method: 'PUT',
      url: '/api/1/tax-profiles/2026',
      payload: body
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'success.taxProfile.saved' });
    expect(taxDb.upsertTaxProfileInDb).toHaveBeenCalledWith({
      userId: 1,
      year: 2026,
      profile: body
    });
    expect(mockCreateAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'tax_profile.updated',
        entityType: 'tax_profile',
        entityId: '2026',
        newValue: expect.objectContaining({
          hasEmploymentPsdCoverage: true,
          activityStartDate: '2026-04-01'
        })
      })
    );

    await app.close();
  });

  it.each([
    [{ activityStartDate: '2026-06-01', activityEndDate: '2026-03-01' }, 'activityEndDate'],
    [{ otherDeclaredIncome: '-5' }, 'otherDeclaredIncome'],
    [{ expenseMethod: 'flat' }, 'expenseMethod']
  ])('rejects invalid assumptions %j', async (overrides, key) => {
    const app = await createApp();
    const response = await app.inject({
      method: 'PUT',
      url: '/api/1/tax-profiles/2026',
      payload: {
        expenseMethod: 'actual',
        hasEmploymentPsdCoverage: false,
        hasAdditionalPensionAccumulation: false,
        otherDeclaredIncome: '0',
        ...overrides
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ key })])
    );
    expect(taxDb.upsertTaxProfileInDb).not.toHaveBeenCalled();

    await app.close();
  });

  it('requires a session', async () => {
    const app = await createApp({ withAuth: true });
    const response = await app.inject({
      method: 'GET',
      url: '/api/1/tax-estimate?year=2026'
    });

    expect(response.statusCode).toBe(401);
    expect(taxDb.getTaxProfileFromDb).not.toHaveBeenCalled();

    await app.close();
  });
});

import z from 'zod/v4';

export const companyLookupRequestSchema = z.object({
  query: z.string().trim().min(3).max(100)
});

export const companyLookupSourceSchema = z.object({
  provider: z.literal('vmi'),
  label: z.literal('VMI open data via data.gov.lt — CC BY 4.0'),
  url: z.literal('https://data.gov.lt/datasets/607/?resource_version=940')
});

export const companyLookupResultSchema = z.object({
  companyCode: z.string(),
  legalName: z.string(),
  vatNumber: z.string().nullable(),
  registeredAddress: z.null(),
  source: companyLookupSourceSchema
});

export const companyLookupResponseSchema = z.object({
  results: z.array(companyLookupResultSchema).max(8)
});

export type CompanyLookupRequest = z.infer<typeof companyLookupRequestSchema>;
export type CompanyLookupResult = z.infer<typeof companyLookupResultSchema>;
export type CompanyLookupResponse = z.infer<typeof companyLookupResponseSchema>;

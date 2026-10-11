export type TaxYearRules = {
  version: string;
  averageWage: string;
  minimumWage: string;
  deemedExpensesBp: bigint;
  gpm: {
    rateBp: bigint;
    creditRateBp: bigint;
    fullCreditLimit: string;
    creditLimit: string;
    creditSlopeDivisor: string;
    bands: Array<{ upToAverageWages: bigint | null; rateBp: bigint }>;
  };
  contributions: {
    baseShareBp: bigint;
    capAverageWages: bigint;
    vsdRateBp: bigint;
    additionalPensionRateBp: bigint;
    psdRateBp: bigint;
    monthlyPsdMinimum: string;
  };
  sources: Array<{ label: string; url: string }>;
};

const RULES_2026: TaxYearRules = {
  version: '2026.1',
  averageWage: '2312.15',
  minimumWage: '1153.00',
  deemedExpensesBp: 3000n,
  gpm: {
    rateBp: 2000n,
    creditRateBp: 1500n,
    fullCreditLimit: '20000.00',
    creditLimit: '42500.00',
    creditSlopeDivisor: '150000.00',
    bands: [
      { upToAverageWages: 36n, rateBp: 2000n },
      { upToAverageWages: 60n, rateBp: 2500n },
      { upToAverageWages: null, rateBp: 3200n }
    ]
  },
  contributions: {
    baseShareBp: 9000n,
    capAverageWages: 43n,
    vsdRateBp: 1252n,
    additionalPensionRateBp: 300n,
    psdRateBp: 698n,
    monthlyPsdMinimum: '80.48'
  },
  sources: [
    {
      label: 'VMI: GPMĮ pakeitimai nuo 2026-01-01',
      url: 'https://www.vmi.lt/evmi/5725'
    },
    {
      label: 'Sodra: įmokų tarifai savarankiškai dirbantiems nuo 2026-01-01',
      url: 'https://sodra.lt/sodros-imoku-tarifai-taikomi-nuo-2026-m-sausio-1-d-savarankiskai-dirbantiems-asmenims'
    },
    {
      label: 'Sodra: vykdau individualią veiklą',
      url: 'https://sodra.lt/imokos/vykdau-individualia-veikla'
    }
  ]
};

export const TAX_RULES: Record<number, TaxYearRules> = {
  2026: RULES_2026
};

export const SUPPORTED_TAX_YEARS = Object.keys(TAX_RULES).map(Number);

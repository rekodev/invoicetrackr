export type ActionResponseModel = {
  ok: boolean;
  message: string;
  code?: string;
  validationErrors?: Record<string, string>;
  data?: unknown;
};

export type ActionResponseModel<T = unknown> = {
  ok: boolean;
  message: string;
  code?: string;
  validationErrors?: Record<string, string>;
  data?: T;
};

import { Static, Type } from "@sinclair/typebox";
import { InvoicePartyBusinessType, InvoicePartyType } from "./invoice";

export const Client = Type.Object({
  id: Type.Number(),
  type: InvoicePartyType,
  name: Type.String({ minLength: 1, errorMessage: "Name is required" }),
  businessType: InvoicePartyBusinessType,
  businessNumber: Type.String({
    minLength: 1,
    errorMessage: "Business number is required",
  }),
  address: Type.String({ minLength: 1, errorMessage: "Address is required" }),
  email: Type.Optional(
    Type.String({
      format: "email",
      errorMessage: "Must be a valid email address",
    }),
  ),
});

export type ClientModel = Static<typeof Client>;

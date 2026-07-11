import { relations } from 'drizzle-orm/relations';

import {
  bankingInformationTable,
  businessProfilesTable,
  clientsTable,
  invoiceServicesTable,
  invoicesTable,
  usersTable
} from './schema';

export const invoiceServicesRelations = relations(
  invoiceServicesTable,
  ({ one }) => ({
    invoice: one(invoicesTable, {
      fields: [invoiceServicesTable.invoiceId],
      references: [invoicesTable.id]
    })
  })
);

export const invoicesRelations = relations(invoicesTable, ({ one, many }) => ({
  invoiceServices: many(invoiceServicesTable),
  client: one(clientsTable, {
    fields: [invoicesTable.receiverId],
    references: [clientsTable.id]
  }),
  user: one(usersTable, {
    fields: [invoicesTable.userId],
    references: [usersTable.id]
  }),
  bankingInformation: one(bankingInformationTable, {
    fields: [invoicesTable.bankAccountId],
    references: [bankingInformationTable.id]
  })
}));

export const clientsRelations = relations(clientsTable, ({ one, many }) => ({
  invoices: many(invoicesTable),
  user: one(usersTable, {
    fields: [clientsTable.userId],
    references: [usersTable.id]
  })
}));

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  invoices: many(invoicesTable),
  clients: many(clientsTable),
  businessProfile: one(businessProfilesTable),
  bankingInformations: many(bankingInformationTable, {
    relationName: 'bankingInformation_userId_users_id'
  })
}));

export const businessProfilesRelations = relations(
  businessProfilesTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [businessProfilesTable.userId],
      references: [usersTable.id]
    }),
    selectedBankAccount: one(bankingInformationTable, {
      fields: [businessProfilesTable.selectedBankAccountId],
      references: [bankingInformationTable.id]
    })
  })
);

export const bankingInformationRelations = relations(
  bankingInformationTable,
  ({ one, many }) => ({
    invoices: many(invoicesTable),
    user: one(usersTable, {
      fields: [bankingInformationTable.userId],
      references: [usersTable.id],
      relationName: 'bankingInformation_userId_users_id'
    })
  })
);

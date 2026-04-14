import { relations } from "drizzle-orm";

import { PaymentMethod, User, CompanyDocument } from "../schemas/index.js";

export const PaymentMethodRelations = relations(
  PaymentMethod,
  ({ one, many }) => ({
    createdBy: one(User, {
      fields: [PaymentMethod.createdBy],
      references: [User.id],
    }),

    companies: many(CompanyDocument, {
      relationName: "paymentMethod_to_companyPaymentMethod",
    }),
  }),
);

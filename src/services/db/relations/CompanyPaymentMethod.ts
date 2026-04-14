import { relations } from "drizzle-orm";
import {
  Company,
  User,
  CompanyPaymentMethod,
  PaymentMethod,
} from "../schemas/index.js";

export const CompanyPaymentMethodRelations = relations(
  CompanyPaymentMethod,
  ({ one }) => ({
    company: one(Company, {
      fields: [CompanyPaymentMethod.companyId],
      references: [Company.id],
      relationName: "company_to_companyPaymentMethod",
    }),
    paymentMethod: one(PaymentMethod, {
      fields: [CompanyPaymentMethod.paymentMethodId],
      references: [PaymentMethod.id],
      relationName: "paymentMethod_to_companyPaymentMethod",
    }),
    createdBy: one(User, {
      fields: [CompanyPaymentMethod.createdBy],
      references: [User.id],
    }),
  }),
);

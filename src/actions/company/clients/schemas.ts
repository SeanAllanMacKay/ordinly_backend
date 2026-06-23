import * as z from "zod";
import { locationType } from "../../../services/db/constants.js";

// Shared Zod schemas for the polymorphic contact sub-entities, reused across
// client and contact create/update actions.

export const PhoneNumberInputSchema = z.object({
  number: z.string("Phone number must be a string"),
  type: z.string("Phone type must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
});

export const EmailAddressInputSchema = z.object({
  email: z.email("A valid email is required"),
  type: z.string("Email type must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
});

export const LocationInputSchema = z.object({
  address: z.string("Address must be a string"),
  name: z.string("Location name must be a string if passed").optional(),
  zoneIdentifier: z.string("zoneIdentifier must be a string if passed").optional(),
  city: z.string("City must be a string if passed").optional(),
  region: z.string("Region must be a string if passed").optional(),
  country: z.string("Country must be a string if passed").optional(),
  type: z.enum(locationType).optional(),
  latitude: z.string("Latitude must be a string if passed").optional(),
  longitude: z.string("Longitude must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
});

// Spread into client/contact schemas. When an array is provided on update it
// replaces that sub-entity set; omitting it leaves the existing rows untouched.
export const contactInfoFields = {
  phoneNumbers: z.array(PhoneNumberInputSchema).optional(),
  emails: z.array(EmailAddressInputSchema).optional(),
  locations: z.array(LocationInputSchema).optional(),
};

// A contact nested inside a client create payload.
export const NestedContactSchema = z.object({
  name: z.string("Contact name must be a string"),
  role: z.string("Role must be a string if passed").optional(),
  description: z.string("Description must be a string if passed").optional(),
  ...contactInfoFields,
});

import {
  db,
  Contact,
  insertOwnedContactInfo,
  OwnedContactInfoInput,
} from "../../index.js";

export type InsertContactProps = {
  companyId: string;
  clientId: string;
  userId: string;
  name: string;
  role?: string;
  description?: string;
} & OwnedContactInfoInput;

// Creates a contact under a client, plus its phone/email/location info.
export const insertContact = async ({
  companyId,
  clientId,
  userId,
  name,
  role,
  description,
  phoneNumbers,
  emails,
  locations,
}: InsertContactProps) => {
  return await db.transaction(async (tx) => {
    const [contact] = await tx
      .insert(Contact)
      .values({ companyId, clientId, name, role, description, createdBy: userId })
      .returning();

    await insertOwnedContactInfo(tx, {
      ownerType: "contact",
      ownerId: contact.id,
      userId,
      phoneNumbers,
      emails,
      locations,
    });

    return contact;
  });
};

import { and, eq, inArray, isNull } from "drizzle-orm";

import { db, PhoneNumber, EmailAddress, Location } from "../../index.js";
import { locationType, ownerType } from "../../constants.js";

export type OwnerType = (typeof ownerType)[number];

// Transaction handle type, derived from db.transaction's callback param so the
// owned-info helpers can run inside a parent transaction.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type PhoneNumberInput = {
  number: string;
  type?: string;
  description?: string;
};

export type EmailAddressInput = {
  email: string;
  type?: string;
  description?: string;
};

export type LocationInput = {
  address: string;
  name?: string;
  zoneIdentifier?: string;
  city?: string;
  region?: string;
  country?: string;
  type?: (typeof locationType)[number];
  latitude?: string;
  longitude?: string;
  description?: string;
};

export type OwnedContactInfoInput = {
  phoneNumbers?: PhoneNumberInput[];
  emails?: EmailAddressInput[];
  locations?: LocationInput[];
};

// Inserts the provided phone/email/location rows for an owner. Empty/omitted
// arrays insert nothing. Runs inside the caller's transaction.
export const insertOwnedContactInfo = async (
  tx: Tx,
  {
    ownerType,
    ownerId,
    userId,
    phoneNumbers,
    emails,
    locations,
  }: {
    ownerType: OwnerType;
    ownerId: string;
    userId: string;
  } & OwnedContactInfoInput,
) => {
  if (phoneNumbers?.length) {
    await tx.insert(PhoneNumber).values(
      phoneNumbers.map((p) => ({
        ownerType,
        ownerId,
        number: p.number,
        type: p.type,
        description: p.description,
        createdBy: userId,
      })),
    );
  }

  if (emails?.length) {
    await tx.insert(EmailAddress).values(
      emails.map((e) => ({
        ownerType,
        ownerId,
        email: e.email,
        type: e.type,
        description: e.description,
        createdBy: userId,
      })),
    );
  }

  if (locations?.length) {
    await tx.insert(Location).values(
      locations.map((l) => ({
        ownerType,
        ownerId,
        address: l.address,
        name: l.name,
        zoneIdentifier: l.zoneIdentifier,
        city: l.city,
        region: l.region,
        country: l.country,
        type: l.type,
        latitude: l.latitude,
        longitude: l.longitude,
        description: l.description,
        createdBy: userId,
      })),
    );
  }
};

// Reconciles an owner's contact info to exactly the provided sets. Each array is
// independent: when provided (even empty), the existing rows of that type are
// soft-deleted and replaced; when omitted (undefined), that type is left as-is.
export const replaceOwnedContactInfo = async (
  tx: Tx,
  {
    ownerType,
    ownerId,
    userId,
    phoneNumbers,
    emails,
    locations,
  }: {
    ownerType: OwnerType;
    ownerId: string;
    userId: string;
  } & OwnedContactInfoInput,
) => {
  const stamp = { deletedDate: new Date(), deletedBy: userId };

  if (phoneNumbers !== undefined) {
    await tx
      .update(PhoneNumber)
      .set(stamp)
      .where(
        and(
          eq(PhoneNumber.ownerType, ownerType),
          eq(PhoneNumber.ownerId, ownerId),
          isNull(PhoneNumber.deletedDate),
        ),
      );
  }

  if (emails !== undefined) {
    await tx
      .update(EmailAddress)
      .set(stamp)
      .where(
        and(
          eq(EmailAddress.ownerType, ownerType),
          eq(EmailAddress.ownerId, ownerId),
          isNull(EmailAddress.deletedDate),
        ),
      );
  }

  if (locations !== undefined) {
    await tx
      .update(Location)
      .set(stamp)
      .where(
        and(
          eq(Location.ownerType, ownerType),
          eq(Location.ownerId, ownerId),
          isNull(Location.deletedDate),
        ),
      );
  }

  await insertOwnedContactInfo(tx, {
    ownerType,
    ownerId,
    userId,
    phoneNumbers,
    emails,
    locations,
  });
};

// Soft-deletes every phone/email/location belonging to the given owner ids.
// Used when cascading a client/contact delete.
export const softDeleteOwnedContactInfo = async (
  tx: Tx,
  {
    ownerType,
    ownerIds,
    userId,
  }: {
    ownerType: OwnerType;
    ownerIds: string[];
    userId: string;
  },
) => {
  if (!ownerIds.length) return;

  const stamp = { deletedDate: new Date(), deletedBy: userId };

  await tx
    .update(PhoneNumber)
    .set(stamp)
    .where(
      and(
        eq(PhoneNumber.ownerType, ownerType),
        inArray(PhoneNumber.ownerId, ownerIds),
        isNull(PhoneNumber.deletedDate),
      ),
    );

  await tx
    .update(EmailAddress)
    .set(stamp)
    .where(
      and(
        eq(EmailAddress.ownerType, ownerType),
        inArray(EmailAddress.ownerId, ownerIds),
        isNull(EmailAddress.deletedDate),
      ),
    );

  await tx
    .update(Location)
    .set(stamp)
    .where(
      and(
        eq(Location.ownerType, ownerType),
        inArray(Location.ownerId, ownerIds),
        isNull(Location.deletedDate),
      ),
    );
};

export type OwnedContactInfo = {
  phoneNumbers: (typeof PhoneNumber.$inferSelect)[];
  emails: (typeof EmailAddress.$inferSelect)[];
  locations: (typeof Location.$inferSelect)[];
};

// Batch-loads non-deleted contact info for many owners of the same type, keyed
// by ownerId. One query per sub-entity type, so no N+1 across a list.
export const selectOwnedContactInfoBatch = async ({
  ownerType,
  ownerIds,
}: {
  ownerType: OwnerType;
  ownerIds: string[];
}): Promise<Record<string, OwnedContactInfo>> => {
  const map: Record<string, OwnedContactInfo> = {};
  for (const id of ownerIds) {
    map[id] = { phoneNumbers: [], emails: [], locations: [] };
  }

  if (!ownerIds.length) return map;

  const [phoneNumbers, emails, locations] = await Promise.all([
    db
      .select()
      .from(PhoneNumber)
      .where(
        and(
          eq(PhoneNumber.ownerType, ownerType),
          inArray(PhoneNumber.ownerId, ownerIds),
          isNull(PhoneNumber.deletedDate),
        ),
      ),
    db
      .select()
      .from(EmailAddress)
      .where(
        and(
          eq(EmailAddress.ownerType, ownerType),
          inArray(EmailAddress.ownerId, ownerIds),
          isNull(EmailAddress.deletedDate),
        ),
      ),
    db
      .select()
      .from(Location)
      .where(
        and(
          eq(Location.ownerType, ownerType),
          inArray(Location.ownerId, ownerIds),
          isNull(Location.deletedDate),
        ),
      ),
  ]);

  for (const row of phoneNumbers) map[row.ownerId]?.phoneNumbers.push(row);
  for (const row of emails) map[row.ownerId]?.emails.push(row);
  for (const row of locations) map[row.ownerId]?.locations.push(row);

  return map;
};

// Convenience single-owner read.
export const selectOwnedContactInfo = async ({
  ownerType,
  ownerId,
}: {
  ownerType: OwnerType;
  ownerId: string;
}): Promise<OwnedContactInfo> => {
  const map = await selectOwnedContactInfoBatch({
    ownerType,
    ownerIds: [ownerId],
  });
  return map[ownerId];
};

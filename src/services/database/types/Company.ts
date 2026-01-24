import type { Schema as SchemaType, Document, Model } from "mongoose";

export interface CompanyType {
  owner: string;
  name: string;
  description?: string;
  profilePicture: { key: string; name: string };
  profile: {
    tagline?: string;
    description?: string;
    tags?: string[];
    location?: {
      country?: string;
      region?: string;
      city?: string;
      streetAddress?: string;
    };
  };
  createdBy: SchemaType.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedBy?: SchemaType.Types.ObjectId;
  deletedAt?: Date;
  projects?: { clients?: string[]; assignees?: string[]; projectId: any }[];
  workers: {
    _id?: any;
    userId?: string;
    email: string;
    role?: string;
    status: string;
    addedBy?: string;
    addedAt: Date;
    removedAt?: Date;
  }[];
  clients?: string[];
  subscription?: {
    active: boolean;
    subscriptionId: string;
    customerId: string;
  };
}

//@ts-ignore
export interface CompanyDocument extends Document, CompanyType {}

//@ts-ignore
export interface CompanyModel extends Model<CompanyDocument> {}

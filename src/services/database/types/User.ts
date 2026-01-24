import type { Document, Model } from "mongoose";

export type UserType = {
  name: string;
  email: string;
  password: string;
  accountType: string;
  isPublic: boolean;
  isVerified: boolean;
  verificationCode: string;
  companies: string[];
  projects: string[];
  profile?: {
    description: string;
    phone?: string;
    email?: string;
    profilePicture?: string;
    coverPicture?: string;
    displayName?: string;
    website?: string;
    address?: string;
  };
};

export interface UserDocumentType extends Document, UserType {}

export interface UserModelType extends Model<UserDocumentType> {}

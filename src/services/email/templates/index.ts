import type { EmailTemplate } from "./types.js";

import attemptedSignUp from "./attemptedSignUp.js";
import successfulSignUp from "./successfulSignUp.js";
import accountVerified from "./accountVerified.js";
import attemptedSignUpWithUnverified from "./attemptedSignUpWithUnverified.js";
import existingUserInvitedToCompany from "./existingUserInvitedToCompany.js";
import newUserInvitedToCompany from "./newUserInvitedToCompany.js";
import revokedInvitationToCompany from "./revokedInvitationToCompany.js";
import acceptedInvitationToCompany from "./acceptedInvitationToCompany.js";
import declinedInvitationToCompany from "./declinedInvitationToCompany.js";
import removedFromCompany from "./removedFromCompany.js";
import missedPayment from "./missedPayment.js";
import changedPassword from "./changedPassword.js";
import clientInvitedToCompany from "./clientInvitedToCompany.js";
import companyInvitedToPersonalProject from "./companyInvitedToPersonalProject.js";
import revokeInvitationToPersonalProject from "./revokeInvitationToPersonalProject.js";
import companyInvitedToCompanyProject from "./companyInvitedToCompanyProject.js";
import companyCreated from "./companyCreated.js";
import companyOnboarding from "./companyOnboarding.js";
import companyFreeTrialHalfOver from "./companyFreeTrialHalfOver.js";
import companyFreeTrialOverInTwoDays from "./companyFreeTrialOverInTwoDays.js";
import companyFreeTrialExpiredNoSubscription from "./companyFreeTrialExpiredNoSubscription.js";
import companyFreeTrialExpiredWithSubscription from "./companyFreeTrialExpiredWithSubscription.js";
import reminder from "./reminder.js";
import accountDeleted from "./accountDeleted.js";
import accountRestored from "./accountRestored.js";

/**
 * Registry of every email type the app can send. Add a new template by creating
 * a `{ subject, html }` function file in this folder and registering it here.
 */
export const emailTemplates = {
  attemptedSignUp,
  successfulSignUp,
  accountVerified,
  attemptedSignUpWithUnverified,
  existingUserInvitedToCompany,
  newUserInvitedToCompany,
  revokedInvitationToCompany,
  acceptedInvitationToCompany,
  declinedInvitationToCompany,
  removedFromCompany,
  missedPayment,
  changedPassword,
  clientInvitedToCompany,
  companyInvitedToPersonalProject,
  revokeInvitationToPersonalProject,
  companyInvitedToCompanyProject,
  companyCreated,
  companyOnboarding,
  companyFreeTrialHalfOver,
  companyFreeTrialOverInTwoDays,
  companyFreeTrialExpiredNoSubscription,
  companyFreeTrialExpiredWithSubscription,
  reminder,
  accountDeleted,
  accountRestored,
} satisfies Record<string, EmailTemplate>;

export type EmailType = keyof typeof emailTemplates;

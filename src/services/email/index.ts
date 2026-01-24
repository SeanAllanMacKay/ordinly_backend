import sgMail from "@sendgrid/mail";

import attemptedSignUp from "./attemptedSignUp";
import successfulSignUp from "./successfulSignUp";
import accountVerified from "./accountVerified";
import attemptedSignUpWithUnverified from "./attemptedSignUpWithUnverified";
import existingUserInvitedToCompany from "./existingUserInvitedToCompany";
import newUserInvitedToCompany from "./newUserInvitedToCompany";
import revokedInvitationToCompany from "./revokedInvitationToCompany";
import acceptedInvitationToCompany from "./acceptedInvitationToCompany";
import declinedInvitationToCompany from "./declinedInvitationToCompany";
import removedFromCompany from "./removedFromCompany";
import missedPayment from "./missedPayment";
import changedPassword from "./changedPassword";
import clientInvitedToCompany from "./clientInvitedToCompany";
import companyInvitedToPersonalProject from "./companyInvitedToPersonalProject";
import revokeInvitationToPersonalProject from "./revokeInvitationToPersonalProject";
import companyInvitedToCompanyProject from "./companyInvitedToCompanyProject";

const SENDGRID_API_KEY: string = process.env["SENDGRID_API_KEY"] || "";

const SENDGRID_EMAIL_ADDRESS: string =
  process.env["SENDGRID_EMAIL_ADDRESS"] || "";

sgMail.setApiKey(SENDGRID_API_KEY);

type EmailFunctionResponse = {
  subject: string;
  html: string;
};

type EmailProps = {
  email: string;
  type: string;
} & { [key: string]: string };

type Email = {
  from: string;
  to: string;
} & EmailFunctionResponse;

type EmailReturn = {
  email: Email;
};

const emailTypes: {
  [key: string]: (props: any) => EmailFunctionResponse;
} = {
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
};

export default async ({
  email: emailAddress,
  type,
  ...rest
}: EmailProps): Promise<EmailReturn | undefined> => {
  try {
    const email = {
      from: SENDGRID_EMAIL_ADDRESS,
      to: emailAddress,
      ...emailTypes[type](rest),
    };

    try {
      await sgMail.send(email);
      return { email };
    } catch (emailError) {
      console.error(emailError);
      throw { email };
    }
  } catch (caught: any) {}
};

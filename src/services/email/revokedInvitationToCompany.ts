type RevokedInvitationToCompanyProps = {
  companyName: string;
};

export default ({ companyName }: RevokedInvitationToCompanyProps) => ({
  subject: `Invitation to company revoked`,
  html: `<h2>Your invitation to ${companyName} was revoked</h2>`,
});

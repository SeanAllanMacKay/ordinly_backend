type ExistingUserInvitedToCompanyProps = {
  companyName: string;
};

export default ({ companyName }: ExistingUserInvitedToCompanyProps) => ({
  subject: `Invitation to company`,
  html: `<h2>You've been invited to work on ${companyName}</h2><p><a href="http://ordinly.com">Click Here</a> to log in and start working with them.</p>`,
});

type NewUserInvitedToCompanyProps = {
  companyName: string;
};

export default ({ companyName }: NewUserInvitedToCompanyProps) => ({
  subject: `Invitation to company`,
  html: `<h2>You've been invited to work with ${companyName}</h2><p><a href="http://ordinly.com/">Click Here</a> to sign up and start working with them.</p>`,
});

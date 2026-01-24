type ClientInvitedToCompanyProps = {
  companyName: string;
  clientName: string;
};

export default ({ companyName, clientName }: ClientInvitedToCompanyProps) => ({
  subject: `Invitation to company`,
  html: `<h2>${clientName} has been invited to work with ${companyName}</h2><p><a href="http://ordinly.com/">Click Here</a> to log in and start working with them.</p>`,
});

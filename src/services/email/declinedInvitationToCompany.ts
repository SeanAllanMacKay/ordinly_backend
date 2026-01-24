type DeclinedInvitationProps = {
  userName: string;
  companyName: string;
};

export default ({ userName, companyName }: DeclinedInvitationProps) => ({
  subject: `Invitation to company`,
  html: `<h2>${userName} has declined your invitation to ${companyName}</h2>`,
});

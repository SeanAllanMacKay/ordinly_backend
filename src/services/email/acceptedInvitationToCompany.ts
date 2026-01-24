type AcceptedInvitationProps = {
  userName: string;
  companyName: string;
};

export default ({ userName, companyName }: AcceptedInvitationProps) => ({
  subject: `Invitation to company`,
  html: `<h2>${userName} has accepted your invitation to ${companyName}</h2>`,
});

type CompanyInvitedToPersonalProjectProps = {
  userName: string;
  companyName: string;
};

export default ({
  userName,
  companyName,
}: CompanyInvitedToPersonalProjectProps) => ({
  subject: `Invitation to ${userName}'s personal project has been revoked`,
  html: `<h2>${userName} has revoked their invitation for ${companyName} to work with them on a personal project.</h2>`,
});

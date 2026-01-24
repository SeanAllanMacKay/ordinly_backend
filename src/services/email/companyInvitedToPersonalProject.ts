type CompanyInvitedToPersonalProjectProps = {
  userName: string;
  companyName: string;
};

export default ({
  userName,
  companyName,
}: CompanyInvitedToPersonalProjectProps) => ({
  subject: `Invitation to ${userName}'s personal project`,
  html: `<h2>${userName} has invited ${companyName} to work with them on a personal project. </h2><p><a href="http://ordinly.com/">Click Here</a> to log in and start working with them.</p>`,
});

type CompanyInvitedToCompanyProjectProps = {
  userName: string;
  toCompanyName: string;
  fromCompanyName: string;
};

export default ({
  userName,
  toCompanyName,
  fromCompanyName,
}: CompanyInvitedToCompanyProjectProps) => ({
  subject: `Invitation to ${fromCompanyName}'s project`,
  html: `<h2>${userName} has invited ${toCompanyName} to work with them on one of ${fromCompanyName}'s projects. </h2><p><a href="http://ordinly.com/">Click Here</a> to log in and start working with them.</p>`,
});

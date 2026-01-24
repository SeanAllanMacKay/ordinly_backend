type RemovedFromCompanyCompanyProps = {
  companyName: string;
};

export default ({ companyName }: RemovedFromCompanyCompanyProps) => ({
  subject: `Removed from ${companyName}`,
  html: `<h2>You have been removed from ${companyName}</h2>`,
});

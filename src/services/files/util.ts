export const fileServicePrefixes = {
  companyLogo: ({ companyId }: { companyId: string }) =>
    `company/${companyId}/logo`,
  userProfilePicture: ({ userId }: { userId: string }) =>
    `user/${userId}/profile-picture`,
  teamProfilePicture: ({ teamId }: { teamId: string }) =>
    `team/${teamId}/profile-picture`,
  clientProfilePicture: ({ clientId }: { clientId: string }) =>
    `client/${clientId}/profile-picture`,
  contactProfilePicture: ({ contactId }: { contactId: string }) =>
    `contact/${contactId}/profile-picture`,
  taskDocument: ({ taskId }: { taskId: string }) => `tasks/${taskId}/documents`,
};

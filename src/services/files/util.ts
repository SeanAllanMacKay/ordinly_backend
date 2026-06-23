export const fileServicePrefixes = {
  companyLogo: ({ companyId }: { companyId: string }) =>
    `company/${companyId}/logo`,
  userProfilePicture: ({ userId }: { userId: string }) =>
    `user/${userId}/profile-picture`,
  taskDocument: ({ taskId }: { taskId: string }) => `tasks/${taskId}/documents`,
};

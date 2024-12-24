export default {
  text: 'Text',
  validationErrors: {
    invoice: {
      name: 'Name is required',
      status: 'Status is required',
      services: {
        description: 'Description is required',
        amount: 'Amount is required',
      },
    },
    user: {
      password: 'Current password is required',
      newPassword: 'New password is required',
      confirmedNewPassword: 'Confirmed new password is required',
    },
  },
  errors: {
    user: {
      accountSettings: {
        update: {
          success: 'Account settings updated successfully',
          badRequest: 'Unable to update account settings',
        },
      },
      changePassword: {
        currentPassword: 'Current password is incorrect',
        newAndConfirmed: 'New password and confirmed new password do not match',
        success: 'Password changed successfully',
        badRequest: 'Unable to change password',
      },
    },
  },
};

export default {
  emails: {
    resetPassword: {
      subject: 'Reset Your Password',
      text: 'Click the link to reset your password: %{resetLink}'
    }
  },
  validation: {
    invoice: {
      name: 'Name is required',
      status: 'Status is required',
      services: {
        description: 'Description is required',
        amount: 'Amount is required'
      }
    },
    client: {
      email: 'Must be a valid email address'
    },
    user: {
      password: 'Current password is required',
      newPassword: 'New password is required',
      confirmedNewPassword: 'Confirmed new password is required'
    }
  },
  success: {
    user: {
      created: 'User created successfully',
      updated: 'User information updated successfully',
      deleted: 'Account deleted successfully',
      profilePictureUpdated: 'Profile picture updated successfully',
      accountSettingsUpdated: 'Account settings updated successfully',
      passwordChanged: 'Password changed successfully',
      resetLinkSent: 'Reset link has been sent to the entered email',
      selectedBankAccountUpdated: 'Selected bank account updated successfully'
    },
    invoice: {
      created: 'Invoice added successfully',
      updated: 'Invoice updated successfully',
      deleted: 'Invoice deleted successfully',
      statusUpdated: 'Invoice status updated successfully',
      emailSent: 'Email sent successfully'
    },
    client: {
      created: 'Client added successfully',
      updated: 'Client updated successfully',
      deleted: 'Client deleted successfully'
    },
    bankAccount: {
      created: 'Bank account added successfully',
      createdWithWarning: 'Bank account added succesfully. Please select it as your main account.',
      updated: 'Bank account updated successfully',
      deleted: 'Bank account deleted successfully'
    },
    payment: {
      subscriptionCanceled: 'Subscription canceled successfuly'
    },
    contact: {
      messageSent: 'Message sent successfully'
    }
  },
  error: {
    user: {
      notFound: 'User not found',
      alreadyExists: 'User already exists',
      invalidCredentials: 'Invalid credentials',
      passwordsDoNotMatch: 'Passwords do not match',
      currentPasswordIncorrect: 'Current password is incorrect',
      newPasswordMismatch: 'New password and confirmed new password do not match',
      unableToCreate: 'Unable to create user',
      unableToUpdate: 'Unable to update user information',
      unableToDelete: 'Unable to delete account at this time. Please try again later',
      unableToUpdateProfilePicture: 'Unable to update profile picture',
      unableToUpdateAccountSettings: 'Unable to update account settings',
      unableToChangePassword: 'Unable to change password',
      unableToSendResetLink: 'Unable to send reset link. Please try again',
      tokenInvalid: 'Token is invalid',
      tokenExpired: 'Token has expired',
      unableToUploadSignature: 'Unable to upload signature',
      unableToUpdateSelectedBankAccount: 'Unable to update selected bank account'
    },
    invoice: {
      notFound: 'Invoice not found',
      alreadyExists: 'Invoice with provided invoice ID already exists',
      unableToCreate: 'Unable to add invoice',
      unableToUpdate: 'Unable to update invoice',
      unableToDelete: 'Unable to delete invoice',
      unableToUpdateStatus: 'Unable to update invoice status',
      unableToRetrieveData: 'Unable to retrieve invoice data',
      unableToSendEmail: 'Unable to send email'
    },
    client: {
      notFound: 'Client not found',
      alreadyExists: 'Client already exists',
      unableToCreate: 'Unable to add client',
      unableToUpdate: 'Unable to update client',
      unableToDelete: 'Unable to delete client'
    },
    bankAccount: {
      notFound: 'Bank account not found',
      alreadyExists: 'Bank account with provided account number already exists',
      unableToCreate: 'Unable to add bank account',
      unableToUpdate: 'Unable to update bank account',
      unableToDelete: 'Unable to delete bank account',
      cannotDeleteSelected: 'Cannot delete selected bank account'
    },
    payment: {
      customerNotFound: 'Customer not found',
      unableToCreateCustomer: 'Unable to create customer',
      subscriptionNotFound: 'Subscription not found',
      subscriptionAlreadyActive: 'Subscription already active',
      unableToCreateSubscription: 'Unable to create subscription',
      unableToCancel: 'Unable to cancel subscription'
    },
    contact: {
      unableToSendMessage: 'Failed to send message'
    }
  }
};

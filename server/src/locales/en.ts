export default {
  emails: {
    resetPassword: {
      subject: 'Reset Your Password',
      text: 'Click the link to reset your password: %{resetLink}'
    }
  },
  validation: {
    general: 'Review fields and retry',
    reviewField: 'Review field',
    password: {
      required: 'Password is required',
      currentRequired: 'Current password is required',
      tooShort: 'Password must be at least 8 characters long',
      tooLong: 'Password must not exceed 100 characters',
      requireUppercase: 'Password must contain at least one uppercase letter',
      requireLowercase: 'Password must contain at least one lowercase letter',
      requireNumber: 'Password must contain at least one number',
      mismatch: 'Passwords do not match'
    },
    invoice: {
      invoiceId: 'Required to match format "ABC123"',
      date: 'Valid date is required',
      dueDate: 'Valid date is required',
      dueDateAfterDate: 'Due date must be after invoice date',
      status: 'Valid status is required',
      businessType: '"Business" or "Individual" required',
      partyType: 'Valid party type is required',
      totalAmount: 'Total amount is required',
      sender: {
        required: 'Sender is required',
        name: 'Name is required',
        businessNumber: 'Business number is required',
        address: 'Address is required',
        email: 'Valid email is required'
      },
      receiver: {
        required: 'Receiver is required',
        name: 'Name is required',
        businessNumber: 'Business number up to 15 characters is required',
        address: 'Address up to 255 characters is required',
        email: 'Valid email is required'
      },
      services: {
        required: 'At least one service is required',
        description: 'Description up to 200 characters is required',
        unit: 'Unit up to 20 characters is required',
        quantity: 'Quantity between 0.0001 and 10,000 is required',
        amount: 'Amount between 0.01 and 1,000,000 is required'
      },
      bankingInformation: {
        required: 'Banking information is required',
        name: 'Bank name is required',
        code: 'Bank code is required',
        accountNumber: 'Bank account number is required'
      },
      email: {
        format: 'Invalid email',
        subject: 'Subject is required',
        message: 'Message is too long'
      },
      recipientEmail: 'Valid recipient email is required',
      subject: 'Subject is required',
      message: 'Message must not exceed 1000 characters'
    },
    client: {
      name: 'Name is required',
      businessNumber: 'Business number is required',
      address: 'Address is required',
      email: 'Must be a valid email address'
    },
    bankAccount: {
      name: 'Bank name is required',
      code: 'Bank code is required',
      accountNumber: 'Bank account number is required'
    },
    user: {
      name: 'Name is required',
      businessNumber: 'Business number is required',
      address: 'Address is required',
      email: 'Valid email is required',
      currency: 'Currency is required',
      language: 'Language is required'
    },
    contact: {
      email: 'Invalid email',
      message: 'Message must be between 1 and 5000 characters long'
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
      createdWithWarning:
        'Bank account added successfully. Please select it as your main account.',
      updated: 'Bank account updated successfully',
      deleted: 'Bank account deleted successfully'
    },
    payment: {
      subscriptionCanceled: 'Subscription canceled successfully'
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
      unableToCreate: 'Unable to create user',
      unableToUpdate: 'Unable to update user information',
      unableToDelete:
        'Unable to delete account at this time. Please try again later',
      unableToUpdateProfilePicture: 'Unable to update profile picture',
      unableToUpdateAccountSettings: 'Unable to update account settings',
      unableToChangePassword: 'Unable to change password',
      unableToSendResetLink: 'Unable to send reset link. Please try again',
      tokenInvalid: 'Token is invalid',
      tokenExpired: 'Token has expired',
      unableToUploadSignature: 'Unable to upload signature',
      unableToUpdateSelectedBankAccount:
        'Unable to update selected bank account'
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

export default {
  emails: {
    resetPassword: {
      subject: 'Reset Your Password',
      text: 'Click the link to reset your password: %{resetLink}',
      greeting: 'Hello!',
      message:
        'We received a request to reset your password. Click the button below to create a new password:',
      buttonText: 'Reset Password',
      orCopy: 'Or copy and paste this link into your browser:',
      linkExpiry: 'This link will expire in 1 hour for security reasons.',
      noRequest:
        "If you didn't request a password reset, you can safely ignore this email.",
      footer: 'This email was sent by InvoiceTrackr',
      copyright: '© %{year} InvoiceTrackr. All rights reserved.'
    },
    verifyEmail: {
      subject: 'Verify your InvoiceTrackr email',
      text: 'Click the link to verify your email: %{verificationLink}',
      greeting: 'Welcome to InvoiceTrackr!',
      message:
        'Confirm your email address so you can send invoices and receive account notifications.',
      buttonText: 'Verify email',
      orCopy: 'Or copy and paste this link into your browser:',
      linkExpiry: 'This link will expire in 24 hours for security reasons.',
      noRequest:
        "If you didn't create an InvoiceTrackr account, you can safely ignore this email.",
      footer: 'This email was sent by InvoiceTrackr',
      copyright: '© %{year} InvoiceTrackr. All rights reserved.'
    },
    invoice: {
      title: 'InvoiceTrackr',
      defaultMessage: 'Please find your invoice attached.',
      detailsTitle: 'Invoice Details',
      sentBy: 'This invoice was sent from %{senderName} via InvoiceTrackr.',
      invoiceNumber: 'Invoice Number:',
      amount: 'Amount:',
      dueDate: 'Due Date:',
      from: 'From:',
      attachmentTitle: 'Invoice Attached',
      attachmentMessage:
        'The complete invoice document is attached to this email as a PDF file.',
      signingTitle: 'Review and sign invoice',
      signingMessage:
        'Open the secure invoice link to review the document, add your signature, and download the signed PDF.',
      signingButton: 'Review and sign',
      publicInvoiceTitle: 'View invoice',
      publicInvoiceMessage:
        'Open the secure invoice page to review the PDF, see payment details, and pay online if the sender accepts card payments.',
      publicInvoiceButton: 'View invoice',
      signedNotification: {
        recipient: 'The recipient',
        subject: 'Invoice %{invoiceId} was signed',
        message: '%{receiverName} signed invoice %{invoiceId}.',
        review: 'You can review the signed invoice here:',
        reviewButton: 'View signed invoice'
      },
      footer: 'This email was sent by InvoiceTrackr',
      copyright: 'InvoiceTrackr. All rights reserved.'
    },
    billing: {
      buttonText: 'Manage billing',
      fallback: 'Or copy and paste this billing link into your browser:',
      note: 'Keeping your billing details current keeps your invoice workflow available without interruption.',
      trialEnding: {
        subject: 'Your InvoiceTrackr trial is ending soon',
        text: 'Your 7-day trial is ending soon. Add a payment method in your account settings to keep using InvoiceTrackr.'
      },
      paymentFailed: {
        subject: 'Your InvoiceTrackr payment failed',
        text: 'We could not process your subscription payment. You have 3 days to update your payment method in your account settings.'
      }
    },
    incomeJournal: {
      filename: 'income-journal',
      paymentDate: 'Payment date',
      invoiceDate: 'Invoice date',
      documentNumber: 'Document number',
      client: 'Client',
      clientCode: 'Client code',
      services: 'Services / goods',
      subtotal: 'Subtotal (%{currency})',
      vatTotal: 'VAT total (%{currency})',
      grandTotal: 'Grand total (%{currency})'
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
      invoiceId: 'Required to match format "ABC123" or "SF001"',
      invoiceSeries: 'Invoice series must be 2-8 letters',
      date: 'Valid date is required',
      dueDate: 'Valid date is required',
      dueDateAfterDate: 'Due date must be after invoice date',
      incomeJournalDateRange: 'End date must not be before start date',
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
        quantity: {
          number: 'Quantity must be a number',
          min: 'Quantity must be at least 0.0001',
          max: 'Quantity must not exceed 10,000'
        },
        amount: {
          number: 'Amount must be a number',
          min: 'Amount must be at least 0.01',
          max: 'Amount must not exceed 10,000,000'
        }
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
      language: 'Language is required',
      preferredInvoiceLanguage: 'Preferred invoice language is required'
    },
    contact: {
      email: 'Invalid email',
      message: 'Message must be between 1 and 5000 characters long'
    }
  },
  success: {
    user: {
      loggedIn: 'Logged in successfully',
      created: 'User created successfully',
      updated: 'User information updated successfully',
      deleted: 'Account deleted successfully',
      profilePictureUpdated: 'Profile picture updated successfully',
      accountSettingsUpdated: 'Account settings updated successfully',
      passwordChanged: 'Password changed successfully',
      resetLinkSent: 'Reset link has been sent to the entered email',
      verificationEmailSent: 'Verification email has been sent',
      emailVerified: 'Email verified successfully',
      emailAlreadyVerified: 'Email is already verified',
      oauthLinked: 'Google account connected successfully',
      selectedBankAccountUpdated: 'Selected bank account updated successfully'
    },
    invoice: {
      created: 'Invoice added successfully',
      updated: 'Invoice updated successfully',
      deleted: 'Invoice deleted successfully',
      statusUpdated: 'Invoice status updated successfully',
      emailSent: 'Email sent successfully',
      signed: 'Invoice signed successfully',
      signingLinkRevoked: 'Signing link revoked',
      signingLinkRegenerated: 'Fresh signing link generated'
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
      unableToSendVerificationEmail:
        'Unable to send verification email. Please try again',
      emailVerificationRequired:
        'Verify your email before sending invoice emails',
      emailVerificationCooldown:
        'Please wait before requesting another verification email',
      oauthEmailNotVerified:
        'Google did not confirm this email address. Please use another sign-in method',
      tokenInvalid: 'Token is invalid',
      tokenExpired: 'Token has expired',
      tokenAlreadyUsed: 'Token has already been used',
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
      unableToSendEmail: 'Unable to send email',
      unableToCreatePublicLink: 'Unable to create public invoice link',
      unableToCreateSigningLink: 'Unable to create invoice signing link',
      unableToRegenerateSigningLink:
        'Unable to regenerate invoice signing link',
      signingLinkExpired:
        'This invoice link has expired. Ask the sender for a fresh link.',
      signingLinkRevoked:
        'This invoice link has been revoked. Ask the sender for a fresh link.',
      publicLinkExpired:
        'This invoice link has expired. Ask the sender for a fresh link.',
      publicLinkRevoked:
        'This invoice link has been revoked. Ask the sender for a fresh link.',
      publicLinkRequired:
        'Online payment requires the public invoice link. Ask the sender for a fresh invoice link.',
      notPayable: 'This invoice is not payable online.',
      onlinePaymentUnavailable:
        'The sender is not accepting online payments for this invoice.',
      alreadySigned: 'Invoice is already signed',
      paidIssuedImmutable:
        'This invoice was paid through Stripe, so its status cannot be changed manually.',
      issuedImmutable:
        'Issued invoices cannot be edited or deleted from this flow'
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

export default {
  emails: {
    resetPassword: {
      subject: "Reset Your Password",
      text: "Click the link to reset your password: %{resetLink}",
    },
  },
  text: "Text",
  validationErrors: {
    invoice: {
      name: "Name is required",
      status: "Status is required",
      services: {
        description: "Description is required",
        amount: "Amount is required",
      },
    },
    client: {
      email: "Must be a valid email address",
    },
    user: {
      password: "Current password is required",
      newPassword: "New password is required",
      confirmedNewPassword: "Confirmed new password is required",
    },
  },
  errors: {
    user: {
      accountSettings: {
        update: {
          success: "Account settings updated successfully",
          badRequest: "Unable to update account settings",
        },
      },
      changePassword: {
        currentPassword: "Current password is incorrect",
        newAndConfirmed: "New password and confirmed new password do not match",
        success: "Password changed successfully",
        badRequest: "Unable to change password",
      },
      resetPassword: {
        notFound: "User with given email not found",
        success: "Reset link has been sent to the entered email",
        failure: "Unable to send reset link. Please try again",
        token: {
          invalid: "Token is invalid",
          expired: "Token has expired",
        },
      },
    },
  },
};

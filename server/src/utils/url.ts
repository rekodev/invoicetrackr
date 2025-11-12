export const getTranslationKeyPrefix = (url: string) => {
  const urlParts = url.split('/');

  switch (true) {
    case urlParts.includes('invoices'):
      return 'invoice';
    case urlParts.includes('clients'):
      return 'client';
    case urlParts.includes('users'):
      return 'user';
    case urlParts.includes('banking-information'):
      return 'bankingInformation';
    case urlParts.includes('contact'):
      return 'contact';
    case urlParts.includes('account-settings'):
      return 'accountSettings';
    case urlParts.includes('personal-information'):
      return 'personalInformation';
    case urlParts.includes('change-password'):
      return 'changePassword';
    case urlParts.includes('create-customer'):
    case urlParts.includes('create-subscription'):
    case urlParts.includes('customer'):
    case urlParts.includes('cancel-subscription'):
      return 'payment';
    case urlParts.includes('forgot-password'):
      return 'forgotPassword';
    case urlParts.includes('reset-password-token'):
      return 'resetPasswordToken';
    case urlParts.includes('create-new-password'):
      return 'createNewPassword';
    case urlParts.includes('selected-bank-account'):
      return 'selectedBankAccount';
    case urlParts.includes('profile-picture'):
      return 'profilePicture';
  }
};

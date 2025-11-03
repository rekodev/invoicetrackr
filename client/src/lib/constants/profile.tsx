import {
  Cog6ToothIcon,
  CreditCardIcon,
  LockClosedIcon,
  UserIcon
} from '@heroicons/react/24/outline';

import {
  ACCOUNT_SETTINGS_PAGE,
  BANKING_INFORMATION_PAGE,
  CHANGE_PASSWORD_PAGE,
  PERSONAL_INFORMATION_PAGE
} from './pages';

export const profileMenuTabs = [
  {
    key: 'personal-information',
    name: 'personal_information.title',
    icon: <UserIcon className="h-4 w-4" />,
    href: PERSONAL_INFORMATION_PAGE
  },
  {
    key: 'banking-information',
    name: 'banking_information.title',
    icon: <CreditCardIcon className="h-4 w-4" />,
    href: BANKING_INFORMATION_PAGE
  },
  {
    key: 'change-password',
    name: 'change_password.title',
    icon: <LockClosedIcon className="h-4 w-4" />,
    href: CHANGE_PASSWORD_PAGE
  },
  {
    key: 'account-settings',
    name: 'account_settings.title',
    icon: <Cog6ToothIcon className="h-4 w-4" />,
    href: ACCOUNT_SETTINGS_PAGE
  }
];

'use client';

import { useEffect } from 'react';

type Props = {
  userLanguage: string | null | undefined;
};

export default function LanguageSync({ userLanguage }: Props) {
  useEffect(() => {
    if (userLanguage) {
      // Sync localStorage with user's database language preference
      localStorage.setItem('language', userLanguage);
    } else {
      // User is logged out, keep localStorage value or default to 'en'
      if (!localStorage.getItem('language')) {
        localStorage.setItem('language', 'en');
      }
    }
  }, [userLanguage]);

  return null;
}

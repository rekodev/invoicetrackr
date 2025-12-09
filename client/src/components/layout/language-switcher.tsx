'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SharedSelection
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { User } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { getLocaleCookieAction, setLocaleCookieAction } from '@/lib/actions';
import { availableLanguages } from '@/lib/constants/profile';
import { updateUserAccountSettingsAction } from '@/lib/actions/user';

type Props = {
  user?: User;
};

export default function LanguageSwitcher({ user }: Props) {
  const router = useRouter();
  const t = useTranslations('header.language_switcher');
  const baseT = useTranslations();
  const [currentLanguage, setCurrentLanguage] = useState(
    new Set([user?.language || 'en'])
  );

  useEffect(() => {
    const synchronizeLocale = async () => {
      const cookie = await getLocaleCookieAction();

      if (user?.language) {
        if (cookie === user.language) {
          setCurrentLanguage(new Set([cookie]));
          return;
        }

        await setLocaleCookieAction(user.language);
        setCurrentLanguage(new Set([user.language]));
        router.refresh();
      } else {
        setCurrentLanguage(new Set([cookie]));
      }
    };

    synchronizeLocale();
  }, [router, user?.language]);

  const handleSelect = async (keys: SharedSelection) => {
    const selectedLanguage = keys.currentKey;

    if (!selectedLanguage) return;

    setCurrentLanguage(new Set([selectedLanguage || 'en']));
    await setLocaleCookieAction(selectedLanguage || 'en');

    if (user?.id && user?.currency) {
      await updateUserAccountSettingsAction({
        userId: Number(user.id),
        language: selectedLanguage,
        currency: user.currency
      });
    }
  };

  return (
    <Dropdown className="min-w-max">
      <DropdownTrigger>
        <Button
          data-testid="language-switcher-trigger"
          aria-label={t('a11y.label')}
          isIconOnly
          className="max-w-min"
          variant="flat"
        >
          <LanguageIcon className="h-5 w-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={currentLanguage}
        selectionMode="single"
        items={availableLanguages}
        onSelectionChange={handleSelect}
      >
        {/* @ts-ignore */}
        {(item) => (
          <DropdownItem key={item.code} value={item.code}>
            {baseT(item.nameTranslationKey)}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

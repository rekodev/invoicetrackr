'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Selection,
  buttonVariants
} from '@heroui/react';
import { Language, User } from '@invoicetrackr/types';
import { useEffect, useState } from 'react';
import { LanguageIcon } from '@heroicons/react/24/outline';
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
  const [currentLanguage, setCurrentLanguage] = useState<Set<Language>>(
    new Set([(user?.language as Language) || 'en'])
  );

  useEffect(() => {
    const synchronizeLocale = async () => {
      const cookie = await getLocaleCookieAction();

      if (user?.language) {
        if (cookie === user.language) {
          setCurrentLanguage(new Set([cookie as Language]));
          return;
        }

        await setLocaleCookieAction(user.language);
        setCurrentLanguage(new Set([user.language as Language]));
        router.refresh();
      } else {
        setCurrentLanguage(new Set([cookie as Language]));
      }
    };

    synchronizeLocale();
  }, [router, user?.language]);

  const handleSelect = async (keys: Selection) => {
    if (keys === 'all') return;

    const selectedLanguage = Array.from(keys)[0] as Language | undefined;

    if (!selectedLanguage) return;

    setCurrentLanguage(new Set([selectedLanguage || 'en']));
    await setLocaleCookieAction(selectedLanguage || 'en');

    if (user?.id && user?.currency) {
      await updateUserAccountSettingsAction({
        userId: Number(user.id),
        language: selectedLanguage,
        currency: user.currency,
        preferredInvoiceLanguage:
          user.preferredInvoiceLanguage || selectedLanguage,
        isVatPayer: user.isVatPayer,
        defaultInvoiceVatMode: user.defaultInvoiceVatMode || 'no_vat',
        defaultInvoiceSeries: user.defaultInvoiceSeries || 'SF',
        defaultPaymentTermsDays: user.defaultPaymentTermsDays || 30
      });
    }
  };

  return (
    <Dropdown className="min-w-max">
      <DropdownTrigger
        data-testid="language-switcher-trigger"
        aria-label={t('a11y.label')}
        className={buttonVariants({
          variant: 'primary',
          className: 'flex items-center justify-center',
          isIconOnly: true
        })}
      >
        <LanguageIcon className="h-5 w-5" />
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu
          selectedKeys={currentLanguage}
          selectionMode="single"
          items={availableLanguages}
          onSelectionChange={handleSelect}
        >
          {(item) => (
            <DropdownItem
              key={item.code}
              id={item.code}
              textValue={baseT(item.nameTranslationKey)}
            >
              {baseT(item.nameTranslationKey)}
              <Dropdown.ItemIndicator />
            </DropdownItem>
          )}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
}

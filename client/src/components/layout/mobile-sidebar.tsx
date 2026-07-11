import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { RefObject } from 'react';

import AppBrand from '../app-brand';
import Navigation from './navigation';

type Props = {
  mobileDrawerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export default function MobileSidebar({ mobileDrawerRef, onClose }: Props) {
  const t = useTranslations('header.user');

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label={t('a11y.close_navigation')}
        onClick={onClose}
      />
      <aside
        ref={mobileDrawerRef}
        className="bg-background relative flex h-full w-72 flex-col border-r p-4 shadow-xl"
        aria-label={t('a11y.primary_navigation')}
        aria-modal="true"
        role="dialog"
      >
        <div className="mb-7 flex items-center justify-between">
          <AppBrand />
          <Button
            isIconOnly
            className="text-muted"
            variant="ghost"
            aria-label={t('a11y.close_navigation')}
            onPress={onClose}
          >
            <XMarkIcon className="size-5" />
          </Button>
        </div>
        <Navigation isMobile onCloseMobileSidebar={onClose} />
      </aside>
    </div>
  );
}

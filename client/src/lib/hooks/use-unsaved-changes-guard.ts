'use client';

import { useCallback, useEffect, useRef } from 'react';

const HISTORY_GUARD_KEY = '__invoiceTrackrUnsavedChangesGuard';

export default function useUnsavedChangesGuard({
  isDirty,
  message
}: {
  isDirty: boolean;
  message: string;
}) {
  const isGuardEnabledRef = useRef(isDirty);
  const hasHistoryEntryRef = useRef(false);
  const isRestoringHistoryRef = useRef(false);

  useEffect(() => {
    isGuardEnabledRef.current = isDirty;
  }, [isDirty]);

  const disableGuard = useCallback(() => {
    isGuardEnabledRef.current = false;
  }, []);

  const confirmNavigation = useCallback(() => {
    if (!isGuardEnabledRef.current || window.confirm(message)) {
      disableGuard();
      return true;
    }

    return false;
  }, [disableGuard, message]);

  useEffect(() => {
    if (!isDirty || hasHistoryEntryRef.current) return;

    window.history.pushState(
      { ...window.history.state, [HISTORY_GUARD_KEY]: true },
      '',
      window.location.href
    );
    hasHistoryEntryRef.current = true;
  }, [isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isGuardEnabledRef.current) return;

      event.preventDefault();
      event.returnValue = '';
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (!isGuardEnabledRef.current || event.defaultPrevented) return;

      const target = event.target;
      const anchor =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>('a[href]')
          : null;

      if (
        !anchor ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash
      )
        return;

      if (confirmNavigation()) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const handlePopState = () => {
      if (isRestoringHistoryRef.current) {
        isRestoringHistoryRef.current = false;
        return;
      }
      if (!isGuardEnabledRef.current) return;

      if (window.confirm(message)) {
        disableGuard();
        window.history.back();
      } else {
        isRestoringHistoryRef.current = true;
        window.history.forward();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [confirmNavigation, disableGuard, message]);

  return { confirmNavigation, disableGuard };
}

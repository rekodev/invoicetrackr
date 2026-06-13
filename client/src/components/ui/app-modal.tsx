'use client';

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  useOverlayState
} from '@heroui/react';
import { ReactNode } from 'react';

type AppModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  placement?: 'auto' | 'top' | 'center' | 'bottom';
  scroll?: 'inside' | 'outside';
  isDismissable?: boolean;
};

export function AppModal({
  children,
  isOpen,
  onClose,
  size,
  placement,
  scroll,
  isDismissable
}: AppModalProps) {
  const modalSize =
    size === 'full'
      ? 'full'
      : size === 'sm' || size === 'md' || size === 'lg'
        ? size
        : size
          ? 'cover'
          : undefined;

  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    }
  });

  return (
    <Modal state={state}>
      <ModalBackdrop isDismissable={isDismissable}>
        <ModalContainer placement={placement} scroll={scroll} size={modalSize}>
          <ModalDialog>{children}</ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}

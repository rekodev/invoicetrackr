'use client';

import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  addToast
} from '@heroui/react';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { isResponseError } from '@/lib/utils/error';
import { postContactMessage } from '@/api';
import { useForm } from 'react-hook-form';

type ContactForm = {
  email: string;
  message: string;
};

export default function ContactFormDialog() {
  const t = useTranslations('components.contact_form');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset
  } = useForm<ContactForm>();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = (data: ContactForm) =>
    startTransition(async () => {
      const { email, message } = data;
      const response = await postContactMessage({ email, message });

      if (isResponseError(response)) {
        response.data.errors.forEach(({ key, value }) => {
          setError(key as keyof ContactForm, { message: value });
        });

        addToast({
          title: response.data.message,
          color: 'danger'
        });

        return;
      }

      addToast({
        title: response.data.message,
        color: 'success'
      });
      handleClose();
    });

  return (
    <>
      <Button
        onPress={() => setIsOpen(true)}
        className="max-w-min"
        color="secondary"
      >
        {t('title')}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onClose={handleClose}
        size="lg"
      >
        <ModalContent as={Form} onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{t('title')}</ModalHeader>
          <ModalBody className="w-full flex-col">
            <Input
              {...register('email')}
              variant="faded"
              placeholder={t('email_placeholder')}
              label={t('email_label')}
              type="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />
            <Textarea
              variant="faded"
              {...register('message')}
              label={t('message_label')}
              placeholder={t('message_placeholder')}
              maxLength={5000}
              isInvalid={!!errors.message}
              errorMessage={errors.message?.message}
            />
          </ModalBody>
          <ModalFooter className="w-full">
            <Button variant="bordered" onPress={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              isLoading={isPending}
              isDisabled={isPending}
              type="submit"
              color="secondary"
            >
              {t('send')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

'use client';

import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  TextField,
  toast
} from '@heroui/react';
import { useState, useTransition } from 'react';
import { AppModal } from '@/components/ui/app-modal';
import { useTranslations } from 'next-intl';

import { isResponseError } from '@/lib/utils/error';
import { postContactMessage } from '@/api/contact';
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

        toast(response.data.message, {
          variant: 'danger'
        });

        return;
      }

      toast(response.data.message, {
        variant: 'success'
      });
      handleClose();
    });

  return (
    <>
      <Button onPress={() => setIsOpen(true)} className="max-w-min">
        {t('title')}
      </Button>

      <AppModal isOpen={isOpen} onClose={handleClose} size="lg">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{t('title')}</ModalHeader>
          <ModalBody className="w-full flex-col">
            <TextField variant="secondary" isInvalid={!!errors.email}>
              <Label>{t('email_label')}</Label>
              <Input
                {...register('email')}
                placeholder={t('email_placeholder')}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </TextField>
            <TextField variant="secondary" isInvalid={!!errors.message}>
              <Label>{t('message_label')}</Label>
              <TextArea
                {...register('message')}
                placeholder={t('message_placeholder')}
                maxLength={5000}
              />
              <FieldError>{errors.message?.message}</FieldError>
            </TextField>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button variant="outline" onPress={handleClose}>
              {t('cancel')}
            </Button>
            <Button isPending={isPending} type="submit">
              {t('send')}
            </Button>
          </ModalFooter>
        </Form>
      </AppModal>
    </>
  );
}

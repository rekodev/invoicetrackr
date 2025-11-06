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

import { postContactMessage } from '@/api';
import { useForm } from 'react-hook-form';
import { isResponseError } from '@/lib/utils/error';

type ContactForm = {
  email: string;
  message: string;
};

export default function ContactFormDialog() {
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
        Contact Us
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onClose={handleClose}
        size="lg"
      >
        <ModalContent as={Form} onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Contact Us</ModalHeader>
          <ModalBody className="w-full flex-col">
            <Input
              {...register('email')}
              variant="faded"
              placeholder="Enter your email"
              label="Email"
              type="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />
            <Textarea
              variant="faded"
              {...register('message')}
              label="Message"
              placeholder="Tell us how we can help you..."
              maxLength={5000}
              isInvalid={!!errors.message}
              errorMessage={errors.message?.message}
            />
          </ModalBody>
          <ModalFooter className="w-full">
            <Button variant="bordered" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              isLoading={isPending}
              isDisabled={isPending}
              type="submit"
              color="secondary"
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

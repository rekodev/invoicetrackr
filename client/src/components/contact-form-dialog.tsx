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
import { FormEvent, useState, useTransition } from 'react';

import { postContactMessage } from '@/api';

export default function ContactFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent) =>
    startTransition(async () => {
      event.preventDefault();
      const response = await postContactMessage({ email, message });

      if ('errors' in response) {
        addToast({
          title: response.data?.message,
          color: 'danger'
        });

        return;
      }

      addToast({
        title: response.data.message,
        color: 'success'
      });
      setIsOpen(false);
      setEmail('');
      setMessage('');
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
        onClose={() => setIsOpen(false)}
        size="lg"
      >
        <ModalContent as={Form} onSubmit={handleSubmit}>
          <ModalHeader>Contact Us</ModalHeader>
          <ModalBody className="w-full flex-col">
            <Input
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="Enter your email"
              label="Email"
              type="email"
            />
            <Textarea
              value={message}
              onChange={(ev) => setMessage(ev.target.value)}
              label="Message"
              placeholder="Tell us how we can help you..."
            />
          </ModalBody>
          <ModalFooter className="w-full">
            <Button variant="bordered" onPress={() => setIsOpen(false)}>
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

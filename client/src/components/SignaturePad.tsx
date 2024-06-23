import { PencilIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import { useContext, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

import { SignatureContext } from '@/contexts/SignatureContextProvider';

const SignaturePad = () => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { signatureImage, setSignatureImage, setTrimmedSignatureImage } =
    useContext(SignatureContext);
  const signatureRef = useRef<SignatureCanvas>(null);

  const saveSignature = () => {
    const dataURL = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL('image/png');

    setSignatureImage(dataURL || '');

    const trimmedSignatureImage = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL('image/png');

    if (trimmedSignatureImage) setTrimmedSignatureImage(trimmedSignatureImage);

    onClose();
  };

  useEffect(() => {
    if (!isOpen || !signatureImage) return;

    signatureRef.current?.fromDataURL(signatureImage, {
      width: 528,
      height: 400,
    });
  }, [isOpen, signatureImage]);

  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <small className='text-white'>Signature</small>
        <Button
          variant='bordered'
          className='p-0'
          color='default'
          startContent={<PencilIcon className='size-5' />}
          onPress={onOpen}
        >
          {signatureImage ? 'Edit Signature' : 'Add Signature'}
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xl'>
        <ModalContent>
          <ModalHeader>Signature</ModalHeader>
          <ModalBody>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 528,
                height: 400,
                style: { backgroundColor: 'white' },
              }}
              backgroundColor='white'
            />
          </ModalBody>
          <ModalFooter>
            <Button color='success' onPress={saveSignature}>
              Save
            </Button>
            <Button
              color='danger'
              onPress={() => signatureRef.current?.clear()}
            >
              Clear
            </Button>
            <Button
              color='secondary'
              onPress={() => signatureRef.current?.fromDataURL(signatureImage)}
            >
              Show
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SignaturePad;

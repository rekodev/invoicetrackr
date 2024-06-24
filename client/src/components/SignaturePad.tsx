import { CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
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
import { base64ToFile } from '@/utils/base64ToFile';

type Props = {
  signature?: File | string;
  profileSignature?: string;
  onSignatureChange: (signature: File | string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
};

const SignaturePad = ({
  signature,
  profileSignature,
  onSignatureChange,
  isInvalid,
  errorMessage,
}: Props) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    signatureImage,
    setSignatureImage,
    trimmedSignatureImage,
    setTrimmedSignatureImage,
  } = useContext(SignatureContext);
  const signatureRef = useRef<SignatureCanvas>(null);

  const signatureImgUrl = signature
    ? typeof signature === 'string'
      ? signature
      : URL.createObjectURL(signature)
    : trimmedSignatureImage;

  const saveSignature = () => {
    const dataURL = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL('image/png');

    setSignatureImage(dataURL || '');

    const trimmedSignatureImage = signatureRef.current
      ?.getTrimmedCanvas()
      .toDataURL('image/png');

    if (trimmedSignatureImage) {
      setTrimmedSignatureImage(trimmedSignatureImage);
      onSignatureChange(
        base64ToFile(trimmedSignatureImage, 'sender_signature.png', 'image/png')
      );
    }

    onClose();
  };

  useEffect(() => {
    if (!isOpen || !signatureImage) return;

    signatureRef.current?.fromDataURL(signatureImage, {
      width: 532,
      height: 400,
    });
  }, [isOpen, signatureImage]);

  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <Card
          radius='lg'
          className={`flex justify-center items-center relative aspect-4/3 overflow-hidden ${
            isInvalid && 'bg-[#F3126040]'
          }`}
          onPress={onOpen}
          isPressable
        >
          <CardBody className='p-0 w-full h-full flex flex-col gap-2 justify-center items-center overflow-visible group'>
            {signatureImgUrl ? (
              <>
                <Image
                  src={signatureImgUrl}
                  alt='Signature'
                  className='z-0 rounded-none'
                />
                <div className='absolute w-full h-full bg-black bg-opacity-75 flex-col justify-center items-center gap-2 hidden group-hover:flex'>
                  <PencilSquareIcon className='h-10 w-10' />
                  <p className='font-medium'>Edit Signature</p>
                </div>
              </>
            ) : (
              <>
                <PencilSquareIcon className='h-8 w-8' />
                <p className='font-medium'>Add a Signature</p>
              </>
            )}
          </CardBody>
        </Card>
        {profileSignature && (
          <Chip
            onClose={() => onSignatureChange(profileSignature)}
            endContent={<CheckCircleIcon className='w-4 h-4 mr-0.5' />}
            color='secondary'
            variant='faded'
          >
            Use Profile Signature
          </Chip>
        )}
        {isInvalid && (
          <Chip variant='light' className='mt-[-4px]' size='sm' color='danger'>
            {errorMessage}
          </Chip>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xl'>
        <ModalContent>
          <ModalHeader>Signature</ModalHeader>
          <ModalBody>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 532,
                height: 400,
                style: { backgroundColor: 'white' },
              }}
              backgroundColor='white'
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color='danger'
              onPress={() => signatureRef.current?.clear()}
            >
              Clear
            </Button>
            <Button color='secondary' onPress={saveSignature}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SignaturePad;

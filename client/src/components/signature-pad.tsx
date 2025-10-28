import { CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import {
  Button,
  Card,
  CardBody,
  Chip,
  cn,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

import { base64ToFile, imageUrlToBase64 } from '@/lib/utils/base64';

type Props = {
  signature?: File | string;
  profileSignature?: string;
  onSignatureChange: (signature: File | string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isChipVisible?: boolean;
};

const SignaturePad = ({
  signature,
  profileSignature,
  onSignatureChange,
  isInvalid,
  errorMessage,
  isChipVisible = false
}: Props) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [signatureImage, setSignatureImage] = useState('');

  const signatureRef = useRef<SignatureCanvas>(null);

  const signatureImgUrl = useMemo(
    () =>
      signature
        ? typeof signature === 'string'
          ? signature
          : URL.createObjectURL(signature)
        : '',
    [signature]
  );

  useEffect(() => {
    if (!signature || signatureImage) return;

    const setInitialSignatureImage = async () => {
      if (typeof signature !== 'string') {
        setSignatureImage(URL.createObjectURL(signature));

        return;
      }

      const base64 = await imageUrlToBase64(signature);

      setSignatureImage(base64);
    };

    setInitialSignatureImage();
  }, [signatureImage, signature]);

  useEffect(() => {
    if (!isOpen || !signatureImage) return;

    signatureRef.current?.fromDataURL(signatureImage, {
      width: 532,
      height: 400
    });
  }, [isOpen, signatureImage]);

  const saveSignature = () => {
    const trimmedDataURL = signatureRef.current
      ?.getCanvas()
      .toDataURL('image/png');

    if (trimmedDataURL) {
      setSignatureImage(trimmedDataURL);
      onSignatureChange(
        base64ToFile(trimmedDataURL, 'sender_signature.png', 'image/png')
      );
    }

    onClose();
  };

  const setProfileSignature = async () => {
    if (!profileSignature) return;

    onSignatureChange(profileSignature);

    const base64 = await imageUrlToBase64(profileSignature);
    setSignatureImage(base64);
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Card
          radius="lg"
          className={cn(
            'shadow-small dark:border-default-100 aspect-4/3 relative flex items-center justify-center overflow-hidden dark:border',
            {
              'bg-[#F3126040]': isInvalid,
              'hover:border-none': !!signatureImgUrl
            }
          )}
          onPress={onOpen}
          isPressable
        >
          <CardBody className="group flex h-full w-full flex-col items-center justify-center gap-2 overflow-visible p-0">
            {signatureImgUrl ? (
              <>
                <Image
                  src={signatureImgUrl}
                  alt="Signature"
                  className="z-0 rounded-none"
                />
                <div className="absolute hidden h-full w-full flex-col items-center justify-center gap-2 bg-black/50 text-white group-hover:flex dark:bg-black/75">
                  <PencilSquareIcon className="h-10 w-10" />
                  <p className="font-medium">Edit Signature</p>
                </div>
              </>
            ) : (
              <>
                <PencilSquareIcon className="h-8 w-8" />
                <p className="font-medium">Add a Signature</p>
              </>
            )}
          </CardBody>
        </Card>
        {profileSignature && isChipVisible && (
          <Chip
            onClose={setProfileSignature}
            endContent={<CheckCircleIcon className="mr-0.5 h-4 w-4" />}
            color="secondary"
            variant="faded"
          >
            Use Profile Signature
          </Chip>
        )}
        {isInvalid && (
          <Chip variant="light" className="mt-[-4px]" size="sm" color="danger">
            {errorMessage}
          </Chip>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          <ModalHeader>Signature</ModalHeader>
          <ModalBody>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                style: {
                  backgroundColor: 'white',
                  touchAction: 'none',
                  aspectRatio: '1 / 1'
                }
              }}
              backgroundColor="white"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onPress={() => signatureRef.current?.clear()}
            >
              Clear
            </Button>
            <Button color="secondary" onPress={saveSignature}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SignaturePad;

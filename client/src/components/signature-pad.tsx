import {
  Button,
  Card,
  CardContent,
  Chip,
  Modal,
  cn,
  useOverlayState
} from '@heroui/react';
import { CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import { useEffect, useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useTranslations } from 'next-intl';

import { base64ToFile, imageUrlToBase64 } from '@/lib/utils/base64';
import Image from 'next/image';

type Props = {
  signature?: File | string;
  profileSignature?: string;
  onSignatureChange: (_signature: File | string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isChipVisible?: boolean;
  isReadOnly?: boolean;
};

const SignaturePad = ({
  signature,
  profileSignature,
  onSignatureChange,
  isInvalid,
  errorMessage,
  isChipVisible = false,
  isReadOnly = false
}: Props) => {
  const t = useTranslations('components.signature_pad');
  const {
    isOpen,
    open: onOpen,
    close: onClose,
    setOpen: onOpenChange
  } = useOverlayState();
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

    signatureRef.current?.fromDataURL(signatureImage);
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
          className={cn(
            'shadow-small aspect-4/3 relative flex max-w-64 items-center justify-center overflow-hidden border',
            {
              'bg-[#F3126040]': isInvalid,
              'hover:border-none': !!signatureImgUrl && !isReadOnly
            }
          )}
          onClick={isReadOnly ? undefined : onOpen}
        >
          <CardContent className="group flex h-full w-full flex-col items-center justify-center gap-2 overflow-visible p-0">
            {signatureImgUrl ? (
              <>
                <Image
                  fill
                  src={signatureImgUrl}
                  alt={t('signature_alt')}
                  className="z-0 rounded-none"
                />
                {!isReadOnly && (
                  <div className="absolute hidden h-full w-full flex-col items-center justify-center gap-2 bg-black/50 text-white group-hover:flex dark:bg-black/75">
                    <PencilSquareIcon className="h-10 w-10" />
                    <p className="font-medium">{t('edit_signature')}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <PencilSquareIcon className="h-8 w-8" />
                <p className="font-medium">{t('add_signature')}</p>
              </>
            )}
          </CardContent>
        </Card>
        {profileSignature && isChipVisible && (
          <Button size="sm" variant="secondary" onPress={setProfileSignature}>
            <CheckCircleIcon className="mr-0.5 h-4 w-4" />
            {t('use_profile_signature')}
          </Button>
        )}
        {isInvalid && (
          <Chip
            variant="tertiary"
            className="mt-[-4px]"
            size="sm"
            color="danger"
          >
            {errorMessage}
          </Chip>
        )}
      </div>

      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(open) => !open && onOpenChange(false)}
        >
          <Modal.Container size="cover">
            <Modal.Dialog>
              <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{t('modal_title')}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                style: {
                  backgroundColor: 'white',
                  touchAction: 'none',
                  aspectRatio: '4 / 3'
                }
              }}
              backgroundColor="white"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              onPress={() => signatureRef.current?.clear()}
            >
              {t('clear')}
            </Button>
            <Button onPress={saveSignature}>{t('save')}</Button>
          </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};

export default SignaturePad;

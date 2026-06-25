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

const SIGNATURE_CANVAS_ASPECT_RATIO = 254 / 190;
const SIGNATURE_CANVAS_MAX_WIDTH = 508;
const SIGNATURE_CANVAS_FALLBACK_WIDTH = 508;
const SIGNATURE_CANVAS_CURSOR =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M4 20l4.5-1 10-10-3.5-3.5-10 10L4 20z%27 fill=%27%2315181C%27 stroke=%27white%27 stroke-width=%271.5%27/%3E%3Cpath d=%27M14.5 5.5l3.5 3.5%27 stroke=%27white%27 stroke-width=%271.5%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") 3 21, crosshair';

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
  const [canvasSize, setCanvasSize] = useState({
    width: SIGNATURE_CANVAS_FALLBACK_WIDTH,
    height: Math.round(
      SIGNATURE_CANVAS_FALLBACK_WIDTH / SIGNATURE_CANVAS_ASPECT_RATIO
    )
  });

  const signatureRef = useRef<SignatureCanvas>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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
      width: canvasSize.width,
      height: canvasSize.height,
      ratio: 1
    });
  }, [canvasSize, isOpen, signatureImage]);

  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;

    const updateCanvasSize = () => {
      const containerWidth =
        canvasContainerRef.current?.getBoundingClientRect().width || 0;

      if (!containerWidth) return;

      const width = Math.floor(
        Math.min(containerWidth, SIGNATURE_CANVAS_MAX_WIDTH)
      );
      const height = Math.round(width / SIGNATURE_CANVAS_ASPECT_RATIO);

      setCanvasSize((currentSize) => {
        if (currentSize.width === width && currentSize.height === height) {
          return currentSize;
        }

        return { width, height };
      });
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvasContainerRef.current);

    return () => resizeObserver.disconnect();
  }, [isOpen]);

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
            'shadow-small aspect-4/3 relative flex max-w-64 items-center justify-center overflow-hidden border p-0 transition',
            {
              'bg-[#F3126040]': isInvalid,
              'hover:border-secondary hover:bg-secondary/5 cursor-pointer':
                !isReadOnly,
              'hover:border-none': !!signatureImgUrl && !isReadOnly
            }
          )}
          onClick={isReadOnly ? undefined : onOpen}
        >
          <CardContent className="group relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-visible p-0">
            {signatureImgUrl ? (
              <>
                <Image
                  fill
                  src={signatureImgUrl}
                  alt={t('signature_alt')}
                  sizes="256px"
                  className="z-0 rounded-none"
                />
                {!isReadOnly && (
                  <div className="absolute hidden h-full w-full cursor-pointer flex-col items-center justify-center gap-2 bg-black/50 text-white group-hover:flex dark:bg-black/75">
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
          <Modal.Container>
            <Modal.Dialog className="mx-auto !w-[min(92vw,548px)] !max-w-[548px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>{t('modal_title')}</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="items-center">
                <div
                  ref={canvasContainerRef}
                  className="border-default-300 w-full max-w-[508px] overflow-hidden rounded-lg border-2 border-dashed bg-white"
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    clearOnResize={false}
                    throttle={0}
                    minDistance={1}
                    canvasProps={{
                      width: canvasSize.width,
                      height: canvasSize.height,
                      className: 'block',
                      style: {
                        width: canvasSize.width,
                        height: canvasSize.height,
                        backgroundColor: 'white',
                        cursor: SIGNATURE_CANVAS_CURSOR,
                        touchAction: 'none'
                      }
                    }}
                    backgroundColor="white"
                  />
                </div>
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

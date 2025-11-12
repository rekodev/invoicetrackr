'use client';

import { CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tab,
  Tabs,
  addToast
} from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';

import { updateUserProfilePictureAction } from '@/lib/actions/user';
import { profileMenuTabs } from '@/lib/constants/profile';
import { UserModel } from '@/lib/types/models/user';

type Props = {
  user: UserModel;
};

const UserCard = ({ user }: Props) => {
  const t = useTranslations('profile.user_nav_card');
  const pathname = usePathname();

  const [uploadedImage, setUploadedImage] = useState<File>();
  const [isPending, startTransition] = useTransition();

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const currentPath = pathname?.split('/')[2];

  const initiateImageUpload = () => {
    imageFileInputRef.current?.click();
  };

  const handleImageUpload = async () =>
    startTransition(async () => {
      if (!uploadedImage) return;

      const formData = new FormData();
      formData.append('profilePicture', uploadedImage);

      const response = await updateUserProfilePictureAction({
        userId: Number(user.id),
        formData
      });

      addToast({
        title: response.message,
        color: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      setUploadedImage(undefined);
    });

  const renderUserDetails = () => {
    return (
      <>
        <div className="relative">
          <Avatar
            showFallback
            onClick={initiateImageUpload}
            fallback={
              <CameraIcon className="text-default-500 h-6 w-6 animate-pulse" />
            }
            className="absolute left-0 top-0 z-10 h-14 w-14 cursor-pointer opacity-0 hover:opacity-100"
          />
          <Avatar
            src={
              uploadedImage
                ? URL.createObjectURL(uploadedImage)
                : user?.profilePictureUrl
            }
            size="lg"
            className="mb-2"
          />
          {uploadedImage && !isPending && (
            <Chip
              variant="faded"
              onClose={handleImageUpload}
              endContent={
                <CheckCircleIcon className="text-success-500 h-5 w-5" />
              }
              className="absolute -right-10 bottom-1 z-10"
            >
              Save
            </Chip>
          )}
          <input
            ref={imageFileInputRef}
            onChange={(e) => {
              setUploadedImage(e.target.files?.[0]);
            }}
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-md">{user?.name || 'User'}</p>
        <p className="text-small text-default-500">{user?.email}</p>
      </>
    );
  };

  return (
    <Card
      as="aside"
      className="dark:border-default-100 flex max-h-80 min-h-80 min-w-56 flex-col justify-between bg-transparent pt-3 sm:max-w-56 dark:border"
    >
      <CardHeader className="flex-col">{renderUserDetails()}</CardHeader>
      <CardBody className="flex justify-center p-0 px-2">
        <Tabs
          aria-label={t('a11y.actions_label')}
          isVertical
          selectedKey={currentPath}
          fullWidth
          variant="light"
          color="secondary"
        >
          {profileMenuTabs.map((tab) => (
            <Tab
              key={tab.key}
              className="justify-start"
              title={
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{t(tab.name)}</span>
                </div>
              }
              as={Link}
              href={tab.href}
            />
          ))}
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default UserCard;

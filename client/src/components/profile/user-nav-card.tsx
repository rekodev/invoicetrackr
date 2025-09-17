'use client';

import { CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tab,
  Tabs
} from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import { updateUserProfilePictureAction } from '@/lib/actions/user';
import { profileMenuTabs } from '@/lib/constants/profile';
import { UiState } from '@/lib/constants/ui-state';
import { UserModel } from '@/lib/types/models/user';

type Props = {
  user: UserModel;
};

const UserCard = ({ user }: Props) => {
  const pathname = usePathname();

  const [uploadedImage, setUploadedImage] = useState<File>();
  const [uiState, setUiState] = useState(UiState.Idle);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const currentPath = pathname?.split('/')[2];

  const initiateImageUpload = () => {
    imageFileInputRef.current?.click();
  };

  const handleImageUpload = async () => {
    if (!uploadedImage) return;

    const formData = new FormData();
    formData.append('profilePicture', uploadedImage);

    setUiState(UiState.Pending);
    const response = await updateUserProfilePictureAction({
      userId: Number(user.id),
      formData
    });

    if (!response.ok) {
      // TODO: Add toast notification
      setUiState(UiState.Failure);

      return;
    }

    setUploadedImage(undefined);
    setUiState(UiState.Success);
  };

  const renderUserDetails = () => {
    // if (isUserLoading)
    //   return (
    //     <>
    //       <Skeleton className="mb-2 h-14 w-14 rounded-full" />
    //       <Skeleton className="mt-2 h-3 w-2/5 rounded-lg" />
    //       <Skeleton className="mb-1 mt-2 h-3 w-3/5 rounded-lg" />
    //     </>
    //   );

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
          {uploadedImage && uiState === UiState.Idle && (
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
              if (uiState !== UiState.Idle) setUiState(UiState.Idle);
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
          aria-label="Actions"
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
                  <span>{tab.name}</span>
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

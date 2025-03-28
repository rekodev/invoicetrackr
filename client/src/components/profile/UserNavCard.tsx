'use client';

import { CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton,
  Tab,
  Tabs,
} from "@heroui/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import { updateUserProfilePicture } from '@/api';
import { profileMenuTabs } from '@/lib/constants/profile';
import { UiState } from '@/lib/constants/uiState';
import useGetUser from '@/lib/hooks/user/useGetUser';

type Props = {
  userId: number;
};

const UserCard = ({ userId }: Props) => {
  const pathname = usePathname();
  const { user, isUserLoading, mutateUser } = useGetUser({ userId });

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
    const response = await updateUserProfilePicture(userId, formData);

    if ('errors' in response) {
      // TODO: Add toast notification
      setUiState(UiState.Failure);

      return;
    }

    setUploadedImage(undefined);
    setUiState(UiState.Success);
    mutateUser();
  };

  const renderUserDetails = () => {
    if (isUserLoading)
      return (
        <>
          <Skeleton className='h-14 rounded-full w-14 mb-2' />
          <Skeleton className='h-3 w-2/5 rounded-lg mt-2' />
          <Skeleton className='h-3 w-3/5 rounded-lg mt-2 mb-1' />
        </>
      );

    return (
      <>
        <div className='relative'>
          <Avatar
            showFallback
            onClick={initiateImageUpload}
            fallback={
              <CameraIcon className='animate-pulse w-6 h-6 text-default-500' />
            }
            className='absolute z-10 top-0 left-0 w-14 h-14 cursor-pointer opacity-0 hover:opacity-100'
          />
          <Avatar
            src={
              uploadedImage
                ? URL.createObjectURL(uploadedImage)
                : user?.profilePictureUrl
            }
            size='lg'
            className='mb-2'
          />
          {uploadedImage && uiState === UiState.Idle && (
            <Chip
              variant='faded'
              onClose={handleImageUpload}
              endContent={
                <CheckCircleIcon className='h-5 w-5 text-success-500' />
              }
              className='absolute -right-10 bottom-1 z-10'
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
            type='file'
            accept='image/*'
            className='hidden'
          />
        </div>
        <p className='text-md'>{user?.name || 'User'}</p>
        <p className='text-small text-default-500'>{user?.email}</p>
      </>
    );
  };

  return (
    <Card
      as='aside'
      className='flex flex-col justify-between min-w-56 min-h-80 max-h-80 sm:max-w-56 pt-3 border border-neutral-800 bg-transparent'
    >
      <CardHeader className='flex-col'>{renderUserDetails()}</CardHeader>
      <CardBody className='flex justify-center p-0 px-2'>
        <Tabs
          aria-label='Actions'
          isVertical
          disableAnimation
          selectedKey={currentPath}
          fullWidth
          variant='light'
          color='secondary'
        >
          {profileMenuTabs.map((tab) => (
            <Tab
              key={tab.key}
              className='justify-start'
              title={
                <div className='flex items-center space-x-2'>
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

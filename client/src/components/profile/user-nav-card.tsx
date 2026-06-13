'use client';

import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  toast
} from '@heroui/react';
import { CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { User } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

import { profileMenuTabs } from '@/lib/constants/profile';
import { updateUserProfilePictureAction } from '@/lib/actions/user';

type Props = {
  user: User;
};

export default function UserNavCard({ user }: Props) {
  const t = useTranslations('profile.user_nav_card');
  const pathname = usePathname();
  const router = useRouter();

  const [uploadedImage, setUploadedImage] = useState<File>();
  const [isPending, startTransition] = useTransition();

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const currentPath = pathname?.split('/')[2];
  const userInitial = (user?.name || user?.email || 'U')
    .charAt(0)
    .toUpperCase();

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

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      setUploadedImage(undefined);
    });

  const renderUserDetails = () => {
    return (
      <>
        <div className="relative">
          <Avatar
            onClick={initiateImageUpload}
            className="absolute left-0 top-0 z-10 h-14 w-14 cursor-pointer opacity-0 hover:opacity-100"
          >
            <Avatar.Fallback>
              <CameraIcon className="h-5 w-5" />
            </Avatar.Fallback>
          </Avatar>
          <Avatar size="lg" className="mb-2">
            <Avatar.Image
              src={
                uploadedImage
                  ? URL.createObjectURL(uploadedImage)
                  : user?.profilePictureUrl
              }
              alt={user?.name || user?.email || 'User'}
            />
            <Avatar.Fallback>{userInitial}</Avatar.Fallback>
          </Avatar>
          {uploadedImage && !isPending && (
            <Button
              size="sm"
              variant="secondary"
              onPress={handleImageUpload}
              className="absolute -right-10 bottom-1 z-10"
            >
              <CheckCircleIcon className="text-success-500 h-5 w-5" />
              Save
            </Button>
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
    <aside>
      <Card className="dark:border-default-100 flex max-h-min min-w-56 flex-col justify-between bg-transparent py-3 sm:max-w-56 dark:border">
        <CardHeader className="flex-col">{renderUserDetails()}</CardHeader>
        <CardContent className="flex justify-center p-0 px-2">
          <Tabs
            aria-label={t('a11y.actions_label')}
            orientation="vertical"
            selectedKey={currentPath}
            variant="secondary"
            onSelectionChange={(key) => {
              const tab = profileMenuTabs.find((item) => item.key === key);

              if (tab) router.push(tab.href);
            }}
          >
            <Tabs.ListContainer className="w-full">
              <Tabs.List
                className="w-full"
                aria-label={t('a11y.actions_label')}
              >
                {profileMenuTabs.map((tab) => (
                  <Tabs.Tab
                    id={tab.key}
                    key={tab.key}
                    className="justify-start"
                  >
                    <div className="flex items-center space-x-2">
                      {tab.icon}
                      <span>{t(tab.name)}</span>
                    </div>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </CardContent>
      </Card>
    </aside>
  );
}

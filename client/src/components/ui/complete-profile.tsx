import { UserIcon } from '@heroicons/react/24/outline';
import {
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Link
} from '@heroui/react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';

import { PROFILE_PAGE } from '@/lib/constants/pages';

type Props = {
  title: string;
};

const CompleteProfile = ({ title }: Props) => {
  const t = useTranslations('components.complete_profile');

  return (
    <Card className="mx-auto max-w-lg bg-transparent">
      <CardHeader className="text-foreground flex-col justify-center gap-heading text-center text-3xl font-bold">
        <UserIcon className="text-secondary-500 size-12" />
        {t('title')}
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">{t('description', { title })}</p>
      </CardContent>
      <CardFooter className="justify-center text-center">
        <NextLink
          href={PROFILE_PAGE}
          className={buttonVariants({ variant: 'primary' })}
        >
          {t('go_to_profile')}
          <Link.Icon />
        </NextLink>
      </CardFooter>
    </Card>
  );
};

export default CompleteProfile;

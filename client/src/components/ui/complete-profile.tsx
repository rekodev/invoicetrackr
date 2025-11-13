import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link
} from '@heroui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { PERSONAL_INFORMATION_PAGE } from '@/lib/constants/pages';

type Props = {
  title: string;
};

const CompleteProfile = ({ title }: Props) => {
  const t = useTranslations('components.complete_profile');

  return (
    <Card className="mx-auto max-w-lg gap-4 bg-transparent">
      <CardHeader className="text-foreground flex-col justify-center gap-4 p-6 pb-0 text-center text-3xl font-bold">
        <UserIcon className="text-secondary-500 size-12" />
        {t('title')}
      </CardHeader>
      <CardBody className="px-6 pt-0 text-center">
        <p className="text-muted-foreground">{t('description', { title })}</p>
      </CardBody>
      <CardFooter className="justify-center p-6 pt-0 text-center">
        <Button
          href={PERSONAL_INFORMATION_PAGE}
          as={Link}
          color="secondary"
          showAnchorIcon
        >
          {t('go_to_profile')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompleteProfile;

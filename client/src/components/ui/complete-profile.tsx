import { UserIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link
} from '@heroui/react';

import { PERSONAL_INFORMATION_PAGE } from '@/lib/constants/pages';

type Props = {
  title: string;
};

const CompleteProfile = ({ title }: Props) => {
  return (
    <Card className="mx-auto max-w-lg gap-4 bg-transparent">
      <CardHeader className="flex-col justify-center gap-4 p-6 pb-0 text-center text-3xl font-bold text-foreground">
        <UserIcon className="size-12 text-secondary-500" />
        Complete Your Profile
      </CardHeader>
      <CardBody className="px-6 pt-0 text-center">
        <p className="text-muted-foreground">
          Before you can create your first {title}, please complete your
          personal information in your profile.
        </p>
      </CardBody>
      <CardFooter className="justify-center p-6 pt-0 text-center">
        <Button
          href={PERSONAL_INFORMATION_PAGE}
          as={Link}
          color="secondary"
          showAnchorIcon
        >
          Go to Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompleteProfile;

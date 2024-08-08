import { UserIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
} from '@nextui-org/react';

import { PERSONAL_INFORMATION_PAGE } from '@/lib/constants/pages';

type Props = {
  title: string;
};

const CompleteProfile = ({ title }: Props) => {
  return (
    <Card className='mx-auto gap-4 max-w-lg bg-transparent'>
      <CardHeader className='font-bold flex-col justify-center text-3xl p-6 pb-0 gap-4 text-center text-foreground'>
        <UserIcon className='size-12 text-secondary-500' />
        Complete Your Profile
      </CardHeader>
      <CardBody className='px-6 pt-0 text-center'>
        <p className='text-muted-foreground'>
          Before you can create your first {title}, please complete your
          personal information in your profile.
        </p>
      </CardBody>
      <CardFooter className='text-center p-6 pt-0 justify-center'>
        <Button
          href={PERSONAL_INFORMATION_PAGE}
          as={Link}
          color='secondary'
          showAnchorIcon
        >
          Go to Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompleteProfile;

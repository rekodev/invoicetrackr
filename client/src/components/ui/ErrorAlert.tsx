import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
} from '@nextui-org/react';

import { HOME_PAGE } from '@/lib/constants/pages';

const ErrorAlert = () => {
  return (
    <Card
      className='bg-rose-300 border-rose-500 border-large text-rose-700 px-4 py-3'
      role='alert'
    >
      <CardHeader className='font-bold'>Oops! Something Went Wrong</CardHeader>
      <CardBody>
        We encountered an unexpected issue. We apologize for any inconvenience
        and appreciate your patience.
      </CardBody>
      <CardFooter>
        <Button
          href={HOME_PAGE}
          as={Link}
          color='danger'
          showAnchorIcon
          variant='solid'
        >
          Go Back Home
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorAlert;

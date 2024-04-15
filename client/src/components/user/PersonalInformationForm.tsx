'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';

import { CLIENT_BUSINESS_TYPES } from '@/constants/client';
import { capitalize } from '@/utils';

const PersonalInformationForm = () => {
  return (
    <Card>
      <CardBody>
        <form className='flex flex-wrap gap-4'>
          <Input label='Name' />
          <Select label='Business Type'>
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input label='Business Number' />
          <Input label='Address' />
          <Input label='Email' />
        </form>
      </CardBody>
      <CardFooter className='justify-end'>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalInformationForm;

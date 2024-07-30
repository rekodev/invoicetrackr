'use client';

import axios from 'axios';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

type Props = {
  children: ReactNode;
};

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const fetcher = async (url: string) => {
  const response = await axios.get(url, {
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

const SWRProvider = ({ children }: Props) => {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
};

export default SWRProvider;

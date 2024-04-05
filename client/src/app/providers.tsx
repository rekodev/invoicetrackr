'use client';

import { NextUIProvider } from '@nextui-org/react';
import axios from 'axios';
import { SWRConfig } from 'swr';

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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher }}>
      <NextUIProvider className='flex flex-col min-h-screen justify-between'>
        {children}
      </NextUIProvider>
    </SWRConfig>
  );
}

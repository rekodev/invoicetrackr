'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const icon =
    theme === 'light' ? (
      <MoonIcon className="h-5 w-5" />
    ) : (
      <SunIcon className="h-5 w-5" />
    );

  const handleClick = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Button
      isDisabled={!mounted}
      variant="outline"
      isIconOnly
      onPress={handleClick}
    >
      {icon}
    </Button>
  );
}

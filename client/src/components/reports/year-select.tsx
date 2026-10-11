'use client';

import { Label, ListBox, ListBoxItem, Select } from '@heroui/react';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  year: number;
  years: number[];
  onChange: (_year: number) => void;
  icon?: ReactNode;
};

const YearSelect = ({ label, year, years, onChange, icon }: Props) => (
  <Select
    className={icon ? 'w-max' : 'sm:w-32'}
    variant="secondary"
    aria-label={icon ? label : undefined}
    value={String(year)}
    onChange={(value) => onChange(Number(value))}
  >
    {!icon && <Label>{label}</Label>}
    <Select.Trigger className={icon ? 'w-max items-center gap-2 rounded-full' : undefined}>
      {icon}
      <Select.Value className={icon ? 'flex-none' : undefined} />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox>
        {years.map((option) => (
          <ListBoxItem key={option} id={String(option)} textValue={String(option)}>
            {option}
            <ListBoxItem.Indicator />
          </ListBoxItem>
        ))}
      </ListBox>
    </Select.Popover>
  </Select>
);

export default YearSelect;

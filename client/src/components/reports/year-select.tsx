'use client';

import { cn, Label, ListBox, ListBoxItem, Select } from '@heroui/react';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  year: number;
  years: number[];
  onChange: (_year: number) => void;
  icon?: ReactNode;
  hideLabel?: boolean;
};

const YearSelect = ({ label, year, years, onChange, icon, hideLabel }: Props) => (
  <Select
    className={icon ? 'w-max' : 'sm:w-32'}
    variant="secondary"
    aria-label={icon || hideLabel ? label : undefined}
    value={String(year)}
    onChange={(value) => onChange(Number(value))}
  >
    {!icon && !hideLabel && <Label>{label}</Label>}
    <Select.Trigger
      className={cn({
        'h-10 min-h-10 items-center py-0 md:h-9 md:min-h-9': icon || hideLabel,
        'w-max items-center gap-actions rounded-full': icon
      })}
    >
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

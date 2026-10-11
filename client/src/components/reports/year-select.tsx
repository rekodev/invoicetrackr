'use client';

import { Label, ListBox, ListBoxItem, Select } from '@heroui/react';

type Props = {
  label: string;
  year: number;
  years: number[];
  onChange: (_year: number) => void;
};

const YearSelect = ({ label, year, years, onChange }: Props) => (
  <Select
    className="sm:w-32"
    variant="secondary"
    value={String(year)}
    onChange={(value) => onChange(Number(value))}
  >
    <Label>{label}</Label>
    <Select.Trigger>
      <Select.Value />
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

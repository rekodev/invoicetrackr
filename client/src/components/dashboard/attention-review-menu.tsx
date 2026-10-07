'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button, Dropdown, Label } from '@heroui/react';

type Props = {
  label: string;
  items: Array<{ key: string; action: string; href: string }>;
};

export default function AttentionReviewMenu({ label, items }: Props) {
  return (
    <Dropdown>
      <Button size="sm" variant="outline">
        {label}
        <ChevronDownIcon className="size-4" />
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label={label}>
          {items.map((item) => (
            <Dropdown.Item key={item.key} id={item.key} href={item.href} textValue={item.action}>
              <Label>{item.action}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

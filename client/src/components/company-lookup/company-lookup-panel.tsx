'use client';

import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import {
  ComboBox,
  FieldError,
  Input,
  type Key,
  Label,
  ListBox
} from '@heroui/react';
import type { CompanyLookupResult } from '@invoicetrackr/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { searchCompanyLookupsAction } from '@/lib/actions/company-lookup';

type Props = {
  userId: number;
  value: string;
  label: string;
  placeholder?: string;
  variant?: 'primary' | 'secondary';
  isInvalid?: boolean;
  errorMessage?: string;
  onInputChange: (_value: string) => void;
  onApply: (_result: CompanyLookupResult) => void;
};

const MIN_QUERY_LENGTH = 3;
const SEARCH_DELAY_MS = 500;

const CompanyLookupPanel = ({
  userId,
  value,
  label,
  placeholder,
  variant = 'secondary',
  isInvalid = false,
  errorMessage,
  onInputChange,
  onApply
}: Props) => {
  const t = useTranslations('company_lookup');
  const [results, setResults] = useState<CompanyLookupResult[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const trimmedQuery = value.trim();

  useEffect(() => {
    const requestId = requestIdRef.current;

    if (trimmedQuery.length < MIN_QUERY_LENGTH || selectedCode) return;

    const timeout = window.setTimeout(async () => {
      const response = await searchCompanyLookupsAction({
        userId,
        query: trimmedQuery
      });

      if (requestId !== requestIdRef.current) return;

      if (!response.ok) {
        setResults([]);
        return;
      }

      setResults(response.results);
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [selectedCode, trimmedQuery, userId]);

  const handleInputChange = (nextValue: string) => {
    requestIdRef.current += 1;
    setResults([]);
    setSelectedCode(null);
    onInputChange(nextValue);
  };

  const handleSelectionChange = (key: Key | null) => {
    if (key === null) return;

    const result = results.find(
      (candidate) => candidate.companyCode === String(key)
    );
    if (!result) return;

    requestIdRef.current += 1;
    setSelectedCode(result.companyCode);
    onApply(result);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <ComboBox
        allowsCustomValue
        allowsEmptyCollection
        fullWidth
        variant={variant}
        menuTrigger="input"
        inputValue={value}
        selectedKey={selectedCode}
        isInvalid={isInvalid}
        defaultFilter={() => true}
        onInputChange={handleInputChange}
        onSelectionChange={handleSelectionChange}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <Label>{label}</Label>
          <a
            href="https://data.gov.lt/datasets/607/?resource_version=940"
            target="_blank"
            rel="noreferrer"
            className="text-muted flex items-center gap-1.5 text-xs font-normal hover:underline"
          >
            <Image
              src="/vmi.svg"
              alt=""
              aria-hidden="true"
              width={20}
              height={20}
              className="size-5"
            />
            {t('provider_badge')}
          </a>
        </div>
        <ComboBox.InputGroup>
          <Input
            placeholder={placeholder || t('placeholder')}
            maxLength={100}
          />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        {results.length > 0 ? (
          <ComboBox.Popover className="w-(--trigger-width) max-w-(--trigger-width)">
            <div className="text-muted border-b px-3 py-2 text-xs font-medium uppercase tracking-wide">
              {t('results_header')}
            </div>
            <ListBox>
              {results.map((result) => (
                <ListBox.Item
                  key={result.companyCode}
                  id={result.companyCode}
                  textValue={`${result.legalName} ${result.companyCode}`}
                >
                  <span className="bg-background-secondary flex size-9 shrink-0 items-center justify-center rounded-full">
                    <BuildingOffice2Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <Label className="block truncate">{result.legalName}</Label>
                    <span className="text-muted block truncate text-sm">
                      {t('result_details', {
                        companyCode: result.companyCode,
                        vatNumber: result.vatNumber || t('no_vat')
                      })}
                      {' · '}
                      {t('provider_short')}
                    </span>
                  </span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </ComboBox.Popover>
        ) : null}
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      </ComboBox>
    </div>
  );
};

export default CompanyLookupPanel;

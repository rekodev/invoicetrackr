'use client';

import {
  Alert,
  Button,
  Description,
  Label,
  ListBox,
  SearchField,
  Spinner
} from '@heroui/react';
import type { CompanyLookupResult } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { searchCompanyLookupsAction } from '@/lib/actions/company-lookup';

type Props = {
  userId: number;
  onApply: (_result: CompanyLookupResult) => void;
};

const MIN_QUERY_LENGTH = 3;
const SEARCH_DELAY_MS = 500;

const CompanyLookupPanel = ({ userId, onApply }: Props) => {
  const t = useTranslations('company_lookup');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompanyLookupResult[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>();
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const requestIdRef = useRef(0);
  const trimmedQuery = query.trim();
  const selectedResult = results.find(
    (result) => result.companyCode === selectedCode
  );

  useEffect(() => {
    const requestId = requestIdRef.current;

    if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

    const timeout = window.setTimeout(async () => {
      setStatus('loading');
      setErrorMessage('');

      const response = await searchCompanyLookupsAction({
        userId,
        query: trimmedQuery
      });

      if (requestId !== requestIdRef.current) return;

      if (!response.ok) {
        setResults([]);
        setSelectedCode(undefined);
        setErrorMessage(response.message);
        setStatus('error');
        return;
      }

      setResults(response.results);
      setSelectedCode(undefined);
      setStatus('success');
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [trimmedQuery, userId]);

  const handleQueryChange = (value: string) => {
    requestIdRef.current += 1;
    setQuery(value);

    if (value.trim().length >= MIN_QUERY_LENGTH) return;

    setResults([]);
    setSelectedCode(undefined);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleApply = () => {
    if (!selectedResult) return;
    onApply(selectedResult);
    handleQueryChange('');
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-3">
      <SearchField
        fullWidth
        variant="secondary"
        value={query}
        onChange={handleQueryChange}
      >
        <Label>{t('label')}</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={t('placeholder')} />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>{t('description')}</Description>
      </SearchField>

      {status === 'loading' ? (
        <div className="text-muted flex items-center gap-2 text-sm">
          <Spinner size="sm" />
          <span>{t('loading')}</span>
        </div>
      ) : null}

      {status === 'error' ? (
        <Alert status="danger" className="p-0">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      {status === 'success' && results.length === 0 ? (
        <p className="text-muted text-sm">{t('empty')}</p>
      ) : null}

      {results.length > 0 ? (
        <ListBox
          aria-label={t('results_label')}
          selectionMode="single"
          selectedKeys={selectedCode ? [selectedCode] : []}
          onSelectionChange={(keys) => {
            if (keys === 'all') return;
            const key = [...keys][0];
            setSelectedCode(key === undefined ? undefined : String(key));
          }}
          className="max-h-64 overflow-y-auto rounded-lg border p-1"
        >
          {results.map((result) => (
            <ListBox.Item
              key={result.companyCode}
              id={result.companyCode}
              textValue={`${result.legalName} ${result.companyCode}`}
            >
              <Label>{result.legalName}</Label>
              <Description>
                {t('result_details', {
                  companyCode: result.companyCode,
                  vatNumber: result.vatNumber || t('no_vat')
                })}
                {' · '}
                {result.source.label}
              </Description>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      ) : null}

      {selectedResult ? (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <div>
            <p className="font-medium">{selectedResult.legalName}</p>
            <p className="text-muted text-sm">
              {t('result_details', {
                companyCode: selectedResult.companyCode,
                vatNumber: selectedResult.vatNumber || t('no_vat')
              })}
            </p>
            <p className="text-muted text-xs">{selectedResult.source.label}</p>
          </div>
          <Alert status="warning" className="p-0">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{t('address_notice')}</Alert.Description>
            </Alert.Content>
          </Alert>
          <Button type="button" onPress={handleApply} className="self-end">
            {t('apply')}
          </Button>
        </div>
      ) : null}

      <p className="text-muted text-xs">{t('manual_fallback')}</p>
    </div>
  );
};

export default CompanyLookupPanel;

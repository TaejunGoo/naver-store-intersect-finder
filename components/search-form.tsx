'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';

import { Search, X, Loader2, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group';

interface SearchFormProps {
  onSearch: (keywords: string[]) => void
  isLoading: boolean
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseKeywords = (value: string): string[] => {
    return value
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  };

  const validate = (keywords: string[]): string | null => {
    if (keywords.length === 0) {
      return '검색어를 입력해주세요';
    }
    if (keywords.length < 2) {
      return '최소 2개 이상의 검색어를 입력해주세요 (쉼표로 구분)';
    }
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const keywords = parseKeywords(input);
    const validationError = validate(keywords);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSearch(keywords);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setInput('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-3'>
      <div className='flex gap-1 md:gap-2'>
        {/* <div className='relative flex-1'>
          <Input
            type='text'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder='검색어를 쉼표로 구분하여 입력 (예: 단백질 보충제, 쉐이커)'
            disabled={isLoading}
            className='pr-10'
          />
          {input && (
            <button
              type='button'
              onClick={handleClear}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer'
              disabled={isLoading}
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Search className='h-4 w-4' />
          )}
          <span className='hidden md:ml-2 md:inline'>검색</span>
        </Button> */}
        <InputGroup>
          <InputGroupInput 
            id='inline-start-input'
            placeholder='검색어를 쉼표로 구분하여 입력 (예: 단백질 보충제, 쉐이커)'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <InputGroupAddon align='inline-end'>
            <InputGroupButton 
              variant='ghost'
              type='submit'
              disabled={isLoading}
            >
              
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin text-foreground' />
              ) : (
                <SearchIcon className='text-foreground cursor-pointer' />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
      {error && (
        <p className='text-sm text-destructive'>{error}</p>
      )}
    </form>
  );
}

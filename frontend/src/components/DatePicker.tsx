import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar } from './Calendar';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  locale?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  showClearButton?: boolean;
  allowTextInput?: boolean;
  error?: string;
  label?: string;
  id?: string;
  name?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  required = false,
  className = '',
  locale = 'en-US',
  dateFormat = 'MM/dd/yyyy',
  minDate,
  maxDate,
  showClearButton = true,
  allowTextInput = true,
  error,
  label,
  id,
  name
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, dateFormat));
    } else {
      setInputValue('');
    }
  }, [value, dateFormat]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setInputError(null);

    if (!newValue) {
      onChange?.(null);
      return;
    }

    if (!allowTextInput) {
      return;
    }

    try {
      const parsedDate = parse(newValue, dateFormat, new Date());
      
      if (isValid(parsedDate)) {
        if (minDate && parsedDate < minDate) {
          setInputError(t('datePicker.error.minDate', 'Date is before minimum allowed date'));
          return;
        }
        
        if (maxDate && parsedDate > maxDate) {
          setInputError(t('datePicker.error.maxDate', 'Date is after maximum allowed date'));
          return;
        }

        onChange?.(parsedDate);
        setInputError(null);
      } else {
        setInputError(t('datePicker.error.invalidFormat', 'Invalid date format'));
      }
    } catch (err) {
      setInputError(t('datePicker.error.invalidFormat', 'Invalid date format'));
    }
  }, [allowTextInput, dateFormat, minDate, maxDate, onChange, t]);

  const handleDateSelect = useCallback((date: Date) => {
    onChange?.(date);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange?.(null);
    setInputValue('');
    setInputError(null);
    inputRef.current?.focus();
  }, [onChange]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  const toggleCalendar = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  const displayError = error || inputError;

  return (
    <div className={`date-picker ${className}`} ref={containerRef}>
      {label && (
        <label 
          htmlFor={id}
          className="date-picker-label"
        >
          {label}
          {required && <span className="date-picker-required">*</span>}
        </label>
      )}
      
      <div className="date-picker-input-wrapper">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`date-picker-input ${displayError ? 'date-picker-input--error' : ''}`}
          aria-describedby={displayError ? `${id}-error` : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          role="combobox"
        />
        
        <button
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          className="date-picker-toggle"
          aria-label={t('datePicker.toggleCalendar', 'Toggle calendar')}
        >
          <ChevronDown size={20} />
        </button>
        
        {showClearButton && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="date-picker-clear"
            aria-label={t('datePicker.clear', 'Clear date')}
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {displayError && (
        <div 
          id={`${id}-error`}
          className="date-picker-error"
          role="alert"
          aria-live="polite"
        >
          {displayError}
        </div>
      )}
      
      {isOpen && (
        <div 
          ref={calendarRef}
          className="date-picker-calendar"
          role="dialog"
          aria-modal="true"
          aria-label={t('datePicker.calendarLabel', 'Date picker calendar')}
        >
          <Calendar
            selected={value}
            onSelect={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;

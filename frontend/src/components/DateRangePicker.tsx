import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, isAfter, isBefore, isSameDay, addDays } from 'date-fns';
import { Calendar } from './Calendar';
import { ChevronDown, X, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  locale?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  allowSameDay?: boolean;
  showClearButton?: boolean;
  error?: string;
  label?: string;
  id?: string;
  name?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date range',
  disabled = false,
  required = false,
  className = '',
  locale = 'en-US',
  dateFormat = 'MM/dd/yyyy',
  minDate,
  maxDate,
  allowSameDay = false,
  showClearButton = true,
  error,
  label,
  id,
  name
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const getDisplayValue = useCallback(() => {
    if (!value?.start && !value?.end) return '';
    if (value?.start && value?.end) {
      return `${format(value.start, dateFormat)} - ${format(value.end, dateFormat)}`;
    }
    if (value?.start) {
      return `${format(value.start, dateFormat)} - ${t('dateRangePicker.selectEnd', 'Select end')}`;
    }
    return '';
  }, [value, dateFormat, t]);

  const isDateSelected = useCallback((date: Date): boolean => {
    if (!value?.start) return false;
    return isSameDay(date, value.start) || (value.end && isSameDay(date, value.end));
  }, [value]);

  const isDateInRange = useCallback((date: Date): boolean => {
    if (!value?.start || !value?.end) return false;
    return (isAfter(date, value.start) || isSameDay(date, value.start)) &&
           (isBefore(date, value.end) || isSameDay(date, value.end));
  }, [value]);

  const isDateHovered = useCallback((date: Date): boolean => {
    if (!hoveredDate || !value?.start) return false;
    if (selectionMode === 'end') {
      return (isAfter(date, value.start) || isSameDay(date, value.start)) &&
             (isBefore(date, hoveredDate) || isSameDay(date, hoveredDate));
    }
    return false;
  }, [hoveredDate, value, selectionMode]);

  const handleDateSelect = useCallback((date: Date) => {
    if (!value?.start) {
      onChange?.({ start: date });
      setSelectionMode('end');
    } else if (!value?.end) {
      if (isSameDay(date, value.start) && !allowSameDay) {
        onChange?.({ start: date });
        setSelectionMode('end');
      } else if (isAfter(date, value.start) || (allowSameDay && isSameDay(date, value.start))) {
        onChange?.({ start: value.start, end: date });
        setSelectionMode('start');
        setIsOpen(false);
        inputRef.current?.focus();
      } else {
        onChange?.({ start: date });
        setSelectionMode('end');
      }
    } else {
      onChange?.({ start: date });
      setSelectionMode('end');
    }
  }, [value, allowSameDay, onChange]);

  const handleDateHover = useCallback((date: Date) => {
    if (selectionMode === 'end' && value?.start && !value?.end) {
      setHoveredDate(date);
    }
  }, [selectionMode, value]);

  const handleClear = useCallback(() => {
    onChange?.(null);
    setSelectionMode('start');
    setHoveredDate(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredDate(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setHoveredDate(null);
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

  useEffect(() => {
    if (!value?.start || value?.end) {
      setSelectionMode('start');
    }
  }, [value]);

  return (
    <div className={`date-range-picker ${className}`} ref={containerRef}>
      {label && (
        <label 
          htmlFor={id}
          className="date-range-picker-label"
        >
          {label}
          {required && <span className="date-range-picker-required">*</span>}
        </label>
      )}
      
      <div className="date-range-picker-input-wrapper">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={getDisplayValue()}
          readOnly
          onClick={toggleCalendar}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`date-range-picker-input ${error ? 'date-range-picker-input--error' : ''}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          role="combobox"
        />
        
        <button
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          className="date-range-picker-toggle"
          aria-label={t('dateRangePicker.toggleCalendar', 'Toggle calendar')}
        >
          <CalendarIcon size={20} />
        </button>
        
        {showClearButton && value?.start && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="date-range-picker-clear"
            aria-label={t('dateRangePicker.clear', 'Clear date range')}
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {error && (
        <div 
          id={`${id}-error`}
          className="date-range-picker-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      
      {isOpen && (
        <div 
          ref={calendarRef}
          className="date-range-picker-calendar"
          role="dialog"
          aria-modal="true"
          aria-label={t('dateRangePicker.calendarLabel', 'Date range picker calendar')}
        >
          <div className="date-range-picker-selection-info">
            <div className="date-range-picker-selection-mode">
              {selectionMode === 'start' 
                ? t('dateRangePicker.selectingStart', 'Selecting start date')
                : t('dateRangePicker.selectingEnd', 'Selecting end date')
              }
            </div>
            {value?.start && (
              <div className="date-range-picker-selected-start">
                {t('dateRangePicker.start', 'Start')}: {format(value.start, dateFormat)}
              </div>
            )}
            {value?.end && (
              <div className="date-range-picker-selected-end">
                {t('dateRangePicker.end', 'End')}: {format(value.end, dateFormat)}
              </div>
            )}
          </div>
          
          <Calendar
            selected={value?.start || value?.end}
            onSelect={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            locale={locale}
            className="date-range-picker-calendar-grid"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

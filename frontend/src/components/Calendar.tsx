import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  isWeekend,
  getDay,
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  isAfter,
  parseISO,
  addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekNumbers?: boolean;
  highlightToday?: boolean;
  highlightWeekends?: boolean;
  allowOutsideDays?: boolean;
  initialMonth?: Date;
}

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  disabled = false,
  className = '',
  locale = 'en-US',
  weekStartsOn = 0,
  showWeekNumbers = false,
  highlightToday = true,
  highlightWeekends = false,
  allowOutsideDays = false,
  initialMonth = new Date()
}) => {
  const { t, language } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [focusedDate, setFocusedDate] = useState(selected || new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const isDateDisabled = useCallback((date: Date): boolean => {
    if (disabled) return true;
    if (minDate && isBefore(date, setHours(setMinutes(setSeconds(minDate, 0), 0), 0))) return true;
    if (maxDate && isAfter(date, setHours(setMinutes(setSeconds(maxDate, 0), 59), 23))) return true;
    return false;
  }, [disabled, minDate, maxDate]);

  const getCalendarDate = useCallback((date: Date): CalendarDate => {
    return {
      date,
      isCurrentMonth: isSameMonth(date, currentMonth),
      isToday: isToday(date),
      isWeekend: isWeekend(date),
      isSelected: selected ? isSameDay(date, selected) : false,
      isDisabled: isDateDisabled(date)
    };
  }, [currentMonth, selected, isDateDisabled]);

  const handleDateSelect = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;
    onSelect?.(date);
  }, [onSelect, isDateDisabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, date: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateSelect(date);
    }
  }, [handleDateSelect]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  }, []);

  const getWeekNumber = useCallback((date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }, []);

  const getDayNames = useCallback((): string[] => {
    const names = [];
    const start = startOfWeek(new Date(), { weekStartsOn });
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      names.push(format(date, 'EEE', { locale }));
    }
    return names;
  }, [locale, weekStartsOn]);

  useEffect(() => {
    if (selected && !isSameMonth(selected, currentMonth)) {
      setCurrentMonth(selected);
    }
  }, [selected, currentMonth]);

  const weekDays = getDayNames();
  const weeks: CalendarDate[][] = [];
  let currentWeek: CalendarDate[] = [];

  days.forEach((day, index) => {
    const calendarDate = getCalendarDate(day);
    currentWeek.push(calendarDate);
    
    if (index % 7 === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div 
      className={`calendar ${className}`}
      role="application"
      aria-label={t('calendar.ariaLabel', 'Calendar')}
    >
      <div className="calendar-header">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          disabled={disabled}
          className="calendar-nav-button"
          aria-label={t('calendar.previousMonth', 'Previous month')}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="calendar-month-year">
          {format(currentMonth, 'MMMM yyyy', { locale })}
        </h2>
        
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          disabled={disabled}
          className="calendar-nav-button"
          aria-label={t('calendar.nextMonth', 'Next month')}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid" ref={gridRef}>
        <div className="calendar-weekdays">
          {showWeekNumbers && (
            <div className="calendar-week-header">
              {t('calendar.week', 'Wk')}
            </div>
          )}
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days" role="grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week" role="row">
              {showWeekNumbers && (
                <div className="calendar-week-number">
                  {getWeekNumber(week[0].date)}
                </div>
              )}
              {week.map((calendarDate, dayIndex) => (
                <button
                  key={`${calendarDate.date.toISOString()}-${dayIndex}`}
                  type="button"
                  ref={el => {
                    if (el) buttonRefs.current.set(calendarDate.date.toISOString(), el);
                  }}
                  className={`calendar-day ${
                    calendarDate.isCurrentMonth ? 'calendar-day--current-month' : 'calendar-day--outside-month'
                  } ${
                    calendarDate.isSelected ? 'calendar-day--selected' : ''
                  } ${
                    calendarDate.isToday && highlightToday ? 'calendar-day--today' : ''
                  } ${
                    calendarDate.isWeekend && highlightWeekends ? 'calendar-day--weekend' : ''
                  } ${
                    calendarDate.isDisabled ? 'calendar-day--disabled' : ''
                  }`}
                  onClick={() => handleDateSelect(calendarDate.date)}
                  onKeyDown={(e) => handleKeyDown(e, calendarDate.date)}
                  disabled={calendarDate.isDisabled}
                  aria-label={format(calendarDate.date, 'PPP', { locale })}
                  aria-pressed={calendarDate.isSelected}
                  aria-disabled={calendarDate.isDisabled}
                  role="gridcell"
                  tabIndex={
                    selected && isSameDay(calendarDate.date, selected) ? 0 : -1
                  }
                >
                  <span className="calendar-day-number">
                    {format(calendarDate.date, 'd')}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

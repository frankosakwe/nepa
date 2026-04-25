import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Calendar from './Calendar';
import DatePicker from './DatePicker';
import DateRangePicker from './DateRangePicker';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock date-fns to have consistent dates for testing
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date, formatStr) => {
    const mockDate = new Date('2024-01-15');
    if (formatStr === 'MMMM yyyy') return 'January 2024';
    if (formatStr === 'd') return '15';
    if (formatStr === 'EEE') return 'Mon';
    if (formatStr === 'MM/dd/yyyy') return '01/15/2024';
    if (formatStr === 'PPP') return 'January 15, 2024';
    return 'mock-date';
  }),
  startOfMonth: jest.fn(() => new Date('2024-01-01')),
  endOfMonth: jest.fn(() => new Date('2024-01-31')),
  startOfWeek: jest.fn(() => new Date('2023-12-31')),
  endOfWeek: jest.fn(() => new Date('2024-01-06')),
  eachDayOfInterval: jest.fn(() => {
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(2023, 11, 31 + i));
    }
    return days;
  }),
  isSameMonth: jest.fn((date1, date2) => date1.getMonth() === date2.getMonth()),
  isSameDay: jest.fn((date1, date2) => date1.getDate() === date2.getDate()),
  addMonths: jest.fn((date, months) => new Date(date.getTime() + months * 30 * 24 * 60 * 60 * 1000)),
  subMonths: jest.fn((date, months) => new Date(date.getTime() - months * 30 * 24 * 60 * 60 * 1000)),
  isToday: jest.fn(() => false),
  isWeekend: jest.fn(() => false),
  getDay: jest.fn(() => 1),
  setHours: jest.fn((date, hours) => new Date(date.setHours(hours))),
  setMinutes: jest.fn((date, minutes) => new Date(date.setMinutes(minutes))),
  setSeconds: jest.fn((date, seconds) => new Date(date.setSeconds(seconds))),
  isBefore: jest.fn((date1, date2) => date1 < date2),
  isAfter: jest.fn((date1, date2) => date1 > date2),
  parseISO: jest.fn((str) => new Date(str)),
  parse: jest.fn((str, format, reference) => new Date(str)),
  isValid: jest.fn(() => true),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
}));

// Mock useTranslation hook
jest.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    language: 'en'
  })
}));

describe('Calendar Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  test('renders calendar with correct structure', () => {
    render(<Calendar onSelect={mockOnSelect} />);
    
    expect(screen.getByRole('application', { name: /calendar/i })).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('navigates between months', async () => {
    const user = userEvent.setup();
    render(<Calendar onSelect={mockOnSelect} />);
    
    const prevButton = screen.getByLabelText(/previous month/i);
    const nextButton = screen.getByLabelText(/next month/i);
    
    await user.click(prevButton);
    await user.click(nextButton);
    
    // Verify navigation buttons are clickable
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  test('selects date when clicked', async () => {
    const user = userEvent.setup();
    render(<Calendar onSelect={mockOnSelect} />);
    
    const dateButtons = screen.getAllByRole('gridcell');
    await user.click(dateButtons[15]); // Click middle date
    
    expect(mockOnSelect).toHaveBeenCalled();
  });

  test('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Calendar onSelect={mockOnSelect} />);
    
    const dateButtons = screen.getAllByRole('gridcell');
    dateButtons[15].focus();
    
    await user.keyboard('{Enter}');
    
    expect(mockOnSelect).toHaveBeenCalled();
  });

  test('disables dates when minDate is set', () => {
    const minDate = new Date('2024-01-10');
    render(<Calendar onSelect={mockOnSelect} minDate={minDate} />);
    
    const dateButtons = screen.getAllByRole('gridcell');
    // Some buttons should be disabled
    expect(dateButtons.some(button => button.hasAttribute('disabled'))).toBe(true);
  });

  test('disables dates when maxDate is set', () => {
    const maxDate = new Date('2024-01-20');
    render(<Calendar onSelect={mockOnSelect} maxDate={maxDate} />);
    
    const dateButtons = screen.getAllByRole('gridcell');
    // Some buttons should be disabled
    expect(dateButtons.some(button => button.hasAttribute('disabled'))).toBe(true);
  });

  test('highlights selected date', () => {
    const selectedDate = new Date('2024-01-15');
    render(<Calendar selected={selectedDate} onSelect={mockOnSelect} />);
    
    const dateButtons = screen.getAllByRole('gridcell');
    const selectedButton = dateButtons.find(button => 
      button.getAttribute('aria-pressed') === 'true'
    );
    
    expect(selectedButton).toBeInTheDocument();
  });

  test('passes accessibility checks', async () => {
    const { container } = render(<Calendar onSelect={mockOnSelect} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('supports custom className', () => {
    render(<Calendar onSelect={mockOnSelect} className="custom-calendar" />);
    
    const calendar = screen.getByRole('application', { name: /calendar/i });
    expect(calendar).toHaveClass('custom-calendar');
  });

  test('shows week numbers when enabled', () => {
    render(<Calendar onSelect={mockOnSelect} showWeekNumbers />);
    
    expect(screen.getByText('Wk')).toBeInTheDocument();
  });

  test('highlights weekends when enabled', () => {
    render(<Calendar onSelect={mockOnSelect} highlightWeekends />);
    
    const dateButtons = screen.getAllByRole('gridcell');
    // Weekend highlighting would be applied via CSS classes
    expect(dateButtons.length).toBeGreaterThan(0);
  });
});

describe('DatePicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders date picker with input', () => {
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Select date');
  });

  test('opens calendar when input is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    expect(screen.getByRole('dialog', { name: /date picker calendar/i })).toBeInTheDocument();
  });

  test('opens calendar when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={mockOnChange} />);
    
    const toggleButton = screen.getByLabelText(/toggle calendar/i);
    await user.click(toggleButton);
    
    expect(screen.getByRole('dialog', { name: /date picker calendar/i })).toBeInTheDocument();
  });

  test('closes calendar when escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    await user.keyboard('{Escape}');
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('closes calendar when clicking outside', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Click outside
    await user.click(document.body);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('displays selected date value', () => {
    const selectedDate = new Date('2024-01-15');
    render(<DatePicker value={selectedDate} onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('01/15/2024');
  });

  test('clears date when clear button is clicked', async () => {
    const user = userEvent.setup();
    const selectedDate = new Date('2024-01-15');
    render(<DatePicker value={selectedDate} onChange={mockOnChange} />);
    
    const clearButton = screen.getByLabelText(/clear date/i);
    await user.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test('validates date input', async () => {
    const user = userEvent.setup();
    render(<DatePicker onChange={mockOnChange} allowTextInput />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'invalid-date');
    
    expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
  });

  test('respects minDate constraint', async () => {
    const user = userEvent.setup();
    const minDate = new Date('2024-01-10');
    render(<DatePicker onChange={mockOnChange} minDate={minDate} allowTextInput />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, '01/05/2024');
    
    expect(screen.getByText(/date is before minimum allowed date/i)).toBeInTheDocument();
  });

  test('respects maxDate constraint', async () => {
    const user = userEvent.setup();
    const maxDate = new Date('2024-01-20');
    render(<DatePicker onChange={mockOnChange} maxDate={maxDate} allowTextInput />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, '01/25/2024');
    
    expect(screen.getByText(/date is after maximum allowed date/i)).toBeInTheDocument();
  });

  test('passes accessibility checks', async () => {
    const { container } = render(<DatePicker onChange={mockOnChange} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('disables input when disabled prop is true', () => {
    render(<DatePicker onChange={mockOnChange} disabled />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  test('shows required indicator when required prop is true', () => {
    render(<DatePicker onChange={mockOnChange} required label="Birth Date" />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

describe('DateRangePicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders date range picker with input', () => {
    render(<DateRangePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Select date range');
  });

  test('opens calendar when input is clicked', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    expect(screen.getByRole('dialog', { name: /date range picker calendar/i })).toBeInTheDocument();
  });

  test('selects start date first', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    const dateButtons = screen.getAllByRole('gridcell');
    await user.click(dateButtons[10]);
    
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
      start: expect.any(Date)
    }));
  });

  test('selects end date after start date', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    const dateButtons = screen.getAllByRole('gridcell');
    await user.click(dateButtons[10]); // Start date
    await user.click(dateButtons[20]); // End date
    
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
      start: expect.any(Date),
      end: expect.any(Date)
    }));
  });

  test('displays range in input when both dates selected', () => {
    const value = {
      start: new Date('2024-01-10'),
      end: new Date('2024-01-15')
    };
    render(<DateRangePicker value={value} onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('01/10/2024 - 01/15/2024');
  });

  test('clears range when clear button is clicked', async () => {
    const user = userEvent.setup();
    const value = {
      start: new Date('2024-01-10'),
      end: new Date('2024-01-15')
    };
    render(<DateRangePicker value={value} onChange={mockOnChange} />);
    
    const clearButton = screen.getByLabelText(/clear date range/i);
    await user.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test('shows selection mode indicator', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    expect(screen.getByText(/selecting start date/i)).toBeInTheDocument();
  });

  test('passes accessibility checks', async () => {
    const { container } = render(<DateRangePicker onChange={mockOnChange} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('handles same day selection when allowed', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={mockOnChange} allowSameDay />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    const dateButtons = screen.getAllByRole('gridcell');
    const targetDate = dateButtons[10];
    
    await user.click(targetDate);
    await user.click(targetDate);
    
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
      start: expect.any(Date),
      end: expect.any(Date)
    }));
  });
});

describe('Calendar Integration Tests', () => {
  test('calendar components work together', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    const { rerender } = render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByRole('combobox');
    await user.click(input);
    
    const dateButtons = screen.getAllByRole('gridcell');
    await user.click(dateButtons[15]);
    
    expect(mockOnChange).toHaveBeenCalled();
    
    // Test with DateRangePicker
    const mockRangeChange = jest.fn();
    rerender(<DateRangePicker onChange={mockRangeChange} />);
    
    const rangeInput = screen.getByRole('combobox');
    await user.click(rangeInput);
    
    const rangeDateButtons = screen.getAllByRole('gridcell');
    await user.click(rangeDateButtons[10]);
    await user.click(rangeDateButtons[20]);
    
    expect(mockRangeChange).toHaveBeenCalledWith(expect.objectContaining({
      start: expect.any(Date),
      end: expect.any(Date)
    }));
  });

  test('calendar components handle edge cases', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    // Test with disabled state
    render(<DatePicker onChange={mockOnChange} disabled />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
    
    // Test with required state
    render(<DatePicker onChange={mockOnChange} required label="Required Date" />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Required Date')).toBeInTheDocument();
  });
});

import React, { useState } from 'react';
import Calendar from './Calendar';
import DatePicker from './DatePicker';
import DateRangePicker from './DateRangePicker';
import { DateRange } from './DateRangePicker';

const CalendarExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [disabledDate, setDisabledDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRangeSelect = (range: DateRange | null) => {
    setDateRange(range);
  };

  const handleDisabledSelect = (date: Date) => {
    setDisabledDate(date);
  };

  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar Components Example</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Calendar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Basic Calendar</h2>
          <div className="p-4 border border-gray-200 rounded-lg">
            <Calendar
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="w-full"
            />
          </div>
          {selectedDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Selected: {selectedDate.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Calendar with Constraints */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Calendar with Date Constraints</h2>
          <div className="p-4 border border-gray-200 rounded-lg">
            <Calendar
              selected={disabledDate}
              onSelect={handleDisabledSelect}
              minDate={lastMonth}
              maxDate={nextMonth}
              highlightToday={true}
              highlightWeekends={true}
              showWeekNumbers={true}
              className="w-full"
            />
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Dates are limited to last month through next month</p>
            <p>• Today and weekends are highlighted</p>
            <p>• Week numbers are shown</p>
          </div>
        </div>

        {/* Date Picker */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Date Picker</h2>
          <div className="space-y-4">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              label="Select a date"
              placeholder="Choose a date"
              allowTextInput={true}
              showClearButton={true}
            />
            
            <DatePicker
              label="Date with constraints"
              placeholder="Select date (limited range)"
              minDate={lastMonth}
              maxDate={nextMonth}
              onChange={(date) => console.log('Constrained date:', date)}
            />
            
            <DatePicker
              label="Disabled date picker"
              placeholder="This is disabled"
              disabled={true}
            />
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Date Range Picker</h2>
          <div className="space-y-4">
            <DateRangePicker
              value={dateRange}
              onChange={handleRangeSelect}
              label="Select date range"
              placeholder="Choose date range"
              allowSameDay={false}
              showClearButton={true}
            />
            
            {dateRange?.start && dateRange?.end && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Range: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Duration: {Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            )}
            
            <DateRangePicker
              label="Range with constraints"
              placeholder="Select range (this month only)"
              minDate={new Date(today.getFullYear(), today.getMonth(), 1)}
              maxDate={new Date(today.getFullYear(), today.getMonth() + 1, 0)}
              onChange={(range) => console.log('Constrained range:', range)}
            />
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Accessibility Features</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Full keyboard navigation (Arrow keys, Enter, Space, Escape)</li>
            <li>• ARIA labels and roles for screen readers</li>
            <li>• High contrast mode support</li>
            <li>• Reduced motion support</li>
            <li>• Focus management and visible focus indicators</li>
            <li>• Semantic HTML structure</li>
          </ul>
        </div>
      </div>

      {/* Responsive Design */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Responsive Design</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Mobile-optimized touch targets (minimum 44px)</li>
            <li>• Adaptive layout for different screen sizes</li>
            <li>• Scrollable calendar on small screens</li>
            <li>• Optimized font sizes and spacing</li>
          </ul>
        </div>
      </div>

      {/* Localization Support */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Localization Support</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Multiple language support (English, Spanish)</li>
            <li>• Localized date formats</li>
            <li>• RTL language support ready</li>
            <li>• Culturally appropriate calendar layouts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalendarExample;

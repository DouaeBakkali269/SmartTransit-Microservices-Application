'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
    value?: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
    className?: string;
}

export function DateTimePicker({ value, onChange, minDate, className }: DateTimePickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Set minimum date to November 20, 2025
    const absoluteMinDate = new Date(2025, 10, 20); // Month is 0-indexed, so 10 = November
    const minDateToUse = minDate && minDate > absoluteMinDate ? minDate : absoluteMinDate;

    const [selectedDate, setSelectedDate] = useState<Date>(value || minDateToUse);
    const [selectedTime, setSelectedTime] = useState<string>(
        value ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}` : '12:00'
    );

    // Generate calendar days for current month
    const generateCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (number | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        newDate.setHours(hours, minutes);

        setSelectedDate(newDate);
        onChange(newDate);
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours, minutes);
        onChange(newDate);
    };

    const handleMonthChange = (increment: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + increment);

        // Restrict to year 2025 only
        if (newDate.getFullYear() === 2025) {
            setSelectedDate(newDate);
        }
    };

    const canNavigatePrevMonth = () => {
        const prevMonth = new Date(selectedDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        return prevMonth.getFullYear() === 2025 &&
            (prevMonth.getMonth() > 10 || prevMonth.getFullYear() > 2025);
    };

    const canNavigateNextMonth = () => {
        const nextMonth = new Date(selectedDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.getFullYear() === 2025;
    };

    const isDateDisabled = (day: number) => {
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        date.setHours(0, 0, 0, 0);
        const minDateCopy = new Date(minDateToUse);
        minDateCopy.setHours(0, 0, 0, 0);
        return date < minDateCopy || date.getFullYear() !== 2025;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate();
    };

    const formatDisplayDate = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (selectedDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (selectedDate.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: selectedDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={cn("relative", className)}>
            <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowPicker(!showPicker)}
            >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDisplayDate()}</span>
            </Button>

            {showPicker && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPicker(false)}
                    />

                    {/* Picker Popup */}
                    <div className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl p-4 min-w-[320px]">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => handleMonthChange(-1)}
                                disabled={!canNavigatePrevMonth()}
                                className="p-2 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="font-semibold text-slate-900">
                                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleMonthChange(1)}
                                disabled={!canNavigateNextMonth()}
                                className="p-2 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {generateCalendarDays().map((day, index) => (
                                <div key={index}>
                                    {day ? (
                                        <button
                                            type="button"
                                            onClick={() => !isDateDisabled(day) && handleDateSelect(day)}
                                            disabled={isDateDisabled(day)}
                                            className={cn(
                                                "w-full aspect-square rounded-md text-sm transition-colors",
                                                isSelected(day) && "bg-blue-600 text-white font-semibold hover:bg-blue-700",
                                                !isSelected(day) && isToday(day) && "border-2 border-blue-600 text-blue-600 font-semibold",
                                                !isSelected(day) && !isToday(day) && !isDateDisabled(day) && "hover:bg-slate-100 text-slate-900",
                                                isDateDisabled(day) && "text-slate-300 cursor-not-allowed"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Time Picker */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Time</span>
                            </div>
                            <input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const now = new Date();
                                    setSelectedDate(now);
                                    setSelectedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
                                    onChange(now);
                                    setShowPicker(false);
                                }}
                                className="flex-1"
                            >
                                Now
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setShowPicker(false)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, X } from 'lucide-react';
import { searchLocations, type Location } from '@/lib/geolocation';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
    id: string;
    placeholder: string;
    value: string;
    onChange: (value: string, location?: Location) => void;
    onLocationSelect?: (location: Location) => void;
    showCurrentLocationButton?: boolean;
    onCurrentLocationClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export function LocationAutocomplete({
    id,
    placeholder,
    value,
    onChange,
    onLocationSelect,
    showCurrentLocationButton = false,
    onCurrentLocationClick,
    className,
    disabled = false
}: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search for locations when input changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length >= 2 && isUserTyping && !disabled) {
                try {
                    const results = await searchLocations(value);
                    setSuggestions(results);
                    setShowSuggestions(true);
                    setSelectedIndex(-1);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                    setSuggestions([]);
                }
            } else if (isUserTyping) {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [value, isUserTyping, disabled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUserTyping(true);
        onChange(e.target.value);
    };

    const handleSuggestionClick = (location: Location) => {
        setIsUserTyping(false);
        onChange(location.name, location);
        if (onLocationSelect) {
            onLocationSelect(location);
        }
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    };

    const handleClear = () => {
        setIsUserTyping(false);
        onChange('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        if (suggestions.length > 0 && isUserTyping && !disabled) {
            setShowSuggestions(true);
        }
    };

    const getLocationTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            university: 'text-blue-600 bg-blue-50',
            neighborhood: 'text-blue-600 bg-blue-50',
            landmark: 'text-green-600 bg-green-50',
            transport: 'text-orange-600 bg-orange-50',
            shopping: 'text-pink-600 bg-pink-50',
            hospital: 'text-red-600 bg-red-50',
            school: 'text-indigo-600 bg-indigo-50',
            business: 'text-teal-600 bg-teal-50',
            park: 'text-emerald-600 bg-emerald-50',
            sports: 'text-amber-600 bg-amber-50',
            city: 'text-slate-600 bg-slate-50',
            street: 'text-gray-600 bg-gray-50'
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                    ref={inputRef}
                    id={id}
                    placeholder={placeholder}
                    className={cn("pl-9 pr-20", className)}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    autoComplete="off"
                    disabled={disabled}
                />
                <div className="absolute right-2 top-2 flex items-center gap-1">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {showCurrentLocationButton && !disabled && (
                        <button
                            type="button"
                            onClick={onCurrentLocationClick}
                            className="h-7 w-7 rounded-full hover:bg-blue-50 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
                            title="Use current location"
                        >
                            <Navigation className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-2">
                        <div className="text-xs font-medium text-slate-500 px-3 py-2">
                            Suggestions in Rabat
                        </div>
                        {suggestions.map((location, index) => (
                            <button
                                key={location.id}
                                type="button"
                                onClick={() => handleSuggestionClick(location)}
                                className={cn(
                                    "w-full text-left px-3 py-2.5 rounded-md transition-colors flex items-start gap-3 group",
                                    selectedIndex === index
                                        ? "bg-blue-50 text-blue-900"
                                        : "hover:bg-slate-50"
                                )}
                            >
                                <div className="mt-0.5">
                                    <MapPin className={cn(
                                        "h-4 w-4",
                                        selectedIndex === index ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "font-medium text-sm",
                                            selectedIndex === index ? "text-blue-900" : "text-slate-900"
                                        )}>
                                            {location.name}
                                        </span>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                            getLocationTypeColor(location.type)
                                        )}>
                                            {location.type}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "text-xs truncate",
                                        selectedIndex === index ? "text-blue-700" : "text-slate-500"
                                    )}>
                                        {location.address}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No results message - only show when user is actively typing */}
            {showSuggestions && isUserTyping && value.length >= 2 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
                    <div className="text-center text-sm text-slate-500">
                        No locations found in Rabat matching &quot;{value}&quot;
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';

interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
}

export default function PlateInput({ 
  value, 
  onChange, 
  placeholder = "AA-00-AA", 
  className = "",
  required = false,
  id = "plate"
}: PlateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the value when it changes externally
    setDisplayValue(formatPlate(value));
  }, [value]);

  const formatPlate = (input: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Format as AA-00-AA
    let formatted = '';
    for (let i = 0; i < cleaned.length && i < 6; i++) {
      if (i === 2 || i === 4) {
        formatted += '-';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPlate(input);
    
    setDisplayValue(formatted);
    
    // Send back the cleaned value (without dashes) to parent
    const cleaned = formatted.replace(/-/g, '');
    onChange(cleaned);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    
    // Ensure that it is a letter or number
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 65 || e.keyCode > 90) &&
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <input
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength={8} // AA-00-AA = 8 characters with dashes
      required={required}
      className={className}
      autoComplete="off"
    />
  );
}

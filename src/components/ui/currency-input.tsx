
'use client';

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';

interface CurrencyInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: number;
  onValueChange: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    React.useEffect(() => {
        // Format the initial value or when it changes from the outside
        if (value > 0) {
          setDisplayValue(new Intl.NumberFormat('en-US').format(value));
        } else {
          setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Remove non-digit characters
      const numericValue = parseInt(rawValue.replace(/[^0-9]/g, ''), 10);
      
      if (!isNaN(numericValue)) {
        setDisplayValue(new Intl.NumberFormat('en-US').format(numericValue));
        onValueChange(numericValue);
      } else {
        setDisplayValue('');
        onValueChange(0);
      }
    };

    return <Input ref={ref} value={displayValue} onChange={handleChange} {...props} />;
  }
);
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };

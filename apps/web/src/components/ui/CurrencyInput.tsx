import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface CurrencyInputProps extends Omit<NumericFormatProps, 'value' | 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  prefix?: string;
}

export default function CurrencyInput({ value, onChange, className, prefix = '$ ', ...props }: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        // values.value is the raw unformatted string (e.g. "20000.50")
        onChange(values.value);
      }}
      thousandSeparator="."
      decimalSeparator=","
      prefix={prefix}
      decimalScale={2}
      allowNegative={false}
      className={className}
      {...props}
    />
  );
}

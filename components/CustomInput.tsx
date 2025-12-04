// components/CustomInput.tsx
import cn from 'clsx';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const CustomInput = ({
  placeholder = "Enter text",
  value,
  onChangeText,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  ...props
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View className='w-full mb-5'>
      {label && (
        <Text className='text-gray-700 text-sm font-semibold mb-2'>
          {label}
        </Text>
      )}
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className={cn(
          'border rounded-xl p-4 text-base',
          isFocused ? 'border-primary bg-white' : 'border-gray-300 bg-gray-50',
          props.editable === false ? 'bg-gray-100' : 'bg-white'
        )}
        {...props}
      />
      {props.error && (
        <Text className="text-red-500 text-sm mt-1">{props.error}</Text>
      )}
    </View>
  );
};

export default CustomInput;
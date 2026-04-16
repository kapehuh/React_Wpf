//hooks/hookFieldSelect.js
import { useMemo } from 'react';

// fieldConfig - нужен, чтобы передать в хук поведение, специфичное для поля
// без импорта fieldConfigs в App нельзя передать конфигурацию в хук
// это разделение позволяет переиспользовать хук для любого поля, сохраняя код App чистым и декларативным
export const useFieldSelect = (fieldKey, editedElement, currentElement, fieldConfig, handleFieldChange) => {
  const value = editedElement?.[fieldKey];
  const originalValue = currentElement?.[fieldKey];

  const options = useMemo(
    () => fieldConfig.getOptions(value),
    [fieldConfig, value]
  );

  const isChanged = value !== originalValue;
  const disabled = fieldConfig.isDisabled ? fieldConfig.isDisabled(originalValue) : false;

  const onChange = (newValue) => handleFieldChange(fieldKey, newValue);

  return {
    value,
    originalValue,
    options,
    isChanged,
    disabled,
    onChange,
    label: fieldConfig.label,
    layout: fieldConfig.layout || 'left',
  };
};
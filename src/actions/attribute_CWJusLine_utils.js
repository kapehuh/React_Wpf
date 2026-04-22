// src/actions/attribute_CWJusLine_utils.js

// Проверяет, есть ли атрибут (не пустая строка) – можно использовать ту же логику, что для cwDDIR
export const isJusLineAttributePresent = (value) => value != null && value !== '';

// Возвращает опции для комбобокса, добавляя произвольное значение, если пришло неизвестное
export const getJusLineOptions = (currentValue, originalValue) => {
  // Список возможных значений: value – то, что приходит из WPF, label – отображение для пользователя
  const predefinedOptions  = [
    { value: '', label: '— Не задано —' },
    { value: 'CENT', label: 'bottom-centre' },
    { value: 'LEFT', label: 'bottom-left' },
    { value: 'RIGH', label: 'bottom-right' },
    { value: 'CENC', label: 'centre-centre' },
    { value: 'CENL', label: 'centre-left' },
    { value: 'CENR', label: 'centre-right' },
    { value: 'TOPC', label: 'top-centre' },
    { value: 'TOPL', label: 'top-left' },
    { value: 'TOPR', label: 'top-right' },
  ];
  if (originalValue === '') {
    return [predefinedOptions[0]];
  }
  const options = predefinedOptions.filter(opt => opt.value !== '');
  const predefinedValues = options.map(opt => opt.value);
  if (currentValue && !predefinedValues.includes(currentValue)) {
    options.push({ value: currentValue, label: `Произвольное: ${currentValue}` });
  }
  return options;
};
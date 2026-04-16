// src/actions/attribute_CWJusLine_utils.js

// Список возможных значений: value – то, что приходит из WPF, label – отображение для пользователя
export const JUSLINE_OPTIONS = [
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

// Проверяет, есть ли атрибут (не пустая строка) – можно использовать ту же логику, что для cwDDIR
export const isJusLineAttributePresent = (value) => value != null && value !== '';

// Возвращает опции для комбобокса, добавляя произвольное значение, если пришло неизвестное
export const getJusLineOptions = (currentValue) => {
  //console.log('getJusLineOptions called with:', currentValue);
  //console.log('Base JUSLINE_OPTIONS:', JUSLINE_OPTIONS);
  //const normalizedCurrent = currentValue?.toUpperCase();
  const predefinedValues = JUSLINE_OPTIONS.map(opt => opt.value);
  if (currentValue && !predefinedValues.includes(currentValue)) {
    return [
      ...JUSLINE_OPTIONS,
      { value: currentValue, label: `Произвольное: ${currentValue}` }
    ];
  }
  return JUSLINE_OPTIONS;
};
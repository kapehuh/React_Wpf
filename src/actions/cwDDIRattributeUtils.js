// Опции для выпадающего списка
export const DIRECTION_OPTIONS = [
  { value: '', label: '— Не выбрано —' },
  { value: 'N', label: 'N' },
  { value: 'S', label: 'S' },
  { value: 'W', label: 'W' },
  { value: 'E', label: 'E' },
];

// Проверяет, есть ли атрибут (значение не пустое)
export const iscwDDIRAttributePresent = (value) => value != null && value !== '';

// Возвращает опции для комбобокса, добавляя произвольное значение, если нужно
export const getDirectionOptions = (currentValue) => {
  const predefinedValues = DIRECTION_OPTIONS.map(opt => opt.value);
  if (currentValue && !predefinedValues.includes(currentValue)) {
    return [...DIRECTION_OPTIONS, { value: currentValue, label: `Произвольное: ${currentValue}` }];
  }
  return DIRECTION_OPTIONS;
};
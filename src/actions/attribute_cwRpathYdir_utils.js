// src/actions/attribute_cwRpathYdir_utils.js

// Проверяет, есть ли атрибут (значение не пустое)
export const iscwRpathYdirAttributePresent = (value) => value != null && value !== '' && value != 'undefined';

// Возвращает опции для комбобокса, добавляя произвольное значение, если нужно
export const getCwRpathYdirOptions = (currentValue, originalValue) => {
  const predefinedOptions = [
    { value: '', label: '— Не задано —' },
    { value: 'E', label: 'E' },
    { value: 'N', label: 'N' },
    { value: 'U', label: 'U' },
    { value: 'W', label: 'W' },
    { value: 'S', label: 'S' },
    { value: 'D', label: 'D' },
  ];
  // Если атрибут отсутствует (originalValue === ''), показываем только "— Не выбрано —"
  if (originalValue === '') {
    return [predefinedOptions[0]];
  }
  // Если атрибут есть, убираем опцию "— Не выбрано —"
  const options = predefinedOptions.filter(opt => opt.value !== '');
  // Если текущее значение не входит в список, добавляем произвольное
  const predefinedValues = options.map(opt => opt.value);
  if (currentValue && !predefinedValues.includes(currentValue)) {
    options.push({ value: currentValue, label: `Произвольное: ${currentValue}` });
  }
  return options;
};
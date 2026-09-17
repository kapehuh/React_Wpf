// src/actions/directionUtils.js
export const DIRECTION_PREDEFINED = [
  { value: '', label: '— Не задано —' },
  { value: 'E', label: 'E' },
  { value: 'N', label: 'N' },
  { value: 'U', label: 'U' },
  { value: 'W', label: 'W' },
  { value: 'S', label: 'S' },
  { value: 'D', label: 'D' },
];

export const isDirectionPresent = (value) => value != null && value !== '';

export const getDirectionOptions = (currentValue, originalValue) => {
  if (originalValue == null || originalValue === '') {
    return [DIRECTION_PREDEFINED[0]];
  }
  const options = DIRECTION_PREDEFINED.filter(opt => opt.value !== '');
  if (currentValue && !options.some(opt => opt.value === currentValue)) {
    options.push({ value: currentValue, label: `Произвольное: ${currentValue}` });
  }
  return options;
};
// src/actions/attribute_VShape_utils.js

// Опции для выпадающего списка
export const VSHAPE_OPTIONS = [
  { value: '', label: '— Не задано —' },
  { value: '0', label: 'Прямоугольник' },
  { value: '1', label: 'Круг' }
];

// Проверяет, есть ли атрибут (значение не пустое)
export const isVShapeAttributePresent = (value) => value != null && value !== '';

// Возвращает опции для комбобокса, добавляя произвольное значение, если нужно
export const getVShapeOptions = (currentValue) => {
  const predefinedValues = VSHAPE_OPTIONS.map(opt => opt.value);
  if (currentValue && !predefinedValues.includes(currentValue)) {
    return [...VSHAPE_OPTIONS, { value: currentValue, label: `Произвольное: ${currentValue}` }];
  }
  return VSHAPE_OPTIONS;
};
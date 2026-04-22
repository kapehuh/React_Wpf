// src/actions/attribute_VShape_utils.js

// Опции для выпадающего списка
export const VSHAPE_OPTIONS = {
  rectangle: { value: '0', label: 'Прямоугольник' },
  circle: { value: '1', label: 'Круг' },
  absent: { value: '2', label: '— Не задано —' },
};

// Проверяет, есть ли атрибут (значение не пустое)
export const isVShapeAttributePresent = (value) => value === '0' || value === '1';

// Возвращает опции для комбобокса, добавляя произвольное значение, если нужно
export const getVShapeOptions = (currentValue, originalValue) => {
  if (originalValue === '2') {
    return [VSHAPE_OPTIONS.absent];
  }
  return [VSHAPE_OPTIONS.rectangle, VSHAPE_OPTIONS.circle];
};
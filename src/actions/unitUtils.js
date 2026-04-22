export const UNIT_OPTIONS = [
  { value: 'кг', label: 'кг' },
  { value: 'кг/пм', label: 'кг/пм' },
  { value: 'кг/м2', label: 'кг/м2' },
];

// Проверка, что единица измерения допустима
export const isValidUnit = (unit) => UNIT_OPTIONS.some(opt => opt.value === unit);

// Получить опции для комбобокса (с возможностью добавить произвольную)
export const getUnitOptions = (currentUnit) => {
  if (currentUnit && !isValidUnit(currentUnit)) {
    return [...UNIT_OPTIONS, { value: currentUnit, label: `Произвольное: ${currentUnit}` }];
  }
  return UNIT_OPTIONS;
};
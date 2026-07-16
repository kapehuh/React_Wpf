// src/components/WeightWithUnitInputSelect.jsx
import React, { useState, useEffect, useMemo } from 'react';
import LabelInput from './LabelInput';
import LabelSelect from './LabelSelect';
import { getUnitOptions } from '../actions/unitUtils';

const WeightWithUnit = ({ value, originalValue, onChange, onValidation, error }) => {
  const parseWeight = (raw) => {
    if (raw == null || raw === '') return { number: '', unit: '' };
    if (typeof raw !== 'string') raw = String(raw);
    const str = raw.trim();
    if (str === '') return { number: '', unit: '' };
    const parts = str.split(/\s+/);
    if (parts.length === 1) return { number: parts[0], unit: '' };
    return { number: parts[0], unit: parts.slice(1).join(' ') };
  };

  const originalParsed = useMemo(() => parseWeight(originalValue), [originalValue]);

  const [numberValue, setNumberValue] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [lastUnit, setLastUnit] = useState(''); // запоминаем последнюю непустую единицу

  const isOriginalAbsent = !originalValue || originalValue === '';
  const shouldDisable = isOriginalAbsent && (!value || value === '');

  // Синхронизация при изменении внешнего value или originalValue
  useEffect(() => {
    if (value == null || value === '') {
      setNumberValue('');
      if (isOriginalAbsent) {
        // Элемент без атрибута: сбрасываем единицу полностью
        setUnitValue('');
        setLastUnit('');
      }
      // НЕ сбрасываем unitValue и lastUnit, чтобы единица сохранялась
    } else {
      const { number, unit } = parseWeight(value);
      setNumberValue(number);
      if (unit !== '') {
        setUnitValue(unit);
        setLastUnit(unit);
      } else {
        // Если value пришло без единицы, считаем, что её сознательно убрали
        setUnitValue('');
        setLastUnit('');
      }
    }
  }, [value]);

  // Валидация: ошибка только если изменилось и число некорректно
  useEffect(() => {
    if (value == null || value === '') {
      onValidation?.(null);
      return;
    }
    const parsed = parseWeight(value);
    if (parsed.number === originalParsed.number && parsed.unit === originalParsed.unit) {
      onValidation?.(null);
      return;
    }
    const valid = numberValue.trim() !== '' && !isNaN(Number(numberValue));
    onValidation?.(!valid ? 'Введите число' : null);
  }, [numberValue, unitValue, value, originalParsed, onValidation]);

  const isChanged = value !== originalValue;

  const errorTooltip = error ? (
    <div className="absolute left-0 top-full mt-1 z-20 bg-red-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
      {error}
    </div>
  ) : null;

  return (
    <div className="relative grid grid-cols-2 gap-1">
      <div className='flex ml-2'>
        <LabelInput
          label="Нагрузка"
          value={numberValue}
          originalValue={originalParsed.number}
          onChange={(newNumber) => {
            const numStr = (newNumber == null || newNumber === '') ? '' : String(newNumber);
            if (numStr === '') {
              // Полная очистка, единица не передаётся, но остаётся в интерфейсе
              onChange('');
            } else {
              // Используем текущую единицу, а если она пуста — последнюю известную
              const effectiveUnit = unitValue || lastUnit;
              onChange(effectiveUnit ? `${numStr} ${effectiveUnit}` : numStr);
            }
          }}
          numeric={true}
          isChanged={numberValue !== originalParsed.number}
          disabled={shouldDisable}
          inputClassName="w-37"
          placeholder={shouldDisable ? 'не задан' : 'Значение'}
        />
      </div>
      <div className='flex ml-20 mt-1 justify-end'>
        <LabelSelect
          label="Ед. изм."
          value={shouldDisable ? '' : unitValue}
          options={shouldDisable ? [] : getUnitOptions(unitValue)}
          onChange={(newUnit) => {
            const numStr = (numberValue == null || numberValue === '') ? '' : String(numberValue);
            setUnitValue(newUnit);
            setLastUnit(newUnit);
            if (numStr === '') {
              // Без числа значение не меняем, но единица запомнена
              onChange('');
            } else {
              onChange(`${numStr} ${newUnit}`);
            }
          }}
          isChanged={shouldDisable ? false : (unitValue !== originalParsed.unit)}
          disabled={shouldDisable}
          layout="left"
          labelClassName="w-20"
          inputClassName="w-25"
        />
      </div>
      {errorTooltip}
    </div>
  );
};

export default WeightWithUnit;
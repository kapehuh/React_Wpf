// src/components/WeightWithUnitInputSelect.jsx (валидация с пробросом ошибки)
import React, { useState, useEffect } from 'react';
import LabelInput from './LabelInput';
import LabelSelect from './LabelSelect';
import { getUnitOptions } from '../actions/unitUtils';

const WeightWithUnit = ({ value, originalValue, onChange, onValidation }) => {
  const parseWeight = (str) => {
    if (!str || str === '') return { number: '', unit: '' };
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return { number: parts[0], unit: '' };
    const number = parts[0];
    const unit = parts.slice(1).join(' ');
    return { number, unit };
  };

  const [numberValue, setNumberValue] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [isMissing, setIsMissing] = useState(!value || value === '');

  useEffect(() => {
    const missing = !value || value === '';
    setIsMissing(missing);
    if (missing) {
      setNumberValue('');
      setUnitValue('');
    } else {
      const { number, unit } = parseWeight(value);
      setNumberValue(number);
      setUnitValue(unit);
    }
  }, [value]);

  useEffect(() => {
    // Оповещаем родителя о валидности (если поле не заблокировано)
    if (!isMissing) {
      const valid = numberValue.trim() !== '' && !isNaN(Number(numberValue));
      onValidation?.(!valid ? 'Введите число' : null);
    } else {
      onValidation?.(null);
    }
  }, [numberValue, isMissing, onValidation]);

  const isChanged = value !== originalValue;

  if (isMissing) {
    return (
      <div className="grid grid-cols-2 gap-1">
        <div className='flex ml-2 pr-1'>
          <LabelInput label="Вес" value="" onChange={() => {}} disabled={true} placeholder="не задан" layout="left" inputClassName="w-35" />
        </div>
        <div className='flex ml-14'>
          <LabelSelect label="Ед. изм." value="" options={[]} onChange={() => {}} disabled={true} layout="left" labelClassName="w-20" inputClassName="w-19" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1">
      <div className='flex ml-2 pr-1'>
        <LabelInput
          label="Нагрузка"
          value={numberValue}
          originalValue={parseWeight(originalValue).number}
          onChange={(newNumber) => {
            const newWeight = newNumber && unitValue ? `${newNumber} ${unitValue}` : (newNumber || '');
            onChange(newWeight);
          }}
          numeric={true}
          isChanged={numberValue !== parseWeight(originalValue).number}
          inputClassName="w-35"
          placeholder="число"
        />
      </div>
      <div className='flex ml-14'>
        <LabelSelect
          label="Ед. изм."
          value={unitValue}
          options={getUnitOptions(unitValue)}
          onChange={(newUnit) => {
            const newWeight = numberValue && newUnit ? `${numberValue} ${newUnit}` : (numberValue || '');
            onChange(newWeight);
          }}
          isChanged={unitValue !== parseWeight(originalValue).unit}
          disabled={false}
          layout="left"
          labelClassName="w-20"
          inputClassName="w-19"
        />
      </div>
    </div>
  );
};

export default WeightWithUnit;
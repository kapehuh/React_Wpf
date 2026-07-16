// src/components/LabelInputWithCheckbox.jsx
import React, { useState, useEffect } from 'react';

// Проверяет, соответствует ли строка формату "0,000" (цифры, запятая, до 3 знаков после)
const isNumericFormat = (str) => {
  if (str === '') return true; // пустая строка допустима
  // Регулярка: цифры, опционально запятая и до 3 цифр после
  return /^\d*,?\d{0,3}$/.test(str);
};

const LabelInputWithCheckbox = ({
  label,
  value,
  originalValue,
  onChange,
  labelClassName = 'w-25',
  inputClassName = 'w-36',
  placeholder = '',
  templateText = 'смотри 3D модель',
  error,
  labelAlign = 'start',
}) => {
  const [checked, setChecked] = useState(false);
  const isDisabled = originalValue === 'false'; // атрибут отсутствует
  const alignClass = labelAlign === 'start' ? 'items-start' :
                     labelAlign === 'center' ? 'items-center' :
                     'items-end';


  // Синхронизация чекбокса при смене элемента извне
  useEffect(() => {
    if (value === templateText && originalValue !== templateText) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [value, originalValue, templateText]);


  // Обработчик чекбокса
  const handleCheckboxChange = (e) => {
    const newChecked = e.target.checked;
    if (newChecked) {
      onChange(templateText);
      setChecked(true);
    } else {
      // Восстанавливаем исходное значение (если originalValue === 'false', то ставим пустую строку)
      onChange(originalValue === 'false' ? '' : originalValue);
      setChecked(false);
    }
  };


  // Обработчик фокуса – очищаем, если значение нечисловое или равно шаблону
  const handleFocus = () => {
    if (isDisabled) return;
    const currentValue = value ?? '';
    // Если не число (и не пустая строка, которая является числовой) – очищаем
    if (!isNumericFormat(currentValue)) {
      onChange('');
      setChecked(false);
    }
  };


  // Обработчик ввода с валидацией
  const handleInputChange = (e) => {
    const newValue = e.target.value;

    // Разрешаем только пустую строку или числовой формат
    if (newValue === '' || isNumericFormat(newValue)) {
      onChange(newValue);
      // Если введено что-то, что не шаблон – снимаем чекбокс
      if (newValue !== templateText) {
        setChecked(false);
      } else {
        setChecked(true);
      }
    }
    // Иначе игнорируем ввод (не вызываем onChange)
  };


  // Обработчик потери фокуса (необязательно, но можно добавить форматирование)
  const handleBlur = () => {
    // Можно ничего не делать, оставим для будущего расширения
  };
  const isChanged = value !== originalValue;


  const baseInputClasses = `
    border rounded px-2 py-1 text-sm w-full
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${isChanged && !isDisabled ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${isDisabled ? 'bg-gray-100 cursor-default' : 'bg-white'}
    ${!isDisabled ? 'hover:border-blue-500' : ''}
  `;

  const errorTooltip = error ? (
    <div className="absolute left-0 top-full mt-1 z-20 bg-red-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
      {error}
    </div>
  ) : null;

  return (
    <div className={`flex ${alignClass}`}>
      <label className={`font-semibold text-gray-700 select-none pt-0.5 mb-1 ${labelClassName}`}>
        {label}:
      </label>
      <div className="relative flex-1 pt-6"> {/* pt-6 освобождает место для чекбокса */}
        {/* Чекбокс над правым краем инпута */}
        <div className="absolute right-0 top-0 z-10">
          <label className={`flex items-center gap-1 text-xs text-gray-600 select-none ${isDisabled ? 'cursor-default opacity-60' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={checked}
              disabled={isDisabled}
              onChange={handleCheckboxChange}
              className="w-3.5 h-3.5 accent-gray-500"
            />
            {templateText}
          </label>
        </div>
        <div className="relative">
          <input
            type="text"
            value={isDisabled ? '' : (value ?? '')}
            onChange={handleInputChange}
            onFocus={handleFocus}
            disabled={isDisabled}
            placeholder={isDisabled ? '— Не задано —' : placeholder}
            className={`${baseInputClasses} ${inputClassName}`.trim()}
          />
          {errorTooltip}
        </div>
      </div>
    </div>
  );
};

export default LabelInputWithCheckbox;
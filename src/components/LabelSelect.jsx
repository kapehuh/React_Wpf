//components/LabelSelect.jsx
import React from 'react';

/**
 * Компонент для выбора значения из выпадающего списка с меткой.
 * 
 * @param {string} label - Текст метки
 * @param {string|number} value - Текущее значение (из editedElement)
 * @param {Array} options - Массив объектов { value, label } для <option>
 * @param {function} onChange - Колбэк при изменении выбора (получает новое значение)
 * @param {string} layout - Расположение метки: 'left' (по умолчанию) или 'top'
 * @param {boolean} isChanged - Флаг подсветки (изменено, но не сохранено)
 * @param {boolean} disabled - Блокировка выбора (опционально)
 * @param {string} labelClassName - Дополнительные классы для метки (например, 'w-32', 'w-64')
 * @param {string} inputClassName - Дополнительные классы для инпута (например, 'w-32', 'w-64')
 */
const LabelSelect = ({
  label,
  value,
  options = [],
  onChange,
  layout = 'left',
  isChanged = false,
  disabled = false,
  labelClassName = '',
  inputClassName = '',
  error,
}) => {
  const selectClasses = `
    border rounded px-2 py-1 text-sm
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${isChanged ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-default opacity-70' : 'bg-white'}
  `;



  const selectElement = (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${selectClasses} ${inputClassName}`.trim()}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
  const errorTooltip = error ? (
    <div className="absolute left-0 top-full mt-1 z-20 bg-red-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
      {error}
    </div>
  ) : null;
  const wrappedSelect = (
    <div className="relative inline-block">
      {selectElement}
      {errorTooltip}
    </div>
  );


  if (layout === 'top') {
    return (
      <div className="mb-3">
        <label className="w-45 ml-1 block font-semibold text-gray-700 mb-1 select-none">{label}:</label>
        {wrappedSelect}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <label className={`font-semibold text-gray-700 select-none ${labelClassName || 'w-35'}`}>
        {label}:
      </label>
      {wrappedSelect}
    </div>
  );
};


export default LabelSelect;
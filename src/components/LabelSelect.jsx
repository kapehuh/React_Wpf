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
  inputClassName = '',
}) => {
  const selectClasses = `
    border rounded px-2 py-1 text-sm
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${isChanged ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  if (layout === 'top') {
    return (
      <div className="mb-3">
        <label className="block font-semibold text-gray-700 mb-1">{label}:</label>
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
      </div>
    );
  }

  // layout === 'left' (по умолчанию)
  return (
    <div className="flex items-center gap-3">
      <label className="w-35 font-semibold text-gray-700">{label}:</label>
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
    </div>
  );
};

export default LabelSelect;
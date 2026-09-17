// components/LabelValue.jsx
import React from 'react';

/**
 * Компонент для отображения пары "метка : значение".
 * Метка имеет фиксированную ширину (w-32), чтобы значения начинались на одной линии.
 *
 * @param {string} label - Текст метки (например, "Site")
 * @param {string|number} value - Значение для отображения (если null/undefined, покажет "—")
 */

const LabelValue = ({ label, value, title, labelClassName = 'w-20' }) => {
  const displayValue = value ?? '—';
  const tooltip = title !== undefined ? title : displayValue;
  return (
    <div className="flex items-center h-4 min-w-0 w-full">
      {/* Фиксированная ширина метки */}
      <label className={`ml-1 font-semibold text-gray-700 rounded select-none flex-shrink-0 ${labelClassName}`}>
        {label}
      </label>
      <span className="text-gray-600 truncate min-w-0" title={tooltip}>
        {displayValue}
      </span>
    </div>
  );
};

export default LabelValue;
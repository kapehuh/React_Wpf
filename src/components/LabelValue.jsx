// components/LabelValue.jsx
import React from 'react';

/**
 * Компонент для отображения пары "метка : значение".
 * Метка имеет фиксированную ширину (w-32), чтобы значения начинались на одной линии.
 *
 * @param {string} label - Текст метки (например, "Site")
 * @param {string|number} value - Значение для отображения (если null/undefined, покажет "—")
 */

const LabelValue = ({ label, value }) => {
  const displayValue = value ?? '—';
  return (
    <div className="flex items-center gap-3 h-4 min-w-0 w-full">
      {/* Фиксированная ширина метки */}
      <label className="w-20 font-semibold text-gray-700 rounded bg-gray-50 select-none flex-shrink-0">{label}</label>
      <span 
      className="text-gray-600 truncate min-w-0"
      title={displayValue}
      >
        {displayValue}
      </span>
    </div>
  );
};

export default LabelValue;
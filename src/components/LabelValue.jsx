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
  return (
    <div className="flex items-center gap-3 h-4">
      {/* Фиксированная ширина метки */}
      <label className="w-20 font-semibold text-gray-700 rounded bg-gray-50 select-none">{label}</label>
      <span className="text-gray-600">{value ?? '—'}</span>
    </div>
  );
};

export default LabelValue;
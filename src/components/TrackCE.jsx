// components/TrackCE.jsx
import React, { useState, useEffect } from 'react';
/**
 * Компонент "V Track CE" – чекбокс с надписью.
 * @param {function} onTrackingChange – опциональный колбэк, вызываемый при изменении состояния.
 *        Получает аргументом булево значение (включён/выключен).
 * @param {boolean} initialChecked – начальное состояние (по умолчанию true).
 */

const TrackCE = ({ onTrackingChange, initialChecked = true }) => {
  const [isTracking, setIsTracking] = useState(initialChecked);// по умолчанию true
  //debugger;

  // Обработчик изменения чекбокса
  const handleToggle = (event) => {
    const newValue = event.target.checked;
    setIsTracking(newValue);
    // Если передан колбэк от родителя, вызываем его
    if (onTrackingChange) {
      onTrackingChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2" title="Включить/выключить отслеживание текущего элемента в E3D">
      <label className="flex items-center cursor-pointer select-none gap-4">
        <input
          type="checkbox"
          checked={isTracking}
          onChange={handleToggle}
          className="w-4 h-4 accent-gray-500 bg-gray"
        />
        <span className="text-gray-700">Track CE</span>
      </label>
    </div>
  );
};

export default TrackCE;

// src/components/LabelInputButton.jsx
import React, { useState, useEffect } from 'react';
import { useCopyToClipboard } from '../hooks/hookCopyToClipboard';


/**
 * Компонент для редактируемого поля: метка + input + кнопка "Сохранить".
 * Локальное состояние синхронизируется с currentElement[fieldKey] при его изменении.
 *
 * @param {string} label - Текст метки
 * @param {string} fieldKey - Ключ в объекте currentElement (например, "Name")
 * @param {object} currentElement - Текущий объект элемента (из контекста)
 * @param {function} onSave - Колбэк при нажатии кнопки (получает fieldKey и новое значение)
 */
const LabelInputButton = ({ 
    label,
    value,                // текущее значение (из editedElement)
    onChange,             // вызывается при каждом изменении инпута
    onSave,               // вызывается при клике на кнопку сохранения
    buttonLabel = "Сохранить", 
    readOnly = false,     // если true – инпут только для чтения, кнопка копирования
    actionType = "save", 
    buttonIcon,
    buttonClassName = "",  // true → подсветка жёлтым (поле изменено, но не сохранено)
    isChanged = false,    // true → подсветка жёлтым (поле изменено, но не сохранено)
   }) => {

  // Используем хук для копирования
  const { copy, showTooltip } = useCopyToClipboard();
  
  // Обработчик кнопки
  const handleButtonClick = () => {
    if (actionType === 'copy') {
      handleCopy();
    } else if (actionType === 'save') {
      handleSave();
    }
  };
  
  // Обработчик копирования – просто вызываем хук
  const handleCopy = () => {
    copy(value);
  };
  
  // Обработчик сохранения 
  const handleSave = () => {
    if (onSave) onSave(value);
  };

  

  return (
    <div className="flex items-center gap-3 mb-0">
      <label className={"w-20 font-semibold text-gray-700"}>{label}:</label>
      
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        readOnly={readOnly}
        className={`flex-1 border border-gray-300 rounded px-2 py-1 text-sm 
          ${isChanged 
            ? 'border-yellow-500 bg-yellow-50' 
            : 'border-gray-300'}
          ${readOnly 
            ? 'focus:outline-none focus:ring-0 cursor-default' 
            : 'hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'}
        `}
      />
      <span className="relative">
        <button
          onClick={handleButtonClick}
          className={`px-4 py-1.5 rounded text-sm flex items-center gap-1 ${
            actionType === 'copy' 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white ${buttonClassName}`}>
          {buttonIcon && <span className="w-5 h-5 flex-shrink-0">{buttonIcon}</span>}
          <span>{buttonLabel}</span>
        </button>
        {showTooltip && (
          <div className="absolute top-0 right-full mr-2 bg-gray-500 text-white text-xs px-2 py-2 rounded whitespace-nowrap z-20">
            Скопировано!
          </div>
        )}
      </span>
    </div>
  );
};

export default LabelInputButton;
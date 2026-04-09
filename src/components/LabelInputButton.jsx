// src/components/LabelInputButton.jsx
import React, { useState, useEffect } from 'react';

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
    fieldKey, 
    currentElement, 
    onAction, 
    buttonLabel = "Сохранить", 
    readOnly = false, 
    actionType = "save", 
    buttonIcon,
    buttonClassName = ""
   }) => {
  // Локальное состояние для значения инпута (чтобы редактировать без изменения глобального объекта)
  const [inputValue, setInputValue] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // При обновлении currentElement (новые данные из WPF) синхронизируем локальное значение
  useEffect(() => {
    if (currentElement && currentElement[fieldKey] !== undefined) {
      setInputValue(currentElement[fieldKey] ?? '');
    }
  }, [currentElement, fieldKey]);

  // copy
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inputValue);
      setShowTooltip(true);
      //console.log('Скопировано в буфер обмена:', inputValue);
      //alert(`Скопировано: "${inputValue}"`);
    } catch (err) {
      console.error('Ошибка при копировании:', err);
      fallbackCopyToClipboard(inputValue);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      console.log('Скопировано (fallback):', text);
    } catch (err) {
      console.error('Не удалось скопировать (fallback):', err);
    }

    document.body.removeChild(textArea);
  };

  const handleButtonClick = () => {
    if (actionType === 'copy') {
      handleCopyToClipboard();
      onAction(fieldKey, inputValue);
    } else if (actionType === 'save' && onAction) {
      onAction(fieldKey, inputValue);
    }
  };

  return (
    <div className="flex items-center gap-3 mb-0 relative">
      <label className={"w-20 font-semibold text-gray-700"}>{label}:</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        readOnly={readOnly}
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleButtonClick}
        className={`px-4 py-2 rounded text-sm flex items-center gap-1 ${
          actionType === 'copy' 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white ${buttonClassName}`}
      >
        {buttonIcon && <span className="w-5 h-5 flex-shrink-0">{buttonIcon}</span>}
        <span>{buttonLabel}</span>
      </button>
      {showTooltip && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
            Скопировано!
          </div>
        )}
    </div>
  );
};

export default LabelInputButton;
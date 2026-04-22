// src/components/FileSelector.jsx
import React, { useState, useEffect, useRef } from 'react';

/**
 * Компонент выбора файла: поле (readonly, стилизовано под ссылку) + кнопка "Обзор...".
 * 
 * @param {string} label - Текст метки
 * @param {string} value - Текущее значение (путь к файлу)
 * @param {string} originalValue - Исходное значение (из currentElement)
 * @param {function} onChange - Колбэк при выборе файла (принимает новый путь)
 * @param {string} layout - 'left' или 'top'
 * @param {boolean} isChanged - Флаг подсветки изменения
 * @param {boolean} disabled - Принудительная блокировка
 * @param {string} placeholder - Плейсхолдер (по умолчанию 'Выберите файл')
 * @param {string} inputClassName - Дополнительные классы для поля ввода
 * @param {boolean} blockOnEmpty - Блокировать поле, если value пустая строка
 * @param {function} onBrowse - Опциональная функция для кастомного диалога (например, через C#). Если не передана, используется нативный <input type="file">
 */
const FileSelector = ({
  label,
  value,
  originalValue,
  onChange,
  layout = 'left',
  isChanged = false,
  disabled = false,
  placeholder = 'Выберите файл',
  inputClassName = '',
  blockOnEmpty = false,
  onBrowse, // если передана, то вместо нативного input вызывается эта функция (должна вернуть Promise<string | null>)
}) => {
  const fileInputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || '');
  const isMissing = blockOnEmpty && (!value || value === '');

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Обработчик нативного выбора файла
  const handleNativeFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // В WebView2 можно получить полный путь через специальный API,
      // но для простоты используем name или относительный путь.
      // Для реального полного пути нужно вызывать C# метод.
      const filePath = file.path || file.name;
      setLocalValue(filePath);
      onChange(filePath);
    }
    // Сбрасываем input, чтобы можно было выбрать тот же файл повторно
    event.target.value = '';
  };

  const handleBrowse = async () => {
    if (disabled || isMissing) return;
    if (onBrowse) {
      // Используем кастомный диалог (например, через C#)
      const newPath = await onBrowse();
      if (newPath !== null && newPath !== undefined) {
        setLocalValue(newPath);
        onChange(newPath);
      }
    } else {
      // Используем нативный input
      fileInputRef.current.click();
    }
  };

  const handleOpen = () => {
    if (disabled || isMissing || !localValue) return;
    // Отправляем команду в WPF
    console.log(`[Заглушка] openFile ${ path.localValue }`);
    //sendToWPF('openFile', { path: localValue });
  };

  const handleMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 200); // задержка 0.2 сек
  }

  const handleMouseLeave = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(false);
  }

  const baseInputClasses = `
    border rounded px-2 py-1 text-sm w-103
    focus:outline-none focus:ring-1 focus:ring-blue-500
    cursor-pointer hover:bg-blue-10 hover:text-blue-600
    ${isChanged && !isMissing ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${disabled || isMissing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  const buttonClasses = `
    px-3 py-1 rounded text-sm bg-blue-500 hover:bg-blue-600 text-white
    ${disabled || isMissing ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const inputElement = (
    <div className="flex items-center gap-2 flex-1 position: relative">
      <input
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        type="text"
        value={localValue}
        readOnly
        onClick={handleBrowse}
        placeholder={isMissing ? 'не задан' : placeholder}
        className={`${baseInputClasses} ${inputClassName}`.trim()}
      />
      {showTooltip && localValue && (
        <div className="absolute z-10 bg-gray-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap" style={{ top: '100%', left: 0 }}>
          {localValue}
        </div>
      )}
      {!onBrowse && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleNativeFileSelect}
          style={{ display: 'none' }}
        />
      )}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled || isMissing}
        className={buttonClasses}
      >
        Открыть...
      </button>
    </div>
  );

  if (layout === 'top') {
    return (
      <div className="mb-3">
        <label className="block font-semibold text-gray-700 mb-1 select-none ml-1">{label}:</label>
        {inputElement}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="w-25 font-semibold text-gray-700 select-none ml-1">{label}:</label>
      {inputElement}
    </div>
  );
};

export default FileSelector;
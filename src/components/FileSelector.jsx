// src/components/FileSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { sendToWPF } from '../actions/SendMsgByHostObjects';

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


  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);


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
    //console.log(`[Заглушка] openFile ${ localValue }`);
    sendToWPF('openFile', { path: localValue });
  };


  const baseInputClasses = `
    border rounded px-2 py-1 text-sm w-103
    focus:outline-none focus:ring-1 focus:ring-blue-500
    cursor-pointer hover:bg-blue-10 hover:text-blue-600
    ${isChanged && !isMissing ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${disabled || isMissing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;


  return (
    <div className={layout === 'top' ? 'mb-3 w-full' : 'flex items-center gap-3'}>
      <label className={`font-semibold text-gray-700 select-none ml-1 ${layout === 'top' ? 'block mb-1' : 'w-25'}`}>{label}:</label>
      <div className="flex items-center gap-2 flex-1 relative w-full">
        <input
          type="text"
          value={localValue}
          readOnly
          onClick={handleBrowse}
          onMouseEnter={() => { if (localValue) setShowTooltip(true); }}
          onMouseLeave={() => setShowTooltip(false)}
          placeholder={isMissing ? 'не задан' : placeholder}
          className={`flex-1 ${baseInputClasses} ${inputClassName}`.trim()}
        />
        {showTooltip && localValue && (
          <div className="absolute z-10 bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap" style={{ bottom: '100%', left: 0, marginBottom: 4 }}>
            {localValue}
          </div>
        )}
        {!onBrowse && <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const path = file.path || file.name;
            setLocalValue(path);
            onChange(path);
          }
          e.target.value = '';
        }} />}
        <button onClick={handleOpen} disabled={disabled || isMissing} className={`px-3 py-1 rounded text-sm bg-blue-500 opacity-95 hover:bg-blue-600 text-white ${disabled || isMissing ? 'opacity-50 cursor-not-allowed' : ''}`}>Открыть в ...</button>
      </div>
    </div>
  );
};


export default FileSelector;
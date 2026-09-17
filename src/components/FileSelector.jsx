// src/components/FileSelector.jsx
import React, { useState, useEffect } from 'react';
import { FaFolderOpen } from 'react-icons/fa';

// trim + снятие парных кавычек по краям (только если обе на месте)
const normalizeValue = (v) => {
  if (v == null) return '';
  const s = String(v);
  const t = s.trim();
  if (
    t.length >= 2 &&
    ((t.startsWith('"') && t.endsWith('"')) ||
     (t.startsWith("'") && t.endsWith("'")))
  ) {
    return t.slice(1, -1);
  }
  return s;
};


const FileSelector = ({
  label,
  value,
  originalValue,
  onChange,
  layout = 'left',
  isChanged = false,
  disabled = false,
  placeholder = 'Путь к файлу',
  inputClassName = '',
  onBrowse,          // функция для открытия диалога выбора файла (из WPF)
  onOpenFile,        // функция для открытия файла (проверка + sendToWPF)
  onOpenFolder,      // функция для открытия папки с выделением файла
  onError,           // функция для показа ошибок (setGenericError)
  error,
}) => {
  // Атрибут отсутствует на элементе? Определяем по состоянию с сервера.
  const isAttributeAbsent = originalValue === '' || originalValue == null;
  // Значение пустое? (нет атрибута / unset / пользователь стёр)
  const isValueEmpty =
    isAttributeAbsent || value === '' || value === 'unset' || value == null;


  const inputDisabled = disabled || isAttributeAbsent;
  const buttonsDisabled = disabled || isValueEmpty;


  // 'unset' показываем как пустую строку
  const displayValue = value === 'unset' || value == null ? '' : value;
  

  const [localValue, setLocalValue] = useState(displayValue);
  useEffect(() => { setLocalValue(displayValue); }, [displayValue]);


  // Обработчик вставки – обрезаем кавычки
  const handlePaste = (e) => {
    e.preventDefault();
    let pastedText = e.clipboardData.getData('text/plain');
    if (pastedText) {
      pastedText = pastedText.trim();
      if ((pastedText.startsWith('"') && pastedText.endsWith('"')) ||
          (pastedText.startsWith("'") && pastedText.endsWith("'"))) {
        pastedText = pastedText.slice(1, -1);
      }
      setLocalValue(pastedText);
      onChange(pastedText);
    }
  };


  // Обработчик изменения текста
  const handleChange = (e) => {
    const cleaned = normalizeValue(e.target.value);
    setLocalValue(cleaned);
    onChange(cleaned);
  };


  // Проверка допустимого расширения
  const isValidExtension = (path) => !!path && /\.(dwg|dxf|pdf)$/i.test(path);


  // Обработчик кнопки с иконкой папки
  const handleFolderAction = () => {
    if (buttonsDisabled) return;
    if (!localValue || localValue.trim() === '' ) {
      // поле пустое – вызываем диалог выбора файла
      if (onBrowse) onBrowse();
      return;
    }
    if (onOpenFolder) onOpenFolder(localValue);
  };


  // Обработчик кнопки «Открыть в…»
  const handleOpen = () => {
    if (buttonsDisabled || !localValue) return;
    if (!isValidExtension(localValue)) {
      if (onError) onError('Файл должен иметь расширение .dwg, .dxf или .pdf');
      return;
    }
    if (onOpenFile) onOpenFile(localValue);
  };


  const baseInputClasses = `
    border rounded px-2 py-1 text-sm w-full
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${isChanged && !isValueEmpty ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${inputDisabled  ? 'bg-gray-100 cursor-default' : 'bg-white hover:border-blue-500'}
    ${!inputDisabled  ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'focus:outline-none focus:ring-0'}
  `;

  const buttonClasses = `
    px-3 py-1 rounded text-sm bg-blue-500 text-white
    ${buttonsDisabled  ? 'opacity-50 cursor-default' : 'opacity-95 hover:bg-blue-600'}
  `;

  const errorTooltip = error ? (
    <div className="absolute left-0 top-full mt-1 z-20 bg-red-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
      {error}
    </div>
  ) : null;


  return (
    <div className={layout === 'top' ? 'mb-1 w-full' : 'flex items-center gap-3'}>
      <label className={`font-semibold text-gray-700 select-none ml-1 ${layout === 'top' ? 'block mb-1' : 'w-25'}`}>
        {label}:
      </label>
      <div className="flex items-center gap-2 flex-1 relative w-full">
        <div className='relative flex-1'>
          <input
            type="text"
            value={localValue}
            // readOnly
            onChange={handleChange}
            disabled={inputDisabled}
            placeholder={isValueEmpty  ? 'не задан' : placeholder}
            className={`${baseInputClasses} ${inputClassName}`.trim()}
            title={`Редактировать путь к файлу: ${localValue || placeholder}`}
          />
          {errorTooltip}
        </div>
        <button
          onClick={handleFolderAction}
          disabled={buttonsDisabled}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
          title="Выбрать файл или открыть папку с файлом"
        >
          <FaFolderOpen className="w-4 h-4" />
        </button>
        {/* {!onBrowse && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const path = file.path || file.name;
                setLocalValue(path);
                onChange(path);
              }
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
        )} */}
        <button
          onClick={handleOpen}
          disabled={buttonsDisabled}
          className={buttonClasses}
          title='Открыть в AutoCad/NanoCad'
        >
          Открыть в ...
        </button>
      </div>
    </div>
  );
};

export default FileSelector;
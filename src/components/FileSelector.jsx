// src/components/FileSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { sendToWPF } from '../actions/SendMsgByHostObjects';

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
  onBrowse,
}) => {
  const fileInputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || '');
  const isMissing = blockOnEmpty && (!value || value === '');
  const isDisabled = disabled || isMissing; // общее состояние блокировки

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBrowse = async () => {
    if (isDisabled) return;
    if (onBrowse) {
      const newPath = await onBrowse();
      if (newPath !== null && newPath !== undefined) {
        setLocalValue(newPath);
        onChange(newPath);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleOpen = () => {
    if (isDisabled || !localValue) return;
    sendToWPF('openFile', { path: localValue });
  };

  const baseInputClasses = `
    border rounded px-2 py-1 text-sm w-103
    ${isChanged && !isMissing ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${isDisabled ? 'bg-gray-100 cursor-default' : 'bg-white cursor-pointer hover:bg-blue-50 hover:text-blue-600'}
    ${!isDisabled ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'focus:outline-none focus:ring-0'}
  `;

  const buttonClasses = `
    px-3 py-1 rounded text-sm bg-blue-500 text-white
    ${isDisabled ? 'opacity-50 cursor-default' : 'opacity-95 hover:bg-blue-600'}
  `;

  return (
    <div className={layout === 'top' ? 'mb-3 w-full' : 'flex items-center gap-3'}>
      <label className={`font-semibold text-gray-700 select-none ml-1 ${layout === 'top' ? 'block mb-1' : 'w-25'}`}>
        {label}:
      </label>
      <div className="flex items-center gap-2 flex-1 relative w-full">
        <input
          type="text"
          value={localValue}
          readOnly
          disabled={isDisabled}                    // настоящий disabled
          onClick={handleBrowse}
          placeholder={isMissing ? 'не задан' : placeholder}
          className={`flex-1 ${baseInputClasses} ${inputClassName}`.trim()}
          title={`Выбрать файл: ${localValue || placeholder}`}
        />
        {!onBrowse && (
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
        )}
        <button
          onClick={handleOpen}
          disabled={isDisabled}
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
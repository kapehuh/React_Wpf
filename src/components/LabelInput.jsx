import React, { useState, useEffect } from 'react'

/**
 * Компонент текстового поля с меткой.
 * Поддерживает редактирование, подсветку изменений, расположение метки (left/top) и возможность скрыть метку, а также числовой режим с валидацией.
 *
 * @param {string} label - Текст метки (если hideLabel=true, не отображается)
 * @param {string} value - Текущее значение (из editedElement)
 * @param {string} originalValue - Текущее значение (из currentElement)
 * @param {function} onChange - Колбэк при изменении значения (получает новую строку)
 * @param {string} layout - Расположение метки: 'left' (по умолчанию) или 'top'
 * @param {boolean} isChanged - Флаг подсветки (изменено, но не сохранено)
 * @param {boolean} disabled - Блокировка редактирования (инпут становится серым и недоступным)
 * @param {string} placeholder - Текст-подсказка (опционально)
 * @param {string} type - Тип инпута (text, number, password и т.д.), игнорируется при numeric=true
 * @param {boolean} hideLabel - Полностью скрыть метку (полезно, если нужно только поле ввода)
 * @param {string} inputClassName - Дополнительные классы для инпута (например, 'w-32', 'w-64')
 * @param {boolean} numeric - Включить числовой режим (только цифры и точка, без отрицательных)
 */
const LabelInput = ({
  label,
  value,
  originalValue,
  onChange,
  layout = 'left',
  isChanged = false,
  disabled = false,
  placeholder = '',
  type = 'text',
  hideLabel = false,
  inputClassName = '',
  numeric = false,
  blockOnEmpty = false, // блокировать при пустой строке
}) => {
  // Локальное состояние для отображаемого текста (важно для числового режима)
  const [localValue, setLocalValue] = useState('');

  // Определяем, является ли значение "отсутствующим" (только для числового режима)
  const isMissing = (blockOnEmpty && (value === '' || value === null)) ||
                    (numeric && (value === -1 || value === '-1'));


  // Cинхронизации локального значения
  useEffect(() => {
    if (numeric) {
      if (isMissing) setLocalValue('');
      else setLocalValue(value?.toString() ?? '');
    } else if (blockOnEmpty) {
      if (isMissing) setLocalValue('');
      else setLocalValue(value ?? '');
    } else {
      setLocalValue(value ?? '');
    }
  }, [numeric, blockOnEmpty, value, isMissing]);


  // Валидация для числового режима: только цифры и одна точка, без минуса
  const isValidInput = (input) => {
    if (numeric) {
      if (input === '') return true; // разрешаем пустую строку
      return /^\d*\.?\d*$/.test(input);
    }
    if (blockOnEmpty) return true;
    return true;
  };

  // Обработчик изменения (вызывается при каждом вводе)
  const handleChange = (e) => {
    const raw = e.target.value;
    if (numeric || blockOnEmpty) {
      if (isMissing) return;
      if (isValidInput(raw)) {
        setLocalValue(raw);
        if (numeric) {
          if (raw === '') {
            onChange(''); // пустая строка → обновляем editedElement
          } else {
            const numValue = parseFloat(raw);
            if (!isNaN(numValue)) onChange(numValue);
          }
        } else if (blockOnEmpty) {
          onChange(raw); // разрешаем любую строку (включая пустую)
        } else {
          onChange(raw);
        }
      }
    } else {
      onChange(raw);
    }
  };

  // Обработчик потери фокуса (только для числового режима)
  const handleBlur = () => {
    if ((!numeric && !blockOnEmpty) || isMissing) return;
    let trimmed = localValue.trim();
    const isEmpty = trimmed === '' || (numeric && trimmed === '.');
    if (isEmpty) {
      // ❌ Не восстанавливаем исходное значение – оставляем пустым
      // (onChange('') уже был вызван в handleChange)
      return;
    }
    // Убираем точку в конце для числового режима
    if (numeric && trimmed.endsWith('.')) {
      trimmed = trimmed.slice(0, -1);
      setLocalValue(trimmed);
      const numValue = parseFloat(trimmed);
      if (!isNaN(numValue)) onChange(numValue);
    }
  };

  const baseInputClasses = `
    border rounded px-2 py-1 text-sm
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${isChanged && !isMissing ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${disabled || isMissing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${!disabled && !isMissing ? 'hover:border-blue-500' : ''}
  `;

  // Определяем, что показывать в поле
  let inputValue;
  if (numeric || blockOnEmpty) {
    inputValue = localValue;
  } else {
    inputValue = value ?? '';
  }

  // Определяем плейсхолдер для числового режима при отсутствии атрибута
  const finalPlaceholder = isMissing ? '- Не задано -' : placeholder;

  // Рендер инпута
  const inputElement = (
    <input
      type={numeric ? 'text' : type} // числовой режим использует text для ручной валидации
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled || isMissing}
      placeholder={finalPlaceholder}
      className={`${baseInputClasses} ${inputClassName}`.trim()}
    />
  );

  // Если метка скрыта – рендерим только инпут
  if (hideLabel) return <div className="mb-3">{inputElement}</div>;
  // Расположение метки сверху
  if (layout === 'top') return (
    <div className="mb-3">
      <label className="block font-semibold text-gray-700 mb-1 select-none ml-1">{label}:</label>
      {inputElement}
    </div>
  );
  return (
    <div className="flex items-center">
      <label className="w-25 font-semibold text-gray-700 select-none">{label}:</label>
      {inputElement}
    </div>
  );
};

export default LabelInput;
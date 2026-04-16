import React from 'react';

/**
 * Компонент текстового поля с меткой.
 * Поддерживает редактирование, подсветку изменений, расположение метки (left/top) и возможность скрыть метку.
 *
 * @param {string} label - Текст метки (если hideLabel=true, не отображается)
 * @param {string} value - Текущее значение (из editedElement)
 * @param {function} onChange - Колбэк при изменении значения (получает новую строку)
 * @param {string} layout - Расположение метки: 'left' (по умолчанию) или 'top'
 * @param {boolean} isChanged - Флаг подсветки (изменено, но не сохранено)
 * @param {boolean} disabled - Блокировка редактирования (инпут становится серым и недоступным)
 * @param {string} placeholder - Текст-подсказка (опционально)
 * @param {string} type - Тип инпута (text, number, password и т.д.), по умолчанию 'text'
 * @param {boolean} hideLabel - Полностью скрыть метку (полезно, если нужно только поле ввода)
 * @param {string} inputClassName - Дополнительные классы для инпута (например, 'w-32', 'w-64')
 */
const LabelInput = ({
  label,
  value,
  onChange,
  layout = 'left',
  isChanged = false,
  disabled = false,
  placeholder = '',
  type = 'text',
  hideLabel = false,
  inputClassName = '',
}) => {
  const baseInputClasses  = `
    border rounded px-2 py-1 text-sm
    focus:outline-none focus:ring-1 focus:ring-blue-500
    ${isChanged ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

  const inputElement = (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`${baseInputClasses} ${inputClassName}`.trim()}
    />
  );

  // Если метка скрыта – рендерим только инпут
  if (hideLabel) {
    return <div className="mb-3">{inputElement}</div>;
  }
  // Расположение метки сверху
  if (layout === 'top') {
    return (
      <div className="mb-3">
        <label className="block font-semibold text-gray-700 mb-1">{label}:</label>
        {inputElement}
      </div>
    );
  }
  // Расположение метки слева (по умолчанию)
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 font-semibold text-gray-700">{label}:</label>
      {inputElement}
    </div>
  );
};

export default LabelInput;
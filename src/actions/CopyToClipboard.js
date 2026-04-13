// actions/CopyText.js
/**
 * Копирует текст в буфер обмена.
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} - true, если успешно, false если ошибка
 */

export const copyToClipboard = async (text) => {
  if (!text) return false;

  // Современный способ (асинхронный)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API failed:', err);
      // Пробуем fallback
      return fallbackCopy(text);
    }
  } else {
    // Fallback для старых браузеров или небезопасного контекста
    return fallbackCopy(text);
  }
};

/**
 * Резервный способ копирования (через textarea и execCommand)
 */
const fallbackCopy = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let success = false;
  try {
    success = document.execCommand('copy');
    if (success) console.log('Copied via execCommand');
    else console.error('execCommand copy failed');
  } catch (err) {
    console.error('Fallback copy error:', err);
  }
  document.body.removeChild(textArea);
  return success;
};
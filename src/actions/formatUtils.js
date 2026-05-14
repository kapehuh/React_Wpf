// Функция форматирования
export const formatCreateDate = (raw) => {
  if (!raw) return '—';
  // Извлекаем части регулярными выражениями
  const userMatch = raw.match(/User:\s*(.+?)\s*Host:/);
  const dateMatch = raw.match(/Date:\s*(\S+)/);
  const timeMatch = raw.match(/Time:\s*(\S+)/);
  
  const user = userMatch ? userMatch[1] : '';
  const date = dateMatch ? dateMatch[1] : '';
  const time = timeMatch ? timeMatch[1] : '';
  
  if (date && time && user) {
    return `User: ${user} Date: ${date} Time: ${time}`;
  }
  return raw; // fallback
};
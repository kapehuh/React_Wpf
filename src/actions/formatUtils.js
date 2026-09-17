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

export const formatUsermLastm = (lastModified, userModified) => {
  if (!lastModified) return '—';
  // Пример строки: "14:32 19 Jun 2026"
  const match = lastModified.match(/(\d{2}:\d{2})\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!match) return lastModified; // если формат не совпал, показываем как есть
  const [, time, day, monthStr, year] = match;
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const month = months[monthStr] || monthStr;
  const dateFormatted = `${day.padStart(2, '0')}.${month}.${year}`;
  const user = userModified ? userModified : 'неизвестный пользователь';
  return `User: ${user} Date: ${dateFormatted} Time: ${time}`;
};
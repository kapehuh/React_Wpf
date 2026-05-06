// src/actions/validationUtils.js
export const validateName = (name) => {
  if (!name || name.trim() === '') return 'Имя не может быть пустым';
  if (!name.startsWith('/')) return 'Имя должно начинаться с "/"';
  if (name === '/') return 'Имя не может быть пустым';
  // Допустимые символы: буквы, цифры, подчёркивание, дефис, точка, пробел? Уточните правила E3D
  const regex = /^\/[A-Za-zА-Яа-я0-9_\-\.\s]+$/;
  if (!regex.test(name)) return 'Имя содержит недопустимые символы';
  return null; // null означает, что ошибок нет
};
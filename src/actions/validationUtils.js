// src/actions/validationUtils.js
export const validateName = (name) => {
  if (!name || name.trim() === '') return 'Имя не может быть пустым';
  if (!name.startsWith('/')) return 'Имя должно начинаться с "/"';
  if (name === '/') return 'После "/" необходимо указать имя элемента';
  // Можно разрешить любые символы (кириллица, латиница, цифры, _ - . и т.д.)
  return null;
};
// contexts/ElementContext.jsx
import { createContext, useContext } from 'react';
export const ElementContext = createContext(null);
export const useElement = () => useContext(ElementContext);
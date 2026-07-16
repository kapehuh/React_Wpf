// src/config/fieldConfigs.js
import { getDirectionOptions, isDirectionPresent } from '../actions/directionUtils';
import { getJusLineOptions, isJusLineAttributePresent } from '../actions/attribute_CWJusLine_utils';
import { getVShapeOptions, isVShapeAttributePresent } from '../actions/attribute_VShape_utils';


// это статическая конфигурация поля
export const fieldConfigs = {
  direction: {
    label: 'Открытая часть',
    getOptions: (value, originalValue) => getDirectionOptions(value, originalValue),
    isDisabled: () => true,
    layout: 'left',
  },
  direction_top: {
    label: 'Направление',
    getOptions: (value, originalValue) => getDirectionOptions(value, originalValue),
    isDisabled: (originalValue) => !isDirectionPresent(originalValue),
    layout: 'left',
  },
  jusLine: {
    // Горизонтально
    label: 'Линия привязки',
    getOptions: (value, originalValue) => getJusLineOptions(value, originalValue),
    isDisabled: (originalValue) => !isJusLineAttributePresent(originalValue),
    layout: 'left',
  },
  vShape: {
    label: 'Форма',
    getOptions: (value, originalValue) => getVShapeOptions(value, originalValue),
    isDisabled: (originalValue) => !isVShapeAttributePresent(originalValue),
    layout: 'left',
  },
};
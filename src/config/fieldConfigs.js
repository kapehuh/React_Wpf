// src/config/fieldConfigs.js
import { getDirectionOptions, iscwDDIRAttributePresent } from '../actions/attribute_cwDDIR_utils';
import { getJusLineOptions, isJusLineAttributePresent } from '../actions/attribute_CWJusLine_utils';
import { getVShapeOptions, isVShapeAttributePresent } from '../actions/attribute_VShape_utils';

// это статическая конфигурация поля
export const fieldConfigs = {
  direction: {
    label: 'Направление',
    getOptions: (value) => getDirectionOptions(value),
    isDisabled: (originalValue) => !iscwDDIRAttributePresent(originalValue),
    layout: 'left',
  },
  jusLine: {
    label: 'Линия привязки',
    getOptions: (value) => getJusLineOptions(value),
    isDisabled: (originalValue) => !isJusLineAttributePresent(originalValue),
    layout: 'left',
  },
  vShape: {
    label: 'Форма',
    getOptions: (value) => getVShapeOptions(value),
    isDisabled: (originalValue) => !isVShapeAttributePresent(originalValue),
    layout: 'left',
  },
};
// src/config/fieldConfigs.js
import { getDirectionOptions, iscwDDIRAttributePresent } from '../actions/attribute_cwDDIR_utils';
import { getJusLineOptions, isJusLineAttributePresent } from '../actions/attribute_CWJusLine_utils';
import { getVShapeOptions, isVShapeAttributePresent } from '../actions/attribute_VShape_utils';
import { getCwRpathYdirOptions, iscwRpathYdirAttributePresent } from '../actions/attribute_cwRpathYdir_utils';
import { getUnitOptions, isValidUnit } from '../actions/unitUtils';

// это статическая конфигурация поля
export const fieldConfigs = {
  direction: {
    label: 'Направление разреза',
    getOptions: (value, originalValue) => getCwRpathYdirOptions(value, originalValue),
    isDisabled: (originalValue) => !iscwRpathYdirAttributePresent(originalValue),
    layout: 'top',
  },
  direction_top: {
    label: 'Открытая часть',
    getOptions: (value, originalValue) => getDirectionOptions(value, originalValue),
    // isDisabled: (originalValue) => !iscwDDIRAttributePresent(originalValue),
    isDisabled: () => true,
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
    layout: 'top',
  },
  cwLoad: {
    label: 'Нагрузка',
    getOptions: (value, originalValue) => getVShapeOptions(value, originalValue),
    isDisabled: (originalValue) => !isVShapeAttributePresent(originalValue),
    layout: 'top',
  },
  cwUnit: {
    label: 'Ед.измерения',
    getOptions: (value) => getUnitOptions(value),
    isDisabled: (originalValue) => !originalValue,
    layout: 'left',
  },
};
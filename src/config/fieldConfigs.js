import { getDirectionOptions, iscwDDIRAttributePresent } from '../actions/cwDDIRattributeUtils';

// это статическая конфигурация поля
export const fieldConfigs = {
  direction: {
    label: 'Направление',
    getOptions: (value) => getDirectionOptions(value),
    isDisabled: (originalValue) => !iscwDDIRAttributePresent(originalValue),
    layout: 'left',
  },
  // можно добавить другие поля, например:
  // type: {
  //   label: 'Тип элемента',
  //   getOptions: () => [...],
  //   isDisabled: () => false,
  //   layout: 'left',
  // },
};
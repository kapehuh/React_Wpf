import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Toast from './components/Toast';
import TrackCE from './components/TrackCE';
import CopyIcon from './components/CopyIcon';
import SwapButton from './components/SwapButton';
import LabelValue from './components/LabelValue';
import LabelInput from './components/LabelInput';
import LabelSelect from './components/LabelSelect';
import FileSelector from './components/FileSelector';
import WeightWithUnit from './components/WeightWithUnitInputSelect';
import LabelInputButton from './components/LabelInputButton';
import LabelInputWithCheckbox from './components/LabelInputWithCheckbox';
import { sendToWPF } from './actions/SendMsgByHostObjects';
import { validateName } from './actions/validationUtils';
import { formatCreateDate } from './actions/formatUtils';
import { formatUsermLastm } from './actions/formatUtils';
import { fieldConfigs  } from './config/fieldConfigs';
import { editableFields } from './config/editableFields';
import { useFieldSelect } from './hooks/hookFieldSelect';
import { useWpfBridge } from './hooks/hookWpfBridge';




function App() {
  //debugger;
  //Правильный порядок в React-компоненте
  // 1. ВСЕ объявления useState (в самом начале)
  // 2. Все useEffect
  // 3. Функции-обработчики
  // 4. Защита от null
  // 5. Рендер (только когда данные загружены)


  // use_STATE состояния
  const [currentElement, setCurrentElement] = useState(null);   // Оригинал из WPF
  const [editedElement, setEditedElement] = useState(null);     // Локальная копия для редактирования
  const [trackingEnabled, setTrackingEnabled] = useState(true); // синхронизация с чекбоксом, дублер состояния
  const [renameSuccess, setRenameSuccess] = useState(false);    // Успешное переименование
  const [renameError, setRenameError] = useState(null);         // Неуспешное переименование
  const [nameError, setNameError] = useState(null);             // Состояние ошибки имени
  const [weightError, setWeightError] = useState(null);         // Ошибка нагрузка ?
  const [fieldErrors, setFieldErrors] = useState({});           // 
  const [genericError, setGenericError] = useState(null);       // 

  const isWebView = !!window.chrome?.webview;

  // хук обработки сообщений WPF
  const { requestFile } = useWpfBridge({
    setCurrentElement,
    setEditedElement,
    setNameError,
    setRenameError,
    setRenameSuccess,
    setWeightError,
    setFieldErrors,
    setGenericError,
  });

  // use_EFFECT эффекты
  // ✅ запросить текущий элемент при старте
  useEffect(() => {
    if (isWebView) {
      sendToWPF('trackCe', { enabled: true });
    }
  }, [isWebView]);


  // ✅ При получении нового currentElement из WPF – обновляем черновик
  useEffect(() => {
    if (currentElement) {
      setEditedElement({...currentElement});
      setNameError(null); // сбрасываем ошибку при получении нового элемента
      setRenameError(null);
      setWeightError(null);
    }
  }, [currentElement]);


  // объект changes (только изменённые поля) после того, как editedElement и currentElement определены:
  const changes = useMemo(() => {
    if (!editedElement || !currentElement) return {};
    const result = {};
    // перебор изменяемых полей из editableFields.js
    for (const key of editableFields) {
      if (editedElement[key] !== currentElement[key]) {
        result[key] = editedElement[key];
      }
    }
    return result;
  }, [editedElement, currentElement]);


  // use_CALLBACK обработчики
  // Обработчик изменения чекбокса
  const handleTrackingChange = useCallback((isEnabled) => {
    setTrackingEnabled(isEnabled);
    if (isWebView) sendToWPF('trackCe', { enabled: isEnabled });
  }, [isWebView]);


  const handleFieldChange = useCallback((fieldKey, newValue) => {
    // console.log(`🟢 handleFieldChange: ${fieldKey} =`, newValue, typeof newValue);
    setEditedElement(prev => ({ ...prev, [fieldKey]: newValue }));
    if (fieldKey === 'Name') {
      const originalName = currentElement?.Name;
      //если значение вернулось к исходному - не валидировать
      if (newValue === originalName) {
        setNameError(null);
      } else {
        setNameError(validateName(newValue));
      }
    }
  }, [currentElement?.Name]);


  // ФУНКЦИЯ ПЕРЕИМЕНОВАНИЯ
  // ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===
  const handleRename = useCallback(() => {
    // console.log('🔵 handleRename вызван с именем:', newName);
    const newName = editedElement.Name;
    if (newName === currentElement.Name) return;
    const error = validateName(newName);
    if (error) {
      setNameError(error);
      return;
    }
    sendToWPF('updateElement', { changes: { Name: newName } });
  }, [editedElement?.Name, currentElement?.Name]);
  // ФУНКЦИЯ ДЛЯ ОТПРАВКИ ОБНОВЛЕНИЯ
  // ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===
  const handleSaveAll = useCallback(() => {
    if (Object.keys(changes).length === 0) return;
    if (weightError) return; // дополнительная проверка
    sendToWPF('updateElement', { changes });
  }, [changes, weightError]);
  // СБРОСИТЬ изменения
  // ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===
  const handleCancel = useCallback(() => {
    setEditedElement({ ...currentElement });
    setNameError(null);
    setRenameError(null);
    setWeightError(null);
    setFieldErrors({});
  }, [currentElement]);
  // ФУНКЦИЯ заменить высоту на ширину
  // ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===
  const handleSwapDimensions = useCallback(() => {
    sendToWPF('swapDimensions', {});
  }, []);


  // use_CUSTOMHOOKS (Все функции в хуках, должны быть объявлены до их вызова)
  // Извлекаем конфиг для удобства
  const rPathYdirField = useFieldSelect('cwRpathYdir', editedElement, currentElement, fieldConfigs.direction, handleFieldChange);
  const cwDDIRField = useFieldSelect('cwDDIR', editedElement, currentElement, fieldConfigs.direction_top, handleFieldChange);
  const jusLineField = useFieldSelect('cwJusLine', editedElement, currentElement, fieldConfigs.jusLine, handleFieldChange);
  const vShapeField = useFieldSelect('vShape', editedElement, currentElement, fieldConfigs.vShape, handleFieldChange);
  // Вычисляем состояние кнопки Rename
  const isNameChanged = editedElement?.Name !== currentElement?.Name;
  const isSaveDisabled = (!isNameChanged && Object.keys(changes).length === 0) || !!nameError || !!weightError;
  const isFormValid = !nameError && !weightError;

  if (!currentElement || !editedElement) {
    return <div className="p-4">Загрузка данных элемента...</div>;
  }
  const saveDisabled = Object.keys(changes).length === 0 || !isFormValid;
  // состояние кнопки Rename: активно только при изменении и без ошибки имени
  const isRenameDisabled = !isNameChanged || !!nameError;
  const swapDisabled = editedElement?.vHeig === -1 || editedElement?.vHeig === '-1' || editedElement?.vWidth === -1 || editedElement?.vWidth === '-1';

  {/* ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^=== */}
  {/* ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^=== */}
  {/* ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^=== */}
  // RENDERING
  return (
    <div className="p-4 space-y-1 min-w-[500px] overflow-x-hidden">
      <TrackCE onTrackingChange={handleTrackingChange} checked={trackingEnabled} />
      <div className="mt-1 p-3 border border-gray-300 rounded bg-gray-50">
        <LabelInputButton
          label="Name"
          value={editedElement?.Name ?? ''}
          onChange={(val) => handleFieldChange('Name', val)}
          onSave={handleRename}
          buttonLabel="Rename"
          actionType="save"
          isChanged={editedElement.Name !== currentElement.Name}
          buttonTitle="Переименовать текущий элемент"
          isSuccess={renameSuccess}
          isSaveDisabled={isRenameDisabled}
          errorMessage={nameError || renameError || fieldErrors.Name}
        />
      </div>
      <div className="mt-1 ml-1 p-2">
        <LabelInputButton
          label="RefNo"
          value={editedElement.Ref}
          onChange={() => {}}
          buttonLabel=""
          actionType="copy"
          readOnly={true}
          buttonIcon={<CopyIcon />}
          buttonClassName="w-8 h-8 p-0 justify-center"
        />
      </div>
      {/* Site */}
      <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
        <LabelValue label="Site" value={currentElement?.Site ?? '-'} />
      </div>
      {/* Zone */}
      <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
        <LabelValue label="Zone" value={currentElement?.Zone ?? '—'} />
      </div>
      {/* sZone */}
      <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
        <LabelValue label=":SZone" value={currentElement?.sZone ?? '—'} />
      </div>

      <div className='w-full mt-2 ml-1 whitespace-nowrap select-none font-semibold text-gray-700 rounded'>
        <label>Размеры выделенного элемента:</label>
      </div>

      <div className="w-full mt-2 grid grid-cols-[180px_30px_1fr] gap-x-1 font-semibold text-gray-700 rounded">
        {/* Высота/Ширина */}
        <div className="flex flex-col items-end">
          <div className='mt-0 whitespace-nowrap'>
            <LabelInput
              label="Высота"
              value={editedElement.vHeig}
              originalValue={currentElement.vHeig}
              onChange={(val) => handleFieldChange('vHeig', val)}
              numeric={true}
              isChanged={editedElement.vHeig !== currentElement.vHeig}
              inputClassName="w-22"
              placeholder="Высота"
              error={fieldErrors.vHeig}
            />
          </div>
          <div className='mt-1 whitespace-nowrap'>
            <LabelInput
              label="Ширина"
              value={editedElement.vWidth}
              originalValue={currentElement.vWidth}
              onChange={(val) => handleFieldChange('vWidth', val)}
              numeric={true}
              isChanged={editedElement.vWidth !== currentElement.vWidth}
              inputClassName="w-22"
              placeholder="Ширина"
              error={fieldErrors.vWidth}
            />
          </div>
        </div>
        {/* SwapButton */}
        <div className='flex items-start justify-left'>
          <SwapButton onClick={handleSwapDimensions} disabled={swapDisabled} />
        </div>
        {/* Форма/Привязка/Направление */}
        <div className='flex flex-col items-end mt-0'>
          <LabelSelect
            label={vShapeField.label}
            value={vShapeField.value}
            options={vShapeField.options}
            onChange={vShapeField.onChange}
            layout={vShapeField.layout}
            isChanged={vShapeField.isChanged}
            disabled={vShapeField.disabled}
            inputClassName="w-40"
            error={fieldErrors.vShape}
          />
          <LabelSelect
            label={jusLineField.label}
            value={jusLineField.value}
            options={jusLineField.options}
            onChange={jusLineField.onChange}
            layout={jusLineField.layout}
            isChanged={jusLineField.isChanged}
            disabled={jusLineField.disabled}
            inputClassName="w-40"
            labelClassName="w-28 leading-tight"
            error={fieldErrors.cwJusLine}
          />
          <LabelSelect
            label={cwDDIRField.label}
            value={cwDDIRField.value}
            options={cwDDIRField.options}
            onChange={cwDDIRField.onChange}
            layout={cwDDIRField.layout}
            isChanged={cwDDIRField.isChanged}
            disabled={cwDDIRField.disabled}
            inputClassName="w-40"
            error={fieldErrors.cwDDIR}
          />
        </div>
      </div>

      

      <div className="-mt-2">
        <LabelInput
          label="Название разреза"
          value={editedElement.cwDNAM}
          originalValue={currentElement.cwDNAM}
          onChange={(val) => handleFieldChange('cwDNAM', val)}
          layout="top"
          blockOnEmpty={true}
          isChanged={editedElement.cwDNAM !== currentElement.cwDNAM}
          inputClassName="w-full"
          placeholder="Название разреза, узла"
          error={fieldErrors.cwDNAM}
        />
      </div>
      <div className="whitespace-nowrap w-full">
        <WeightWithUnit
          value={editedElement.cwLoad}
          originalValue={currentElement.cwLoad}
          onChange={(val) => handleFieldChange('cwLoad', val)}
          onValidation={setWeightError}
          error={fieldErrors.cwLoad}
        />
      </div>

      {/* Отметка (факт)/(атриб) */}
      <div className="flex justify-start mt-5">
        <LabelValue
          labelClassName="w-35"
          label="Отметка (факт):"
          value={
            currentElement?.zPos && currentElement.zPos !== '' && !isNaN(Number(currentElement.zPos))
              ? (Number(currentElement.zPos) / 1000).toLocaleString() + ' м'
              : '—'
          }
          title="Z-координата по SITE нижней точки CWBRAN"
        />
      </div>
      <div className="w-full -mt-5 ml-1"> {/* подберите row-start */}
        <LabelInputWithCheckbox
          label="Отметка (атриб)"
          value={editedElement.cwHeig}
          originalValue={currentElement.cwHeig}
          onChange={(val) => handleFieldChange('cwHeig', val)}
          labelClassName="w-32 mr-2"
          inputClassName="w-48"
          placeholder="Формат отметки: '0,000'"
          templateText="смотри 3D модель"
          error={fieldErrors.cwHeig}
          labelAlign="bottom"
        />
      </div>


      {/* ===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^===^=== */}
      <div className='flex w-full mt-3'>
        <FileSelector
          label="Ссылка на файл разреза"
          value={editedElement.cwDrawingPath}
          originalValue={currentElement.cwDrawingPath}
          onChange={(val) => handleFieldChange('cwDrawingPath', val)}
          blockOnEmpty={true}
          isChanged={editedElement.cwDrawingPath !== currentElement.cwDrawingPath}
          layout="top"
          placeholder="путь к файлу"
          inputClassName="w-full"
          onBrowse={() => requestFile(crypto.randomUUID())}
        />
      </div>
      <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50 flex">
        <LabelValue label="Создан:" value={formatCreateDate(currentElement?.createDate) ?? '—'} />
      </div>
      <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50 flex">
        <LabelValue label="Изменён:" value={formatUsermLastm(currentElement?.lastModified, currentElement?.userModified) ?? '—'} />
      </div>
      <div className="flex justify-end gap-3 mt-3 pt-1 pb-2 mr-0">
        {/* Тост для общих ошибок */}
        <Toast message={genericError} onClose={() => setGenericError(null)} />
        <button onClick={handleCancel} className="px-4 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100">Отмена</button>
        <button
          onClick={handleSaveAll}
          disabled={saveDisabled}
          className={`px-4 py-1 bg-green-700 text-white rounded 
              disabled:opacity-50 disabled:cursor-default
              ${!saveDisabled ? 'hover:bg-green-800' : ''}`}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}



export default App

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Toast from './components/Toast';
import TrackCE from './components/TrackCE';
import CopyIcon from './components/CopyIcon';
import LabelValue from './components/LabelValue';
import LabelInput from './components/LabelInput';
import LabelSelect from './components/LabelSelect';
import FileSelector from './components/FileSelector';
import WeightWithUnit from './components/WeightWithUnitInputSelect';
import LabelInputButton from './components/LabelInputButton';
import { sendToWPF } from './actions/SendMsgByHostObjects';
import { validateName } from './actions/validationUtils';
import { formatCreateDate } from './actions/formatUtils';
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
    //console.log(`🟢 handleFieldChange: ${fieldKey} =`, newValue, typeof newValue);
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

  // RENDERING
  return (
    <div className="p-4 space-y-1 min-w-[500px] overflow-x-auto">
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
      <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
        <LabelValue label="Site" value={currentElement?.Site ?? '-'} />
      </div>
      <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
        <LabelValue label="Zone" value={currentElement?.Zone ?? '—'} />
      </div>
      <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
        <LabelValue label=":SZone" value={currentElement?.sZone ?? '—'} />
      </div>

      <div className="w-full mt-1 p-3 grid grid-cols-2 grid-rows-4 gap-1 font-semibold text-gray-700 rounded">
        {/* Сетка аналогична оригиналу, только без изменений */}
        <div className="ml-2 col-start-1 row-start-1">
          <label className="-ml-3 whitespace-nowrap select-none">Размеры выделенного элемента:</label>
          <div className='mt-1 -ml-1 whitespace-nowrap'>
            <LabelInput
              label="Высота"
              value={editedElement.vHeig}
              originalValue={currentElement.vHeig}
              onChange={(val) => handleFieldChange('vHeig', val)}
              numeric={true}
              isChanged={editedElement.vHeig !== currentElement.vHeig}
              inputClassName="w-36"
              placeholder="Высота"
              error={fieldErrors.vHeig}
            />
          </div>
          <div className='mt-1 -ml-1 whitespace-nowrap'>
            <LabelInput
              label="Ширина"
              value={editedElement.vWidth}
              originalValue={currentElement.vWidth}
              onChange={(val) => handleFieldChange('vWidth', val)}
              numeric={true}
              isChanged={editedElement.vWidth !== currentElement.vWidth}
              inputClassName="w-36"
              placeholder="Ширина"
              error={fieldErrors.vWidth}
            />
          </div>
        </div>
        <div className="ml-15 mt-2 col-start-2 row-start-1 select-none">
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
          <LabelValue
            label="Отметка:"
            value={
              currentElement?.zPos && currentElement.zPos !== '' && !isNaN(Number(currentElement.zPos))
                ? (Number(currentElement.zPos) / 1000).toLocaleString() + ' м'
                : '—'
            }
            title="Z-координата по SITE нижней точки CWBRAN"
          />
        </div>
        <div className="-ml-23 mt-3 col-start-2 row-start-2">
          <div className="whitespace-nowrap">
            <LabelSelect
              label={jusLineField.label}
              value={jusLineField.value}
              options={jusLineField.options}
              onChange={jusLineField.onChange}
              layout={jusLineField.layout}
              isChanged={jusLineField.isChanged}
              disabled={jusLineField.disabled}
              inputClassName="w-40"
              error={fieldErrors.cwJusLine}
            />
          </div>
          <div className="mt-1 hidden">
            <LabelSelect
              label={rPathYdirField.label}
              value={rPathYdirField.value}
              options={rPathYdirField.options}
              onChange={rPathYdirField.onChange}
              layout={rPathYdirField.layout}
              isChanged={rPathYdirField.isChanged}
              disabled={rPathYdirField.disabled}
              inputClassName="w-40"
              error={fieldErrors.cwRpathYdir}
            />
          </div>
          <div className="mt-1 whitespace-nowrap">
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
        <div className="mt-1 -ml-3 -mr-3 col-span-2 row-start-3">
          <LabelInput
            label="Название разреза"
            value={editedElement.cwDNAM}
            originalValue={currentElement.cwDNAM}
            onChange={(val) => handleFieldChange('cwDNAM', val)}
            layout="top"
            blockOnEmpty={true}
            isChanged={editedElement.cwDNAM !== currentElement.cwDNAM}
            inputClassName="w-full min-w-[450]"
            placeholder="Название разреза, узла"
            error={fieldErrors.cwDNAM}
          />
        </div>
        
        <div className="-ml-1 -mt-7 col-span-2 row-start-4 whitespace-nowrap">
          <WeightWithUnit
            value={editedElement.cwLoad}
            originalValue={currentElement.cwLoad}
            onChange={(val) => handleFieldChange('cwLoad', val)}
            onValidation={setWeightError}
            error={fieldErrors.cwLoad}
          />
        </div>
      </div>
      <div className='flex -mt-21 ml-0 w-full'>
        <FileSelector
          label="Ссылка на файл разреза"
          value={editedElement.cwDrawingPath}
          originalValue={currentElement.cwDrawingPath}
          onChange={(val) => handleFieldChange('cwDrawingPath', val)}
          blockOnEmpty={true}
          isChanged={editedElement.cwDrawingPath !== currentElement.cwDrawingPath}
          layout="top"
          placeholder="путь к файлу"
          inputClassName="w-109"
          onBrowse={() => requestFile(crypto.randomUUID())}
        />
      </div>
      <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50 min-w-[400px] flex">
        <LabelValue label="Создан:" value={formatCreateDate(currentElement?.createDate) ?? '—'} />
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

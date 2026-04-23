import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ElementContext } from './contexts/ElementContext';
import TrackCE from './components/TrackCE';
import CopyIcon from './components/CopyIcon';
import LabelValue from './components/LabelValue';
import LabelInput from './components/LabelInput';
import LabelSelect from './components/LabelSelect';
import FileSelector from './components/FileSelector';
import WeightWithUnit from './components/WeightWithUnitInputSelect';
import LabelInputButton from './components/LabelInputButton';
import { sendToWPF } from './actions/SendMsgByHostObjects';
import { fieldConfigs  } from './config/fieldConfigs';
import { useFieldSelect } from './hooks/hookFieldSelect';




function App() {
  //debugger;
  //Правильный порядок в React-компоненте
  // 1. ВСЕ объявления useState (в самом начале)
  // 2. Все useEffect
  // 3. Функции-обработчики
  // 4. Защита от null
  // 5. Рендер (только когда данные загружены)


  // use_STATE состояния
  // Оригинал из WPF
  const [currentElement, setCurrentElement] = useState(null);
  // Локальная копия для редактирования
  const [editedElement, setEditedElement] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true); //синхронизация с чекбоксом, дублер состояния
  const pendingRequests = useRef(new Map());


  // use_EFFECT эффекты
  // ✅ запросить текущий элемент при старте
  useEffect(() => {
    if (window.chrome?.webview) {
      // опрашиваем текущий элемент при старте
      // sendToWPF('getCurrentElement');
      // при старте отправляем статус чекбокса, если он true wpf вернет CurrentElement
      sendToWPF('trackCe', { enabled: true });
    }
  }, []);


  // ✅ При получении нового currentElement из WPF – обновляем черновик
  useEffect(() => {
    if (currentElement) {
      setEditedElement({...currentElement});
    }
  }, [currentElement]);


  // Подписка на входящие сообщения WPF (через postMessage)
  useEffect(() => {
    const handleMessageFromWPF = (event) => {
      const message = event.data;
      console.log('[App] Received from WPF:', message);
      try {
        const parsed = typeof message === 'string' ? JSON.parse(message) : message;
        if (parsed.action === 'elementChanged' && parsed.payload) {
          setCurrentElement(parsed.payload);
        }
        // 'selectedFile' - отправляет WPF как команду и 'request_id' как идентификатор для resolve
        if (parsed.action === 'selectedFile') {
          const resolve = pendingRequests.current.get(parsed.request_id);
          if (resolve) {
            resolve(parsed.path ?? null);
            pendingRequests.delete(parsed.request_id);
          }
        }
      } catch (e) {
        console.warn('Failed to parse message received from WPF', e);
      }
    };
    if (window.chrome?.webview) {
      window.chrome.webview.addEventListener('message', handleMessageFromWPF);
      return () => window.chrome.webview.removeEventListener('message', handleMessageFromWPF);
    } else {
      console.log('Not in WebView2, using mock data');
    }
  }, []);


  // use_CALLBACK обработчики
  // Обработчик изменения чекбокса
  const handleTrackingChange = useCallback((isEnabled) => {
    setTrackingEnabled(isEnabled);
    if (window.chrome?.webview) sendToWPF('trackCe', { enabled: isEnabled });
  }, []);


  // Заглушка изменения имени DbElement (отправки в WPF)
  const handleFieldSave = (fieldKey, newValue) => {
    console.log(`[Заглушка] Сохранить ${fieldKey} = ${newValue}`);
    if (!currentElement) return;
    const originalValue = currentElement[fieldKey];
    if (originalValue === newValue) {
      console.log(`Поле ${fieldKey} не изменилось`);
      return;
    }
    console.log(`Сохраняем ${fieldKey}: "${originalValue}" → "${newValue}"`);
    // TODO: отправить в WPF
    // sendToWPF('renameElement', { newName: newValue });
  };


  // Обновление поля (печатает пользователь)
  const handleFieldChange = (fieldKey, newValue) => {
    setEditedElement(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));
  };


  // use_CUSTOMHOOKS (Все функции в хуках, должны быть объявлены до их вызова)
  // Извлекаем конфиг для удобства
  const rPathYdirField = useFieldSelect('cwRpathYdir', editedElement, currentElement, fieldConfigs.direction, handleFieldChange);
  const cwDDIRField = useFieldSelect('cwDDIR', editedElement, currentElement, fieldConfigs.direction_top, handleFieldChange);
  const jusLineField = useFieldSelect('cwJusLine', editedElement, currentElement, fieldConfigs.jusLine, handleFieldChange);
  const vShapeField = useFieldSelect('vShape', editedElement, currentElement, fieldConfigs.vShape, handleFieldChange);


  if (!currentElement || !editedElement) {
    return <div className="p-4">Загрузка данных элемента...</div>;
  }
  

  return (
    <ElementContext.Provider value={currentElement}>
      <div className="p-4 space-y-1 min-w-[500px] overflow-x-auto">
        <TrackCE onTrackingChange={handleTrackingChange} initialChecked={true} />
        <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelInputButton
          label="Name"
          value={editedElement?.Name ?? ''}
          onChange={(val) => handleFieldChange('Name', val)}
          onSave={(val) => handleFieldSave('Name', val)}
          buttonLabel="Rename"
          actionType="save"
          isChanged={editedElement.Name !== currentElement.Name}
          buttonTitle="Переименовать текущий элемент"
          />
        </div>
        <div className="mt-1 ml-1 p-2">
          <LabelInputButton
          label="RefNo"
          value={editedElement.Ref}
          onChange={() => {}}        // readOnly, изменять нельзя
          //onSave={() => {}}
          buttonLabel=""
          actionType="copy"
          readOnly={true}
          buttonIcon={<CopyIcon />}
          buttonClassName="w-8 h-8 p-0 justify-center"
          />
        </div>
        <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
          <LabelValue label="Site" value={currentElement?.Site ?? '-'} ></LabelValue>
        </div>
        <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
          <LabelValue label="Zone" value={currentElement?.Zone ?? '—'} ></LabelValue>
        </div>
        <div className="w-full mt-1 p-2 border border-gray-300 rounded bg-gray-50">
          <LabelValue label=":SZone" value={currentElement?.sZone ?? '—'} ></LabelValue>
        </div>

        <div className="w-full mt-1 p-3 grid grid-cols-2 grid-rows-4 gap-1 font-semibold text-gray-700 rounded">
          <div className="ml-2 col-start-1 row-start-1">
            <label className="-ml-3 whitespace-nowrap select-none">Размеры выделенного элемента:</label>
            <div className='mt-1 -ml-1 whitespace-nowrap'>
              {/* Высота */}
              <LabelInput
                label="Высота"
                value={editedElement.vHeig}
                originalValue={currentElement.vHeig}
                onChange={(val) => handleFieldChange('vHeig', val)}
                numeric={true}
                isChanged={editedElement.vHeig !== currentElement.vHeig}
                inputClassName="w-36"
                placeholder="Высота"
              />
            </div>
            <div className='mt-1 -ml-1 whitespace-nowrap'>
              {/* Ширина */}
              <LabelInput
                label="Ширина"
                value={editedElement.vWidth}
                originalValue={currentElement.vWidth}
                onChange={(val) => handleFieldChange('vWidth', val)}
                numeric={true}
                isChanged={editedElement.vWidth !== currentElement.vWidth}
                inputClassName="w-36"
                placeholder="Ширина"
              />
            </div>
          </div>
          <div className="ml-15 mt-2 col-start-2 row-start-1 select-none">
            {/* Форма: */}
            <LabelSelect
              label={vShapeField.label}
              value={vShapeField.value}
              options={vShapeField.options}
              onChange={vShapeField.onChange}
              layout={vShapeField.layout}
              isChanged={vShapeField.isChanged}
              disabled={vShapeField.disabled}
              inputClassName="w-40"
            />
            <LabelValue 
              label="Отметка:" 
              value={
                currentElement?.zPos && currentElement.zPos !== '' && !isNaN(Number(currentElement.zPos))
                ? (Number(currentElement.zPos) / 1000).toLocaleString() + ' м'
                : '—'
              }
            />
          </div>
          <div className="-ml-23 mt-3 col-start-2 row-start-2">
            <div className="whitespace-nowrap">
              {/* Линия привязки */}
              <LabelSelect
                label={jusLineField.label}
                value={jusLineField.value}
                options={jusLineField.options}
                onChange={jusLineField.onChange}
                layout={jusLineField.layout}
                isChanged={jusLineField.isChanged}
                disabled={jusLineField.disabled}
                inputClassName="w-40"
              />
            </div>
            <div className="mt-1">
              {/* Открытая часть верх */}
              <LabelSelect
                label={rPathYdirField.label}
                value={rPathYdirField.value}
                options={rPathYdirField.options}
                onChange={rPathYdirField.onChange}
                layout={rPathYdirField.layout}
                isChanged={rPathYdirField.isChanged}
                disabled={rPathYdirField.disabled}
                inputClassName="w-40"
              />
            </div>
          </div>
          <div className="mt-1 -ml-2 col-start-1 row-start-3">
            {/* Название разреза */}
            <LabelInput
              label="Название разреза"
              value={editedElement.cwDNAM}
              originalValue={currentElement.cwDNAM}
              onChange={(val) => handleFieldChange('cwDNAM', val)}
              layout="top"
              blockOnEmpty={true}
              isChanged={editedElement.cwDNAM !== currentElement.cwDNAM}
              inputClassName="w-62"
              placeholder="Разрез"
            />
          </div>
          <div className="mt-1 ml-15 col-start-2 row-start-3 whitespace-nowrap">
            {/* Направление разреза */}
            <LabelSelect
              label={cwDDIRField.label}
              value={cwDDIRField.value}
              options={cwDDIRField.options}
              onChange={cwDDIRField.onChange}
              layout={cwDDIRField.layout}
              isChanged={cwDDIRField.isChanged}
              disabled={cwDDIRField.disabled}
              inputClassName="w-40"
            />
          </div>
          <div className="-ml-2 -mt-5 col-span-2 row-start-4 whitespace-nowrap">
            {/* Нагрузка */}
            <WeightWithUnit
              value={editedElement.cwLoad}
              originalValue={currentElement.cwLoad}
              onChange={(newWeight) => handleFieldChange('cwLoad', newWeight)}
            />
          </div>
        </div>
        <div className='flex -mt-15 ml-0 w-full'>
          <FileSelector
            label="Ссылка на файл разреза"
            value={editedElement.cwDrawingPath}
            originalValue={currentElement.cwDrawingPath}
            onChange={(newPath) => handleFieldChange('cwDrawingPath', newPath)}
            blockOnEmpty={true}
            isChanged={editedElement.cwDrawingPath !== currentElement.cwDrawingPath}
            layout="top"
            placeholder="Путь к файлу"
            inputClassName="w-109"
            onBrowse={async () => {
              const requestId = crypto.randomUUID(); // строка, уникальный идентификатор
              // Отправляем команду в WPF и ждём ответа
              return new Promise((resolve) => {
                pendingRequests.current.set(requestId, resolve);
                sendToWPF('openFileDialog', { requestId });
              });
            }}
          />
          
        </div>
        <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50 min-w-[400px] flex">
          <LabelValue label="Создан:" value={currentElement?.createDate ?? '—'} ></LabelValue>
        </div>
      </div>
    </ElementContext.Provider>
  );
}



export default App

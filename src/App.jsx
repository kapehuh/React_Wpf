import React, { useState, useEffect, useCallback } from 'react'
import { ElementContext } from './contexts/ElementContext';
import TrackCE from './components/TrackCE';
import CopyIcon from './components/CopyIcon';
import LabelValue from './components/LabelValue';
import LabelInputButton from './components/LabelInputButton';
import { sendToWPF } from './actions/SendMsgByHostObjects';



function App() {
  //debugger;
  // Оригинал из WPF
  const [currentElement, setCurrentElement] = useState(null);
  // Локальная копия для редактирования
  const [editedElement, setEditedElement] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true); //синхронизация с чекбоксом


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


  // Обработчик для копирования (без сохранения)
  const handleRefCopy = (fieldKey, value) => {
    console.log('Просто копируем RefNo в буфер');
  };


  // Обновление поля (печатает пользователь)
  const handleFieldChange = (fieldKey, newValue) => {
    setEditedElement(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));
  };


  if (!currentElement || !editedElement) {
    return <div className="p-4">Загрузка данных элемента...</div>;
  }


  return (
    <ElementContext.Provider value={currentElement}>
      <div className="p-4 space-y-1">
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
          />
        </div>
        <div className="mt-1 p-3">
          <LabelInputButton
          label="RefNo"
          value={editedElement.Ref}
          onChange={() => {}}        // readOnly, изменять нельзя
          onSave={() => {}}
          buttonLabel=""
          actionType="copy"
          readOnly={true}
          buttonIcon={<CopyIcon />}
          buttonClassName="w-8 h-8 p-0 justify-center"
          />
        </div>
        <div className="w-full mt-1 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelValue label="Site" value={currentElement?.Site ?? '-'} ></LabelValue>
        </div>
        <div className="w-full mt-1 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelValue label="Zone" value={currentElement?.Zone ?? '—'} ></LabelValue>
        </div>
        <div className="w-full mt-1 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelValue label=":SZone" value={currentElement?.sZone ?? '—'} ></LabelValue>
        </div>
      </div>
    </ElementContext.Provider>
  );
}



export default App

import React, { useState, useEffect, useCallback } from 'react'
import { ElementContext } from './contexts/ElementContext';
import TrackCE from './components/TrackCE';
import LabelValue from './components/LabelValue';
import LabelInputButton from './components/LabelInputButton';
import { sendToWPF } from './bridge';
import CopyIcon from './components/CopyIcon';


function App() {
  // const [currentElement, setCurrentElement] = useState('(не выбран)');
  const [currentElement, setCurrentElement] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true); //синхронизация с чекбоксом

  //if (!currentElement) return <div>Загрузка...</div>;


  // ✅ запросить текущий элемент при старте
  useEffect(() => {
    if (window.chrome?.webview) {
      sendToWPF('getCurrentElement');
    }
  }, []);

  // Заглушка изменения имени DbElement (отправки в WPF)
  const handleFieldSave = (fieldKey, newValue) => {
    console.log(`[Заглушка] Сохранить ${fieldKey} = ${newValue}`);
    // Здесь позже будет sendToWPF('updateElementField', { field: fieldKey, value: newValue });
    alert(`Сохранение поля ${fieldKey} (заглушка)`);
  };

  // Обработчик изменения чекбокса
  const handleTrackingChange = useCallback((isEnabled) => {
    setTrackingEnabled(isEnabled);
    sendToWPF('trackCe', { enabled: isEnabled });
  }, []);

  // Подписка на сообщения из WPF (через postMessage)
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

  // Обработчик для копирования (без сохранения)
  const handleRefCopy = (fieldKey, value) => {
    console.log('Просто копируем RefNo в буфер');
    //alert(`Копируем ${fieldKey} (заглушка)`);
  };

  return (
    <ElementContext.Provider value={currentElement}>
      <div className="p-4 space-y-1">
        <TrackCE onTrackingChange={handleTrackingChange} initialChecked={true} />
        <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelInputButton
          label="Name"
          fieldKey="Name"
          currentElement={currentElement}
          onAction={handleFieldSave}
          buttonLabel="Rename"
          actionType="save"
          />
        </div>
        <div className="mt-1 p-3">
          <LabelInputButton
          label="RefNo"
          fieldKey="Ref"
          currentElement={currentElement}
          onAction={(key, value) => handleRefCopy(key, value)}
          buttonLabel=""
          actionType="copy"
          buttonIcon={<CopyIcon />}
          readOnly={true} 
          buttonClassName="w-8 h-8 p-0 justify-center"
          />
        </div>
        <div className="w-100 mt-1 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelValue label="Site" value={currentElement?.Site ?? '-'} ></LabelValue>
        </div>
        <div className="w-100 mt-1 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelValue label="Zone" value={currentElement?.Zone ?? '—'} ></LabelValue>
        </div>
        <div className="w-100 mt-1 p-3 border border-gray-300 rounded bg-gray-50">
          <LabelValue label=":SZone" value={currentElement?.sZone ?? '—'} ></LabelValue>
        </div>
      </div>
    </ElementContext.Provider>
  );
}



export default App

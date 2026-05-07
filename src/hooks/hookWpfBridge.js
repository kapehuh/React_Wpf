// src/hooks/useWpfBridge.js (новый хук)
import { useEffect, useRef } from 'react';
import { sendToWPF } from '../actions/SendMsgByHostObjects';

export const useWpfBridge = ({
  setCurrentElement,
  setEditedElement,
  setNameError,
  setRenameError,
  setRenameSuccess,
  setWeightError,
}) => {
  const pendingRequests = useRef(new Map());

  useEffect(() => {
    const handleMessageFromWPF = (event) => {
      const message = event.data;
      try {
        const parsed = typeof message === 'string' ? JSON.parse(message) : message;
        if (parsed.action === 'elementChanged' && parsed.payload) {
          setCurrentElement(parsed.payload);
        }
        if (parsed.action === 'selectedFile') {
          const resolve = pendingRequests.current.get(parsed.request_id);
          if (resolve) {
            resolve(parsed.path ?? null);
            pendingRequests.current.delete(parsed.request_id);
          }
        }
        if (parsed.action === 'updateResult') {
          if (parsed.success) {
            setCurrentElement(parsed.element);
            setNameError(null);
            setRenameError(null);
            setRenameSuccess(true);
            setTimeout(() => setRenameSuccess(false), 1000);
          } else {
            setRenameError(parsed.message || 'Ошибка сохранения');
            setTimeout(() => setRenameError(null), 3000);
          }
        }
        if (parsed.action === 'openFileError') {
          // alert(parsed.message);
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
  }, [setCurrentElement, setEditedElement, setNameError, setRenameError, setRenameSuccess, setWeightError]);

  const requestFile = (requestId) => {
    return new Promise((resolve) => {
      pendingRequests.current.set(requestId, resolve);
      sendToWPF('openFileDialog', { requestId });
    });
  };

  return { requestFile };
};
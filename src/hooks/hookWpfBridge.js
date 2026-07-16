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
  setFieldErrors,
  setGenericError,
}) => {
  const pendingRequests = useRef(new Map());
  const fieldErrorsTimerRef = useRef(null); // таймер для сброса fieldErrors

  useEffect(() => {
    const handleMessageFromWPF = (event) => {
      const message = event.data;
      try {
        const parsed = typeof message === 'string' ? JSON.parse(message) : message;

        if (parsed.action === 'elementChanged' && parsed.payload) {
          // console.log('📦 Данные из WPF:', parsed.payload);
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
            setFieldErrors({});
            setGenericError(null);
            setTimeout(() => setRenameSuccess(false), 1000);
          } else {
            // Ошибки по полям
            const errors = {};
            if (parsed.fieldErrors) {
              Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
                errors[field] = msg;
              });
            }
            setFieldErrors(errors);

            // Показываем общий тост если нет полевых ошибок
            if (Object.keys(errors).length === 0) {
              const genericMsg = parsed.message || 'Ошибка сохранения';
              setGenericError(genericMsg);
              // Тосты сами скрываются через Toast компонент (по таймеру)
            } else {
              setGenericError(null); // скрываем тост, если были полевые ошибки
            }

            // Сбрасываем fieldErrors через 3 секунды
            if (fieldErrorsTimerRef.current) {
              clearTimeout(fieldErrorsTimerRef.current);
            }
            fieldErrorsTimerRef.current = setTimeout(() => {
              setFieldErrors({});
            }, 3000);
            setRenameError(null); // сбрасываем
          }
        }

        if (parsed.action === 'openFileError') {
          setGenericError(parsed.message || 'Ошибка открытия файла');
          setFieldErrors({});
        }
      } catch (e) {
        console.warn('Failed to parse message received from WPF', e);
      }
    };

    if (window.chrome?.webview) {
      window.chrome.webview.addEventListener('message', handleMessageFromWPF);
      //return () => window.chrome.webview.removeEventListener('message', handleMessageFromWPF);
    } else {
      console.log('Not in WebView2, using mock data');
    }



    return () => {
      window.chrome?.webview?.removeEventListener('message', handleMessageFromWPF);
      if (fieldErrorsTimerRef.current) {
        clearTimeout(fieldErrorsTimerRef.current);
      }
    };
  }, [setCurrentElement, setEditedElement, setNameError, setRenameError, setRenameSuccess, setWeightError, setFieldErrors, setGenericError]);

  const requestFile = (requestId) => {
    return new Promise((resolve) => {
      pendingRequests.current.set(requestId, resolve);
      sendToWPF('openFileDialog', { requestId });
    });
  };

  return { requestFile };
};
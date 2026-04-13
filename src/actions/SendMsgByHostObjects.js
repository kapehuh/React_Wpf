// actions/SendMsgByHostObjects.js
export const sendToWPF = (action, payload = {}) => {
  const message = JSON.stringify({ action, payload });

  // 1: через postMessage (работает в WebView2)
  // if (window.chrome?.webview) {
  //   window.chrome.webview.postMessage(message);
  //   console.log('[Bridge] Sent via postMessage:', message);
  //   return;
  // }

  // 2: через hostObjects.bridge
  if (window.chrome?.webview?.hostObjects?.SendMsgByHostObjects) {
    window.chrome.webview.hostObjects.SendMsgByHostObjects.SendToCSharp(message);
    console.log('[Bridge] Sent via hostObjects.bridge:', message);
    return;
  }
  console.warn('[Bridge] WebView2 not available, running in dev mode');
};




// ПРИМЕР:
//     const formData = {
//       name: 'Балка 1',
//       refNo: 'B-123',
//       height: 250,
//       width: 120
//     };
//     sendToWPF('saveData', formData);
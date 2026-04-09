export const sendToWPF = (action, payload = {}) => {
  const message = JSON.stringify({ action, ...payload });

  // 1: через postMessage (работает в WebView2)
  // if (window.chrome?.webview) {
  //   window.chrome.webview.postMessage(message);
  //   console.log('[Bridge] Sent via postMessage:', message);
  //   return;
  // }

  // JSON: {"action":"trackCe","enabled":false}
  // 2: через hostObjects.bridge (в WPF объект bridge)
  if (window.chrome?.webview?.hostObjects?.bridge) {
    window.chrome.webview.hostObjects.bridge.SendToCSharp(message);
    console.log('[Bridge] Sent via hostObjects.bridge:', message);
    return;
  }
  console.warn('[Bridge] WebView2 not available, running in dev mode');
};

// ПРИМЕР:
// const SaveButton = () => {
//   const handleSave = () => {
//     const formData = {
//       name: 'Балка 1',
//       refNo: 'B-123',
//       height: 250,
//       width: 120
//     };
//     sendToWPF('saveData', formData);
//   };
//   return <button onClick={handleSave}>Сохранить</button>;
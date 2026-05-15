using Aveva.ApplicationFramework;
using Aveva.Core.Database;
using Aveva.Core.Explorer;
using Aveva.Core.Geometry;
using Aveva.Core.Presentation;
using Aveva.Core.Presentation.ExplorerControl;
using Aveva.Core3D.Graphics;
using Microsoft.Web.WebView2.Core;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Forms;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Xml.Linq;
using WpfReactTest1.ViewModel;
using Application = System.Windows.Application;
using AvevaCmd = Aveva.Core.Utilities.CommandLine.Command;
using CE = Aveva.Core.Database.CurrentElement;
using WinForms = System.Windows.Forms;

namespace WpfReactTest1.View
{
    /// <summary>
    /// Логика взаимодействия для MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public static AvevaCmd cmd = AvevaCmd.CreateCommand("");
        public static DbQualifier world => new DbQualifier { wrtQualifier = MDB.CurrentMDB.GetFirstWorld(DbType.Design) };
        public DbElement CurElem { get; set; } = CE.Element;

        private ReactBridge _bridge;
        public MainWindow()
        {
            //CurrentElement.CurrentElementChanged += new CurrentElementChangedEventHandler(CE_CurrentElementChanged);
            try
            {
                InitializeComponent();
                CurElem = CurrentElement.Element;
                Loaded += Window_Loaded;
            }
            catch (Exception cstr)
            {
                System.Windows.MessageBox.Show($"Ошибка: {cstr.Message}\n{cstr.StackTrace}");
                throw;
            }
        }

        private bool isInitialized = false;
        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                if (isInitialized) return;
                isInitialized = true;
                webView.CoreWebView2InitializationCompleted += OnWebViewInitializationCompleted;
                await webView.EnsureCoreWebView2Async();
                //_bridge = new Bridge(OnMessageFromReact);
                //System.Diagnostics.Debug.WriteLine("isNULL = " + (webView.CoreWebView2 == null).ToString() + " / webView.CoreWebView2");
                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;

#if DEBUG
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                string url = "http://localhost:5173";
#else
                webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                string dllPath = System.Reflection.Assembly.GetExecutingAssembly().Location;
                string dllDirectory = System.IO.Path.GetDirectoryName(dllPath);
                string reactAppPath = System.IO.Path.Combine(dllDirectory, "ReactApp");
                //WinForms.MessageBox.Show(reactAppPath);
                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "myapp",
                    reactAppPath,
                    CoreWebView2HostResourceAccessKind.Allow  // разрешаем доступ ко всем ресурсам
                );
                string url = "https://myapp/index.html";



                // ================================================================================ V2
                // не актуальная версия которая копирует локально ReactApp на пк пользователя
                // ================================================================================
                // Определяем локальное место для копирования ReactApp
                //string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                //string targetReactPath = System.IO.Path.Combine(localAppData, "YourAppName", "WpfReactTest1", "ReactApp");
                //// Откуда копировать (рядом с DLL, но это UNC)
                //string dllPath = Assembly.GetExecutingAssembly().Location;
                //string sourceReactPath = System.IO.Path.Combine(System.IO.Path.GetDirectoryName(dllPath), "ReactApp");
                //// Если локальной копии нет — копируем
                //if (!Directory.Exists(targetReactPath))
                //{
                //    Directory.CreateDirectory(targetReactPath);
                //    CopyDirectory(sourceReactPath, targetReactPath);
                //}
                //// Теперь используем локальный путь
                //webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                //    "myapp",
                //    targetReactPath,
                //    CoreWebView2HostResourceAccessKind.Allow
                //);
                //string url = "https://myapp/index.html";
#endif

                //string dllPath = System.Reflection.Assembly.GetExecutingAssembly().Location;
                //string dllDirectory = System.IO.Path.GetDirectoryName(dllPath);
                //string reactAppPath = System.IO.Path.Combine(dllDirectory, "ReactApp");
                //webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                //    "myapp",
                //    reactAppPath,
                //    CoreWebView2HostResourceAccessKind.Allow  // разрешаем доступ ко всем ресурсам
                //);
                //webView.CoreWebView2.Navigate("https://myapp/index.html");
                //*webView.CoreWebView2.Navigate("http://localhost:5173");
                //webView.CoreWebView2.Navigate("http://127.0.0.1:5173");
                //webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;

                webView.CoreWebView2.Navigate(url);
            }
            catch (Exception w_Load)
            {
                System.Windows.MessageBox.Show($"Ошибка: {w_Load.Message}\n{w_Load.StackTrace}");
                throw;
            }
        }

        private void CopyDirectory(string sourceDir, string destDir)
        {
            foreach (string dir in Directory.GetDirectories(sourceDir, "*", SearchOption.AllDirectories))
            {
                string targetDir = dir.Replace(sourceDir, destDir);
                Directory.CreateDirectory(targetDir);
            }
            foreach (string file in Directory.GetFiles(sourceDir, "*", SearchOption.AllDirectories))
            {
                string targetFile = file.Replace(sourceDir, destDir);
                File.Copy(file, targetFile, true);
            }
        }

        private void OnWebViewInitializationCompleted(object sender, CoreWebView2InitializationCompletedEventArgs e)
        {
            //if (webView.CoreWebView2 != null) webView.CoreWebView2.AddHostObjectToScript("bridge", new ReactBridge(OnMessageFromReact));
            if (e.IsSuccess && webView.CoreWebView2 != null)
            {
                webView.CoreWebView2.AddHostObjectToScript("SendMsgByHostObjects", new ReactBridge(OnMessageFromReact));
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"Ошибка инициализации WebView2: {e.InitializationException}");
            }
        }

        // ============================================================================================================
        // Отправка команды в React
        // ============================================================================================================
        public void SendToReact(string data)
        {
            if (webView.CoreWebView2 != null)
            {
                webView.CoreWebView2.PostWebMessageAsString(data);
            }
        }

        // ============================================================================================================
        // Получение команды из React
        // ============================================================================================================
        private void OnMessageFromReact(string json)
        {
            System.Diagnostics.Debug.WriteLine($"Received from React via bridge: {json}");
            using (JsonDocument doc = JsonDocument.Parse(json))
            {//{ "action": "...", "payload": {...} }
                JsonElement root = doc.RootElement;
                string action = root.GetProperty("action").GetString();
                JsonElement payload = root.GetProperty("payload");
                switch (action)
                {
                    case "getCurrentElement":
                        var elementData = GetCurrentElementData(CurElem);
                        //string currentName = CurElem.Name(); // получить имя текущего элемента
                        var response = new { action = "elementChanged", payload = elementData };
                        string curelem_json = JsonSerializer.Serialize(response);
                        SendToReact(curelem_json);
                        break;
                    case "trackCe":
                        bool enabled = payload.GetProperty("enabled").GetBoolean();
                        EditCurrentElementChangedSubscribe(enabled);
                        break;
                    case "openFileDialog":
                        var requestId = payload.GetProperty("requestId").GetString();
                        SendFileNameToReact(requestId);
                        break;
                    case "openFile":
                        var filePath = payload.GetProperty("path").GetString();
                        HandleOpenFile(filePath);
                        break;
                    case "updateElement":
                        var changes = payload.GetProperty("changes");
                        bool updateResult = true;

                        //string errField = string.Empty;//поле вызвавшее ошибку
                        //string errMessage = string.Empty;//ошибка
                        var fieldErrors = new Dictionary<string, string>();

                        foreach (var property in changes.EnumerateObject())
                        {
                            string field = property.Name;           // "Name", "vHeig", "vWidth" ...
                            JsonElement value = property.Value;     // новое значение (строка, число и т.д.)
                            switch (field)
                            {
                                //имя
                                case "Name":
                                    try
                                    {
                                        string newName = value.GetString();
                                        CurElem.SetAttribute(DbAttributeInstance.NAME, newName);
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        //errField = field;
                                        //errMessage = e.Message;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //высота
                                case "vHeig":
                                    try
                                    {
                                        double newHeig = value.GetDouble();
                                        CurElem.SetAttribute(DbAttributeInstance.VHEIG, newHeig);
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //ширина
                                case "vWidth":
                                    try
                                    {
                                        double newWidth = value.GetDouble();
                                        CurElem.SetAttribute(DbAttributeInstance.VWIDT, newWidth);
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //форма
                                case "vShape":
                                    try
                                    {
                                        CurElem.SetAttribute(DbAttributeInstance.VSHAPE, int.Parse(value.GetString()));
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //осевая привязка
                                case "cwJusLine":
                                    try
                                    {
                                        CurElem.SetAttribute(DbAttributeInstance.CWJUSL, value.GetString());
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //название разреза
                                case "cwDNAM":
                                    try
                                    {
                                        CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwDNAM"), value.GetString());
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //направление разреза
                                case "cwDDIR":
                                    try
                                    {
                                        CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwDDIR"), value.GetString());
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //нагрузка
                                case "cwLoad":
                                    try
                                    {
                                        string loadStr = value.GetString();
                                        //CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwDDIR"), value.GetString());
                                        // Разделяем строку по первому пробелу
                                        string[] parts = loadStr.Split(new[] { ' ' }, 2, StringSplitOptions.RemoveEmptyEntries);
                                        if (parts.Length == 0)
                                        {
                                            throw new Exception("Пустое значение нагрузки");
                                        }

                                        double loadValue = double.Parse(parts[0].Replace(',', '.'), CultureInfo.InvariantCulture);
                                        string unit = parts.Length > 1 ? parts[1].Trim() : "";

                                        // Допустимые единицы измерения
                                        string[] validUnits = { "кг", "кг/пм", "кг/м2" };
                                        if (unit != "" && !validUnits.Contains(unit))
                                        {
                                            throw new Exception($"Недопустимая единица измерения: {unit}. Допустимы: кг, кг/пм, кг/м2");
                                        }


                                        // Установка двух атрибутов: нагрузка и единица измерения
                                        CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwLOAD"), $"{loadValue} {unit}");
                                        //if (unit != "")
                                        //    CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwUNIT"), unit);
                                        //else
                                        //    CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwUNIT"), "unset"); 
                                        // если единица не задана, убираем атрибут

                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                //ссылка на файл разреза
                                case "cwDrawingPath":
                                    try
                                    {
                                        CurElem.SetAttribute(DbAttribute.GetDbAttribute(":cwDRWG"), value.GetString());
                                        cmd.CommandString = "REFRESH";
                                        cmd.Run();
                                    }
                                    catch (Exception e)
                                    {
                                        updateResult = false;
                                        fieldErrors[field] = e.Message;
                                    }
                                    break;
                                default:
                                    break;
                            }
                            //System.Diagnostics.Debug.WriteLine($"update: {field}");
                            //string newValue = property.Value.GetString();
                            //System.Diagnostics.Debug.WriteLine($"val: {newValue}");
                        }

                        

                        var updateElementResponse = new
                        {
                            action = "updateResult",
                            success = updateResult,
                            fieldErrors,
                            element = GetCurrentElementData(CurElem)
                        };
                        SendToReact(JsonSerializer.Serialize(updateElementResponse));
                        break;
                    default:
                        Debug.WriteLine($"Unknown action: {action}");
                        break;
                }
            }
        }

        

        private bool _isSubscribed = false;
        // Изменение подписки на CurrentElementChanged
        private void EditCurrentElementChangedSubscribe(bool trackCe)
        {
            if (trackCe)
            { // отслеживать
                if (!_isSubscribed)
                {
                    CurrentElement.CurrentElementChanged += new CurrentElementChangedEventHandler(CE_CurrentElementChanged);
                    CurElem = CurrentElement.Element;
                    var elementData = GetCurrentElementData(CurElem);
                    var message = new { action = "elementChanged", payload = elementData };
                    string json = JsonSerializer.Serialize(message);
                    SendToReact(json);
                    _isSubscribed = true;
                    System.Diagnostics.Debug.WriteLine("Subscribed to CurrentElementChanged");
                }
            }
            else
            { // не отслеживать
                if (_isSubscribed)
                {
                    CurrentElement.CurrentElementChanged -= new CurrentElementChangedEventHandler(CE_CurrentElementChanged);
                    _isSubscribed = false;
                    System.Diagnostics.Debug.WriteLine("Unsubscribed from CurrentElementChanged");
                }
            }
        }


        // Событие смены текущего элемента / обработка
        private void CE_CurrentElementChanged(object sender, CurrentElementChangedEventArgs e)
        {
            CurElem = CurrentElement.Element;
            var elementData = GetCurrentElementData(CurElem);
            //string name = CurElem.Name();
            var message = new { action = "elementChanged", payload = elementData };
            string json = JsonSerializer.Serialize(message);
            SendToReact(json);
        }


        // Получение информации о элементе, вызовы: при старте реакта, при включении подписки, при смене элемента
        private object GetCurrentElementData(DbElement e)
        {
            DbElement siteElem = e.FindOwnerOfType("SITE");
            DbElement zoneElem = e.FindOwnerOfType("ZONE");
            DbElement szoneElem = e.FindOwnerOfType("ZONE", ":SZONE");
            double width = 0;
            if (e.GetValidDouble(DbAttributeInstance.VWIDT, ref width)) { }
            else
            {
                width = -1;
            }
            double heig = 0;
            if (e.GetValidDouble(DbAttributeInstance.VHEIG, ref heig)) { }
            else
            {
                heig = -1;
            }
            int vshape = 0; //нет атрибута
            if (e.GetValidInteger(DbAttributeInstance.VSHAPE, ref vshape)) { }
            else
            {
                vshape = 2;
            }
            string cwjusline = string.Empty;
            e.GetValidAsString(DbAttributeInstance.CWJUSL, ref cwjusline);
            string cwdnam = string.Empty;
            e.GetValidAsString(DbAttribute.GetDbAttribute(":cwDNAM"), ref cwdnam);
            string cwddir = string.Empty;
            e.GetValidAsString(DbAttribute.GetDbAttribute(":cwDDIR"), ref cwddir);
            string cwrpathydir = string.Empty;
            e.FirstMember(DbElementTypeInstance.RPATH).GetValidAsString(DbAttributeInstance.YDIR, ref cwrpathydir);
            string cwload = string.Empty;
            e.GetValidAsString(DbAttribute.GetDbAttribute(":cwLOAD"), ref cwload);
            string cwdrawingpath = string.Empty;
            if (e.GetElementType().Equals(DbElementTypeInstance.CWBRAN))
            {
                e.GetValidAsString(DbAttribute.GetDbAttribute(":cwDRWG"), ref cwdrawingpath);
            }
            if (e.GetElementType().Equals(DbElementTypeInstance.EQUIPMENT))
            {
                e.GetValidAsString(DbAttribute.GetDbAttribute(":eqDRWG"), ref cwdrawingpath);
            }
            string createdate = string.Empty;
            e.GetValidAsString(DbAttribute.GetDbAttribute(":CreateDate"), ref createdate);
            string zmin = string.Empty;
            var rpath = e.FirstMember(DbElementTypeInstance.RPATH);
            if (rpath.IsValidEx())
            {
                DbQualifier dbqsite = new DbQualifier { wrtQualifier = siteElem };
                zmin = rpath.Members(DbElementTypeInstance.POINTR).Select(p => p.GetPosition(DbAttributeInstance.POS, dbqsite).Z).Min().ToString();
                //zmin = rpath.Members(DbElementTypeInstance.POINTR).Aggregate((minP, p) => p.GetPosition(DbAttributeInstance.POS, world).Z < minP.GetPosition(DbAttributeInstance.POS, world).Z ? p : minP).ToString();
            }
            var elemdata = new
            {
                Name = e.Name(),                // имя
                Ref = e.GetAsString(DbAttributeInstance.REF),    // ref   
                Site = siteElem.Name(),         // site
                Zone = zoneElem.Name(),         // zone
                sZone = szoneElem.Name(),       // szone

                vWidth = width,                 // ширина
                vHeig = heig,                   // высота

                vShape = vshape.ToString(),     // форма cwbran - круг/квадрат
                zPos = zmin,                    // Z position

                cwJusLine = cwjusline,          // привязка осевой линии лотка
                cwRpathYdir = cwrpathydir,      // Ydir лотка

                cwDNAM = cwdnam,                // название разреза, узла
                cwDDIR = cwddir,                // направление разреза
                cwLoad = cwload,                // нагрузка+ед.измерения

                cwDrawingPath = cwdrawingpath,  // путь к файлу чертежа
                createDate = createdate,        // дата создания
            };
            return elemdata ;
        }

        // Метод, который должен работать по умолчанию, но не работает, вместо него Bridge()
        //private void OnWebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        //{
        //    string message = e.TryGetWebMessageAsString();
        //    System.Diagnostics.Debug.WriteLine($"Received from React: {message}");
        //    using (JsonDocument doc = JsonDocument.Parse(message))
        //    {//{ "action": "...", "payload": {...} }
        //        JsonElement root = doc.RootElement;
        //        string action = root.GetProperty("action").GetString();
        //        switch (action)
        //        {
        //            case "getCurrentElement":
        //                break;
        //            case "trackCe":
        //                JsonElement payload = root.GetProperty("payload");
        //                bool enabled = payload.GetProperty("enabled").GetBoolean();
        //                EditCurrentElementChangedSubscribe(enabled);
        //                break;
        //            default:
        //                break;
        //        }
        //        //if (action == "getCurrentElement")
        //        //{
        //        //    string currentName = CurElem.Name(); // ваша логика получения имени элемента
        //        //    System.Diagnostics.Debug.WriteLine($"Received from React 'getCurrentElement': {currentName}");
        //        //    // Если нужно отправить ответ в React:
        //        //    var response = new { action = "currentElement", payload = new { name = currentName } };
        //        //    string responseJson = JsonSerializer.Serialize(response);
        //        //    webView.CoreWebView2.PostWebMessageAsString(responseJson);
        //        //}
        //    }
        //}


        // ==================================================================================== / открытие файла

        /// <summary>
        /// OpenFileDialog через c#, тк реакт не возвращает полный путь к файлу
        /// </summary>
        /// <param name="request_id">нужен для реакт чтобы сопоставить pendingRequests</param>
        private void SendFileNameToReact(string request_id)
        {
            string projName = Project.CurrentProject.Name;
            Microsoft.Win32.OpenFileDialog openFileDialog = new Microsoft.Win32.OpenFileDialog
            {
                //Filter = "Excel documents (*.xls; *.xlsx; *.xlsm) | *xls; *xlsx; *xlsm",
                Filter = "Cad/pdf documents (*.dwg; *.dxf; *.pdf) | *dwg; *dxf; *pdf|" + "All files (*.*)|*.*",
                //InitialDirectory = "E:\\",
                InitialDirectory = $"\\\\LGNH-AVEVA\\AVEVA-SETUP\\Projects\\{projName}\\{projName.ToLower()}info\\REPORTS\\{projName.ToLower()}\\ELO",
                CheckFileExists = true,
                CheckPathExists = true,
                Multiselect = false,
                Title = "Select File to Open"
            };
            if (openFileDialog.ShowDialog() == true)
            {
                try
                {
                    var response = new { action = "selectedFile", request_id, path = openFileDialog.FileName };
                    SendToReact(JsonSerializer.Serialize(response));
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"{ex.Message}");
                }
            }
            else
            {
                var response = new { action = "selectedFile", request_id, path = (string)null };
                SendToReact(JsonSerializer.Serialize(response));
            }
        }

        private void HandleOpenFile(string filePath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                {
                    SendErrorToReact("Путь к файлу не указан.");
                    return;
                }

                if (!File.Exists(filePath))
                {
                    SendErrorToReact($"Файл не найден: {filePath}");
                    return;
                }

                string extension = System.IO.Path.GetExtension(filePath).ToLowerInvariant();
                var allowedExtensions = new HashSet<string> { ".dwg", ".dxf", ".pdf" };
                if (!allowedExtensions.Contains(extension))
                {
                    SendErrorToReact($"Формат '{extension}': ожидается .dwg .dxf .pdf");
                    return;
                }

                var startInfo = new ProcessStartInfo
                {
                    FileName = filePath,
                    UseShellExecute = true   // программа по умолчанию
                };
                Process.Start(startInfo);
            }
            catch (Exception eex)
            {
                SendErrorToReact($"Ошибка открытия файла: {eex.Message}");
            }
            //SendErrorToReact("Файл не найден: " + filePath);
        }

        private void SendErrorToReact(string message)
        {
            var response = new { 
                action = "openFileError", 

                message };
            SendToReact(JsonSerializer.Serialize(response));
        }

        // ==================================================================================== ***







        //====================================================================================================================
        //====================================================================================================================
        //======================================== Логика обновления полей ===================================================
        //====================================================================================================================
        //====================================================================================================================

    }



    [ComVisible(true)]
    public class ReactBridge
    {
        private readonly Action<string> _onMessage;

        public ReactBridge(Action<string> onMessage)
        {
            _onMessage = onMessage ?? throw new ArgumentNullException(nameof(onMessage));
        }

        public void SendToCSharp(string json)
        {
            _onMessage?.Invoke(json);
        }
    }

    public static class DbElementExtensions
    {
        /// <summary>
        /// Ищет первого владельца указанного типа (Owner.Type) в цепочке Owner.
        /// </summary>
        /// <param name="element">Элемент, с которого начинается поиск.</param>
        /// <param name="targetType">Искомый тип владельца, например "SITE" или "ZONE".</param>
        /// <param name="targetActType">Необязательный ActType для фильтрации (например, ":SZONE").</param>
        /// <returns>Найденный DbElement или null.</returns>
        public static DbElement FindOwnerOfType(this DbElement element, string targetType, string targetActType = null, bool includeSelf = false)
        {

            if (element == null) return null;
            // Если ActType не задан, ищем точное совпадение (ActType = targetType)
            string actTypeToMatch = targetActType ?? targetType;

            //DbElement current = includeSelf ? element : element.Owner;

            if (includeSelf && element.ElementType.Name == targetType) 
            {
                string actType = element.GetActualType()?.Name;
                if (actType == actTypeToMatch) return element;
            }

            //if (element.ElementType.Name.Equals(targetType) && (element.GetActualType().Name.Equals(null) || element.GetActualType().Name.Equals(targetActType))) return element;
            DbElement current = element.Owner;
            while (!current.IsNull)
            {
                // Проверяем тип и, если задан ActType, то и его
                if (current.ElementType.Name == targetType)
                {
                    string actType = current.GetActualType()?.Name;
                    if (actType == actTypeToMatch) return current;
                }
                current = current.Owner;
            }
            return null;
        }
    }



    /// <summary>
    /// Попытка обновить дерево ExplorerTree через c# с получением ExplorerCtrl
    /// </summary>
    public static class ExplorerTreeRefresher
    {
        public static void RefreshElementName(DbElement element)
        {
            try
            {
                ExplorerCtrl explorerCtrl = null;

                foreach (Form form in WinForms.Application.OpenForms)
                {
                    explorerCtrl = FindControl<ExplorerCtrl>(form);
                    if (explorerCtrl != null) break;
                }
                if (explorerCtrl == null) return;


                var mTreeField = typeof(ExplorerCtrl).GetField("mTree", BindingFlags.NonPublic | BindingFlags.Instance);
                var explorerTree = mTreeField?.GetValue(explorerCtrl);
                if (explorerTree == null) return;
                var method = explorerTree.GetType().GetMethod("UpdateImage", BindingFlags.Public | BindingFlags.Instance);
                //var method = explorerTree.GetType().GetMethod("Update", BindingFlags.Public | BindingFlags.Instance);
                //var method = explorerTree.GetType().GetMethod("RefreshRootNode", BindingFlags.Public | BindingFlags.Instance);
                method?.Invoke(explorerTree, new object[] { element });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Ошибка: {ex.Message}");
            }
        }

        private static T FindControl<T>(WinForms.Control parent) where T : WinForms.Control
        {
            if (parent == null) return null;
            if (parent is T t) return t;
            foreach (WinForms.Control child in parent.Controls)
            {
                var result = FindControl<T>(child);
                if (result != null) return result;
            }
            return null;
        }
    }
}

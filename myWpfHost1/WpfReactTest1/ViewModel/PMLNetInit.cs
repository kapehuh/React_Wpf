using Aveva.ApplicationFramework;
using Aveva.ApplicationFramework.Presentation;
using Aveva.Core.Database;
using Aveva.Core.PMLNet;
using WpfReactTest1.Properties;
using WpfReactTest1.View;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Forms;
using System.Windows.Forms.Integration;
using System.Windows.Interop;

namespace WpfReactTest1.ViewModel
{
    [PMLNetCallable()]
    class PMLNetInit
    {
        Aveva.Core.Utilities.CommandLine.Command cmd = Aveva.Core.Utilities.CommandLine.Command.CreateCommand("");

        [PMLNetCallable()]
        public PMLNetInit()
        {
        }

        [PMLNetCallable()]
        public void Exception()
        {
            // (Module number, Message number, Message text)
            throw new PMLNetException(1000, 1, "Проверка реакции на исключение");
        }

        [PMLNetCallable()]
        public void Assign(PMLNetInit that)
        {
            //No state
        }

        [PMLNetCallable()]
        public void Start()
        {
            try
            {
                var mainWindow = new MainWindow() { };
                ElementHost.EnableModelessKeyboardInterop((Window)mainWindow);
                new WindowInteropHelper((Window)mainWindow).Owner = DependencyResolver.GetImplementationOf<IWindowManager>().MainForm.Handle;
                mainWindow.Show();

                // === === === === === лог
                string logPath = Settings.Default.LogPath;
                FileInfo fileInfo = new FileInfo(logPath);
                if (!fileInfo.Directory.Exists)
                    fileInfo.Directory.Create();
                using (StreamWriter writer = new StreamWriter(logPath, true, Encoding.UTF8))
                {
                    string s = $"{Environment.UserName} / {DateTime.Now:dd-MM-yy HH:mm} / {Project.CurrentProject.UserName} / {Project.CurrentProject.Name} / {MDB.CurrentMDB.Name} / {System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}";
                    writer.WriteLine(s);
                }
            }
            catch (Exception ex)
            {
                System.Windows.MessageBox.Show($"Ошибка: {ex.Message}\n{ex.StackTrace}");
            }
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace WpfReactTest1.ViewModel
{
    internal class MyException : Exception
    {
        Aveva.Core.Utilities.CommandLine.Command cmd = Aveva.Core.Utilities.CommandLine.Command.CreateCommand("");
        public MyException()
        {
        }

        public MyException(string message)
          : base(message)
        {
            cmd.CommandString = "$P " + message;
            cmd.RunInPdms();
        }

        public MyException(string message, bool showMbox)
        {
            cmd.CommandString = "$P " + message;
            cmd.RunInPdms();
            MessageBox.Show(message);
        }
    }
}

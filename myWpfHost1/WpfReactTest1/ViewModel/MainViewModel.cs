using Aveva.Core.Database;
using Aveva.Core.Database.Filters;
using Aveva.Core.Utilities.ModuleInfo;
using Aveva.Core3D.Graphics;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Xml.Linq;
using WpfReactTest1.Properties;
using AvevaCmd = Aveva.Core.Utilities.CommandLine.Command;
using CE = Aveva.Core.Database.CurrentElement;

namespace WpfReactTest1.ViewModel
{
    public partial class MainViewModel : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string name = null)
        {
            this.PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
        /// <summary>
        /// /
        /// </summary>
        private readonly MDB mdb = MDB.CurrentMDB;
        public static AvevaCmd cmd = AvevaCmd.CreateCommand("");
        public static DbQualifier world => new DbQualifier { wrtQualifier = MDB.CurrentMDB.GetFirstWorld(DbType.Design) };
        ModuleManager E3DmoduleManager { get; set; } = new ModuleManager();
        private string ModuleName => E3DmoduleManager.CurrentModule.Name;

        public DbElement CurElem { get; set; } = CE.Element;
        public DbElement PrevElem { get; set; } = DbElement.GetElement();
        //public DbElement CurWorld /*=> CurElem.EvaluateElement(DbExpression.Parse("WORLD"));*/ { get; set; } = MDB.CurrentMDB.GetFirstWorld(DbType.Design);
        //public DbElement CurSite => CurElem.EvaluateElement(DbExpression.Parse("SITE"));
        //public DbElement[] CwbrsFromGraphicalSelection => (from p in DrawListManager.Instance.CurrentDrawList.GraphicalSelection() where p.ElementType == DbElementTypeInstance.CWBRAN select p).ToArray();

        //public bool IsDrawModule => ModuleName.Equals("Draw");
        //public string FilePath => Settings.Default.CjFilePath;
        //======================================================================================================================================
        #region Properties

        #endregion

        //======================================================================================================================================
        #region Состояние прогресса

        #endregion

        //======================================================================================================================================
        public Dictionary<string, DbElement> KeyIsConsumer_ValueIsSprefTabite { get; set; } = new Dictionary<string, DbElement>();
        public bool UserPermission => CheckUserAccess();

        #region Команды UI
        public ICommand CheckCollisionVM { get; private set; }      /*Команда*/
        #endregion
        public MainViewModel()
        {
            CurElem = CurrentElement.Element;
            CurrentElement.CurrentElementChanged += new CurrentElementChangedEventHandler(CE_CurrentElementChanged);
        }

        //=============================================================================================== Вспомогательный метод CollectAllFor C#
        public static HashSet<DbElement> CollectAllFor(BaseFilter elementsFilter, string dbExpression, DbElement elementRoot, bool IncludeRoot)
        {
            HashSet<DbElement> dbelementsToReturn = new HashSet<DbElement>();
            DBElementCollection coll = new DBElementCollection(elementRoot) { IncludeRoot = IncludeRoot };

            if (elementsFilter != null)
                coll.Filter = elementsFilter;
            foreach (DbElement ele in coll)
            {
                bool ToAddElementToCollection = false;
                if (IncludeRoot || !ele.Equals(elementRoot))
                {
                    if (string.IsNullOrEmpty(dbExpression))
                        ToAddElementToCollection = true;
                    else if (DbExpression.Parse(dbExpression, out DbExpression pml_expression, out _))
                    {
                        ele.EvaluateValidBool(pml_expression, ref ToAddElementToCollection);
                        //GC.Collect(GC.MaxGeneration, GCCollectionMode.Forced);
                    }
                    if (ToAddElementToCollection)
                        dbelementsToReturn.Add(ele);
                }
            }
            return dbelementsToReturn;
        }

        //======================================================================================================================================
        private void CE_CurrentElementChanged(object sender, CurrentElementChangedEventArgs e)
        {
            //DrawListManager.Instance.CurrentDrawList.Unhighlight(PrevElem);
            CurElem = CurrentElement.Element;
        }

        //======================================================================================================================================
        public bool CheckUserAccess()
        {
            return true;
        }

        //======================================================================================================================================
        //======================================================================================================================================
        //======================================================================================================================================
    }
}

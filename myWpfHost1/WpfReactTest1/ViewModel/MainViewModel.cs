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
        public DbElement CurWorld /*=> CurElem.EvaluateElement(DbExpression.Parse("WORLD"));*/ { get; set; } = MDB.CurrentMDB.GetFirstWorld(DbType.Design);
        public DbElement CurSite => CurElem.EvaluateElement(DbExpression.Parse("SITE"));
        public DbElement[] CwbrsFromGraphicalSelection => (from p in DrawListManager.Instance.CurrentDrawList.GraphicalSelection() where p.ElementType == DbElementTypeInstance.CWBRAN select p).ToArray();

        //public bool IsDrawModule => ModuleName.Equals("Draw");
        //public string FilePath => Settings.Default.CjFilePath;
        //======================================================================================================================================
        #region Properties
        public bool Lvj { get; set; } = true;
        public bool Gj { get; set; } = true;
        public bool Gg { get; set; } = true;
        public string LvjString => Lvj ? "ЛВЖ" : "empty";
        public string GjString => Gj ? "ГЖ" : "empty";
        public string GgString => Gg ? "ГГ" : "empty";

        private SolidColorBrush mycolor = new SolidColorBrush(Colors.DarkOliveGreen);
        public SolidColorBrush Mycolor
        {
            get
            {
                return mycolor;
            }
            set
            {
                mycolor = value;
                OnPropertyChanged("Mycolor");
            }
        }

        /// <summary>
        /// индекс выбранной вкладки TabControl/TabItem
        /// </summary>
        private int _selectedTabIndex;
        public int SelectedTabIndex
        {
            get => _selectedTabIndex;
            set
            {
                _selectedTabIndex = value;
                OnPropertyChanged();
            }
        }


        public ObservableCollection<object> Left_Elements_GensecPane { get; set; } = new ObservableCollection<object>();    //элементы left
        public ObservableCollection<object> Right_Elements_CwbranBox { get; set; } = new ObservableCollection<object>();    //элементы right
        public ObservableCollection<object> NoIntersectedElements { get; set; } = new ObservableCollection<object>();       //элементы без пересечений из right
        public ObservableCollection<object> LvjGjGg { get; set; } = new ObservableCollection<object>();                     //элементы с признаком горючести



        #endregion
        //======================================================================================================================================
        #region Состояние прогресса
        private bool _VisibilityStatus;
        public bool VisibilityStatus
        {
            get => _VisibilityStatus;
            set
            {
                _VisibilityStatus = value;
                ProgressVisibility = value ? Visibility.Visible : Visibility.Hidden;
                OnPropertyChanged("VisibilityStatus");
                OnPropertyChanged("ProgressVisibility");
            }
        }
        //private Visibility _ProgressVisibility;
        public Visibility ProgressVisibility { get; set; }

        private int _CurrentProgress;
        public int CurrentProgress // ProgressBar Value
        {
            get => _CurrentProgress;
            set
            {
                _CurrentProgress = value;
                OnPropertyChanged();
            }
        }
        private int _TotalCount;
        public int TotalCount // Maximum Value
        {
            get => _TotalCount;
            set
            {
                _TotalCount = value;
                OnPropertyChanged();
            }
        }
        private string _ProgressText;
        public string ProgressText // Progress Text
        {
            get => _ProgressText;
            set
            {
                _ProgressText = value;
                OnPropertyChanged();
            }
        }
        private IProgress<Tuple<int, int, string, bool>> progress;
        private void ProgressPlus(IProgress<Tuple<int, int, string, bool>> iProgress, int curIndx, int total, string infoMessage, bool isVisible)
        {
            iProgress.Report(new Tuple<int, int, string, bool>(curIndx++, total, infoMessage, isVisible));
            Thread.Sleep(1);
        }
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
            DrawListManager.Instance.CurrentDrawList.Unhighlight(PrevElem);
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

        /// <summary>
        /// Приблизить элемент
        /// </summary>
        public DelegateCommand ZoomElem
        {
            get
            {
                return new DelegateCommand((obj) =>
                {

                });
            }
        }
    }
}

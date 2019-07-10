using FSW.Utility;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace FSW.dhtmlx
{

    public enum GanttLinkType
    {
        FinishToStart = 0, StartToStart = 1, FinishToFinish = 2, StartToFinish = 3
    }
    public class GanttLink
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty]
        private int source;
        [JsonIgnore]
        private GanttItem _Source;
        [JsonIgnore]
        public GanttItem Source
        {
            get => _Source;
            set
            {
                _Source = value;
                source = value.Id;
            }
        }

        [JsonProperty]
        private int target;
        [JsonIgnore]
        private GanttItem _Target;
        [JsonIgnore]
        public GanttItem Target
        {
            get => _Target;
            set
            {
                _Target = value;
                target = value.Id;
            }
        }

        [JsonProperty]
        private string type = ((int)GanttLinkType.FinishToStart).ToString();
        [JsonIgnore]
        public GanttLinkType Type
        {
            get => (GanttLinkType)int.Parse(type);
            set => type = ((int)value).ToString();
        }

        [JsonProperty(PropertyName = "readonly", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? ReadOnly { get; set; }

        [JsonProperty(PropertyName = "editable", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Editable { get; set; }
    }

    public class GanttResource
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "text")]
        public string Name { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
#pragma warning disable IDE0052 // Remove unread private members
        private int? parent;
#pragma warning restore IDE0052 // Remove unread private members

        [JsonIgnore]
        private GanttResource _Parent;
        [JsonIgnore]
        public GanttResource Parent
        {
            get => _Parent;
            set
            {
                _Parent = value;
                parent = value?.Id;
            }
        }
    }

    public class GanttItem
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "text")]
        public string Text { get; set; }

        [JsonProperty(PropertyName = "start_date")]
        protected string _StartDate;
        [JsonIgnore]
        public DateTime? StartDate
        {
            get => _StartDate == null ? null : (DateTime?)DateTime.ParseExact(_StartDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);
            set => _StartDate = value?.ToString("dd-MM-yyyy");
        }

        [JsonProperty(PropertyName = "duration")]
        public int? Duration { get; set; }

        [JsonProperty(PropertyName = "order")]
        public int Order { get; set; }

        [JsonProperty(PropertyName = "progress")]
        public float Progress { get; set; }

        [JsonProperty(PropertyName = "open")]
        public bool Open { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
#pragma warning disable IDE0052 // Remove unread private members
        private int? parent;
#pragma warning restore IDE0052 // Remove unread private members

        [JsonIgnore]
        protected GanttItem _Parent;
        [JsonIgnore]
        public GanttItem Parent
        {
            get => _Parent;
            set
            {
                _Parent = value;
                parent = value?.Id;
            }
        }

        [JsonProperty(PropertyName = "color", DefaultValueHandling = DefaultValueHandling.Ignore)]
        protected string color;
        [JsonIgnore]
        public System.Drawing.Color Color
        {
            get => string.IsNullOrEmpty(color) ? System.Drawing.Color.Empty : System.Drawing.ColorTranslator.FromHtml(color);
            set => color = value == System.Drawing.Color.Empty ? null : System.Drawing.ColorTranslator.ToHtml(value);
        }

        /// <summary>
        /// Cannot be used with GridColor, GridColor will override
        /// </summary>
        [JsonProperty(PropertyName = "GridCssClass", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string GridCssClass { get; set; }

        /// <summary>
        /// Only available if OverrideGridCssWithGridColor is true
        /// </summary>
        [JsonIgnore]
        public System.Drawing.Color GridColor { get; set; }

        [JsonProperty(PropertyName = "readonly", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool ReadOnly { get; set; }
    }
    public enum AlignPosition
    {
        Left, Center, Right
    }

    public class GanttColumn
    {
        public string Text;

        public string Field;

        public string Width;

        [JsonProperty(PropertyName = nameof(AlignPosition))]
        private string AlignPosition_ = AlignPosition.Left.ToString().ToLower();

        [JsonIgnore]
        public AlignPosition AlignPosition
        {
            get => (AlignPosition)Enum.Parse(typeof(AlignPosition), AlignPosition_, true);
            set => AlignPosition_ = value.ToString().ToLower();
        }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool Tree;

        public bool Resize = true;

        public int Order;
    }
    public class GanttColumnAttribute : Attribute
    {
        public string Text { get; set; }

        public string Width { get; set; }

        public AlignPosition AlignPosition { get; set; } = AlignPosition.Left;

        public bool Resize { get; set; } = true;

        public int Order { get; set; }
    }

    public class GanttResourceTaskLink
    {
#pragma warning disable IDE0052 // Remove unread private members

        [JsonProperty]
        private int resource_id;
        private GanttResource Resource_;
        public GanttResource Resource
        {
            get => Resource_;
            set
            {
                Resource_ = value;
                resource_id = value.Id;
            }
        }

        [JsonProperty]
        private double value;
        public TimeSpan Work
        {
            get => TimeSpan.FromHours(value);
            set => this.value = value.TotalHours;
        }

        [JsonProperty(PropertyName = "Start")]
        protected string _Start;
        [JsonIgnore]
        public DateTime? Start
        {
            get => _Start == null ? null : (DateTime?)DateTime.ParseExact(_Start, "dd-MM-yyyy", CultureInfo.InvariantCulture);
            set => _Start = value?.ToString("dd-MM-yyyy");
        }

        [JsonProperty(PropertyName = "Finish")]
        protected string _Finish;
        [JsonIgnore]
        public DateTime? Finish
        {
            get => _Finish == null ? null : (DateTime?)DateTime.ParseExact(_Finish, "dd-MM-yyyy", CultureInfo.InvariantCulture);
            set => _Finish = value?.ToString("dd-MM-yyyy");
        }

#pragma warning restore IDE0052 // Remove unread private members
    }

    public interface IGanttTaskWithResources
    {
        List<GanttResourceTaskLink> Resources { get; set; }
    }

    public enum GanttScale
    {
        Day, Week, Month, Year
    }

    public class GanttSubScale
    {
        [JsonProperty]
        private string unit = (GanttScale.Week).ToString().ToLower();

        [JsonIgnore]
        public GanttScale Unit
        {
            get => (GanttScale)Enum.Parse(typeof(GanttScale), unit, true);
            set => unit = value.ToString().ToLower();
        }

        [JsonProperty(PropertyName = "step")]
        public int Step { get; set; }
    }


    public class Gantt<DataType> : Controls.Html.HtmlControlBase where DataType : GanttItem
    {
        public override string ControlType => "dhtmlx.Gantt";

        private ControlPropertyList<DataType> Items_;
        public IList<DataType> Items
        {
            get => Items_;
            set => Items_.Set(value is List<DataType> list ? list : value.ToList());
        }

        private ControlPropertyList<GanttLink> Links_;
        public IList<GanttLink> Links
        {
            get => Links_;
            set => Links_.Set(value is List<GanttLink> list ? list : value.ToList());
        }

        private ControlPropertyDictionary<GanttColumn> Columns_;
        public IDictionary<string, GanttColumn> Columns
        {
            get => Columns_;
            set => Columns_.Set(value is Dictionary<string, GanttColumn> list ? list : value.ToDictionary(x => x.Key, x => x.Value));
        }

        private ControlPropertyList<GanttResource> ResourceStore_;
        public IList<GanttResource> ResourceStore
        {
            get => ResourceStore_;
            set => ResourceStore_.Set(value is List<GanttResource> list ? list : value.ToList());
        }

        public int? RowHeight
        {
            get => GetProperty<int?>(PropertyName());
            set => SetProperty(PropertyName(), value);
        }

        public int GridWidth
        {
            get => GetProperty<int>(PropertyName());
            set => SetProperty(PropertyName(), value);
        }

        public bool Editable
        {
            get => GetProperty<bool>(PropertyName());
            set => SetProperty(PropertyName(), value);
        }

        public bool ShowResourceSection
        {
            get => GetProperty<bool>(PropertyName());
            set => SetProperty(PropertyName(), value);
        }

        public GanttScale Scale
        {
            get => (GanttScale)Enum.Parse(typeof(GanttScale), GetProperty<string>(nameof(Scale)));
            set => SetProperty(nameof(Scale), value.ToString());
        }

        private ControlPropertyList<GanttSubScale> SubScales_;
        public IList<GanttSubScale> SubScales
        {
            get => SubScales_;
            set => SubScales_.Set(value as List<GanttSubScale> ?? value.ToList());
        }

        public bool OverrideGridCssWithGridColor { get; set; } = false;

        public delegate void OnItemResizedHandler(DataType item, DateTime oldStart, int oldDuration);
        public event OnItemResizedHandler OnItemResized;

        public delegate void OnItemMovedHandler(DataType item, DateTime oldStart);
        public event OnItemMovedHandler OnItemMoved;

        public delegate void OnItemProgressDraggedHandler(DataType item, float oldProgress);
        public event OnItemProgressDraggedHandler OnItemProgressDragged;

        public delegate void OnTaskDoubleClickedHandler(DataType task);
        public event OnTaskDoubleClickedHandler OnTaskDoubleClicked;


        public override void InitializeProperties()
        {
            base.InitializeProperties();

            Items_ = new ControlPropertyList<DataType>(this, nameof(Items));
            Columns_ = new ControlPropertyDictionary<GanttColumn>(this, nameof(Columns));
            Links_ = new ControlPropertyList<GanttLink>(this, nameof(Links));
            ResourceStore_ = new ControlPropertyList<GanttResource>(this, nameof(ResourceStore));
            SubScales_ = new ControlPropertyList<GanttSubScale>(this, nameof(SubScales));
            Scale = GanttScale.Month;
            Editable = false;
            ShowResourceSection = typeof(DataType).GetInterface(nameof(IGanttTaskWithResources), false) != null;
            RowHeight = null;
            GridWidth = 360; // default value of dhtmlx

            InitializeColumnsFromDataType();

            GetPropertyInternal(nameof(Items)).OnInstantNewValue += Gantt_OnItemsChanged;
        }

        protected override void ControlInitialized()
        {
            base.ControlInitialized();

            InternalStyles["." + Id + "_disp_none"] = new Dictionary<string, string>
            {
                ["display"] = "none !important"
            };
        }

        private Dictionary<System.Drawing.Color, int> AlreadyUsedGridColors = new Dictionary<System.Drawing.Color, int>();
        private void Gantt_OnItemsChanged(Core.Property property, object lastValue, object newValue, Core.Property.UpdateSource source)
        {
            if (OverrideGridCssWithGridColor && source == Core.Property.UpdateSource.Server)
            {
                foreach (var item in Items)
                {
                    if (item.GridColor != System.Drawing.Color.Empty)
                    {
                        if (!AlreadyUsedGridColors.TryGetValue(item.GridColor, out var index))
                        {
                            index = AlreadyUsedGridColors.Count;
                            AlreadyUsedGridColors.Add(item.GridColor, index);

                            InternalStyles["." + Id + "_color_" + index] = new Dictionary<string, string>
                            {
                                ["background-color"] = System.Drawing.ColorTranslator.ToHtml(item.GridColor)
                            };
                        }

                        item.GridCssClass = Id + "_color_" + index;
                    }
                }
            }
        }

        private void InitializeColumnsFromDataType()
        {
            Columns.AddRange(new Dictionary<string, GanttColumn>
            {
                ["Text"] = new GanttColumn()
                {
                    Field = "text",
                    Tree = true,
                    Text = "Name",
                    Width = "*",
                    Order = 0
                },
                ["StartDate"] = new GanttColumn()
                {
                    Field = "start_date",
                    Text = "Start",
                    Order = 1,
                    Width = "100",
                },
                ["Duration"] = new GanttColumn()
                {
                    Field = "duration",
                    Text = "Duration",
                    Width = "100",
                    Order = 2
                },
            });

            var fields = typeof(DataType)
                .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                .OfType<System.Reflection.MemberInfo>()
                .Concat(typeof(DataType).GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance));

            foreach (var field in fields)
            {
                var attribute = field.GetCustomAttributes(typeof(GanttColumnAttribute), false)?.FirstOrDefault() as GanttColumnAttribute;

                if (attribute == null)
                    continue;

                Columns[field.Name] = new GanttColumn()
                {
                    Field = field.Name,
                    Resize = attribute.Resize,
                    Width = attribute.Width,
                    Text = attribute.Text ?? field.Name,
                    AlignPosition = attribute.AlignPosition,
                    Order = attribute.Order
                };
            }
        }

#pragma warning disable IDE0051 // Remove unused private members
        [Core.CoreEvent]
        private void OnTaskDoubleClickedFromClient(int id)
        {
            var item = GetItem(id);

            OnTaskDoubleClicked?.Invoke(item);
        }
        [Core.CoreEvent]
        private void OnItemProgressionChangedFromClient(int id, float progression)
        {
            var item = GetItem(id);

            var oldProgression = item.Progress;
            item.Progress = progression;
            OnItemProgressDragged?.Invoke(item, oldProgression);
        }
        [Core.CoreEvent]
        private void OnItemDraggedFromClient(int id, string newStart, string newEnd, string mode)
        {
            var item = GetItem(id);
            var oldStart = item.StartDate;

            item.StartDate = DateTime.ParseExact(newStart, "dd-MM-yyyy", CultureInfo.InvariantCulture);

            if (mode == "resize")
            {
                var oldDuration = item.Duration;
                var end = DateTime.ParseExact(newEnd, "dd-MM-yyyy", CultureInfo.InvariantCulture);
                item.Duration = (int)(end - item.StartDate)?.TotalDays;

                OnItemResized?.Invoke(item, oldStart.Value, oldDuration.Value);
            }
            else if (mode == "move")
                OnItemMoved?.Invoke(item, oldStart.Value);
        }
#pragma warning restore IDE0051 // Remove unused private members

        public DataType GetItem(int id)
        {
            for (var i = 0; i < Items.Count; ++i)
            {
                if (Items[i].Id == id)
                    return Items[i];
            }
            throw new Exception("Item not found:" + id);
        }
        public GanttLink GetLink(int id)
        {
            for (var i = 0; i < Links.Count; ++i)
            {
                if (Links[i].Id == id)
                    return Links[i];
            }
            throw new Exception("Link not found:" + id);
        }
    }
}

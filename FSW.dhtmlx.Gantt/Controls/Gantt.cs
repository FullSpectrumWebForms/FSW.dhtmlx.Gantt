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

    public class GanttItem
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "text")]
        public string Text { get; set; }

        [JsonProperty(PropertyName = "start_date")]
        private string _StartDate;
        [JsonIgnore]
        public DateTime StartDate
        {
            get => DateTime.ParseExact(_StartDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);
            set => _StartDate = value.ToString("dd-MM-yyyy");
        }

        [JsonProperty(PropertyName = "duration")]
        public int Duration { get; set; }

        [JsonProperty(PropertyName = "order")]
        public int Order { get; set; }

        [JsonProperty(PropertyName = "progress")]
        public float Progress { get; set; }

        [JsonProperty(PropertyName = "open")]
        public bool Open { get; set; }

        [JsonProperty]
#pragma warning disable IDE0052 // Remove unread private members
        private int parent;
#pragma warning restore IDE0052 // Remove unread private members

        [JsonIgnore]
        private GanttItem _Parent;
        [JsonIgnore]
        public GanttItem Parent
        {
            get => _Parent;
            set
            {
                _Parent = value;
                parent = value.Id;
            }
        }

        [JsonProperty(PropertyName = "color")]
        private string color;
        [JsonIgnore]
        public System.Drawing.Color Color
        {
            get => string.IsNullOrEmpty(color) ? System.Drawing.Color.Empty : System.Drawing.ColorTranslator.FromHtml(color);
            set => color = value == System.Drawing.Color.Empty ? null : System.Drawing.ColorTranslator.ToHtml(value);
        }
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
    }
    public class GanttColumnAttribute: Attribute
    {
        public string Text { get; set; }

        public string Width { get; set; }

        public AlignPosition AlignPosition { get; set; } = AlignPosition.Left;

        public bool Resize;
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

        public int? RowHeight
        {
            get => GetProperty<int?>(PropertyName());
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

        public delegate void OnItemResizedHandler(DataType item, DateTime oldStart, int oldDuration);
        public event OnItemResizedHandler OnItemResized;

        public delegate void OnItemMovedHandler(DataType item, DateTime oldStart);
        public event OnItemMovedHandler OnItemMoved;

        public delegate void OnItemProgressDraggedHandler(DataType item, float oldProgress);
        public event OnItemProgressDraggedHandler OnItemProgressDragged;

        public override void InitializeProperties()
        {
            base.InitializeProperties();

            Items_ = new ControlPropertyList<DataType>(this, nameof(Items));
            Columns_ = new ControlPropertyDictionary<GanttColumn>(this, nameof(Columns));
            Links_ = new ControlPropertyList<GanttLink>(this, nameof(Links));
            SubScales_ = new ControlPropertyList<GanttSubScale>(this, nameof(SubScales));
            Scale = GanttScale.Month;
            RowHeight = null;

            InitializeColumnsFromDataType();
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
                    Width = "*"
                },
                ["StartDate"] = new GanttColumn()
                {
                    Field = "start_date",
                    Text = "Start"
                },
                ["Duration"] = new GanttColumn()
                {
                    Field = "duration",
                    Text = "Duration"
                },
            });

            var fields = typeof(DataType).GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            foreach( var field in fields )
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
                    AlignPosition = attribute.AlignPosition
                };
            }
        }

        [Core.CoreEvent]
#pragma warning disable IDE0051 // Remove unused private members
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
                item.Duration = (int)(end - item.StartDate).TotalDays;

                OnItemResized?.Invoke(item, oldStart, oldDuration);
            }
            else if (mode == "move")
                OnItemMoved?.Invoke(item, oldStart);
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

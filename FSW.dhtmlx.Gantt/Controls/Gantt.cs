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
        private int parent;
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
    }
    public enum GanttScale
    {
        Default = 0, Week = 1
    }

    public class Gantt : Controls.Html.HtmlControlBase
    {
        public override string ControlType => "dhtmlx.Gantt";
        public ControlPropertyList<GanttItem> Items { get; private set; }
        public ControlPropertyList<GanttLink> Links { get; private set; }

        public GanttScale Scale
        {
            get => (GanttScale)Enum.Parse(typeof(GanttScale), GetProperty<string>(nameof(Scale)));
            set => SetProperty(nameof(Scale), value.ToString());
        }

        public delegate void OnItemResizedHandler(GanttItem item, DateTime oldStart, int oldDuration);
        public event OnItemResizedHandler OnItemResized;

        public delegate void OnItemMovedHandler(GanttItem item, DateTime oldStart);
        public event OnItemMovedHandler OnItemMoved;

        public delegate void OnItemProgressDraggedHandler(GanttItem item, float oldProgress);
        public event OnItemProgressDraggedHandler OnItemProgressDragged;

        public override void InitializeProperties()
        {
            base.InitializeProperties();

            Items = new ControlPropertyList<GanttItem>(this, nameof(Items));
            Links = new ControlPropertyList<GanttLink>(this, nameof(Links));
            Scale = GanttScale.Default;
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
                item.Duration = (int)(end - item.StartDate).TotalDays;

                OnItemResized?.Invoke(item, oldStart, oldDuration);
            }
            else if (mode == "move")
                OnItemMoved?.Invoke(item, oldStart);
        }

        public GanttItem GetItem(int id)
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

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FSW.dhtmlx
{
    public class GanttResourceColumn
    {
        [JsonProperty(PropertyName = "name")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "label")]
        public string Text { get; set; }

        [JsonProperty(PropertyName = "tree")]
        public bool IsTree { get; set; }

        [JsonProperty(PropertyName = "width", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? Width { get; set; }

        [JsonProperty(PropertyName = "order")]
        public int Order { get; set; } = 1;

        [JsonProperty(PropertyName = "field")]
        public string Field { get; set; }

        [JsonProperty(PropertyName = nameof(AlignPosition))]
        private string AlignPosition_ = AlignPosition.Left.ToString().ToLower();

        [JsonIgnore]
        public AlignPosition AlignPosition
        {
            get => (AlignPosition)Enum.Parse(typeof(AlignPosition), AlignPosition_, true);
            set => AlignPosition_ = value.ToString().ToLower();
        }
    }

    public class GanttResourceAttribute : Attribute
    {
        public string Text { get; set; }

        public bool IsTree{ get; set; }

        public int Width { get; set; }

        public int Order { get; set; } = 1;

        public string Field { get; set; }

        public AlignPosition AlignPosition { get; set; } = AlignPosition.Left;
    }
}

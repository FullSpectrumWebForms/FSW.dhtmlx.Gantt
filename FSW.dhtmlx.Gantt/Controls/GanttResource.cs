using Newtonsoft.Json;

namespace FSW.dhtmlx
{
    public class GanttResource
    {
        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "text")]
        [GanttResource(AlignPosition = AlignPosition.Left, IsTree = true, Text = "Name", Field = "text", Order = 0)]
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
}

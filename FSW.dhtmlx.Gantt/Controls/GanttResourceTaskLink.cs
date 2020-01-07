using Newtonsoft.Json;
using System;
using System.Globalization;

namespace FSW.dhtmlx
{
    public class GanttResourceTaskLink
    {
#pragma warning disable IDE0052 // Remove unread private members

        [JsonProperty]
        private int resource_id;
        private GanttResource Resource_;
        [JsonIgnore]
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
        public string Text { get; set; }

        [JsonProperty(PropertyName = "Start")]
        protected string _Start;
        [JsonIgnore]
        public DateTime? Start
        {
            get => _Start == null ? null : (DateTime?)DateTime.ParseExact(_Start, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            set => _Start = value?.ToString("yyyy-MM-dd");
        }

        [JsonProperty(PropertyName = "Finish")]
        protected string _Finish;
        [JsonIgnore]
        public DateTime? Finish
        {
            get => _Finish == null ? null : (DateTime?)DateTime.ParseExact(_Finish, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            set => _Finish = value?.ToString("yyyy-MM-dd");
        }

#pragma warning restore IDE0052 // Remove unread private members
    }
}

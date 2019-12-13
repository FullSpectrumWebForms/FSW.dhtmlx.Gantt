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

        [JsonProperty(PropertyName = nameof(TotalWork))]
        private double TotalWork_;
        [JsonIgnore]
        public TimeSpan TotalWork
        {
            get => TimeSpan.FromHours(TotalWork_);
            set => this.TotalWork_ = value.TotalHours;
        }

#pragma warning restore IDE0052 // Remove unread private members
    }
}

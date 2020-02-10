using FSW.Utility;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace FSW.dhtmlx
{
    public class GanttDateTimeContainer<TValue> : IDictionary<DateTime, TValue>, ICollection<DateTime>
    {
        private bool WeekInsteadOfDays { get; }
        private ControlPropertyDictionary<TValue> InternalDictionary { get; }

        public GanttDateTimeContainer(Core.ControlBase control, string propertyName, bool weekInsteadOfDays)
        {
            InternalDictionary = new ControlPropertyDictionary<TValue>(control, propertyName);
            WeekInsteadOfDays = weekInsteadOfDays;
        }

        private string DateToString(DateTime date)
        {
            if( WeekInsteadOfDays )
                return date.AddDays(-(int)date.DayOfWeek).ToString("yyyy-MM-dd");
            else
                return date.ToString("yyyy-MM-dd");
        }

        private static DateTime StringToDate(string date) => DateTime.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

        public void Set(IDictionary<DateTime, TValue> dictionary)
        {
            InternalDictionary.Set(dictionary.ToDictionary(x => DateToString(x.Key), x => x.Value));
        }

        public void Add(DateTime key, TValue value)
        {
            InternalDictionary.Add(DateToString(key), value);
        }

        public bool ContainsKey(DateTime key)
        {
            return InternalDictionary.ContainsKey(DateToString(key));
        }

        public bool Remove(DateTime key)
        {
            return InternalDictionary.Remove(DateToString(key));
        }

        public bool TryGetValue(DateTime key, [MaybeNullWhen(false)] out TValue value)
        {
            return InternalDictionary.TryGetValue(DateToString(key), out value);
        }

        public void Add(KeyValuePair<DateTime, TValue> item)
        {
            InternalDictionary.Add(new KeyValuePair<string, TValue>(DateToString(item.Key), item.Value));
        }

        public void Clear()
        {
            InternalDictionary.Clear();
        }

        public bool Contains(KeyValuePair<DateTime, TValue> item)
        {
            return InternalDictionary.Contains(new KeyValuePair<string, TValue>(DateToString(item.Key), item.Value));
        }

        public void CopyTo(KeyValuePair<DateTime, TValue>[] array, int arrayIndex)
        {
            // not the most efficient, but it does the work
            var tempArray = InternalDictionary.Select(x => new KeyValuePair<DateTime, TValue>(StringToDate(x.Key), x.Value)).ToArray();
            tempArray.CopyTo(array, arrayIndex);
        }

        public bool Remove(KeyValuePair<DateTime, string> item)
        {
            return Remove(item.Key);
        }

        public IEnumerator<KeyValuePair<DateTime, TValue>> GetEnumerator()
        {
            return InternalDictionary.Select(x => new KeyValuePair<DateTime, TValue>(StringToDate(x.Key), x.Value)).GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return InternalDictionary.Select(x => new KeyValuePair<DateTime, TValue>(StringToDate(x.Key), x.Value)).GetEnumerator();
        }

        void ICollection<DateTime>.Add(DateTime item)
        {
            Add(item, default);
        }


        bool ICollection<DateTime>.Contains(DateTime item)
        {
            return InternalDictionary.Keys.Select(StringToDate).Contains(item);
        }

        void ICollection<DateTime>.CopyTo(DateTime[] array, int arrayIndex)
        {
            var tempArray = Keys.ToArray();
            tempArray.CopyTo(array, arrayIndex);
        }

        IEnumerator<DateTime> IEnumerable<DateTime>.GetEnumerator()
        {
            return InternalDictionary.Keys.Select(StringToDate).GetEnumerator();
        }

        public bool Remove(KeyValuePair<DateTime, TValue> item)
        {
            return Remove(item.Key);
        }

        public ICollection<DateTime> Keys => this;

        public ICollection<TValue> Values => InternalDictionary.Values;

        public int Count => InternalDictionary.Count;

        public bool IsReadOnly => false;


        public TValue this[DateTime key] 
        {
            get => InternalDictionary[DateToString(key)];
            set => InternalDictionary[DateToString(key)] = value;
        }
    }

}

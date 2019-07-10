using FSW.dhtmlx;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace Tests.Pages
{
    public class IndexModel : FSW.Core.FSWPage
    {

        public class CustomGanttItem : GanttItem, IGanttTaskWithResources
        {
            [GanttColumn]
            public float CustomCol;

            public List<GanttResourceTaskLink> Resources { get; set; }
        }

        private readonly Gantt<CustomGanttItem> TestGantt = new Gantt<CustomGanttItem>();

        public override void OnPageLoad()
        {
            base.OnPageLoad();

            TestGantt.Scale = GanttScale.Day;
            //TestGantt.RowHeight = 20;

            TestGantt.ResourceStore = new[]
            {
                new GanttResource()
                {
                    Id = 1,
                    Name = "Test 1",
                },
                new GanttResource()
                {
                    Id = 2,
                    Name = "Test 2",
                },
                new GanttResource()
                {
                    Id = 3,
                    Name = "Test 3",
                }
            };

            int id = 1;
            TestGantt.Items = new[]
            {
                new CustomGanttItem()
                {
                    Id = ++id,
                    CustomCol = 10,
                    Duration = 5,
                    Progress = 40,
                    Order = id,
                    Open = true,
                    Text = "Task 1",
                    ReadOnly = true,
                    StartDate = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 1 ),
                    Resources = new List<GanttResourceTaskLink>
                    {
                        new GanttResourceTaskLink()
                        {
                            Resource = TestGantt.ResourceStore.First( x=> x.Id == 1 ),
                            Start = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 2 ),
                            Finish = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 3 ),
                            Work = TimeSpan.FromHours(8)
                        },
                        new GanttResourceTaskLink()
                        {
                            Resource = TestGantt.ResourceStore.First( x=> x.Id == 1 ),
                            Start = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 3 ),
                            Finish = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 4 ),
                            Work = TimeSpan.FromHours(8)
                        },
                        new GanttResourceTaskLink()
                        {
                            Resource = TestGantt.ResourceStore.First( x=> x.Id == 1 ),
                            Start = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 4 ),
                            Finish = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 5 ),
                            Work = TimeSpan.FromHours(4)
                        },
                    }
                }
            };

            TestGantt.OnItemResized += TestGantt_OnItemResized;
            TestGantt.OnItemMoved += TestGantt_OnItemMoved;
            TestGantt.OnItemProgressDragged += TestGantt_OnItemProgressDragged;
        }

        private void TestGantt_OnItemProgressDragged(CustomGanttItem item, float oldProgress)
        {
            MessageBox.Success($"{item.Id}", $"progression changed to {item.Progress}");
        }

        private void TestGantt_OnItemMoved(CustomGanttItem item, DateTime oldStart)
        {
            MessageBox.Success($"{item.Id}", $"{item.StartDate?.ToShortDateString()}");
        }

        private void TestGantt_OnItemResized(CustomGanttItem item, DateTime oldStart, int oldDuration)
        {
            MessageBox.Success($"{item.Id}", $"{item.StartDate?.ToShortDateString()} for {item.Duration} days");
        }
    }
}
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

        public class CustomGanttResource : GanttResource
        {
            [GanttResource(AlignPosition = AlignPosition.Right, Text = "Work", Width = 250)]
            public string Work;
        }

        private readonly Gantt<CustomGanttItem, CustomGanttResource> TestGantt = new Gantt<CustomGanttItem, CustomGanttResource>();

        public override void OnPageLoad()
        {
            base.OnPageLoad();

            TestGantt.Scale = GanttScale.Day;
            //TestGantt.RowHeight = 20;

            var parent = new CustomGanttResource()
            {
                Id = 4,
                Name = "Parent",
                Work = "1"
            };

            TestGantt.ResourceStore = new[]
            {
                parent,
                new CustomGanttResource()
                {
                    Id = 1,
                    Name = "Test 1",
                    Work = "1",
                    Parent = parent
                },
                new CustomGanttResource()
                {
                    Id = 2,
                    Name = "Test 2",
                    Work = "2"
                },
                new CustomGanttResource()
                {
                    Id = 3,
                    Name = "Test 3",
                    Work = "3"
                }
            };

            TestGantt.TimeslotStyle[DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek + 4)] = "colTest";

            int id = 1;
            TestGantt.Items = new[]
            {
                new CustomGanttItem()
                {
                    Id = ++id,
                    CustomCol = 10,
                    Duration = 120,
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
                            Text = "<div>4</div>"
                        },
                        new GanttResourceTaskLink()
                        {
                            Resource = TestGantt.ResourceStore.First( x=> x.Id == 1 ),
                            Start = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 3 ),
                            Finish = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 4 ),
                            Text = "<div>8</div>"
                        },
                        new GanttResourceTaskLink()
                        {
                            Resource = TestGantt.ResourceStore.First( x=> x.Id == 3 ),
                            Start = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 60 ),
                            Finish = DateTime.Today.AddDays( -(int)DateTime.Today.DayOfWeek + 61 ),
                            Text = "<div>8</div>"
                        },
                    }
                }
            };

            TestGantt.AlwaysShowFirstTaskResources = true;
            TestGantt.ShowResourceSection = true;
            TestGantt.TimelineGravity = 1;
            TestGantt.ResourceGravity = 9999;
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
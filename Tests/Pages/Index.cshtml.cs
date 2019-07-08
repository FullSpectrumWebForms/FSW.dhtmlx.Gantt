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

            //TestGantt.Scale = GanttScale.Week;
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

            var project2 = new CustomGanttItem
            {
                Id = 1,
                Color = Color.LightGreen,
                Text = "Project #2",
                StartDate = DateTime.Today,
                Duration = 18,
                Order = 10,
                Progress = 0.4f,
                Open = true,
                CustomCol = 666
            };

            int id = 1;
            TestGantt.Items = new[] { project2 }.Concat( Enumerable.Range(0, 10).SelectMany(_ =>
            {
                return new List<CustomGanttItem>
                {
                    new CustomGanttItem
                    {
                        Id = ++id,
                        Text = "Task #1",
                        StartDate = DateTime.Today.Add(TimeSpan.FromDays(1)),
                        Color = System.Drawing.Color.Red,
                        Duration = 8,
                        Order = 10,
                        Progress = 0.6f,
                        Parent = project2,
                        CustomCol = id,
                        Resources = new List<GanttResourceTaskLink>()
                        {
                            new GanttResourceTaskLink()
                            {
                                Resource = TestGantt.ResourceStore.First( x => x.Id == 1 ),
                                Work = TimeSpan.FromHours(32)
                            }
                        }
                    },
                    new CustomGanttItem
                    {
                        Id = ++id,
                        Text = "Task #2",
                        StartDate = DateTime.Today.Add(TimeSpan.FromDays(5)),
                        Duration = 8,
                        Order = 20,
                        Progress = 0.6f,
                        Parent = project2,
                        CustomCol = id
                    },
                    new CustomGanttItem
                    {
                        Id = ++id,
                        Text = "Task #3",
                        Order = 20,
                        Parent = project2,
                        CustomCol = id,
                        Color = System.Drawing.Color.Transparent
                    }
                };
            })).ToList();
            TestGantt.Links = new List<GanttLink>
            {
                new GanttLink
                {
                    Id = 1,
                    Source = TestGantt.GetItem(2),
                    Target = TestGantt.GetItem(3)
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
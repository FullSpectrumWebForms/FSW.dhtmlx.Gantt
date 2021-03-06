/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />
var globalGantt;
if (typeof Gantt !== 'undefined')
    globalGantt = Gantt;
else
    globalGantt = null;
var controls;
(function (controls) {
    var html;
    (function (html) {
        var dhtmlx;
        (function (dhtmlx) {
            class Gantt extends controls.html.htmlControlBase {
                constructor() {
                    super(...arguments);
                    this.events = [];
                    this.isInit = false;
                    this.isPro = false;
                    this.workBuffer = {};
                    this.allResourceDic = {};
                }
                // ------------------------------------------------------------------------   Items
                get Items() {
                    return this.getPropertyValue("Items");
                }
                // ------------------------------------------------------------------------   Links
                get Links() {
                    return this.getPropertyValue("Links");
                }
                // ------------------------------------------------------------------------   ResourceStore
                get ResourceStore() {
                    return this.getPropertyValue("ResourceStore");
                }
                // ------------------------------------------------------------------------   Columns
                get Columns() {
                    return this.getPropertyValue("Columns");
                }
                // ------------------------------------------------------------------------   Items
                get Scale() {
                    return this.getPropertyValue("Scale");
                }
                get SubScales() {
                    return this.getPropertyValue("SubScales");
                }
                get Editable() {
                    return this.getPropertyValue("Editable");
                }
                get ShowResourceSection() {
                    return this.getPropertyValue("ShowResourceSection");
                }
                get RowHeight() {
                    return this.getPropertyValue("RowHeight");
                }
                get GridWidth() {
                    return this.getPropertyValue("GridWidth");
                }
                initialize(type, index, id, properties) {
                    super.initialize(type, index, id, properties);
                    let that = this;
                    if (globalGantt && globalGantt.getGanttInstance) {
                        this.gantt = globalGantt.getGanttInstance();
                        this.isPro = true;
                    }
                    else
                        this.gantt = gantt;
                    if (this.RowHeight)
                        this.gantt.config.row_height = this.RowHeight;
                    this.gantt.config.grid_width = this.GridWidth;
                    this.events.push(this.gantt.attachEvent("onTaskDblClick", this.onTaskDoubleClicked.bind(this)));
                    this.events.push(this.gantt.attachEvent("onTaskClick", this.onTaskClicked.bind(this)));
                    this.events.push(this.gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this)));
                    if (this.ShowResourceSection && this.isPro) {
                        let computeWork = function (resource, start, end) {
                            let startStr;
                            if (start && end) {
                                startStr = start.toLocaleDateString();
                                let buffer = that.workBuffer[resource.id];
                                if (buffer) {
                                    let work = buffer[startStr];
                                    if (work || work == 0)
                                        return work;
                                }
                                end = moment(start).add(that.gantt.config.subscales[0].step, that.gantt.config.subscales[0].unit).toDate();
                            }
                            var taskId = that.gantt.getSelectedId();
                            if (!taskId)
                                return 0;
                            let task = that.gantt.getTask(taskId);
                            var totalWork = 0;
                            for (let j = 0; j < (task.Resources || []).length; ++j) {
                                let cResource = task.Resources[j];
                                if (cResource.resource_id == resource.id) {
                                    let s = (start && end) ? moment(cResource.StartParsed) : null;
                                    let f = (start && end) ? moment(cResource.FinishParsed) : null;
                                    if (((start && end) && (s.isBetween(start, end) ||
                                        f.isBetween(start, end) ||
                                        s.isSame(start))) || !(start && end)) {
                                        totalWork += cResource.value;
                                    }
                                }
                            }
                            if (start && end) {
                                let buffer = that.workBuffer[resource.id];
                                if (!buffer)
                                    buffer = that.workBuffer[resource.id] = {};
                                buffer[startStr] = totalWork;
                            }
                            return totalWork;
                        };
                        this.gantt.templates.rightside_text = function (start, end, task) {
                            if (task.type == gantt.config.types.milestone) {
                                return task.text;
                            }
                            return "";
                        };
                        this.gantt.config.resource_property = 'Resources';
                        this.gantt.config.resource_store = "resource";
                        this.gantt.config.order_branch = true;
                        let calcStartEnd = function (resources, specificResource) {
                            if (specificResource) {
                                let resourcesToUse = [];
                                for (let i = 0; i < resources.length; ++i) {
                                    if (resources[i].resource_id == specificResource.id)
                                        resourcesToUse.push(resources[i]);
                                }
                                resources = resourcesToUse;
                            }
                            let min;
                            let max;
                            let sumTotal = 0;
                            let sumRemaining = 0;
                            for (let i = 0; i < resources.length; ++i) {
                                let start = moment(resources[i].StartParsed);
                                let end = moment(resources[i].FinishParsed);
                                if (!min || start < min)
                                    min = start;
                                if (!max || end > max)
                                    max = end;
                                sumRemaining += resources[i].value;
                                sumTotal += resources[i].TotalWork;
                            }
                            return {
                                min,
                                max,
                                sumRemaining,
                                sumTotal
                            };
                        };
                        var resourceConfig = {
                            columns: [
                                {
                                    name: "name", label: "Name", tree: true, template: function (resource) {
                                        return resource.text;
                                    }
                                },
                                {
                                    name: 'start', label: 'Début', align: "right", width: 80, template: function (resource) {
                                        let taskId = that.gantt.getSelectedId();
                                        if (!taskId)
                                            return '';
                                        let task = that.gantt.getTask(taskId);
                                        let resources = task.Resources;
                                        return moment(calcStartEnd(resources).min).format('YYYY-MM-DD');
                                    }
                                },
                                {
                                    name: 'end', label: 'Fin', align: "right", width: 80, template: function (resource) {
                                        let taskId = that.gantt.getSelectedId();
                                        if (!taskId)
                                            return '';
                                        let task = that.gantt.getTask(taskId);
                                        let resources = task.Resources;
                                        return moment(calcStartEnd(resources).max).format('YYYY-MM-DD');
                                    }
                                },
                                {
                                    name: 'progression', label: '% W. Compl.', align: "right", width: 70, template: function (resource) {
                                        let taskId = that.gantt.getSelectedId();
                                        if (!taskId)
                                            return '';
                                        let task = that.gantt.getTask(taskId);
                                        let resources = task.Resources;
                                        if (task.Resources) {
                                            let info = calcStartEnd(resources, resource);
                                            return Math.round((100 - info.sumRemaining * 100 / info.sumTotal) * 10) / 10 + '%';
                                        }
                                        return '';
                                    }
                                },
                                {
                                    name: "workload", label: "Work", align: "right", width: 65, template: function (resource) {
                                        let taskId = that.gantt.getSelectedId();
                                        if (!taskId)
                                            return '';
                                        let task = that.gantt.getTask(taskId);
                                        let resources = task.Resources;
                                        let info = calcStartEnd(resources, resource);
                                        return (Math.round((info.sumTotal * 10) || 0) / 10) + "h";
                                    }
                                },
                                {
                                    name: "workload", label: "Rem. Work", align: "right", width: 65, template: function (resource) {
                                        let taskId = that.gantt.getSelectedId();
                                        if (!taskId)
                                            return '';
                                        let task = that.gantt.getTask(taskId);
                                        let resources = task.Resources;
                                        let info = calcStartEnd(resources, resource);
                                        return (Math.round((info.sumRemaining * 10) || 0) / 10) + "h";
                                    }
                                }
                            ]
                        };
                        this.gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {
                            let totalWork = computeWork(resource, start_date, end_date);
                            let res = (Math.round(totalWork * 10) / 10);
                            if (res == 0)
                                return '';
                            else
                                return "<div>" + res + "</div>";
                        };
                        this.gantt.templates.resource_cell_class = function (start_date, end_date, resource, tasks) {
                            let totalWork = computeWork(resource, start_date, end_date);
                            let nbDays = moment.duration(moment(end_date).diff(moment(start_date))).asDays();
                            let totalWorkPerDay = totalWork / nbDays;
                            var css = [];
                            css.push("resource_marker");
                            //if (totalWorkPerDay <= 8) {
                            css.push("workday_ok");
                            //} else {
                            //    css.push("workday_over");
                            //}
                            return css.join(" ");
                        };
                        this.gantt.config.layout = {
                            css: "gantt_container",
                            rows: [
                                {
                                    cols: [
                                        { view: "grid", group: "grids", scrollY: "scrollVer" },
                                        { resizer: true, width: 1 },
                                        { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                                        { view: "scrollbar", id: "scrollVer", group: "vertical" }
                                    ],
                                    gravity: 2
                                },
                                { resizer: true, width: 1 },
                                {
                                    config: resourceConfig,
                                    cols: [
                                        { view: "resourceGrid", group: "grids", width: 435, scrollY: "resourceVScroll" },
                                        { resizer: true, width: 1 },
                                        { view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll" },
                                        { view: "scrollbar", id: "resourceVScroll", group: "vertical" }
                                    ],
                                    gravity: 1
                                },
                                { view: "scrollbar", id: "scrollHor" }
                            ]
                        };
                    }
                    var resourcesStore = this.gantt.createDatastore({
                        name: that.gantt.config.resource_store,
                        type: "treeDatastore",
                        initItem: function (item) {
                            item.parent = item.parent || that.gantt.config.root_id;
                            item[that.gantt.config.resource_property] = item.parent;
                            item.open = true;
                            return item;
                        }
                    });
                    this.gantt.init(this.element[0]);
                    this.getProperty("Editable").onChangedFromServer.register(this.onEditableChangedFromServer.bind(this));
                    this.getProperty("GridWidth").onChangedFromServer.register(this.onGridWidthChangedFromServer.bind(this));
                    this.getProperty("Columns").onChangedFromServer.register(this.onColumnsChangedFromServer.bind(this), true);
                    this.getProperty("Scale").onChangedFromServer.register(this.onScaleChangeFromServer.bind(this));
                    this.getProperty("SubScales").onChangedFromServer.register(this.onScaleChangeFromServer.bind(this), true);
                    this.getProperty("Items").onChangedFromServer.register(this.onItemsChangedFromServer.bind(this));
                    this.getProperty("Links").onChangedFromServer.register(this.onLinksChangedFromServer.bind(this), true);
                    this.getProperty("ResourceStore").onChangedFromServer.register(this.onResourceStoreChangedFromServer.bind(this), true);
                    this.isInit = true;
                    this.gantt.templates.grid_row_class = function (start, end, task) {
                        return task.GridCssClass;
                    };
                    this.gantt.templates.task_class = function (start, end, task) {
                        if (task.color == 'Transparent' || task.color == 'transparent')
                            return that.id + '_' + 'disp_none';
                    };
                    this.gantt.render();
                }
                removeControl() {
                    while (this.events.length)
                        this.gantt.detachEvent(this.events.pop());
                }
                reRender() {
                    this.gantt.render();
                }
                onScaleChangeFromServer() {
                    if (this.Scale == 'Month') {
                        this.gantt.config.subscales = [{ unit: 'week', step: 1, date: '%F %d' }];
                        this.gantt.config.scale_unit = 'month';
                        this.gantt.config.date_scale = '%F';
                    }
                    else if (this.Scale == 'Week') {
                        this.gantt.config.subscales = [{ unit: 'day', step: 1, date: '%D' }];
                        this.gantt.config.scale_unit = 'week';
                        this.gantt.config.date_scale = '%d';
                    }
                    else if (this.Scale == 'Year') {
                        this.gantt.config.subscales = [{ unit: 'month', step: 1, date: '%M' }];
                        this.gantt.config.scale_unit = 'year';
                        this.gantt.config.date_scale = '%Y';
                    }
                    // if 0, just keep othe default scale
                    if (this.SubScales.length > 0) {
                        this.gantt.config.subscales = [];
                        for (let i = 0; i < this.SubScales.length; ++i) {
                            let subScale = $.extend({}, this.SubScales[i]);
                            this.gantt.config.subscales.push(subScale);
                            if (subScale.unit == 'week')
                                subScale.date = '%M %d';
                            else if (subScale.unit == 'day')
                                subScale.date = '%M %d';
                            else if (subScale.unit == 'year')
                                subScale.date = '%M %d';
                        }
                    }
                    if (this.isInit)
                        this.reRender();
                }
                onAfterTaskDrag(id, mode) {
                    var task = this.gantt.getTask(id);
                    if (mode == this.gantt.config.drag_mode.progress) {
                        this.customControlEvent('OnItemProgressionChangedFromClient', {
                            id: id,
                            progression: task.progress
                        });
                    }
                    else {
                        var convert = this.gantt.date.date_to_str("%d-%m-%Y");
                        var s = convert(task.start_date);
                        var e = convert(task.end_date);
                        this.customControlEvent('OnItemDraggedFromClient', {
                            id: id,
                            newStart: s,
                            newEnd: e,
                            mode: mode
                        });
                    }
                }
                doParse() {
                    this.workBuffer = {};
                    for (let i = 0; i < this.Items.length; ++i) {
                        let item = this.Items[i];
                        if (item.Resources) {
                            for (let j = 0; j < item.Resources.length; ++j) {
                                let resource = item.Resources[j];
                                resource.StartParsed = moment(resource.Start, 'DD-MM-YYYY').toDate();
                                resource.FinishParsed = moment(resource.Finish, 'DD-MM-YYYY').toDate();
                            }
                        }
                    }
                    this.gantt.clearAll();
                    this.gantt.parse({
                        data: this.Items,
                        links: this.Links
                    });
                    this.onResourceStoreChangedFromServer();
                }
                onItemsChangedFromServer() {
                    this.doParse();
                }
                onLinksChangedFromServer() {
                    this.doParse();
                }
                onEditableChangedFromServer() {
                    this.gantt.config.readonly = !this.Editable;
                }
                onGridWidthChangedFromServer() {
                    this.gantt.config.grid_width = this.GridWidth;
                    this.gantt.render();
                }
                onResourceStoreChangedFromServer() {
                    this.allResourceDic = {};
                    for (let i = 0; i < this.ResourceStore.length; ++i) {
                        let resource = this.ResourceStore[i];
                        this.allResourceDic[resource.id] = resource;
                    }
                    this.onTaskClicked(this.gantt.getSelectedId());
                    this.gantt.render();
                }
                onTaskDoubleClicked(id) {
                    this.workBuffer = {};
                    if (id)
                        this.customControlEvent('OnTaskDoubleClickedFromClient', { id });
                }
                onTaskClicked(id) {
                    if (id == this.gantt.getSelectedId())
                        return true;
                    this.workBuffer = {};
                    if (id) {
                        this.customControlEvent('OnTaskClickedFromClient', { id });
                        let task = this.gantt.getTask(id);
                        let allResources = [];
                        if (task.Resources) {
                            for (let i = 0; i < task.Resources.length; ++i)
                                allResources.push(this.allResourceDic[task.Resources[i].resource_id]);
                        }
                        this.selectedTaskResource = allResources;
                    }
                    else
                        this.selectedTaskResource = this.ResourceStore;
                    var store = this.gantt.getDatastore(gantt.config.resource_store);
                    store.clearAll();
                    let that = this;
                    setTimeout(function () {
                        store.parse(that.selectedTaskResource);
                    }, 1);
                    return true;
                }
                onColumnsChangedFromServer() {
                    let columns = [];
                    let columnsFromServer = this.Columns;
                    let keys = Object.keys(columnsFromServer);
                    for (let i = 0; i < keys.length; ++i) {
                        var col = columnsFromServer[keys[i]];
                        let width;
                        try {
                            width = parseInt(col.Width);
                        }
                        catch (e) {
                            width = col.Width;
                        }
                        let template = null;
                        if (col.Template) {
                            let that = this;
                            template = function (item) {
                                return item[this] || "";
                            }.bind(col.Template);
                        }
                        columns.push({
                            name: col.Field,
                            label: col.Text,
                            width: width,
                            align: col.AlignPosition,
                            tree: col.Tree,
                            resize: col.Resize,
                            order: col.Order,
                            template: template
                        });
                    }
                    this.gantt.config.columns = columns.sort((a, b) => a.order < b.order ? -1 : a.order == b.order ? 0 : 1);
                    this.gantt.render();
                }
                initializeHtmlElement() {
                    this.element = $('<div></div>');
                    this.appendElementToParent();
                }
            }
            dhtmlx.Gantt = Gantt;
        })(dhtmlx = html.dhtmlx || (html.dhtmlx = {}));
    })(html = controls.html || (controls.html = {}));
})(controls || (controls = {}));
core.controlTypes['dhtmlx.Gantt'] = () => new controls.html.dhtmlx.Gantt();
//# sourceMappingURL=Gantt.js.map
/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />

declare var Gantt: GanttEnterprise;
var globalGantt: GanttEnterprise;
if (typeof Gantt !== 'undefined')
    globalGantt = Gantt;
else
    globalGantt = null;
declare var moment: any;

namespace controls.html.dhtmlx {


    interface GanttItem {
        id: number;
        text: string;
        start_date: string;
        duration: number;
        order: number;
        progress: number;
        parent: number;
        open: boolean;
        color: string;
        GridCssClass: string;
        readonly: boolean;
        Resources?: GanttResourceTaskLink[];
    }

    interface GanttLink {
        id: number;
        source: number;
        target: number;
        type: string;
        readonly?: boolean;
        editable?: boolean;
    }

    interface GanttColumn {
        Text: string;

        Field: string;

        Width: string;

        AlignPosition: 'left' | 'right' | 'center';

        Tree?: boolean;

        Resize: Boolean;

        Order: number;
    }

    interface GanttResource {
        id: number;

        text: string;

        parent: number;
    }
    interface GanttResourceTaskLink {
        resource_id: number;

        value: number;

        StartParsed?: Date;
        Start: string;

        FinishParsed?: Date;
        Finish: string;
    }

    export class Gantt extends controls.html.htmlControlBase {

        // ------------------------------------------------------------------------   Items
        get Items(): GanttItem[] {
            return this.getPropertyValue<this, GanttItem[]>("Items");
        }
        // ------------------------------------------------------------------------   Links
        get Links(): GanttLink[] {
            return this.getPropertyValue<this, GanttLink[]>("Links");
        }
        // ------------------------------------------------------------------------   ResourceStore
        get ResourceStore(): GanttResource[] {
            return this.getPropertyValue<this, GanttResource[]>("ResourceStore");
        }
        // ------------------------------------------------------------------------   Columns
        get Columns(): { [key: string]: GanttColumn } {
            return this.getPropertyValue<this, { [key: string]: GanttColumn }>("Columns");
        }
        // ------------------------------------------------------------------------   Items
        get Scale(): string {
            return this.getPropertyValue<this, string>("Scale");
        }

        get SubScales(): any[] {
            return this.getPropertyValue<this, any[]>("SubScales");
        }
        get Editable(): boolean {
            return this.getPropertyValue<this, boolean>("Editable");
        }
        get ShowResourceSection(): boolean {
            return this.getPropertyValue<this, boolean>("ShowResourceSection");
        }

        get RowHeight(): number {
            return this.getPropertyValue<this, number>("RowHeight");
        }
        get GridWidth(): number {
            return this.getPropertyValue<this, number>("GridWidth");
        }
        events: any[] = [];

        gantt: GanttStatic;

        isInit = false;
        isPro = false;

        workBuffer: { [id: number]: { [date: string]: number } } = {};
        initialize(type: string, index: number, id: string, properties: { property: string, value: any }[]) {
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

            this.events.push(this.gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this)));

            if (this.ShowResourceSection && this.isPro) {

                let computeWork = function (resource: GanttResource, start?: Date, end?: Date) {

                    let startStr: string;
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
                    var tasks = that.Items;

                    var totalWork = 0;
                    for (var i = 0; i < tasks.length; i++) {

                        let task = tasks[i];
                        for (let j = 0; j < (task.Resources || []).length; ++j) {
                            let cResource = task.Resources[j];
                            if (cResource.resource_id == resource.id) {
                                let s = moment(cResource.StartParsed);
                                let f = moment(cResource.FinishParsed);
                                if (((start && end) && (
                                    s.isBetween(start, end) ||
                                    f.isBetween(start, end) ||
                                    s.isSame(start) ||
                                    s.isSame(end))) || !(start && end)) {

                                    totalWork += cResource.value;
                                }
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


                this.gantt.config.resource_property = 'Resources';
                this.gantt.config.resource_store = "resource";
                this.gantt.config.order_branch = true;
                var resourceConfig = {
                    columns: [
                        {
                            name: "name", label: "Name", tree: true, template: function (resource) {
                                return resource.text;
                            }
                        },
                        {
                            name: "workload", label: "Workload", template: function (resource) {

                                var totalWork = computeWork(resource);

                                return (Math.round((totalWork * 10) || 0) / 10) + "h";
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
                    if (totalWorkPerDay <= 8) {
                        css.push("workday_ok");
                    } else {
                        css.push("workday_over");
                    }
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

            this.gantt.templates.grid_row_class = function (start, end, task: GanttItem) {
                return task.GridCssClass;
            } as any;
            this.gantt.templates.task_class = function (start, end, task: GanttItem) {
                if (task.color == 'Transparent' || task.color == 'transparent')
                    return that.id + '_' + 'disp_none';
            } as any;

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
            } else {
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
            var store = this.gantt.getDatastore(gantt.config.resource_store);
            store.parse(this.ResourceStore);

            this.workBuffer = {};

            this.gantt.render();
        }

        onTaskDoubleClicked(id) {
            if (id)
                this.customControlEvent('OnTaskDoubleClickedFromClient', { id });
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
                columns.push({
                    name: col.Field,
                    label: col.Text,
                    width: width,
                    align: col.AlignPosition,
                    tree: col.Tree,
                    resize: col.Resize,
                    order: col.Order
                });
            }

            this.gantt.config.columns = columns.sort((a, b) => a.order < b.order ? -1 : a.order == b.order ? 0 : 1);

            this.gantt.render();
        }

        protected initializeHtmlElement(): void {
            this.element = $('<div></div>');
            this.appendElementToParent();
        }

    }
}
core.controlTypes['dhtmlx.Gantt'] = () => new controls.html.dhtmlx.Gantt();
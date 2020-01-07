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
        type: string;
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

        Template: string;
    }

    interface GanttResourceColumn {
        name: string;

        text: string;

        field: string;

        width: string;

        align: 'left' | 'right' | 'center';

        tree?: boolean;
    }

    interface GanttResource {
        id: number;

        text: string;

        parent: number;

        GridRowCss?: string;

        RowCss?: string;
    }
    interface GanttResourceTaskLink {
        resource_id: number;

        Text: string;

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
        // ------------------------------------------------------------------------   ResourceColumns
        get ResourceColumns(): { [key: string]: GanttResourceColumn } {
            return this.getPropertyValue<this, { [key: string]: GanttResourceColumn }>("ResourceColumns");
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
        get TimelineGravity(): number {
            return this.getPropertyValue<this, number>("TimelineGravity");
        }
        get ResourceGravity(): number {
            return this.getPropertyValue<this, number>("ResourceGravity");
        }
        get RowHeight(): number {
            return this.getPropertyValue<this, number>("RowHeight");
        }
        get GridWidth(): number {
            return this.getPropertyValue<this, number>("GridWidth");
        }
        get AlwaysShowFirstTaskResources(): boolean {
            return this.getPropertyValue<this, boolean>("AlwaysShowFirstTaskResources");
        }
        events: any[] = [];

        gantt: GanttStatic;

        isInit = false;
        isPro = false;

        workBuffer: { [id: number]: { [date: string]: string } } = {};
        selectedTaskResource: GanttResource[];
        allResourceDic: { [id: string]: GanttResource } = {};
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
            this.events.push(this.gantt.attachEvent("onTaskClick", this.onTaskClicked.bind(this)));

            this.events.push(this.gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this)));
            this.events.push(this.gantt.attachEvent("onGanttScroll", this.doScroll.bind(this)));

            if (this.ShowResourceSection && this.isPro) {

                let computeWork = function (resource: GanttResource, start?: Date, end?: Date) {

                    let startStr: string;
                    if (start && end) {
                        startStr = start.toLocaleDateString();
                        let buffer = that.workBuffer[resource.id];
                        if (buffer) {
                            let text = buffer[startStr];
                            if (text)
                                return text;
                        }
                        let step: string, unit: string;
                        if (!that.gantt.config.subscales || !(that.gantt.config.subscales.length > 0)) {
                            step = (that.gantt.config as any).scales[0].step;
                            unit = (that.gantt.config as any).scales[0].unit;
                        }
                        else {
                            step = that.gantt.config.subscales[0].step;
                            unit = that.gantt.config.subscales[0].unit;
                        }
                        end = moment(start).add(step, unit).toDate();
                    }

                    let task: GanttItem;
                    if (!that.AlwaysShowFirstTaskResources) {
                        var taskId = that.gantt.getSelectedId();
                        if (!taskId)
                            return '';
                        task = that.gantt.getTask(taskId);
                    }
                    else
                        task = that.gantt.getTaskByIndex(0);

                    let text: string;
                    for (let j = 0; j < (task.Resources || []).length; ++j) {
                        let cResource = task.Resources[j];
                        if (cResource.resource_id == resource.id) {
                            let s = (start && end) ? moment(cResource.StartParsed) : null;
                            let f = (start && end) ? moment(cResource.FinishParsed) : null;
                            if (((start && end) && (
                                s.isBetween(start, end) ||
                                f.isBetween(start, end) ||
                                s.isSame(start))) || !(start && end)) {

                                text = cResource.Text;
                                break;
                            }
                        }
                    }

                    if (start && end) {
                        let buffer = that.workBuffer[resource.id];
                        if (!buffer)
                            buffer = that.workBuffer[resource.id] = {};

                        buffer[startStr] = text;
                    }

                    return text;
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

                this.gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {

                    let totalWork = computeWork(resource, start_date, end_date);

                    return totalWork;
                };


                let rows: any[] = [];

                rows.push({
                    cols: [
                        { view: "grid", group: "grids", scrollY: "scrollVer" },
                        { resizer: true, width: 1 },
                        { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                        { view: "scrollbar", id: "scrollVer", group: "vertical" }
                    ],
                    gravity: that.TimelineGravity
                });

                if (that.ShowResourceSection) {
                    rows.push({ resizer: true, width: 1 });
                    rows.push({
                        config: { columns: [] },
                        templates: {
                            grid_row_class: function (start, end, resource: GanttResource) {
                                return resource.GridRowCss;
                            },
                            task_row_class: function (start, end, resource: GanttResource) {
                                return resource.RowCss;
                            }
                        },
                        cols: [
                            { view: "resourceGrid", group: "grids", width: 435, scrollY: "resourceVScroll" },
                            { resizer: true, width: 1 },
                            { view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVScroll" },
                            { view: "scrollbar", id: "resourceVScroll", group: "vertical" }
                        ],
                        gravity: that.ResourceGravity
                    });

                }
                rows.push({ view: "scrollbar", id: "scrollHor" });

                this.gantt.config.layout = {
                    css: "gantt_container",
                    rows: rows
                };
                this.gantt.createDatastore({
                    name: that.gantt.config.resource_store,
                    type: "treeDatastore",
                    initItem: function (item) {
                        item.parent = item.parent || that.gantt.config.root_id;
                        item[that.gantt.config.resource_property] = item.parent;
                        item.open = true;
                        return item;
                    }
                });

            }

            this.gantt.init(this.element[0]);
            
            this.getProperty("Editable").onChangedFromServer.register(this.onEditableChangedFromServer.bind(this));
            this.getProperty("GridWidth").onChangedFromServer.register(this.onGridWidthChangedFromServer.bind(this));
            this.getProperty("Columns").onChangedFromServer.register(this.onColumnsChangedFromServer.bind(this));
            this.getProperty("ResourceColumns").onChangedFromServer.register(this.onColumnsChangedFromServer.bind(this), true);
            this.getProperty("Scale").onChangedFromServer.register(this.onScaleChangeFromServer.bind(this));
            this.getProperty("SubScales").onChangedFromServer.register(this.onScaleChangeFromServer.bind(this), true);
            this.getProperty("Items").onChangedFromServer.register(this.onItemsChangedFromServer.bind(this));
            this.getProperty("Links").onChangedFromServer.register(this.onLinksChangedFromServer.bind(this), true);
            this.getProperty("ResourceStore").onChangedFromServer.register(this.onResourceStoreChangedFromServer.bind(this), true);


            this.gantt.templates.grid_row_class = function (start, end, task: GanttItem) {
                return task.GridCssClass;
            } as any;
            this.gantt.templates.task_class = function (start, end, task: GanttItem) {
                if (task.color == 'Transparent' || task.color == 'transparent')
                    return that.id + '_' + 'disp_none';
            } as any;

            this.isInit = true;

            this.gantt.init(this.element[0]);
            this.gantt.render();
        }

        removeControl() {
            while (this.events.length)
                this.gantt.detachEvent(this.events.pop());
        }

        render() {
            this.gantt.render();
        }
        lastLeft = 0;
        doScroll(left: number, top: number) {
            if ((left - this.lastLeft) > 30 || (left - this.lastLeft) < -30) {
                this.lastLeft = left;
                this.render();
            }
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
                this.render();
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

                        resource.StartParsed = moment(resource.Start, 'YYYY-MM-DD').toDate();
                        resource.FinishParsed = moment(resource.Finish, 'YYYY-MM-DD').toDate();
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
            if (this.AlwaysShowFirstTaskResources) {
                var store = this.gantt.getDatastore(gantt.config.resource_store);

                store.clearAll();
                let that = this;
                setTimeout(function () {
                    store.parse(that.ResourceStore);

                    that.init();
                }, 1);
            }
            else {

                this.allResourceDic = {};
                for (let i = 0; i < this.ResourceStore.length; ++i) {
                    let resource = this.ResourceStore[i];
                    this.allResourceDic[resource.id] = resource;
                }

                this.onTaskClicked(this.gantt.getSelectedId(), true);
            }
        }

        onTaskDoubleClicked(id) {
            this.workBuffer = {};
            if (id)
                this.customControlEvent('OnTaskDoubleClickedFromClient', { id });
        }

        onTaskClicked(id: string, forceClick?: boolean) {
            if (!forceClick && (id == this.gantt.getSelectedId() || this.AlwaysShowFirstTaskResources)) // if we don't even show the timeline, ignore the error
                return true;

            this.workBuffer = {};
            if (id) {
                this.customControlEvent('OnTaskClickedFromClient', { id });

                let task: GanttItem = this.gantt.getTask(id);

                let allResources: GanttResource[] = [];
                if (task.Resources) {
                    for (let i = 0; i < task.Resources.length; ++i)
                        allResources.push(this.allResourceDic[task.Resources[i].resource_id]);
                }
                this.selectedTaskResource = allResources;
            }
            else
                this.selectedTaskResource = this.ResourceStore;

            if (this.ShowResourceSection) { // parse the resource section if it is showned

                var store = this.gantt.getDatastore(gantt.config.resource_store);
                store.clearAll();
                let that = this;
                setTimeout(function () {
                    store.parse(that.selectedTaskResource);
                    that.gantt.render();
                }, 1);
            }

            return true;
        }
        onColumnsChangedFromServer() {

            let columns = [];

            let columnsFromServer = this.Columns;

            let keys = Object.keys(columnsFromServer);
            for (let i = 0; i < keys.length; ++i) {

                let col = columnsFromServer[keys[i]];
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
                    }.bind(col.Template)
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

            let resourceConfig = { columns: [] };

            let resourceColsFromServer = this.ResourceColumns;

            keys = Object.keys(resourceColsFromServer);
            for (let i = 0; i < keys.length; ++i) {
                let col = $.extend({}, resourceColsFromServer[keys[i]]);
                let field = resourceColsFromServer[keys[i]].field;

                (col as any).template = function (resource: GanttResource) {
                    return resource[field];
                };

                resourceConfig.columns.push(col);
            }
            resourceConfig.columns = resourceConfig.columns.sort((a, b) => a.order < b.order ? -1 : a.order == b.order ? 0 : 1);

            let layoutRows: any[] = this.gantt.config.layout.rows;
            for (let i = 0; i < layoutRows.length; ++i) {
                if (layoutRows[i] && layoutRows[i].cols && layoutRows[i].cols.length > 0 && layoutRows[i].cols[0].view == 'resourceGrid')
                    layoutRows[i].config = resourceConfig;
            }


            if (this.isInit)
                this.init();
        }

        private init() {
            this.gantt.init(this.element[0]);
            this.gantt.render();
        }

        protected initializeHtmlElement(): void {
            this.element = $('<div></div>');
            this.appendElementToParent();
        }

    }
}
core.controlTypes['dhtmlx.Gantt'] = () => new controls.html.dhtmlx.Gantt();
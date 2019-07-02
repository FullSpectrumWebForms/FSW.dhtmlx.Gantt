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
                }
                // ------------------------------------------------------------------------   Items
                get Items() {
                    return this.getPropertyValue("Items");
                }
                // ------------------------------------------------------------------------   Links
                get Links() {
                    return this.getPropertyValue("Links");
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
                get RowHeight() {
                    return this.getPropertyValue("RowHeight");
                }
                initialize(type, index, id, properties) {
                    super.initialize(type, index, id, properties);
                    if (globalGantt && globalGantt.getGanttInstance)
                        this.gantt = globalGantt.getGanttInstance();
                    else
                        this.gantt = gantt;
                    if (this.RowHeight)
                        this.gantt.config.row_height = this.RowHeight;
                    this.gantt.init(this.element[0]);
                    this.events.push(this.gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this)));
                    this.getProperty("Columns").onChangedFromServer.register(this.onColumnsChangedFromServer.bind(this), true);
                    this.getProperty("Scale").onChangedFromServer.register(this.onScaleChangeFromServer.bind(this), true);
                    this.getProperty("SubScales").onChangedFromServer.register(this.onScaleChangeFromServer.bind(this), true);
                    this.getProperty("Items").onChangedFromServer.register(this.onItemsChangedFromServer.bind(this));
                    this.getProperty("Links").onChangedFromServer.register(this.onLinksChangedFromServer.bind(this), true);
                    this.isInit = true;
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
                                subScale.date = '%F %d';
                            else if (subScale.unit == 'day')
                                subScale.date = '%F %d';
                            else if (subScale.unit == 'year')
                                subScale.date = '%F %d';
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
                    this.gantt.parse({
                        data: this.Items,
                        links: this.Links
                    });
                }
                onItemsChangedFromServer() {
                    this.doParse();
                }
                onLinksChangedFromServer() {
                    this.doParse();
                }
                onColumnsChangedFromServer() {
                    let columns = [];
                    let columnsFromServer = this.Columns;
                    let keys = Object.keys(columnsFromServer);
                    for (let i = 0; i < keys.length; ++i) {
                        var col = columnsFromServer[keys[i]];
                        columns.push({
                            name: col.Field,
                            label: col.Text,
                            width: col.Width,
                            align: col.AlignPosition,
                            tree: col.Tree,
                            resize: col.Resize
                        });
                    }
                    this.gantt.config.columns = columns;
                    if (this.isInit)
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
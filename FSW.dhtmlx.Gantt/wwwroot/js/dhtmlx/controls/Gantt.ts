/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />

declare var Gantt: GanttEnterprise;
var globalGantt: GanttEnterprise;
if (typeof Gantt !== 'undefined')
    globalGantt = Gantt;
else
    globalGantt = null;
namespace controls.html.dhtmlx {


    interface GanttItem {
        Id: number;
        text: string;
        start_date: Date;
        duration: number;
        order: number;
        progress: number;
        parent: number;
        open: boolean;
    }

    interface GanttLink {
        id: number;
        source: number;
        target: number;
        type: string;
        readonly?: boolean;
        editable?: boolean;
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
        // ------------------------------------------------------------------------   Items
        get Scale(): string {
            return this.getPropertyValue<this, string>("Scale");
        }

        get SubScales(): any[] {
            return this.getPropertyValue<this, any[]>("SubScales");
        }

        get RowHeight(): number {
            return this.getPropertyValue<this, number>("RowHeight");
        }
        events: any[] = [];

        gantt: GanttStatic;

        isInit = false;
        initialize(type: string, index: number, id: string, properties: { property: string, value: any }[]) {
            super.initialize(type, index, id, properties);

            if (globalGantt && globalGantt.getGanttInstance)
                this.gantt = globalGantt.getGanttInstance();
            else
                this.gantt = gantt;

            if (this.RowHeight)
                this.gantt.config.row_height = this.RowHeight;


            this.gantt.init(this.element[0]);

            this.events.push(this.gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this)));

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

        protected initializeHtmlElement(): void {
            this.element = $('<div></div>');
            this.appendElementToParent();
        }

    }
}
core.controlTypes['dhtmlx.Gantt'] = () => new controls.html.dhtmlx.Gantt();
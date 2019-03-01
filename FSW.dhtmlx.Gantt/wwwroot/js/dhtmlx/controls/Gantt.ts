/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />


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

        get RowHeight(): number {
            return this.getPropertyValue<this, number>("RowHeight");
        }
        events: any[] = [];

        initialize(type: string, index: number, id: string, properties: { property: string, value: any }[]) {
            super.initialize(type, index, id, properties);

            if (this.Scale == 'Week') {
                gantt.config.subscales = [{ unit: 'week', step: 1, date: '%F %d' }];
                gantt.config.scale_unit = 'month';
                gantt.config.date_scale = '%F';
            }

            if (this.RowHeight)
                gantt.config.row_height = this.RowHeight;


            gantt.init(this.element[0]);

            this.events.push(gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this)));

            this.getProperty("Items").onChangedFromServer.register(this.onItemsChangedFromServer.bind(this));
            this.getProperty("Links").onChangedFromServer.register(this.onLinksChangedFromServer.bind(this), true);
        }

        removeControl() {
            while (this.events.length)
                gantt.detachEvent(this.events.pop());
        }

        onAfterTaskDrag(id, mode) {
            var task = gantt.getTask(id);
            if (mode == gantt.config.drag_mode.progress) {
                this.customControlEvent('OnItemProgressionChangedFromClient', {
                    id: id,
                    progression: task.progress
                });
            } else {
                var convert = gantt.date.date_to_str("%d-%m-%Y");
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
            gantt.parse({
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
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


        initialize(type: string, index: number, id: string, properties: { property: string, value: any }[]) {
            super.initialize(type, index, id, properties);


            gantt.init(this.element[0]);

            gantt.attachEvent("onAfterTaskDrag", this.onAfterTaskDrag.bind(this));

            this.getProperty("Items").onChangedFromServer.register(this.onItemsChangedFromServer.bind(this), true);
            this.getProperty("Links").onChangedFromServer.register(this.onLinksChangedFromServer.bind(this), true);
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
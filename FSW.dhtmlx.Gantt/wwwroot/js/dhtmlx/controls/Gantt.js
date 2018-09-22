/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />
var controls;
(function (controls) {
    var html;
    (function (html) {
        var dhtmlx;
        (function (dhtmlx) {
            class Gantt extends controls.html.htmlControlBase {
                // ------------------------------------------------------------------------   Items
                get Items() {
                    return this.getPropertyValue("Items");
                }
                // ------------------------------------------------------------------------   Links
                get Links() {
                    return this.getPropertyValue("Links");
                }
                initialize(type, index, id, properties) {
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
                    }
                    else {
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
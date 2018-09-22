/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />
var controls;
(function (controls) {
    var html;
    (function (html) {
        var dhtmlx;
        (function (dhtmlx) {
            class gantt extends controls.html.htmlControlBase {
                // ------------------------------------------------------------------------   ChartType
                get ChartType() {
                    return this.getPropertyValue("ChartType").toLocaleLowerCase();
                }
                set ChartType(value) {
                    this.setPropertyValue("ChartType", value);
                }
                initialize(type, index, id, properties) {
                    super.initialize(type, index, id, properties);
                }
                initializeHtmlElement() {
                    this.element = $('<div></div>');
                    this.appendElementToParent();
                }
            }
            dhtmlx.gantt = gantt;
        })(dhtmlx = html.dhtmlx || (html.dhtmlx = {}));
    })(html = controls.html || (controls.html = {}));
})(controls || (controls = {}));
core.controlTypes['dhtmlx.Gantt'] = () => new controls.html.dhtmlx.gantt();
//# sourceMappingURL=Gantt.js.map
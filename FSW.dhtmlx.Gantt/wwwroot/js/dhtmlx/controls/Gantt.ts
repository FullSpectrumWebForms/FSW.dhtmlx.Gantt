/// <reference path="..\..\..\..\dt\controls\html\htmlControlBase.d.ts" />


namespace controls.html.dhtmlx {



    export class gantt extends controls.html.htmlControlBase {

        // ------------------------------------------------------------------------   ChartType
        get ChartType(): string {
            return this.getPropertyValue<this, string>("ChartType").toLocaleLowerCase();
        }
        set ChartType(value: string) {
            this.setPropertyValue<this>("ChartType", value);
        }
        

        initialize(type: string, index: number, id: string, properties: { property: string, value: any }[]) {
            super.initialize(type, index, id, properties);


        }

        protected initializeHtmlElement(): void {
            this.element = $('<div></div>');
            this.appendElementToParent();
        }

    }
}
core.controlTypes['dhtmlx.Gantt'] = () => new controls.html.dhtmlx.gantt();
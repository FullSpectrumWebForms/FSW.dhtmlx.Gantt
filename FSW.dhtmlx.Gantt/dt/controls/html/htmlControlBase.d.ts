/// <reference path="../../core/controlBase.d.ts" />
declare namespace controls.html {
    interface RightClickMenuItem {
        Id: number;
        Name: string;
        Items: RightClickMenuItem[];
    }
    interface RightClickMenuOptions {
        Items: RightClickMenuItem[];
    }
    function BuildRightClickMenu(menu: RightClickMenuOptions, selector: string, callback: (key: string, options: any) => void): any;
    class htmlControlBase extends core.controlBase {
        element: JQuery;
        CssProperties: {
            [name: string]: string;
        };
        Attributes: {
            [name: string]: string;
        };
        readonly InternalStyles: {
            [selector: string]: {
                [name: string]: string;
            };
        };
        readonly CustomSelector: string;
        GenerateClickEvents: boolean;
        PopupTitle: string;
        PopupContent: string;
        readonly Classes: string[];
        readonly HtmlDefaultTag: string;
        readonly InnerText: string;
        readonly RightClickMenu: RightClickMenuOptions;
        addClass(className: string): void;
        readonly parentElement: JQuery<HTMLElement>;
        removeElementFromUI(force: boolean): void;
        removeControl(): void;
        initialIndex?: number;
        appendElementToParent(): void;
        initialize(type: string, index: number, id: string, properties: {
            property: string;
            value: any;
        }[]): void;
        protected initializeHtmlElement(): void;
        internalStyles: JQuery;
        private onInternalStylesChanged(property, args);
        private onCssPropertiesChanged(property, args);
        private onAttributesChanged(property, args);
        private onInnerTextChanged(property, args);
        private onPopupChanged(property, args);
        private onClassesChanged(property, args);
        lastContextMenu: any;
        private onRightClickMenuChanged(property, args);
    }
}

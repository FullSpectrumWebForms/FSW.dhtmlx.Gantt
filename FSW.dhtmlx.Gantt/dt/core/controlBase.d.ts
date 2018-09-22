/// <reference path="controlextension.d.ts" />
/// <reference path="coreProperty.d.ts" />
/// <reference path="fswManager.d.ts" />
/// <reference types="jquery" />
declare namespace core {
    class controlBase {
        id: string;
        type: string;
        ParentElementId: string;
        private parent_;
        readonly parent: controlBase;
        childs: controlBase[];
        properties: {
            [name: string]: controlProperty<any>;
        };
        tryGetPropertyValue<T2, T>(name: keyof T2): T;
        getPropertyValue<T2, T>(name: keyof T2): T;
        setPropertyValue<T>(name: keyof T, value: any): void;
        getProperty<T2, T>(name: keyof T2): controlProperty<T>;
        initialize(type: string, index: number, id: string, properties: {
            property: string;
            value: any;
        }[]): void;
        callOnInitProperties(): void;
        wasRemoved: boolean;
        removeControl(): void;
        private flatListChilds();
        uninitialiseControlFromServer(): void;
        removeElementFromUI(force: boolean): void;
        customControlEvent(eventName: string, parameters: any, forceSync?: boolean): JQuery.Deferred<any, any, any>;
        extensions: {
            [clientId: string]: controlExtension;
        };
        registerControlExtension(data: {
            ClientId: string;
        }): void;
        unregisterControlExtension(data: {
            ClientId: string;
        }): void;
        callControlExtensionMethod(data: {
            ClientId: string;
            MethodName: string;
            Parameters: any;
        }): any;
    }
}

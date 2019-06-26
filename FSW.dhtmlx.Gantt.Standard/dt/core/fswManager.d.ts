/// <reference types="jquery" />
declare var signalR: any;
declare var Microsoft: any;
declare var Noty: any;
declare var Cookies: {
    get: (name: string) => any;
    set: (name: string, value: any) => void;
};
declare namespace core {
    class polinetManager {
        private pageId;
        private pageIdAuth;
        private typePath;
        private controls;
        getControl(id: string): controlBase;
        addNewControl(control: controlBase): void;
        removeControl(control: controlBase): void;
        private processNewControl(id, index, type, properties);
        private getControlTypeFromProperties(properties);
        connection: {
            send: (name: string, p: any) => void;
            start: () => Promise<void>;
            on: (name: string, callback: (data: any) => void) => void;
        };
        connectionId: string;
        initialize(): Promise<void>;
        updateLocked: number;
        pendingPropertyUpdate: {
            [id: string]: controlProperty<any>[];
        };
        lockPropertyUpdate(): void;
        unlockPropertyUpdate(): void;
        addPropertyUpdate(property: controlProperty<any>): void;
        private processNewControls(controls);
        private propertyUpdateFromServerStep2(answer);
        private propertyUpdateFromServerStep1(answer);
        sendPropertyUpdate(): void;
        customEventAnswer(datas: {
            result: any;
            properties: any;
        }): void;
        customEventQueue: JQueryDeferred<any>[];
        sendCustomControlEvent(controlId: string, eventName: string, parameters: any, forceSync?: boolean): JQuery.Deferred<any, any, any>;
    }
    var manager: polinetManager;
    var controlTypes: {
        [type: string]: () => controlBase;
    };
    var controlExtensionTypes: {
        [clientId: string]: () => controlExtension;
    };
}

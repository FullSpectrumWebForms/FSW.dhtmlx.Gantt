/// <reference path="controlBase.d.ts" />
declare namespace core {
    class controlPropertyEvent<propertyType, T> {
        constructor(property: controlProperty<propertyType>);
        property: controlProperty<propertyType>;
        callbacks: {
            callback: ((property: controlProperty<propertyType>, args: T) => void);
            onInit: boolean;
        }[];
        register(callback: (property: controlProperty<propertyType>, args: T) => void, onInit?: boolean): void;
        invoke(args: T): void;
        invokeInitCallback(args: T): void;
    }
    class controlProperty<T> {
        name: string;
        value: T;
        control: controlBase;
        constructor(control: controlBase, name: string, value: T);
        onChangedFromServer: controlPropertyEvent<T, {
            old: T;
            new: T;
        }>;
        onChangedFromClient: controlPropertyEvent<T, {
            old: T;
            new: T;
        }>;
        updateValue(newValue: T): void;
        callInitCallbacks(): void;
    }
}

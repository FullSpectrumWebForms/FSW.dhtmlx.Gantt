declare namespace core {
    class controlExtension {
        control: controlBase;
        initialize(control: controlBase): void;
        remove(): void;
    }
}

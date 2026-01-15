// Type declarations for web compatibility

// Global declarations for web compatibility
declare global {
    interface Window {
        localStorage: Storage;
    }

    // eslint-disable-next-line no-var
    var window: Window & typeof globalThis;
}

export { };


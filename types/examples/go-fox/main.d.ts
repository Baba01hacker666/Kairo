declare global {
    interface Window {
        Go: any;
        kairo: {
            update: (dt: number, dirX: number, dirZ: number, run: boolean) => void;
            getEntities: () => string;
            getScore: () => number;
            reset: () => void;
        };
    }
}
export {};

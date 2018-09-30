export class Utils {
    public static IsNullOrUndefined(item: any): boolean {
        if (item === null || item === undefined) {
            return true;
        }
        return false;
    }

    public static HasValue(item: any): boolean {
        if (item !== null && item !== undefined) {
            return true;
        }
        return false;
    }

    public static ArrayHasValue(item: any): boolean {
        if (item !== null && item !== undefined && item.length >0) {
            return true;
        }
        return false;
    }

    public static getRandomBoolean(): boolean {
        const a = new Uint8Array(1);
        crypto.getRandomValues(a);
        return a[0] > 127;
    }

    public static padLeft(input: number, numchars: number, padChar?: string) {
        return Array(numchars - String(input).length + 1).join(padChar || '0') + input;
    }

    public static GetRandomIntInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

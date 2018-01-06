export class Utils {
    public static IsNullOrUndefined(item: any): boolean {
        if (item === null || item === undefined) {
            return true;
        }
        return false;
    }

    public static getRandomBoolean(): boolean {
            const a = new Uint8Array(1);
            crypto.getRandomValues(a);
            return a[0] > 127;
    }
}

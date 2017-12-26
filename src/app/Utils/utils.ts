export class Utils {
    public static IsNullOrUndefined(item: any): boolean {
        if (item === null || item === undefined) {
            return true;
        }
        return false;
    }
}

export class ArrayUtils {
    public static ArrayHasValue(theArray: any): boolean {
        if (theArray !== null && theArray !== undefined && theArray.length > 0) {
            return true;
        }
        return false;
    }

    // removes duplicates from simple arrays
    public static RemoveDuplicates<T>(theArray: Array<T>) {
        return theArray.filter((el, i, a) => i === a.indexOf(el));
    }
}

enum LogLevel {
    NONE = 0, ERROR = 1, WARNING = 2, INFO = 3, DEBUG = 4
}
export class ConsoleLog {

    // TODO - get from config file
    public static logLevel = LogLevel.NONE;

    constructor() {
        ConsoleLog.logLevel = LogLevel.ERROR;
    }

    public static debug(text: string) {
        if (ConsoleLog.logLevel >= LogLevel.DEBUG) {
            console.log(`%c${text}`, 'color:green;font-size:20px');
        }
    }

    public static info(text: string) {
        if (ConsoleLog.logLevel >= LogLevel.INFO) {
            console.log(`%c${text}`, 'color:blue;font-size:20px');
        }
    }

    public static warning(text: string) {
        if (ConsoleLog.logLevel >= LogLevel.WARNING) {
            console.log(`%c${text}`, 'color:orange;font-size:20px');
        }
    }

    public static error(text: string) {
        if (ConsoleLog.logLevel >= LogLevel.ERROR) {
            console.log(`%c${text}`, 'color:red;font-size:20px');
        }
    }

}



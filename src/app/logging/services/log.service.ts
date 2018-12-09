import { Injectable } from '@angular/core';
import { LogLevel } from '../enums/log-level';

@Injectable()
export class LogService {

    public logLevel = LogLevel.DEBUG;
    public errorStyle = 'color:red;font-size:20px';
    public warningStyle = 'color:orange;font-size:20px';
    public infoStyle = 'color:blue;font-size:20px';
    public debugStyle = 'color:green;font-size:20px';

    constructor() { }

    public debug(text: string) {
        if (this.logLevel >= LogLevel.DEBUG) {
            console.log(`%c${text}`, this.debugStyle);
        }
    }

    public info(text: string) {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(`%c${text}`, this.infoStyle);
        }
    }

    public warning(text: string) {
        if (this.logLevel >= LogLevel.WARNING) {
            console.log(`%c${text}`, this.warningStyle);
        }
    }

    public error(text: string) {
        if (this.logLevel >= LogLevel.ERROR) {
            console.log(`%c${text}`, this.errorStyle);
        }
    }
}


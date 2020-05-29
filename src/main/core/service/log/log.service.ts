import { ApplicationException } from '../../exeption/application.exception';
import { LogLevel } from './log-level.enum';

export class LogService {
    
    level: LogLevel;

    public error(error: Error): void {
        if (error instanceof ApplicationException) {
            console.error(
                new Date().toUTCString() + ': [Error] ' + error.getCode() + ' ' + error.getDetail() + ' '
                + error.getDescription()
            );
        } else {
            console.error(new Date().toUTCString() + ': [Error] ' + error.stack);
        }
    }
    public info(message: string): void {
        console.info(new Date().toUTCString() + ': [INFO] ' + message);
    }
    public debug(message: string): void {
        if (this.level === LogLevel.FULL) {
            console.info(new Date().toUTCString() + ': [DEBUG] ' + message);
        }
    }

    public setLogLevel(level: LogLevel): void {
        this.level = level;
    }
}

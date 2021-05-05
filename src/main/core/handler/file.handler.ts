import { createReadStream, readdirSync, statSync } from 'fs';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

import { PropertyModel } from '../shared/model/property.model';
import { CoreMessageService } from '../service/core-message.service';
import { CoreLogger } from '../service/core-logger';
import { ClassTypeEnum } from '../shared/enum/class-type.enum';
import { ApplicationException } from '../exeption/application.exception';

/* eslint-disable  no-console */
export class FileHandler {
    FOUND_FILES: Array<string> = [];

    constructor(
        protected scanProperties: PropertyModel,
        protected logger: CoreLogger
    ) {}

    protected buildPath(): string {
        let path = process.cwd();
        if (this.scanProperties.full) {
            path = this.scanProperties.path as string;
        } else {
            let relativePath = this.scanProperties.path as string;

            relativePath = (relativePath.charAt(0) !== '/') ? '/' + relativePath : relativePath;
            path += relativePath;
        }
        return path;
    }
    protected buildRegex(findabbles: Array<string>): string {
        let regex = '';

        for (const findabble of findabbles) {
            regex += '(\\@' + findabble + '|\\.' + findabble +')|';
        }

        return regex.substr(0, regex.length - 1);
    }
    protected checkPath(path: string, isDirectory: boolean): boolean {
        const normalizedPath = path.replace(/\\/g, '/');
        for (const excludes of this.scanProperties.excludes as Array<string>) {
            if (new RegExp(excludes).test(normalizedPath)) {
                return false;
            }
        }
        if (isDirectory) {
            return true;
        }
        for (const include of this.scanProperties.includes as Array<string>) {
            if (new RegExp(include).test(normalizedPath)) {
                return true;
            }
        }

        return false;
    }
    protected getClassTypes(): Array<string> {
        return [ ClassTypeEnum.SERVICE, ClassTypeEnum.CONFIGURATION, ClassTypeEnum.REST, ClassTypeEnum.COMMON ];
    }
    public initialize(): Observable<boolean> {
        if (!this.scanProperties.enabled) {
            return of(true);
        }
        this.logger.info(CoreMessageService.getMessage('register-scanning'), '[The Way]');

        const path = this.buildPath();
        return fromPromise(this.loadApplicationFiles(path)).pipe(
            map(() => {
                return true;
            })
        );
    }
    protected async importFile(fullPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const regex = new RegExp(this.buildRegex(this.getClassTypes()), 'g');
            const stream = createReadStream(fullPath, { encoding: 'utf-8' });
            stream.on('data', (data) => {
                if (data.toString().search(regex) > -1) {
                    this.FOUND_FILES.push(fullPath);
                    this.logger.debug(CoreMessageService.getMessage('register-found-resource', [fullPath]), '[The Way]');
                    import(fullPath).then(() => {
                        resolve();
                    }).catch((ex) => reject(ex));
                    stream.close();
                }
            });
            stream.on('close', () => {
                resolve();
            });
        });
    }
    protected async loadApplicationFiles(dirPath: string): Promise<void> {
        try {
            const paths = readdirSync(dirPath);
            for (const path of paths) {
                const fullpath = dirPath + '/' + path;
                const stat = statSync(fullpath);
                const isDirectory = stat.isDirectory();
                if (!this.checkPath(path, isDirectory)) {
                    continue;
                }

                if (isDirectory) {
                    await this.loadApplicationFiles(fullpath);
                } else {
                    await this.importFile(fullpath);
                }
            }
        } catch (ex) {
            this.logger.error(ex);
            throw new ApplicationException(
                CoreMessageService.getMessage('error-cannot-scan', [ex.message]),
                CoreMessageService.getMessage('TW-003'),
                ex
            );
        }
    }
}

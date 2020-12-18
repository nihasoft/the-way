import { createReadStream, readdirSync, statSync } from 'fs';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

import { CORE } from '../core';
import { PropertyModel } from '../model/property.model';
import { Messages } from '../shared/messages';
import { Logger } from '../shared/logger';
import { ClassTypeEnum } from '../shared/class-type.enum';

/* eslint-disable  no-console */
export class FileHandler {

    EXTENSIONS = ['.ts', '.js'];
    FOUND_FILES: Array<string> = [];

    constructor(protected core: CORE, protected scanProperties: PropertyModel, protected logger: Logger) {
    }

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
    protected getClassTypes(): Array<string> {
        return [ ClassTypeEnum.SERVICE, ClassTypeEnum.CONFIGURATION, ClassTypeEnum.REST, ClassTypeEnum.COMMON ];
    }
    public initialize(): Observable<boolean> {
        if (!this.scanProperties.enabled) {
            return of(true);
        }
        this.logger.info(Messages.getMessage('scanning'), '[The Way]');

        const path = this.buildPath();
        return fromPromise(this.loadApplicationFiles(path)).pipe(
            map(() => {
                return true;
            })
        );
    }
    protected async importFile(fullPath: string): Promise<void> {
        const extensions = this.EXTENSIONS.toString().replace(',', '|').replace(/\./g, '\\.');

        if (fullPath.search(extensions) > -1) {
            return new Promise((resolve, reject) => {
                const regex = new RegExp(this.buildRegex(this.getClassTypes()), 'g');
                const stream = createReadStream(fullPath, { encoding: 'utf-8' });
                stream.on('data', (data) => {
                    if (data.toString().search(regex) > -1) {
                        this.FOUND_FILES.push(fullPath);
                        this.logger.debug(Messages.getMessage('found-class', [fullPath]), '[The Way]');
                        import(fullPath).then(() => {
                            resolve();
                        }).catch((ex) => {
                            console.error(ex);
                            reject();
                        });
                        stream.close();
                    }
                });
                stream.on('close', () => {
                    resolve();
                });
            });
        }
    }
    protected async loadApplicationFiles(dirPath: string): Promise<void> {
        try {
            const paths = readdirSync(dirPath);
            for(const path of paths) {
                const fullpath = dirPath + '/' + path;
                const stat = statSync(fullpath);
                if (stat.isDirectory()) {
                    await this.loadApplicationFiles(fullpath);
                } else {
                    const extensions = this.EXTENSIONS.toString().replace(',', '|').replace(/\./g, '\\.');

                    if (path.search(extensions) > -1) {
                        const fullpath = dirPath + '/' + path;
                        const stat = statSync(fullpath);
                        if (stat.isDirectory()) {
                            await this.loadApplicationFiles(fullpath);
                        } else {
                            await this.importFile(fullpath);
                        }
                    }
                }
            }
        } catch (ex) {
            console.log('[The Way] ' + ex.message);
        }
    }
}
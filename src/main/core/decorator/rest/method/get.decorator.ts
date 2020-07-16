import { CORE } from '../../../core';
import { HttpType } from '../../../service/http/http-type.enum';

/*eslint-disable @typescript-eslint/explicit-module-boundary-types*/
export const Get = function (path: string, authenticated?: boolean, allowedProfiles?: Array<any>) {
    return (target:  any, propertyKey: string, descriptor: unknown): any => {
        const core: CORE = CORE.getCoreInstance();
        core.whenReady().subscribe((ready: boolean) => {
            if (ready) {
                core.registerPath(HttpType.GET, path, authenticated, allowedProfiles, target, propertyKey);
            }
        })
        return descriptor;
    }
}

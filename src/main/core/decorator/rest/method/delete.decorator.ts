import { CORE } from '../../../core';
import { HttpType } from '../../../service/http/http-type.enum';

/*eslint-disable @typescript-eslint/explicit-module-boundary-types*/
export const Delete = (path: string, authenticated?: boolean, allowedProfiles?: Array<any>) => {
    return (target:  any, propertyKey: string): void => {
        const core: CORE = CORE.getCoreInstance();
        core.whenReady().subscribe((ready: boolean) => {
            if (ready) {
                core.registerPath(HttpType.DELETE, path, authenticated, allowedProfiles, target, propertyKey);
            }
        })
    }
}

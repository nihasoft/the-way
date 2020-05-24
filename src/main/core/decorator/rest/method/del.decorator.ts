import { CORE } from '../../../core';
import { ApplicationException } from '../../../exeption/application.exception';
import { HttpType } from '../../../service/http/http-type.enum';
import { HttpService } from '../../../service/http/http.service';
import { ErrorCodeEnum } from '../../../model/error-code.enum';

export function Del(path: string, authenticated?: boolean, allowedProfiles?: Array<any>) {
    return (target:  any, propertyKey: string): void => {
        CORE.getCoreInstance().ready$.subscribe((ready: boolean) => {
            if (ready) {
                const httpService = CORE.getCoreInstance().getInstanceByName('HttpService') as HttpService;
                if (!httpService) {
                    throw new ApplicationException(
                        'If you want to use the HttpService and the rest decorators, ' + 
                        'you should pass HttpService or and extended class of HttpService on Application decorator',
                        'HttpService not found', ErrorCodeEnum['RU-002']);
                } else {
                    httpService.registerPath(HttpType.DEL, path, authenticated, allowedProfiles, target, propertyKey);
                }
            }
        })
    }
}
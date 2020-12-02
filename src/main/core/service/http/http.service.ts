import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PathParamMetadataKey } from '../../decorator/rest/param/path-param.decorator';
import { ClaimsMetaKey } from '../../decorator/rest/param/claims.decorator';
import { BodyParamMetadataKey } from '../../decorator/rest/param/body-param.decorator';
import { QueryParamMetadataKey } from '../../decorator/rest/param/query-param.decorator';
import { Service } from '../../decorator/service.decorator';
import { ServerConfiguration } from '../../configuration/server.configuration';
import { HttpType } from './http-type.enum';
import { ApplicationException } from '../../exeption/application.exception';
import { LogService } from '../log/log.service';
import { BadRequestException } from '../../exeption/bad-request.exception';
import { InternalException } from '../../exeption/internal.exception';
import { SecurityService } from '../security.service';
import { HeaderMetadataKey } from '../../decorator/rest/param/header.decorator';
import { ResponseMetadataKey } from '../../decorator/rest/param/response.decorator';
import { RequestMetadataKey } from '../../decorator/rest/param/request.decorator';
import { CORE } from '../../core';
import { TokenClaims } from '../../model/token-claims.model';
import { ErrorCodeEnum } from '../../exeption/error-code.enum';
import { MessagesEnum } from '../../model/messages.enum';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
@Service()
export class HttpService {
    serverConfiguration: ServerConfiguration;
    securityService: SecurityService;
    logService: LogService;

    constructor() {
        this.serverConfiguration = CORE.getCoreInstance().getInstanceByName<ServerConfiguration>('ServerConfiguration');
        this.securityService = CORE.getCoreInstance().getInstanceByName<SecurityService>('SecurityService');
        this.logService = CORE.getCoreInstance().getInstanceByName<LogService>('LogService');
    }

    protected buildPathParams(pathParams: Array<any>, req: any, functionArguments: Array<unknown>): void {
        for (const param of pathParams) {
            const paramValue = req.params[param.name];
            if (paramValue) {
                functionArguments[param.index] = paramValue;
            } else {
                throw new InternalException(MessagesEnum['rest-parameters-are-differents']);
            }
        }
    }
    protected execute(
        httpType: HttpType, authenticated: boolean | undefined, allowedProfiles: Array<any> | undefined,
        target: any, propertyKey: string,  req: any, res: any
    ): void {
        try {
            this.securityService.verifyToken(req.headers.authorization, allowedProfiles, authenticated).pipe(
                switchMap((tokenClaims: TokenClaims | undefined) => {
                    return this.executeMethod(httpType, target, propertyKey, req, res, tokenClaims);
                })
            ).subscribe(
                (response: any) => {
                    if (!res.headersSent) {
                        res.send(response);
                    }
                }, (error: Error) => {
                    this.handleError(error, res);
                }
            );
        } catch (error) {
            this.handleError(error, res);
        }
    }
    protected executeMethod(
        httpType: HttpType, target: any, propertyKey: string, req: any,
        res: any, tokenClaims: TokenClaims | undefined
    ): Observable<unknown> {
        const method = target[propertyKey];
        const functionArgumentsLength = method.length;
        const functionArguments = new Array<any>().fill(undefined, 0, functionArgumentsLength);

        const pathParams: Array<any> = Reflect.getOwnMetadata(PathParamMetadataKey, target, propertyKey);
        const tokenClaimsIndex: number = Reflect.getOwnMetadata(ClaimsMetaKey, target, propertyKey);
        const headerIndex: number = Reflect.getOwnMetadata(HeaderMetadataKey, target, propertyKey);
        const responseIndex: number = Reflect.getOwnMetadata(ResponseMetadataKey, target, propertyKey);
        const requestIndex: number = Reflect.getOwnMetadata(RequestMetadataKey, target, propertyKey);

        if (headerIndex !== undefined) {
            functionArguments[headerIndex] = req.headers;
        }

        if (responseIndex !== undefined) {
            functionArguments[responseIndex] = res;
        }

        if (requestIndex !== undefined) {
            functionArguments[requestIndex] = req;
        }

        if (tokenClaimsIndex !== undefined) {
            functionArguments[tokenClaimsIndex] = tokenClaims;
        }

        if (pathParams) {
            this.buildPathParams(pathParams, req, functionArguments);
        }

        // Todo: Verify if post, put, patch can have query params and body.
        if (httpType === HttpType.GET || httpType === HttpType.DELETE || httpType === HttpType.HEAD) {
            const queryParam: number = Reflect.getOwnMetadata(QueryParamMetadataKey, target, propertyKey);
            if (queryParam !== undefined && queryParam !== null) {
                functionArguments[queryParam] = req.query;
            }
        } else {
            const bodyParam: number = Reflect.getOwnMetadata(BodyParamMetadataKey, target, propertyKey);
            if (bodyParam !== undefined && bodyParam !== null) {
                if (Object.keys(req.body).length === 0) {
                    throw new BadRequestException(MessagesEnum['rest-empty-request']);
                }
                functionArguments[bodyParam] = req.body;
            }
        }
        const instance = CORE.getCoreInstance().getInstanceByName(target.constructor.name);
        return Reflect.apply(target[propertyKey], instance, functionArguments);
    }
    protected handleError(ex: Error, res: any): void {
        if (ex instanceof ApplicationException) {
            res.status(ex.getCode()).send(ex);
        } else {
            res.status(ErrorCodeEnum.INTERNAL_SERVER_ERROR).send(ex);
        }
        this.logService.error(ex);
    }
    public registerPath(
        httpType: HttpType, path: string, authenticated: boolean | undefined,
        allowedProfiles: Array<any> | undefined, target: any, propertyKey: string
    ): void {
        const claims: number = Reflect.getOwnMetadata(ClaimsMetaKey, target, propertyKey);

        if (claims !== undefined && !authenticated) {
            throw new ApplicationException(
                MessagesEnum['rest-claims-without-token-verify'],
                MessagesEnum['rest-without-authentication'],
                ErrorCodeEnum['RU-004']
            );
        }
        this.serverConfiguration.registerPath(path, httpType,  (req: any, res: any) => {
            this.execute(httpType, authenticated, allowedProfiles, target, propertyKey, req, res);
        });
    }
}

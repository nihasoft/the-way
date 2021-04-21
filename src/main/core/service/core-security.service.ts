import * as Jwt from 'jsonwebtoken';

import { Observable, of } from 'rxjs';
//
// import { UnauthorizedException } from '../exeption/unauthorized.exception';
// import { NotAllowedException } from '../exeption/not-allowed.exception';
// import { ApplicationException } from '../exeption/application.exception';
import { CORE } from '../core';
// import { CryptoService } from './crypto.service';
// import { PropertiesConfiguration } from '../configuration/properties.configuration';
// import { TokenClaims } from '../model/token-claims.model';
// import { MessagesEnum } from '../model/messages.enum';
import { Service } from '../decorator/service.decorator';
import { System } from '../decorator/system.decorator';
import { Inject } from '../decorator/inject.decorator';
import { PropertiesHandler } from '../handler/properties.handler';
import { TokenClaims } from '../model/token-claims.model';
import { CoreCryptoService } from './core-crypto.service';
import { PropertyModel } from '../model/property.model';
import { NotAllowedException } from '../exeption/not-allowed.exception';
import { Messages } from '../shared/messages';
import { UnauthorizedException } from '../exeption/unauthorized.exception';
import { RestException } from '../exeption/rest.exception';
import { PathMapModel } from '../model/path-map.model';
import has = Reflect.has;

/*eslint-disable @typescript-eslint/no-explicit-any*/
@System
@Service()
export class CoreSecurityService {

    @Inject protected propertiesHandler: PropertiesHandler;
    @Inject protected cryptoService: CoreCryptoService;

    public generateToken(tokenClaims: TokenClaims | null): string {
        const cryptedClaims: string | null = this.generateTokenClaims(tokenClaims);
        return Jwt.sign({ data: cryptedClaims }, this.getTokenKey(), { expiresIn: this.getTokenExpiration() });
    }
    protected generateTokenClaims(tokenClaims: TokenClaims | null): string | null {
        if (!tokenClaims) {
            return null;
        }

        return this.cryptoService.cipherIv(JSON.stringify(tokenClaims), 'aes-256-cbc', this.getUserKey());
    }
    public getTokenClaims(token: string): TokenClaims {
        const claims = Jwt.verify(token, this.getTokenKey()) as {data: string};

        if (claims.data) {
            return JSON.parse(this.cryptoService.decipherIv(claims.data, 'aes-256-cbc', this.getUserKey()));
        } else {
            throw new UnauthorizedException(Messages.getMessage('error-rest-invalid-token'));
        }
    }
    protected getUserKey(): string {
        const restSecurityProperties = this.propertiesHandler.getProperties(
            'the-way.server.rest.security'
        ) as PropertyModel;
        return restSecurityProperties['user-key'] as string;
    }
    protected getTokenKey(): string {
        const restSecurityProperties = this.propertiesHandler.getProperties(
            'the-way.server.rest.security'
        ) as PropertyModel;
        return restSecurityProperties['token-key'] as string;
    }
    protected getTokenExpiration(): string {
        const restSecurityProperties = this.propertiesHandler.getProperties(
            'the-way.server.rest.security'
        ) as PropertyModel;
        return restSecurityProperties['token-expiration'] as string;
    }
    protected hasFatherProfile(tokenProfiles: Array<any>, fatherProfiles: Array<any>): boolean {
        return this.hasProfile(tokenProfiles, fatherProfiles);
    }
    protected hasPathProfile(tokenProfiles: Array<any>, profiles: Array<any>): boolean {
        return this.hasProfile(tokenProfiles, profiles);
    }
    protected hasProfile(profiles: Array<any>, allowedProfiles: Array<any>,): boolean {
        for (const allowedProfile of allowedProfiles) {
            for (const profile of profiles) {
                if (JSON.stringify(profile) === JSON.stringify(allowedProfile)) {
                    return true;
                }
            }
        }
        return false;
    }
    protected isPathRestrictedToProfiles(profiles: Array<any> | undefined, fatherProfiles: Array<any> | undefined): boolean {
        return (profiles !== undefined && profiles.length > 0) ||
            (fatherProfiles !== undefined && fatherProfiles.length > 0);
    }
    protected verifyProfile(token: TokenClaims, profiles: Array<any>, fatherProfiles: Array<any>): void{
        if (!token || !token.profiles || !(token.profiles instanceof Array)) {
            throw new NotAllowedException(Messages.getMessage('error-rest-cannot-perform-action'));
        }

        const tokenProfiles: Array<any> = token.profiles;
        if (!this.hasFatherProfile(tokenProfiles, fatherProfiles) || !this.hasPathProfile(tokenProfiles, profiles)) {
            throw new NotAllowedException(Messages.getMessage('error-rest-cannot-perform-action'));
        }
    }
    public verifyToken(
        fatherPath: PathMapModel, token?: string,
        profiles?: Array<any>
    ): TokenClaims {
        try {
            if (!token) {
                throw new NotAllowedException(Messages.getMessage('error-rest-no-token'));
            } else if (token.search(/^Bearer /) === -1) {
                throw new UnauthorizedException(Messages.getMessage('error-rest-invalid-token'));
            }

            const tokenClaims: TokenClaims = this.getTokenClaims(token.replace('Bearer ', ''));

            if (this.isPathRestrictedToProfiles(fatherPath.allowedProfiles, profiles)) {
                this.verifyProfile(tokenClaims, profiles as Array<any>, fatherPath.allowedProfiles as Array<any>);
            }

            return tokenClaims;
        } catch(ex) {
            if (ex instanceof RestException) {
                throw ex;
            } else {
                console.error(ex);
                throw new UnauthorizedException(Messages.getMessage('error-rest-invalid-token'));
            }
        }
    }
}

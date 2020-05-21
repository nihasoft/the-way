import * as Jwt from 'jsonwebtoken';

import { UnauthorizedException } from '../exeption/unauthorized.exception';
import { NotAllowedException } from '../exeption/not-allowed.exception';
import { ApplicationException } from '../exeption/application.exception';
import { CORE } from '../core';
import { CryptoService } from './crypto.service';
import { PropertiesConfiguration } from '../configuration/properties.configuration';
import { Inject } from '../decorator/inject.decorator';

export abstract class SecurityService {

    @Inject() propertiesConfiguration: PropertiesConfiguration;

    constructor() {}

    public generateToken(user: any): string {
        const cryptoService = CORE.getCoreInstance().getInstanceByName('CryptoService') as CryptoService;
        const cryptedUser: string = cryptoService.cipherIv(JSON.stringify(user), 'aes-256-cbc', this.getUserKey());
        return Jwt.sign({data: cryptedUser}, this.getTokenKey(), { expiresIn: '3 days' });
    }
    public getDecodedUser(token: string): any {
        const cryptoService = CORE.getCoreInstance().getInstanceByName('CryptoService') as CryptoService;
        const claims: any = Jwt.verify(token, this.getTokenKey());
        return JSON.parse(cryptoService.decipherIv(claims.data, 'aes-256-cbc', this.getUserKey()));
    }
    protected getUserKey(): string {
        const theWayProperties = this.propertiesConfiguration.properties['the-way'];
        return theWayProperties.server.security['user-key'];
    }
    protected getTokenKey(): string {
        const theWayProperties = this.propertiesConfiguration.properties['the-way'];
        return theWayProperties.server.security['token-key'];
    }
    protected verifyProfile(user: any, profiles: Array<any>) {
        for (let profile of profiles) {
          if (user.profiles.includes(profile)) {
            return;
          }
        }
    
        throw new NotAllowedException('You cannot perform that.');
    }
    public verifyToken(token: string, profiles: Array<any> | undefined): any {
        try {
            if (!token) {
                throw new NotAllowedException('You have no token.');
            }
            token = token.replace('Bearer ', '');
            let decodedUser = this.getDecodedUser(token);
            let tokenUser: any = decodedUser;

            if (profiles && profiles.length > 0) {
                this.verifyProfile(tokenUser, profiles);
            }

            return tokenUser;
        } catch(ex) {
            if (ex instanceof ApplicationException) {
                throw ex;
            } else {
                console.error(ex);
                throw new UnauthorizedException('Invalid token');
            }
        }
    }
}
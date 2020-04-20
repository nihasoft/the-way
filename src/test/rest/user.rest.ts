import { Observable, of } from 'rxjs';

import { Inject, Post, BodyParam, Get, PathParam, QueryParam, RequestingUser} from '../../core/decorator';
import { SecurityService } from '../../core/service/security.service';

export class UserRest {
    @Inject() securityService: SecurityService;

    @Get('/api/user/:id')
    public getUser(@PathParam('id') id: string): Observable<any> {
        return of({
            username: "Hanor",
            profiles: [0, 1],
            id: id
        });
    }
    @Get('/api/user/:id/tenants', true, [1])
    public getUserTenants(@PathParam('id') id: string, @QueryParam param: any, @RequestingUser user: any): Observable<Array<any>> {
        console.log(user)
        return of([]);
    }

    @Post('/api/sign/in')
    public signIn(@BodyParam signIn: any): Observable<any> {
        const user = {
            id: 1123,
            profiles: [0, 1, 2]
        };
        return of({
            user: user,
            token: this.securityService.generateToken(user)
        });
    }
}
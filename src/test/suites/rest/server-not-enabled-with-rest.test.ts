import { switchMap } from 'rxjs/operators';

import { CORE, Messages } from '../../../main';
import { EnvironmentTest } from '../../resources/environment/environment.test';

afterAll(done => {
    EnvironmentTest.clear(done);
});
beforeEach(() => {
    EnvironmentTest.spyProcessExit();
})
describe('Rest', () => {
    beforeAll(done => {
        process.argv.push('--the-way.core.scan.enabled=true');
        process.argv.push('--the-way.core.scan.path=src/test/resources/rest/hero');
        process.argv.push('--the-way.core.log.level=0');
        process.argv.push('--the-way.server.enabled=false');
        process.argv.push('--the-way.server.http.enabled=false');
        process.argv.push('--the-way.server.https.enabled=false');
        import('../../resources/environment/main/not-automatic-main.test').then(
            (result) => {
                new result.NotAutomaticMainTest();
                done();
            }
        );
    });
    test('Server Not Enabled With Rest', done => {
        CORE.whenDestroyed().subscribe(
            (error: any) => {
                expect(error.description).toBe(Messages.getMessage('TW-011'))
                expect(error.detail).toBe(Messages.getMessage('error-server-cannot-map-path'))
                done();
            }
        );
    });
});

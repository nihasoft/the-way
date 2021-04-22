import { EnvironmentTest } from '../../resources/environment/environment.test';
import { CORE, CoreStateEnum } from '../../../main';
import { switchMap } from 'rxjs/operators';

const defaultArgs = [...process.argv];
afterAll(done => {
    EnvironmentTest.clear(done);
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
test('Destruction: Service & Configuration With Error', done => {
    const scanPath = 'src/test/resources/destructible/error';
    process.argv.push('--the-way.core.scan.path=' + scanPath);
    process.argv.push('--the-way.core.scan.enabled=true');

    import('../../resources/environment/main/main.test').then(
        () => {
            CORE.whenReady().pipe(
                switchMap(() => {
                    return CORE.destroy();
                })
            ).subscribe(
                (error: Error | void) => {
                    expect((error as Error).message).toBe('Destruction: An error ocurred in the destruction step. Error Damn!! SMASHER!. -> Error');
                    done();
                }
            );
        }
    );
});
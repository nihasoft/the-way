import { EnvironmentTest } from '../../resources/environment/environment.test';
import { CORE } from '../../../main';

afterAll(done => {
    EnvironmentTest.clear(done);
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
test('Injection: Error In Dependency', done => {
    const scanPath = '../../resources/injection/in-error-dependency';
    process.argv.push('--the-way.core.scan.path=' + scanPath);
    process.argv.push('--the-way.core.scan.enabled=true');
    process.argv.push('--the-way.core.language=br');
    process.argv.push('--the-way.core.log.level=1');

    import('../../resources/environment/main/main.test').then(
        () => {
            CORE.whenDestroyed().subscribe(
                () => expect(true).toBeFalsy(),
                (error: Error | undefined ) => {
                    expect(error).toBeDefined();
                    done();
                }
            );
        }
    );
});
import { ApplicationException, CORE, CoreMessageService } from '../../../main';
import { EnvironmentTest } from '../../resources/environment/environment.test';

afterAll(done => {
    EnvironmentTest.clear(done);
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
test('Overridde: Twice Same Class', done => {
    const scanPath = 'src/test/resources/injection/overriding-dependency/same-class';
    process.argv.push('--the-way.core.scan.path=' + scanPath);
    process.argv.push('--the-way.core.scan.enabled=true');
    process.argv.push('--the-way.core.language=br');
    import('../../resources/environment/main/main.test').then(() => {
        CORE.whenDestroyed().subscribe(
            () => expect(true).toBeFalsy(),
            (error: Error | undefined) => {
                if (error && error instanceof ApplicationException) {
                    expect(error.detail).toBe(CoreMessageService.getMessage('error-cannot-overridden-twice', [ 'DependencyAServiceTest', 'DependencyBServiceTest', 'DependencyCServiceTest' ]))
                    expect(error.description).toBe(CoreMessageService.getMessage('TW-010'))
                    done();
                }
            }
        );
    })
});
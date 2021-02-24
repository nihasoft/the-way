import { ApplicationException, CORE, Messages } from '../../../main';
import { EnvironmentTest } from '../../resources/environment/environment.test';

afterAll(() => {
    EnvironmentTest.clear();
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
test('Override: Twice Same Class', done => {
    const scanPath = 'src/test/resources/injection/overriding-dependency/same-class';
    process.argv.push('--the-way.core.scan.path=' + scanPath);
    process.argv.push('--the-way.core.scan.enabled=true');
    process.argv.push('--the-way.core.language=br');
    import('../../resources/environment/main/main.test').then(() => {
        CORE.whenDestroyed().subscribe(
            (error: ApplicationException | undefined) => {
                if (error) {
                    expect(error.detail).toBe(Messages.getMessage('before-initialization-cannot-override-twice', [ 'DependencyAServiceTest', 'DependencyBServiceTest', 'DependencyCServiceTest' ]))
                    expect(error.description).toBe(Messages.getMessage('TW-010'))
                    done();
                }
            }
        );
    })
});
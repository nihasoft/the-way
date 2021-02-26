import { EnvironmentTest } from '../../resources/environment/environment.test';
import { ApplicationException, CORE } from '../../../main';

afterAll(() => {
    EnvironmentTest.clear();
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
test('Instance: Instance not created', done => {
    const scanPath = 'src/test/resources/instance';
    process.argv.push('--the-way.core.scan.path=' + scanPath);
    process.argv.push('--the-way.core.scan.enabled=true');
    process.argv.push('--the-way.core.language=br');
    process.argv.push('--the-way.core.log.level=0');

    import('../../resources/environment/main/main.test').then(
        () => {
            CORE.whenDestroyed().subscribe(
                (error: Error | undefined) => {
                    if (error) {
                        expect(error.message).toBe('I\'m Thanos!')
                        done();
                    }
                }
            );
        }
    );
});
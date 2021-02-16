import { switchMap } from 'rxjs/operators';

import { EnvironmentTest } from '../../resources/environment/environment.test';
import { ApplicationException, CORE, Messages } from '../../../main';

afterAll(() => {
    EnvironmentTest.clear();
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
test('With Error', (done) => {
    const defaultArgs = [ ...process.argv ];
    import('../../resources/environment/main/not-automatic-main.test').then(
        (value => {
            const message = 'Wakeup Samurai, We have a city to explode!!';
            new value.NotAutomaticMainTest();
            CORE.whenReady().pipe(
                switchMap(() => {
                    EnvironmentTest.buildCoreDestructionArmySpy(message);
                    return CORE.destroy();
                })
            ).subscribe(
                (error: ApplicationException | void) => {
                    if (error) {
                        expect(error.message).toBe(
                            Messages.getMessage('destroyed-with-error', [message]) +
                            ' -> ' +
                            Messages.getMessage('TW-012')
                        );
                        expect(CORE.isDestroyed()).toBe(true);
                        process.argv = defaultArgs;
                        done();
                    }
                }
            );
        })
    );
});
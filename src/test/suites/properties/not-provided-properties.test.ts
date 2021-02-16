import { CORE, PropertyModel } from '../../../main';
import { EnvironmentTest } from '../../resources/environment/environment.test';

afterAll(() => {
    EnvironmentTest.clear();
});
beforeAll(() => {
    EnvironmentTest.spyProcessExit();
});
describe('Properties Handler: ', () => {
    test('Properties not provided', done => {
        let properties: PropertyModel;
        const index = process.argv.findIndex((arg: string) => arg === '--properties=src/test/resources/application-test.properties.yml');
        process.argv = [...process.argv.slice(0, index), ...process.argv.slice(index + 1)];
        import('../../resources/environment/main/main.test').then(
            () => {
                CORE.whenReady().subscribe(
                    () => {
                        properties = CORE.getPropertiesHandler().getProperties() as PropertyModel;
                        CORE.destroy();
                        done();
                    }
                );
            }
        );
    });
});
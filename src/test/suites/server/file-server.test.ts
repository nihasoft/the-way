import {EnvironmentTest} from "../../resources/environment/environment.test";
import {CORE} from "../../../main";
import {HttpRequestorEnvironment} from "../../resources/environment/http-requestor.environment.test";
import {HttpsRequestorEnvironment} from "../../resources/environment/https-requestor.environment.test";

afterAll(done => {
    EnvironmentTest.clear(done);
});
beforeEach(() => {
    EnvironmentTest.spyProcessExit();
})
describe('Server Configuration: ', () => {
    test('File Server - Full Path', done => {
        const path = __dirname.replace('suites\\server', 'resources\\file-server')
        process.argv.push('--the-way.core.scan.enabled=false');
        process.argv.push('--the-way.core.log.level=0');
        process.argv.push('--the-way.server.http.enabled=false');
        process.argv.push('--the-way.server.https.enabled=true');
        process.argv.push('--the-way.server.https.keyPath=src/test/resources/certificate/localhost.key');
        process.argv.push('--the-way.server.https.certPath=src/test/resources/certificate/localhost.cert');

        process.argv.push('--the-way.server.file.enabled=true');
        process.argv.push('--the-way.server.file.full=true');
        process.argv.push('--the-way.server.file.path=' + path);
        import('../../resources/environment/main/not-automatic-main.test').then(
            (result) => {
                new result.NotAutomaticMainTest();
                CORE.whenReady().subscribe(
                    () => {
                      HttpsRequestorEnvironment.GetNoParse('').subscribe(
                          (result: any) => {
                              expect(result.toString()).toContain('Luke, I`m your father!');
                              done();
                          }
                      );
                    }
                );
            }
        );
    });
});
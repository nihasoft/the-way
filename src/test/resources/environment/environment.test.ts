import resetAllMocks = jest.resetAllMocks;

import { Observable, Subscriber } from 'rxjs';

import {
    CORE, CoreCryptoService, CoreRestService, CoreLogger,
    PropertiesHandler, ServerConfiguration, ConstructorMapModel, CoreSecurityService
} from '../../../main';

export class EnvironmentTest {
    private static CORE_INSTANCES = [ 'CoreSecurityService', 'CoreCryptoService', 'PropertiesHandler', 'CoreLogger', 'CoreRestService'];
    private static CORE_TYPES = [ CoreSecurityService, CoreCryptoService, CoreLogger, ServerConfiguration, PropertiesHandler, CoreRestService ];
    private static processExitSpy: jest.SpyInstance
    private static processArgs: Array<string> = [ ...process.argv ];

    public static buildCoreConfigureSpy(message: string): void {
        const core = (CORE as any).INSTANCE$.getValue();
        const instanceHandler = core.instanceHandler;
        jest.spyOn(instanceHandler as any, 'configureInstances').mockReturnValue(
            new Observable((observer: Subscriber<boolean>) => {
                observer.error({
                    detail: message
                });
                observer.next(true);
                observer.complete();
            })
        );
    }
    public static clear(done: Function): void {
        this.clearProcessVariables();
        resetAllMocks();
        if (!CORE.isDestroyed()) {
            CORE.destroy().subscribe(
                () => {
                    done();
                }
            );
        } else {
            done();
        }
    }
    public static clearProcessVariables(): void {
        process.argv = [ ...this.processArgs ];
    }
    public static getConstructorsWithoutCore(): ConstructorMapModel {
        const filtered = {} as ConstructorMapModel;
        const constructors = CORE.getConstructors();
        for (const constructor in constructors) {
            if (!this.CORE_INSTANCES.includes(constructor)) {
                filtered[constructor] = constructors[constructor];
            }
        }
        return filtered;
    }
    public static getDependenciesTree(): any {
        const dependenciesTree = { ...CORE.getDependenciesTree() };

        for (const type of this.CORE_TYPES) {
            delete dependenciesTree[ type.name ];
        }

        return dependenciesTree;
    }
    public static getInstancesWithout(exclude: Array<any>): Array<any> {
        return CORE.getInstances().filter((instance: any) => {
            for (const type of [...this.CORE_TYPES, ...exclude]) {
                if (instance instanceof type) {
                    return false;
                }
            }
            return true;
        });
    }
    public static spyProcessExit(): void {
        this.processExitSpy = jest.spyOn(process, 'exit');
        this.processExitSpy.mockReturnValue('banana');
    }
}
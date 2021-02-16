import Spy = jasmine.Spy;
import resetAllMocks = jest.resetAllMocks;
import { Observable, Subscriber } from 'rxjs';
import { CORE, CryptoService, Logger, ServerConfiguration } from '../../../main';
import { ConstructorMapModel } from '../../../main/core/model/constructor-map.model';

export class EnvironmentTest {
    private static CORE_INSTANCES = ['CryptoService'];
    private static CORE_TYPES = [ CryptoService, Logger, ServerConfiguration ];
    private static processExitSpy: Spy
    private static processArgs: Array<string> = [ ...process.argv ];

    public static buildCoreConfigueSpy(message: string): void {
        const core = (CORE as any).getInstance();
        spyOn(core as any, 'configure').and.returnValue(
            new Observable((observer: Subscriber<boolean>) => {
                observer.error({
                    detail: message
                });
                observer.next(true);
                observer.complete();
            })
        );
    }
    public static buildCoreDestructionArmySpy(message: string): void {
        const core = (CORE as any).getInstance();
        spyOn(core as any, 'destroyTheArmy').and.returnValue(
            new Observable((observer: Subscriber<boolean>) => {
                observer.error(new Error(message));
                observer.next(true);
                observer.complete();
            })
        );
    }
    public static clear(): void {
        this.clearProcessVariables();
        resetAllMocks();
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
        this.processExitSpy = spyOn(process, 'exit');
        this.processExitSpy.and.returnValue('banana');
    }
}
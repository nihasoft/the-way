import { forkJoin, Observable, of } from 'rxjs';
import { defaultIfEmpty, map } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

import { Logger } from '../shared/logger';
import { InstancesMapModel } from '../model/instances-map.model';
import { RegisterHandler } from './register.handler';
import { ConstructorModel } from '../model/constructor.model';
import { Messages } from '../shared/messages';
import { ConfigurationMetaKey } from '../decorator/configuration.decorator';
import { Configurable } from '../shared/configurable';
import { Destroyable } from '../shared/destroyable';
import { ApplicationException } from '../exeption/application.exception';

/*
    eslint-disable @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
 */
export class InstanceHandler {
    protected INSTANCES: InstancesMapModel;

    constructor(
        protected logger: Logger,
        protected registerHandler: RegisterHandler
    )   {
        this.initialize();
    }

    public buildApplication(constructor: Function): Object {
        const object = this.buildObject(constructor);
        this.registerInstance(object);
        return object;
    }
    public buildInstance<T>(constructor: Function): T | null {
        const registeredConstructor = this.registerHandler.getConstructor(constructor.name);
        const registeredConstructorName = registeredConstructor.name;
        if (!this.INSTANCES[registeredConstructorName]) {
            this.logger.debug(
                Messages.getMessage('building-instance', [ registeredConstructorName ]),
                '[The Way]'
            );
            const instance = this.buildObject(registeredConstructor.constructorFunction);
            const decorators = Reflect.getMetadataKeys(registeredConstructor.constructorFunction);
            this.registerInstance(instance);
            this.handleInstance(instance, decorators);
            return instance as T;
        } else {
            return this.INSTANCES[registeredConstructorName] as T;
        }
    }
    public buildCoreInstances(): void {
        this.logger.debug(Messages.getMessage('building-core-instances'), '[The Way]');
        Object.values(this.registerHandler.getCoreComponents()).forEach(
            (registeredConstructor: ConstructorModel) => {
                this.buildInstance(registeredConstructor.constructorFunction);
            }
        );
    }
    public buildInstances(): void {
        this.logger.debug(Messages.getMessage('building-instances'), '[The Way]');
        Object.values(this.registerHandler.getComponents()).forEach(
            (registeredConstructor: ConstructorModel) => {
                this.buildInstance(registeredConstructor.constructorFunction);
            }
        );
    }
    protected buildObject(constructor: Function): Object {
        return new constructor.prototype.constructor();
    }
    public caller(methodName: string, instances: Array<any>, messageKey: string): Observable<boolean> {
        const results: Array<Observable<any>> = [];

        for (const instance of instances) {
            let observable: Observable<any>;
            try {
                this.logger.debug(Messages.getMessage(messageKey, [ instance.constructor.name ]), '[The Way]');
                const method = Reflect.get(instance, methodName) as Function;
                const result = Reflect.apply(method, instance, []);

                if (result instanceof Promise) {
                    observable = fromPromise(result);
                } else if (result instanceof Observable) {
                    observable = result;
                } else {
                    observable = of(result);
                }
                observable.pipe(
                    defaultIfEmpty(true)
                );
            } catch (ex) {
                observable = of(ex);
            }

            results.push(observable);
        }
        return forkJoin(results).pipe(
            map((values: Array<any>) => {
                const errors = values.filter((value => {
                    return value !== undefined && (
                        value instanceof Error || value.code !== undefined
                    );
                }));

                if (errors.length > 0) {
                    throw (errors[0]);
                } else {
                    return true;
                }
            }),
            defaultIfEmpty(true)
        );
    }
    public configure(): Observable<boolean> {
        return this.caller('configure', this.registerHandler.getConfigurables(), 'configuring-instance');
    }
    public destroy(): Observable<boolean> {
        return this.caller('destroy', this.registerHandler.getDestroyable(), 'destruction-instance',);
    }
    public getInstanceByName<T>(name: string): T {
        const registeredConstructor = this.registerHandler.getConstructor(name);
        if (registeredConstructor) {
            return this.INSTANCES[registeredConstructor.name];
        } else {
            throw new ApplicationException(
                Messages.getMessage('error-not-found-instance', [name]),
                Messages.getMessage('TW-012')
            );
        }
    }
    public getInstances(): Array<any> {
        return Object.values(this.INSTANCES);
    }
    protected handleInstance<T>(instance: T, decorators: Array<string>): void {
        if (decorators.includes(ConfigurationMetaKey) && instance instanceof Configurable) {
            this.registerHandler.registerConfigurable(instance);
        }

        if (instance instanceof Destroyable) {
            this.registerHandler.registerDestroyable(instance);
        }
    }
    protected initialize(): void {
        this.INSTANCES = {};
    }
    public registerInstance(instance: Object): void {
        this.INSTANCES[instance.constructor.name] = instance;
    }
}

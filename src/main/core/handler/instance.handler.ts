import { BehaviorSubject, forkJoin, isObservable, Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

import { CoreLogger } from '../service/core-logger';
import { InstancesMapModel } from '../shared/model/instances-map.model';
import { RegisterHandler } from './register.handler';
import { ConstructorModel } from '../shared/model/constructor.model';
import { CoreMessageService } from '../service/core-message.service';
import { Destroyable } from '../shared/abstract/destroyable';
import { ApplicationException } from '../exeption/application.exception';
import { DependencyTreeModel } from '../shared/model/dependency-tree.model';
import { Configurable } from '../shared/abstract/configurable';

/*
    eslint-disable @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/explicit-module-boundary-types
 */
/**
 *   @name InstanceHandler
 *   @description InstanceHandler is the responsible to create the instances, resolve the dependencies tree,
 *      configure and destroy instances.
 *   @since 1.0.0
 */
export class InstanceHandler {
    protected INSTANCES: InstancesMapModel;

    constructor(
        protected logger: CoreLogger,
        protected registerHandler: RegisterHandler
    )   {
        this.initialize();
    }

    protected bindDependentWithDepedencies(dependent: string, dependencies: Array<string>): void {
        for (const dependency of dependencies) {
            const dependencyInformation = this.registerHandler.getDependency(dependent, dependency);
            const instance = this.getInstanceByName(dependencyInformation.dependencyConstructor.name) as Object;
            const target = dependencyInformation.target as Function;
            const dependencyName = (instance.constructor.name !== dependencyInformation.dependencyConstructor.name) ?
                instance.constructor.name + '( as ' + dependencyInformation.dependencyConstructor.name + ' )' :
                dependencyInformation.dependencyConstructor.name;

            Reflect.set(target, dependencyInformation.key as string, instance);
            this.logger.debug(
                CoreMessageService.getMessage(
                    'injection-injected',
                    [dependencyName, dependent, dependencyInformation.key]
                ),
                '[The Way]'
            );
        }
    }
    /**
     *   @name buildApplication
     *   @description This method will create an instance of the class decorated with @Application. Used in core only.
     *   @param constructor: With type Function, is the constructor of the main application class.
     *   @return instance: Is the constructor of the main application class.
     *   @since 1.0.0
     */
    public buildApplication<T>(constructor: Function): T {
        const object = this.buildObject<T>(constructor);
        this.registerInstance(object);
        return object;
    }
    protected buildCoreComponents(): Array<Configurable> {
        this.logger.debug(CoreMessageService.getMessage('building-core-instances'), '[The Way]');
        return this.buildComponents(Object.values(this.registerHandler.getCoreComponents()));
    }
    protected buildApplicationComponents(): Array<Configurable> {
        this.logger.debug(CoreMessageService.getMessage('building-instances'), '[The Way]');
        return this.buildComponents(Object.values(this.registerHandler.getComponents()));
    }
    protected buildComponents(components: Array<any>): Array<Configurable> {
        const configurable: Array<Configurable> = [];
        components.forEach(
            (registeredConstructor: ConstructorModel) => {
                const [instance, wasCreatedBefore] = this.buildInstance(registeredConstructor.constructorFunction);
                if ((instance instanceof Configurable) && !wasCreatedBefore) {
                    configurable.push(instance);
                }
            }
        );
        return configurable;
    }
    protected buildDependenciesInstances(
        constructor: Function | Object,
        dependencyTree: DependencyTreeModel
    ): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            const componentsOrdered = this.getBuildDependenciesOrder(dependencyTree);
            const handler = new BehaviorSubject<Array<string>>(componentsOrdered);
            handler.subscribe(
                (components: Array<string>) => {
                    if (components.length === 0) {
                        handler.complete();
                    } else {
                        const component = components.shift() as string;
                        const dependenciesTree = dependencyTree[component];
                        const dependencies = (dependenciesTree) ? Object.keys(dependenciesTree) : [];
                        this.buildDependencyInstance(component, dependencies).subscribe(
                            () => {
                                handler.next(components);
                            },
                            (error) => handler.error(error)
                        );
                    }
                }, (error => {
                    observer.error(error);
                    observer.complete();
                }), () => {
                    observer.next(true);
                    observer.complete();
                }
            );
        });
    }
    protected buildDependencyInstance(
        component: string, dependencies: Array<string>
    ): Observable<boolean> {
        this.bindDependentWithDepedencies(component, dependencies);
        const constructor = this.registerHandler.getConstructor(component)?.constructorFunction;
        if (constructor) {
            return this.buildInstanceAndConfigure(constructor);
        } else {
            /*
            * When the component is the MAIN class
            * */
            return of(true);
        }
    }
    protected buildObject<T>(constructor: Function): T {
        return new constructor.prototype.constructor();
    }
    protected buildObservableFromResult(result: any): Observable<any> {
        if (isObservable(result)) {
            return result;
        } else if (result instanceof Promise) {
            return fromPromise(result);
        } else if (result) {
            return of(result);
        } else {
            return of(undefined);
        }
    }
    /**
     *   @name buildInstance
     *   @description Will create or retrieve an instance of a constructor.
     *      If the constructor was override, will be returned the overridden class instance
     *      If the class extends the Destroyable, this instance will be registered to be destroyed when the
     *      Core assume the destruction state.
     *   @param constructor: With type Function, is the constructor of the class.
     *   @return [instance, boolean], will return an array with instance in first index, and a boolean flag in the second index.
     *      The boolean flag will be false when an instance is created and true when has an instance.
     *   @since 1.0.0
     */
    public buildInstance<T>(constructor: Function): [T, boolean] {
        const registeredConstructor = this.registerHandler.getConstructor(constructor.name);
        const registeredConstructorName = registeredConstructor.name;
        if (!this.INSTANCES[registeredConstructorName]) {
            this.logger.debug(
                CoreMessageService.getMessage('building-instance', [ registeredConstructorName ]),
                '[The Way]'
            );
            const instance = this.buildObject(registeredConstructor.constructorFunction);
            this.registerInstance(instance);
            this.handleInstance(instance);
            return [instance as T, false];
        } else {
            return [this.INSTANCES[registeredConstructorName] as T, true];
        }
    }
    protected buildInstanceAndConfigure(constructor: Function): Observable<any> {
        const [instance, wasCreatedBefore] = this.buildInstance(constructor);
        if (this.registerHandler.getConfigurables().has(constructor) && !wasCreatedBefore) {
            return this.configureInstance(instance as Configurable);
        } else {
            return of(true);
        }
    }
    /**
     *   @name buildInstances
     *   @description this method will resolve the dependencies tree, create all the instances registered and configure the classes
     *      that extends the Configurable. Core only.
     *   @param mainConstructor: With type Function, is the constructor of the main class.
     *   @param dependencyTree: is the dependency tree created in DependencyHandler
     *   @return Observable<boolean>: emits true when all instances were created and configured.
     *   @since 1.0.0
     */
    public buildInstances(mainConstructor: Function | Object, dependencyTree: DependencyTreeModel): Observable<boolean> {
        this.logger.debug(CoreMessageService.getMessage('building-dependencies-instances'), '[The Way]');
        return this.buildDependenciesInstances(mainConstructor, dependencyTree).pipe(
            switchMap(() => {
                const configurableInstances = this.buildCoreComponents();
                configurableInstances.push(...this.buildApplicationComponents());
                return this.configureInstances(new Set<Configurable>(configurableInstances));
            })
        );
    }
    protected caller(methodName: string, instances: Set<any>, messageKey: string): Observable<boolean> {
        const results: Array<Observable<any>> = [];

        for (const instance of instances) {
            let observable: Observable<any>;
            try {
                this.logger.debug(CoreMessageService.getMessage(messageKey, [ instance.constructor.name ]), '[The Way]');
                const method = Reflect.get(instance, methodName) as Function;
                const result = Reflect.apply(method, instance, []);
                observable = this.buildObservableFromResult(result);
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
            })
        );
    }
    protected configureInstance(instance: Configurable): Observable<any> {
        try {
            this.logger.debug(
                CoreMessageService.getMessage('configuring-instance', [ instance.constructor.name ]),
                '[The Way]'
            );
            return this.buildObservableFromResult((instance).configure());
        } catch (ex) {
            return throwError(ex);
        }
    }
    protected configureInstances(instances: Set<Configurable>): Observable<boolean> {
        if (instances.size > 0) {
            return this.caller('configure', instances, 'configuring-instance');
        } else {
            return of(true);
        }
    }
    /**
     *   @name destroy
     *   @description will destroy all instances that extends Destroyable.
     *   @return Observable<boolean>: emits true when all instances are destroyed.
     *   @since 1.0.0
     */
    public destroy(): Observable<boolean> {
        const destroyable = this.registerHandler.getDestroyable();
        if (destroyable.size > 0) {
            return this.caller('destroy', destroyable, 'destruction-instance');
        } else {
            return of(true);
        }
    }
    protected getBuildDependenciesOrder(dependencyTree: DependencyTreeModel): Array<string> {
        let dependencies = Object.keys(dependencyTree);
        const resolvingDependencies = new Set<string>();
        const processed = new Set<string>();

        for (let i = 0; i < dependencies.length; i++) {
            const dependency = dependencies[i];
            const subDependenciesTree = dependencyTree[dependency];
            const subDependencies = (subDependenciesTree && !resolvingDependencies.has(dependency)) ? Object.keys(subDependenciesTree) : [];

            if (subDependencies.length > 0) {
                dependencies = [...dependencies.slice(0, i), ...subDependencies, ...dependencies.slice(i, dependencies.length)];
                resolvingDependencies.add(dependency);
                i--;
            } else if (processed.has(dependency)) {
                dependencies.splice(i, 1);
                i--;
            } else {
                processed.add(dependency);
            }
        }
        return dependencies;
    }
    /**
     *   @name getInstanceByName
     *   @description Will return the wanted class instance.
     *   @param name: With type string, is the class name of the wanted instance. When not found, an exception will be thrown
     *   @return The wanted instance
     *   @since 1.0.0
     */
    public getInstanceByName<T>(name: string): T {
        const registeredConstructor = this.registerHandler.getConstructor(name);
        const instance = (registeredConstructor) ?
            this.INSTANCES[registeredConstructor.name] :
            this.INSTANCES[name];
        if (instance) {
            return instance;
        } else {
            throw new ApplicationException(
                CoreMessageService.getMessage('error-not-found-instance', [name]),
                CoreMessageService.getMessage('TW-012')
            );
        }
    }
    /**
     *   @name getInstances
     *   @description This method will return all created instances.
     *   @return All instances
     *   @since 1.0.0
     */
    public getInstances(): Array<any> {
        return Object.values(this.INSTANCES);
    }
    protected handleInstance<T>(instance: T): void {
        if (instance instanceof Destroyable) {
            this.registerHandler.registerDestroyable(instance);
        }
    }
    protected initialize(): void {
        this.INSTANCES = {};
    }
    /**
     *   @name registerInstance
     *   @description Will register an instance
     *   @param The class instance
     *   @since 1.0.0
     */
    public registerInstance<T>(instance: T): void {
        this.INSTANCES[(instance as any).constructor.name] = instance;
    }
}

export const PathParamMetadataKey = Symbol('PathParam');

export function PathParam(name: string) {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let parameters: Array<any> = Reflect.getOwnMetadata(PathParamMetadataKey, target, propertyKey) || [];
        parameters.push({index: parameterIndex, name: name});
        Reflect.defineMetadata(PathParamMetadataKey, parameters, target, propertyKey);
    }
}

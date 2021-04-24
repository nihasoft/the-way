/* eslint-disable max-len */
export const MESSAGES: { [key: string]: { [key: string]: string | number; } } = {
    'en': {
        'building': 'Building: Started',
        'building-core-instances': 'Building: Core instances...',
        'building-dependencies-tree-done': 'Building: Dependencies tree\n \n$\n',
        'building-dependencies-instances': 'Building: Dependencies Instances...',
        'building-done': 'Building: done.',
        'building-instance': 'Building: Instance -> $',
        'building-instances': 'Building: Instances...',

        'configuring-application-class': 'Configuring: Application instance...',
        'configuring-instance': 'Configuring: $',

        'destruction-instance': 'Desctruction: Destroying $',
        'destruction-destroyed': 'Desctruction: I\'m inevitable! Was destroyed every thing. CYA!',

        'error': 'An error ocurred',
        'error-cannot-inject': 'Register: The class $ cannot be injected. Only The Core PropertiesHandler can be injected.',
        'error-cannot-overridden-core-classes': 'Register: Core class cannot be overriden $.',
        'error-cannot-overridden-twice': 'Register: Is not possible to overwrite more than once. Was registered the overridden $ as $. The current is $.',
        'error-cannot-scan': 'Register: Cannot scan files with the provided path $.',
        'error-circular-dependency': 'Register: Found a circular dependency between $ -> $.',
        'error-in-destruction': 'Destruction: An error ocurred in the destruction step. Error $.',
        'error-is-not-the-way': 'Preparing: Your application does not extend the class TheWayApplication',
        'error-not-found-dependency-constructor': 'Register: Cannot inject $ in class $. Cannot acquire the metadata from property. Probably a circular dependency',
        'error-not-found-instance': 'The $ instance not found',
        'error-properties-not-valid': 'Preparing: The provided application properties is not valid.',
        'error-rest-cannot-perform-action': 'You cannot perform this action.',
        'error-rest-no-token': 'Token no found',
        'error-rest-claims-without-token-verify': 'Trying to inject claims in a not authenticated path',
        'error-rest-invalid-token': 'Invalid Token',
        'error-rest-empty-request': 'Empty body',
        'error-rest-empty-response': 'Empty response',
        'error-rest-operation-not-in-rest': 'The Operation [$] $ must be in a Rest context. Decorate the $ class with @Rest',
        'error-rest-path-parameter': 'The path parameter $ is not present or not equal in method.',
        'error-server': 'Cannot initialize server -> $',
        'error-server-cannot-map-path': 'Cannot map a REST path without server.',
        'error-server-not-enabled': 'Cannot use Server Without Http or Https.',

        'http-bad-request': 'Bad Request',
        'http-internal-server-error': 'Internal Server Error',
        'http-not-allowed': 'Not Allowed',
        'http-not-authorized': 'Not Authorized',
        'http-server-initialization': 'Configuring the Http & Https server.',
        'http-server-running': 'HttpServer started on port $',
        'https-server-running': 'HttpsServer started on port $',
        'http-swagger-enabled': 'Configuring the Swagger UI...',
        'http-file-enabled': 'Configuring the File Server...',

        'injection-injected': 'Injection: Injected $ into $.$.',

        'register-class': 'Register: $ with type $',
        'register-dependency': 'Register: Dependency between -> $ into $',
        'register-found-resource': 'Register: Loading resources $',
        'register-overridden': 'Register: Overridden -> $ as $',
        'register-path': 'Register: [$] $ -> $',
        'register-father-path': 'Register: $ -> $',
        'register-scanning': 'Register: Searching & Loading the resources...',

        'step-after-initialization': 'Running: The application is running [elapsed time $].',
        'step-before-initialization-started': 'Register Step: Started',
        'step-before-initialization-done': 'Register Step: Done.',
        'step-destruction-started': 'Desctruction Step: Started',
        'step-destruction-done': 'Desctruction Step: Done.',
        'step-initialization-started': 'Building & Configuration Step: Started',
        'step-initialization-done': 'Building & Configuration Step: Done.',

        'TW-001': 'Application not recognized',
        'TW-002': 'HttpServer is not found',
        'TW-003': 'File not found',
        'TW-004': 'Cannot inject',
        'TW-005': 'Instance not created',
        'TW-006': 'Not destroyed',
        'TW-007': 'Not configured',
        'TW-008': 'Circular dependency',
        'TW-009': 'Metadata not found',
        'TW-010': 'Cannot Override',
        'TW-011': 'Not Valid',
        'TW-012': 'Error',
        'TW-013': 'Cannnot register',
        'TW-014': 'Core Constructor',
        'TW-015': 'Core Class Injection',

        'warning-properties-not-gived': 'Preparing: Not gived a file properties. Will be used the default properties.',
        'warning-http-file-with-helmet': 'Http enabled but with HELMET parameters. This can cause problems in file server.',
    }
};

export class Messages {
    static messages = MESSAGES;
    static language = 'en'
    static setLanguage(language: string): void {
        this.language = language;
    }
    private static get(name: string): string | number {
        const defaultMessages = this.messages.en;
        let languageMessages = this.messages[this.language];
        if (!languageMessages) {
            languageMessages = defaultMessages;
        }
        return (languageMessages[name]) ? languageMessages[name] : defaultMessages[name];
    }
    static getCodeMessage(name: string): number {
        return this.get(name) as number;
    }
    static getMessage(name: string, replacements?: Array<string>): string {
        let message = this.get(name) as string;

        if (replacements && (typeof message === 'string')) {
            for (const replace of replacements) {
                message = (message as string).replace('$', replace);
            }
        }

        return message;
    }
}

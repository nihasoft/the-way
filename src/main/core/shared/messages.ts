export const MESSAGES: { [key: string]: { [key: string]: string | number; } } = {
    'en': {
        'bad-request': 'Bad Request',
        'bad-request-code': 400,
        'building': 'Building instances and dependencies...',
        'building-application-class': 'Building application instance...',
        'building-class': 'Building instance for $',
        'building-dependencies-tree': 'Building dependencies tree...',
        'building-instances': 'Building instances...',
        'cannot-scan': 'Cannot scan files with the provided path $',
        'cannot-override-twice': 'it is not possible to overwrite more than once. Was registered the overridden $ -> $ and the current $',
        'circular-dependency': 'Found a circular dependency between $ -> $',
        'configuring': 'Configuring some things...',
        'destroying': 'Descruction process started...',
        'destroyed': 'I\'m inevitable! Was destroyed every thing. CYA!',
        'destroyed-with-error': 'An error ocurred in the destruction step. Error $',
        'error-occured-destroying': 'An error ocurred in the initialization step.',
        'found-resource': 'Loading resources $',
        'initializing': 'Initializing the application...',
        'internal-error': 'Internal Error',
        'internal-server-error': 'Internal Server Error',
        'internal-server-error-code': 500,
        'injection': 'Injected $ into $.$',
        'is-not-the-way': 'Your application does not extend the class TheWayApplication',
        'manual-initialization': 'Manual initialization...',
        'not-allowed': 'Not Allowed',
        'not-allowed-code': 403,
        'not-found': 'Not Found',
        'not-found-code': 404,
        'not-found-dependency-constructor': 'Cannot inject property: $ in class $. ' +
            'Cannot acquire the metadata from property. Probably a circular dependency',
        'properties-not-gived': 'Not gived a file properties. Will be used the default properties.',
        'properties-not-valid': 'The provided application properties is not valid.',
        'ready': 'The application is running [elapsed time $].',
        'registering-class': 'Registered: $ with type $',
        'registering-dependency-class': 'Registered dependency between: $ -> $',
        'registering-overridden-class': 'Registered overriden: $ -> $',
        'resolving-tree': 'Providing instances for dependency tree...',
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
        'scanning': 'Searching & Loading the resources...',
        'unauthorized': 'Not Authorized',
        'unauthorized-code': 401
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

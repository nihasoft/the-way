## CoreMessagesConstant

This constant is used to make an internationalization.
The keys are the language, and the value of the language key,
is a generic object with a message name as key, and the value as message.
The system language is defined in the property ['the-way.core.language'](documentation/the-way/core/application-properties.md#the-waycorelanguage), and used in [CoreMessagesService](documentation/the-way/core/service/core-message-service.md)

**Example: A new Language**

    {
        'en': {
            ...
            'welcome-message': 'Hello user'
        },
        'pt': {
            ...
            'welcome-message': 'Olá usuário'
        }
    }
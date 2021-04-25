## NodeJs With Typescript

The Typescript is basically a Javascript with types and closest to the ECMAScript implementations.

### Summary

 - [Before The Way](#before-the-way)
 - [Initializing Project: NPM](#initializing-project-npm)
 - [Initializing Project: Typescript](#initializing-project-typescript)
 - [Main: A First Typescript Class](#main-a-first-typescript-class)
 - [Initializing Project: The Way](#initializing-project-the-way)
 - [Extra: TSNode - Running The Typescript Source Code](#extra-typescript-in-development-stage)
 - [Extra: Watching File Change And Recompile](#extra-watch-code-changes-and-automatic-run)

### Before The Way

First you need to install the [NodeJS](https://nodejs.org/en/). When the NodeJs is installed you can move to the next state.

### Initializing Project: NPM

Create a folder that will be your project or clone a git repository and move to this directory.
Execute the command:

    npm init

With this command a wizard setup will initialize asking things for your project.
When the Wizard Setup is done, you can move to the next stage.

### Initializing Project: Typescript

Now we will install the typescript and initialize your project. Execute the follow commands:

*Installing the typescript*

    npm i typescript --save-dev

*Create a file named **tsconfig.json** with the follow content*

    {
        "compilerOptions": {
            "module": "commonjs",
            "esModuleInterop": true,
            "target": "ES2017",
            "moduleResolution": "node",
            "sourceMap": true,
            "outDir": "dist/src/main",
            "experimentalDecorators": true,
            "emitDecoratorMetadata": true,
            "strict": true,
            "strictPropertyInitialization": false
        }
    }

*The property "outDir" is the directory that the typescript build will put the final source code.*

### Main: A First Typescript Class

Now let's code a bit. Create the directory path: `src/main`, and inside this directory, create a file named with: `main.ts`.
In the created file put the below code:

*Main: src/main/main.ts*

    export class Main {
        constructor() {
            console.log('Hello World')
        }
    }
    new Main();

Now with a file and directory created, you can execute this code but first you need to build. To build and execute, you need to run the fellow commands:

Create a package.json script to execute the BUILD task:

*Script: package.json*

    {
        ...
        "scripts": {
            "build": "tsc"
        }
        ...
    }

*Script: build run*

    npm run build

After the build goal, let's run the final code:

    node dist/src/main/main.js


With the code above, when you run the built program an instance of type Main will be created and consoled the information 'Hello World'.

### Initializing Project: The Way

Now with every thing configured and created, you can improve the code with the framework TheWay.

*Installing TheWay*

    npm install @umberware/the-way

*Main: Adjustments for The Way*

    import { Application, TheWayApplication } from '@umberware/the-way';

    @Application()
    export class Main extends TheWayApplication {
        public start(): void {
            console.log('Hello World')
        }
    }

**To use the framework, your MAIN class need to be decorated with @Application and must extend the class TheWayApplication.**

After the adjustment let's run the code baby!!!

*Script: build run*

    npm run build

*Running*

    node dist/src/main/main.js


Now you are ready to explore all the features in TheWay Framework!

### Extra: Typescript In Development Stage

In the examples above, every change in the code must be built and in development stage this behavior can be exhaustive.
With the library [ts-node](https://www.npmjs.com/package/ts-node) we can execute the typescript source code without the build.

Installing the Ts-Node

    npm install ts-node --save-dev


Create a script in package.json to execute the ts-node command:

*Script: package.json*

    {
        ...
        "scripts": {
            "build": "tsc",
            "serve": "ts-node src/main/main.ts"
        }
        ...
    }

*Script: server run*

    npm run serve

### Extra: Watch Code Changes And Automatic RUN

To watch and run the code automatically we need to configure the [nodemon](https://www.npmjs.com/package/nodemon). With this library we can watch the code changes and recompile or run the code automatically.

*Installing the nodemon*

    npm install nodemon --save-dev

*Creating the nodemon.json*
In root path of your project create a file denominated as nodemon.json and put the follow code:

    {
        "watch": ["src", "../the-way/dist"],
        "ext": "ts",
        "ignore": ["src/**/*.spec.ts", "node_modules/**", "src/**/*.js"],
        "exec": "ts-node src/main/main.ts"
    }

*Updating the package.json*

In the `package.json` over the "scripts" you need to add a new instruction:

    {
        "scripts": {
            ...
            "serve": "nodemon --config nodemon.json --watch"
            ...
        }
    }

*Running and Watching the Code*

    npm run serve
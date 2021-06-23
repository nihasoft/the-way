[![Source Code](https://img.shields.io/badge/Source%20Code-black?logo=TypeScript&style=for-the-badge)](src/main/core/shared/model/dependency-map.model.ts)

## DependencyMapModel

This interface represents a map of all registered dependencies that must be resolved to run the application

Properties:

- *\[key: string\]*: Is a generic field, and the key is the dependent class name. The value of the key is a new Generic Object where
  keys are the dependency name, and the value is a [DependencyModel](dependency-model.md)

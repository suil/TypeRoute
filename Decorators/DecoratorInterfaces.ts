import DecoratorContext from "./DecoratorContext";

export interface IDecorator {
    onConfigure(config: any): void;
    onHandleRequest(decoratorContext: DecoratorContext): boolean;
}

export interface IMethodDecorator extends IDecorator {
    decorator(config: Object): MethodDecorator;
    decorator(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void;
    decorator(...params: any[]): any;
}

export interface IClassDecorator extends IDecorator {
    decorator(config: Object): ClassDecorator;
    decorator(target: Function): void;
    decorator(param: any): any;
}
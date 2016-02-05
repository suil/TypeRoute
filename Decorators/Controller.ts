import DecoratorContext from "./DecoratorContext";
import { IClassDecorator } from "./DecoratorInterfaces";

export class ControllerDecorator implements IClassDecorator {
    private static decoratorMetas: any[];

    onConfigure(config): void {
        
    }

    onHandleRequest(decoratorContext: DecoratorContext): boolean {
        return true;
    }

    decorator(routePrefix: string): ClassDecorator;
    decorator(target: Function): void;
    decorator(param: any): any {
        if (typeof param === "string") {
            const routePrefix = param;

            return (target: Object) => {
                ControllerDecorator.decoratorMetas.push({
                    classPrototype: target,
                    routePrefix: routePrefix
                });
            };
        }

        if (typeof param === "function") {
            const target = param;

            ControllerDecorator.decoratorMetas.push({
                classPrototype: target,
                routePrefix: ""
            });

            return;
        }
    }

}
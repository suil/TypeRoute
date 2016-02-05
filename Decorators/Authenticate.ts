import DecoratorContext from "./DecoratorContext";
import { IMethodDecorator } from "./DecoratorInterfaces";

export class AuthenticateDecorator implements IMethodDecorator {
    private static decoratorMetas: any[] = [];

    onConfigure(config): void {}

    onHandleRequest(context: DecoratorContext): boolean {
        const decoratorMeta = AuthenticateDecorator.decoratorMetas.find(meta =>
            meta.classPrototype === context.classInstance &&
            meta.methodName === context.methodName
        );

        if (!decoratorMeta) { return true; }

        const { users, roles } = decoratorMeta;

        if (!context.request.user ||
            users && !users.some(u => u === context.request.user.userName) ||
            roles && !roles.some(r => r === context.request.user.role)
        ) {
            context.response.status(401).end();
            return false;
        }

        return true;
    }

    decorator(config: Object): MethodDecorator;
    decorator(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void;
    decorator(...params: any[]): any {
        if (params.length === 1 && typeof params[0] === "object") {
            const { users, roles } = params[0];

            return (target: Object, propertyKey: string) => {
                AuthenticateDecorator.decoratorMetas.push({
                    classPrototype: target,
                    methodName: propertyKey,
                    users: users,
                    roles: roles
                });
            };
        }

        if (params.length === 3
            && typeof params[0] === "function"
            && typeof params[1] === "string"
            && typeof params[2] === "object"
        ) {
            const [target, propertyKey] = params;
            AuthenticateDecorator.decoratorMetas.push({
                classPrototype: target,
                methodName: propertyKey,
                users: undefined,
                roles: undefined
            });
            return;
        }
    }
}

export let authenticateDecorator = new AuthenticateDecorator();
export const Authenticate = authenticateDecorator.decorator;
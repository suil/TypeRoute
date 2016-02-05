import DecoratorContext from "./DecoratorContext";
import { IClassDecorator } from "./DecoratorInterfaces";

export class AuthenticateAllDecorator implements IClassDecorator {
    private static decoratorMetas: any[] = [];

    onConfigure(config): void { }

    onHandleRequest(context: DecoratorContext): boolean {
        const decoratorMeta = AuthenticateAllDecorator.decoratorMetas.find(meta =>
            meta.classPrototype === context.classInstance &&
            meta.methodName === context.methodName
        );

        if (!decoratorMeta) { return true; }

        const { users, roles } = decoratorMeta;

        return context.request.user &&
            (!users || users.some(u => u === context.request.user.userName)) &&
            (!roles || roles.some(r => r === context.request.user.role));
    }

    decorator(config: Object): ClassDecorator;
    decorator(target: Function): void;
    decorator(param: any): any {
        if (typeof param === "object") {
            const { users, roles } = param;

            return (target: Object) => {
                AuthenticateAllDecorator.decoratorMetas.push({
                    classPrototype: target,
                    users: users,
                    roles: roles
                });
            };
        }

        if (typeof param === "function") {
            const target = param;

            AuthenticateAllDecorator.decoratorMetas.push({
                classPrototype: target,
                users: undefined,
                roles: undefined
            });

            return;
        }
    }
}

export let authenticateAllDecorator = new AuthenticateAllDecorator();
export const AuthenticateAll = authenticateAllDecorator.decorator;
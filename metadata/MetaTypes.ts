export interface IControllerDecoratorMeta {
    name: string;
    type: string;
    controllerClass: Object;
    data: any;
}

export interface IActionDecoratorMeta {
    name: string;
    type: string;
    controllerPrototype: Object;
    action: string;
    paramTypes: Object[];
    data: any;
}

export interface IParamDecoratorMeta {
    name: string;
    type: string;
    controllerPrototype: Object;
    action: string;
    index: number;
    paramType: Object;
    data: any;
}

export class ControllerMeta {
    controllerClass: Object;
    private _instance: any;
    decoratorMetas: { [type: string]: IControllerDecoratorMeta[] };
    actionMetas: ActionMeta[];

    get instance(): any {
        if (this._instance) { return this._instance; }
        return this._instance = new (this.controllerClass as any)();
    }

    get routePrefix(): string {
        const routingDecoratorMetas = this.decoratorMetas["routing"];
        if (!routingDecoratorMetas
            || routingDecoratorMetas.length !== 1
            || routingDecoratorMetas[0].name !== "Controller"
        ) {
            throw new Error("Only one Controller decorator is allowed");
        }

        const controllerDecoratorMeta = routingDecoratorMetas[0];
        if (!controllerDecoratorMeta.data
            || !controllerDecoratorMeta.data.routePrefix
        ) {
            throw new Error("Controller has to have a routePrefix property");
        }

        return controllerDecoratorMeta.data.routePrefix;
    }
}

export class ActionMeta {
    controllerPrototype: Object;
    action: string;
    paramTypes: Object[];
    decoratorMetas: { [type: string]: IActionDecoratorMeta[] };
    paramMetas: ParamMeta[];
    controllerMeta: ControllerMeta;

    get actionRouteData(): { route: string, httpMethod: string, returnType: Object } {
        const routingDecoratorMetas = this.decoratorMetas["routing"];
        if (!routingDecoratorMetas
            || routingDecoratorMetas.length !== 1
        ) {
            throw new Error("Only one routing decorator is allowed");
        }

        const routingDecoratorMeta = routingDecoratorMetas[0];
        if (!routingDecoratorMeta
            || !routingDecoratorMeta.data
            || !routingDecoratorMeta.data.route
            || !routingDecoratorMeta.data.httpMethod
            || !routingDecoratorMeta.data.returnType
        ) {
            throw new Error("Properties of route, httpMethod and returnType are required for routing decorator");
        }

        return routingDecoratorMeta.data;
    }

    get paramRequestData(): any[] {
        return this.paramTypes.map((paramType, paramIndex) => {
            const paramMeta = this.paramMetas.find(p => p.index === paramIndex);
            return paramMeta ? paramMeta.paramRequestData : undefined;
        });
    }

    get authorizeData() {
        const authenticationDecoratorMetas = this.controllerMeta.decoratorMetas["authentication"];
        if (authenticationDecoratorMetas
            || authenticationDecoratorMetas.length !== 1
        ) {
            throw new Error("Only one authentication decorator is allowed");
        }

        const authorizeAllDecoratorMeta = authenticationDecoratorMetas[0];
        if (!authorizeAllDecoratorMeta
            || authorizeAllDecoratorMeta.name !== "AuthorizeAll"
        ) {
            throw new Error("AuthorizeAll decorator is missing");
        }

        return undefined;
    }
}

export class ParamMeta {
    controllerPrototype: Object;
    action: string;
    index: number;
    paramType: Object;
    decoratorMetas: { [type: string]: IParamDecoratorMeta[] };
    actionMeta: ActionMeta;

    get paramRequestData(): { decoratorName: string, decoratorType: Object, variableKey: string } {
        const routingDecoratorMetas = this.decoratorMetas["routing"];
        if (!routingDecoratorMetas
            || routingDecoratorMetas.length !== 1
        ) {
            throw new Error("Only one routing decorator is allowed");
        }

        const routingDecoratorMeta = routingDecoratorMetas[0];
        if (!routingDecoratorMeta) {
            throw new Error("Wrong routing decorator");
        }

        if (routingDecoratorMeta.name === "Query"
            && (!routingDecoratorMeta.data || !routingDecoratorMeta.data.variableKey)
        ) {
            throw new Error("Query decorator requires variableKey in data");
        }

        return {
            decoratorName: routingDecoratorMeta.name,
            decoratorType: routingDecoratorMeta.paramType,
            variableKey: routingDecoratorMeta.data ? routingDecoratorMeta.data.variableKey : undefined
        };
    }
}

/**
 * HTTP action types.
 */
export class HttpMethods {
    static CHECKOUT = "checkout";
    static CONNECT = "connect";
    static COPY = "copy";
    static DELETE = "delete";
    static GET = "get";
    static HEAD = "head";
    static LOCK = "lock";
    static MERGE = "merge";
    static MKACTIVITY = "mkactivity";
    static MKCOL = "mkcol";
    static MOVE = "move";
    static M_SEARCH = "m-search";
    static NOTIFY = "notify";
    static OPTIONS = "options";
    static PATCH = "patch";
    static POST = "post";
    static PROPFIND = "propfind";
    static PROPPATCH = "proppatch";
    static PURGE = "purge";
    static PUT = "put";
    static REPORT = "report";
    static SEARCH = "search";
    static SUBSCRIBE = "subscribe";
    static TRACE = "trace";
    static UNLOCK = "unlock";
    static UNSUBSCRIBE = "unsubscribe";
}

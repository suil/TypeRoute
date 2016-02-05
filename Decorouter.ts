import { Application, Request, Response, Router } from "express";
import { ActionMeta, ControllerMeta, ParamMeta } from "./metadata/MetaTypes";
import { metaContainer } from "./metadata/MetaContainer";
import { Result } from "./actions/Results";

export class Decorouter {
    constructor(private app: Application) {}

    registerRoutes(...controllerDirs: string[]) {
        // load in all controller files
        const requireAll = require("require-all");
        controllerDirs.forEach(ctlrDir => {
            requireAll({dirname: ctlrDir});
        });

        metaContainer.controllerMetas.forEach(controllerMeta => {
            const router = Router();

            controllerMeta.actionMetas.forEach(actionMeta => {
                var { route, httpMethod, returnType } = actionMeta.actionRouteData;
                router[httpMethod.toLocaleLowerCase()](route, (req, res, next) => {

                    // push in request and respons as controller's dynamic properties
                    controllerMeta.instance.request && (controllerMeta.instance.request = req);
                    controllerMeta.instance.response && (controllerMeta.instance.response = res);

                    const actionMethod: Function = controllerMeta.instance[actionMeta.action];
                    const actionMethodParamValues = actionMeta.paramRequestData.map(paramRequest => {
                        let paramValue;
                        if (paramRequest.decoratorName === "Query") {
                            paramValue = req.params[paramRequest.variableKey];
                        } else if (paramRequest.decoratorName === "Body") {
                            paramValue = paramRequest.variableKey ? req.body[paramRequest.variableKey] : req.body;
                        } else {
                            throw new Error("unknown decorator");
                        }

                        if (typeof paramValue !== "undefined") {
                            switch (paramRequest.decoratorType) {
                                case Number:
                                    paramValue = Number(paramValue);
                                    break;
                                case String:
                                    paramValue = String(paramValue);
                                    break;
                            }
                        }

                        return paramValue;
                    });

                    debugger;
                    // call action method with parameter values from request.params
                    const resultData: any = actionMethod.apply(controllerMeta.instance, actionMethodParamValues);

                    if (typeof resultData === "undefined" || resultData === null) {
                        next();
                        return;
                    }

                    if (resultData instanceof Result) {
                        (resultData as Result).handle(req, res);
                        return;
                    }

                    if (this.isPromise(resultData)) {
                        resultData.then(result => {
                            Result.createResult(returnType, result).handle(req, res);
                        });
                        if (resultData.catch instanceof Function) {
                            resultData.catch(error => {
                                res.status(500).send(JSON.stringify(error));
                            });
                        }
                        return;
                    }

                    return Result.createResult(returnType, resultData).handle(req, res);
                });
            });

            this.app.use(controllerMeta.routePrefix || "/", router);
        });
        debugger;
        // loop thru controller-action-param meta data structure.
        //metaContainer.controllerActionParamMetas.forEach(controllerActionMeta => {
        //    const controllerMeta = controllerActionMeta.controllerMeta;
        //    const controllerInstance = controllerActionMeta.instance;
        //    const actionParamMetas = controllerActionMeta.actionParamMetas;
        //    const router = Router();

        //    // fill in router with all routes and action handlers
        //    actionParamMetas.forEach(actionParamMeta => {
        //        var actionMeta = actionParamMeta.actionMeta;

        //        const appMethod = actionMeta.httpMethod.toLowerCase();
        //        router[appMethod](actionMeta.route, (req, res, next) => {
        //            this.handleAction(req, res, next, controllerInstance, actionMeta, actionParamMeta.paramMetas);
        //        });
        //    });

        //    // attach the router into app with route prefix
        //    this.app.use(controllerMeta.routePrefix || "/", router);
        //});
    }

    private handleAction1(req: Request, res: Response, next: Function, controllerInstance: any, action: string,
        returnType: Object): void {

        // push in request and respons as controller's dynamic properties
        controllerInstance.request && (controllerInstance.request = req);
        controllerInstance.response && (controllerInstance.response = res);

        //const actionMethod: Function = controllerInstance[actionMeta.action];
        //const actionMethodParamValues = this.buildActionMethodParamValues(req, actionMeta, paramMetas);

        // call action method with parameter values from request.params
        //const resultData: any = actionMethod.apply(controllerInstance, actionMethodParamValues);

        //if (typeof resultData === "undefined" || resultData === null) {
        //    next();
        //    return;
        //}

        //if (resultData instanceof Result) {
        //    (resultData as Result).handle(req, res);
        //    return;
        //}

        //if (this.isPromise(resultData)) {
        //    resultData.then(result => {
        //        Result.createResult(actionMeta.returnType, result).handle(req, res);
        //    });
        //    if (resultData.catch instanceof Function) {
        //        resultData.catch(error => {
        //            res.status(500).send(JSON.stringify(error));
        //        });
        //    }
        //    return;
        //}

        //return Result.createResult(actionMeta.returnType, resultData).handle(req, res);
    }

    //private handleAction(req: Request, res: Response, next: Function, controllerInstance: any,
    //    actionMeta: ActionMeta, paramMetas: ParamMeta[]): void {

    //    // push in request and respons as controller's dynamic properties
    //    controllerInstance.request && (controllerInstance.request = req);
    //    controllerInstance.response && (controllerInstance.response = res);

    //    const actionMethod: Function = controllerInstance[actionMeta.action];
    //    const actionMethodParamValues = this.buildActionMethodParamValues(req, actionMeta, paramMetas);

    //    // call action method with parameter values from request.params
    //    const resultData: any = actionMethod.apply(controllerInstance, actionMethodParamValues);

    //    if (typeof resultData === "undefined" || resultData === null) {
    //        next();
    //        return;
    //    }

    //    if (resultData instanceof Result) {
    //        (resultData as Result).handle(req, res);
    //        return;
    //    }

    //    if (this.isPromise(resultData)) {
    //        resultData.then(result => {
    //            Result.createResult(actionMeta.returnType, result).handle(req, res);
    //        });
    //        if (resultData.catch instanceof Function) {
    //            resultData.catch(error => {
    //                res.status(500).send(JSON.stringify(error));
    //            });
    //        }
    //        return;
    //    }

    //    return Result.createResult(actionMeta.returnType, resultData).handle(req, res);
    //}

    //private buildActionParamValues(req: Request, actionMeta: ActionMeta, paramMetas: ParamMeta[]): any[] {
    //    return actionMeta.paramTypes.map((paramType, paramIndex) => {
    //        const paramMeta = paramMetas.find(
    //            pMeta => pMeta.index === paramIndex
    //                && [ParamNames.Body, ParamNames.Query].some(p => p === pMeta.name)
    //        );
    //        let paramValue = paramMeta ? paramMeta.getReqData(req) : undefined;
    //        if (typeof paramValue !== "undefined") {
    //            switch (paramType) {
    //                case Number:
    //                    paramValue = Number(paramValue);
    //                    break;
    //                case String:
    //                    paramValue = String(paramValue);
    //                    break;
    //            }
    //        }
    //        return paramValue;
    //    });
    //}

    //private buildActionMethodParamValues(req: Request, actionMeta: ActionMeta, paramMetas: ParamMeta[]): any[] {
    //    return actionMeta.paramTypes.map((paramType, paramIndex) => {
    //        const paramMeta = paramMetas.find(
    //            pMeta => pMeta.index === paramIndex
    //                && [ParamNames.Body, ParamNames.Query].some(p => p === pMeta.name)
    //        );
    //        let paramValue = paramMeta ? paramMeta.getReqData(req) : undefined;
    //        if (typeof paramValue !== "undefined") {
    //            switch (paramType) {
    //                case Number:
    //                    paramValue = Number(paramValue);
    //                    break;
    //                case String:
    //                    paramValue = String(paramValue);
    //                    break;
    //            }
    //        }
    //        return paramValue;
    //    });
    //}

    private isPromise(object: any): boolean {
        return object instanceof Object
            && object.then instanceof Function;
            //&& object.catch instanceof Function;
    }
}
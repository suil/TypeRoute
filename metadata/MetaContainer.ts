import { IControllerDecoratorMeta, IActionDecoratorMeta, IParamDecoratorMeta, ActionMeta, ControllerMeta, ParamMeta } from "./MetaTypes";

export class MetaContainer {
    private _controllerDecoratorMetas: IControllerDecoratorMeta[] = [];
    private _actionDecoratorMetas: IActionDecoratorMeta[] = [];
    private _paramDecoratorMetas: IParamDecoratorMeta[] = [];

    addControllerDecoratorMeta(controllerMeta: IControllerDecoratorMeta): void {
        this._controllerDecoratorMetas.push(controllerMeta);
    }

    addActionDecoratorMeta(actionMeta: IActionDecoratorMeta): void {
        this._actionDecoratorMetas.push(actionMeta);
    }

    addParamDecoratorMeta(paramMeta: IParamDecoratorMeta): void {
        this._paramDecoratorMetas.push(paramMeta);
    }

    get controllerMetas(): ControllerMeta[] {
        return this._controllerDecoratorMetas.reduce((controllerMetas, controllerDecoratorMeta) => {
            let controllerMeta = controllerMetas.find(m => m.controllerClass === controllerDecoratorMeta.controllerClass);

            if (!controllerMeta) {
                controllerMeta = new ControllerMeta();
                controllerMeta.controllerClass = controllerDecoratorMeta.controllerClass;
                controllerMeta.decoratorMetas = {};
                controllerMeta.actionMetas = this.findActionMetas(controllerMeta.controllerClass);
                controllerMeta.actionMetas.forEach(am => am.controllerMeta = controllerMeta);
                controllerMetas.push(controllerMeta);
            }

            let controllerDecoratorMetas = controllerMeta.decoratorMetas[controllerDecoratorMeta.type];
            if (!controllerDecoratorMetas) {
                controllerDecoratorMetas = controllerMeta.decoratorMetas[controllerDecoratorMeta.type] = [];
            }

            const isInDecoratorMetas = controllerDecoratorMetas.some(m => m.name === controllerDecoratorMeta.name);
            if (!isInDecoratorMetas) {
                controllerDecoratorMetas.push(controllerDecoratorMeta);
            }

            return controllerMetas;
        }, []);
    }

    findActionMetas(controllerClass: Object): ActionMeta[] {
        return this._actionDecoratorMetas.reduce((actionMetas, actionDecoratorMeta) => {
            if (actionDecoratorMeta.controllerPrototype.constructor !== controllerClass) {
                return actionMetas;
            }

            let actionMeta = actionMetas.find(m => m.action === actionDecoratorMeta.action);

            if (!actionMeta) {
                actionMeta = new ActionMeta();
                actionMeta.controllerPrototype = actionDecoratorMeta.controllerPrototype;
                actionMeta.action = actionDecoratorMeta.action;
                actionMeta.paramTypes = actionDecoratorMeta.paramTypes;
                actionMeta.decoratorMetas = {};
                actionMeta.paramMetas = this.findParamMetas(actionDecoratorMeta.controllerPrototype, actionMeta.action);
                actionMeta.paramMetas.forEach(pm => pm.actionMeta = actionMeta);
                actionMetas.push(actionMeta);
            }

            let actionDecoratorMetas = actionMeta.decoratorMetas[actionDecoratorMeta.type];
            if (!actionDecoratorMetas) {
                actionDecoratorMetas = actionMeta.decoratorMetas[actionDecoratorMeta.type] = [];
            }

            const isInDecoratorMetas = actionDecoratorMetas.some(m => m.name === actionDecoratorMeta.name);
            if (!isInDecoratorMetas) {
                actionDecoratorMetas.push(actionDecoratorMeta);
            }

            return actionMetas;
        }, []);
    }

    findParamMetas(controllerPrototype: Object, action: string): ParamMeta[] {
        return this._paramDecoratorMetas.reduce((paramMetas, paramDecoratorMeta) => {
            if (paramDecoratorMeta.controllerPrototype !== controllerPrototype
                || paramDecoratorMeta.action !== action
            ) {
                return paramMetas;
            }

            let paramMeta = paramMetas.find(m => m.index === paramDecoratorMeta.index);
            if (!paramMeta) {
                paramMeta = new ParamMeta();
                paramMeta.action = paramDecoratorMeta.action;
                paramMeta.controllerPrototype = paramDecoratorMeta.controllerPrototype;
                paramMeta.index = paramDecoratorMeta.index;
                paramMeta.paramType = paramDecoratorMeta.paramType;
                paramMeta.decoratorMetas = {};
                paramMeta.actionMeta
                paramMetas.push(paramMeta);
            }

            let paramDecoratorMetas = paramMeta.decoratorMetas[paramDecoratorMeta.type];
            if (!paramDecoratorMetas) {
                paramDecoratorMetas = paramMeta.decoratorMetas[paramDecoratorMeta.type] = [];
            }

            const isInDecoratorMetas = paramDecoratorMetas.some(m => m.index === paramDecoratorMeta.index);
            if (!isInDecoratorMetas) {
                paramDecoratorMetas.push(paramDecoratorMeta);
            }

            return paramMetas;
        }, []);
    }
}


export let metaContainer = new MetaContainer();

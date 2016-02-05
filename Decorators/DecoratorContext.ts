import { Request, Response } from "express";

export default class DecoratorContext {
    request: Request;
    response: Response;
    classInstance: Object;
    methodName: string;
}

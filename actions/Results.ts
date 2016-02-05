///<reference path="../../../../typings/tsd.d.ts" />
import { Request, Response} from "express";

export class Result {
    handle(req: Request, res: Response): void {
        res.end();
    };

    static createResult(resultType: Object, param: any): Result {
        const isStringParam = typeof param === "string";
        const isObjectParam = typeof param === "object";

        if (param instanceof Result) {
            return param;
        }

        switch (resultType) {
            case Download:
                if (isStringParam) {
                    return new Download(param);
                }
                if (isObjectParam) {
                    const { path, filename, cb } = param;
                    return new Download(path, filename, cb);
                }
                throw new Error("wrong parameter for Download object");

            case Json:
                return new Json(param);

            case Jsonp:
                return new Jsonp(param);

            case Content:
                return new Content(param);

            case Redirect:
                if (isStringParam) {
                    return new Redirect(param);
                }
                if (isObjectParam) {
                    const { url, status } = param;
                    return new Redirect(url, status);
                }
                throw new Error("wrong parameter for Redirect object");

            case View:
                if (isStringParam) {
                    return new View(param);
                }
                if (isObjectParam) {
                    const { template, locals, cb } = param;
                    return new View(template, locals, cb);
                }
                throw new Error("wrong parameter for View object");

            case File:
                if (isStringParam) {
                    return new File(param);
                }
                if (isObjectParam) {
                    const { path, options, cb } = param;
                    return new File(path, options, cb);
                }
                throw new Error("wrong parameter for File object");

            default:
                throw new Error("not a Result object");
        }
    }
}

export class Download extends Result {
    constructor(private path: string, private filename?: string, private cb?: (err: Error) => void) {
        super();
    }

    handle(req: Request, res: Response) {
        res.download(this.path, this.filename, this.cb);
    }
}

export class Json extends Result {
    constructor(private data: any) {
        super();
    }

    handle(req: Request, res: Response) {
        res.json(this.data);
    }

    static create(args: any): Json {
        return new Json(args);
    }
}

export class Jsonp extends Result {
    constructor(private data: {}) {
        super();
    }

    handle(req: Request, res: Response) {
        res.jsonp(this.data);
    }

    static create(args: any): Jsonp {
        return new Jsonp(args);
    }
}

export class Redirect extends Result {
    constructor(private url: string, private status: number = 302) {
        super();
    }

    handle(req: Request, res: Response) {
        res.redirect(this.status, this.url);
    }
}

export class View extends Result {
    constructor(private template: string, private locals?: {}, private cb?: (err: Error) => void) {
        super();
    }

    handle(req: Request, res: Response) {
        res.render(this.template, this.locals, this.cb);
    }
}

export class File extends Result {
    constructor(private path: string, private options?: Object, private cb?: (err: Error) => void) {
        super();
    }

    handle(req: Request, res: Response) {
        res.sendFile(this.path, this.options, this.cb);
    }
}

export class Content extends Result {
    constructor(private body: any) {
        super();
    }
    handle(req: Request, res: Response) {
        res.send(this.body);
    }
}
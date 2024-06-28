
export class Result<Ok, Error> {

    private constructor(
        private readonly ok: Ok | null,
        private readonly error: Error | null
    ) {}

    static ok<Ok, Error>(value: Ok): Result<Ok, Error> {
        return new Result<Ok, Error>(value, null);
    }

    static error<Ok, Error>(value: Error): Result<Ok, Error> {
        return new Result<Ok, Error>(null, value);
    }

    is_ok(): boolean {
        return this.ok !== null;
    }

    is_ok_cb(callback: (value: Ok) => void) {
        if (this.ok !== null) {
            callback(this.ok);
        }
    }

    is_error(): boolean {
        return this.error !== null;
    }

    is_error_cb(callback: (value: Error) => void) {
        if (this.error !== null) {
            callback(this.error);
        }
    }

    unwrap(): Ok {
        if (this.ok === null) {
            throw new Error("Cannot unwrap error result");
        }
        return this.ok;
    }

    unwrap_or(default_value: Ok): Ok {
        if (this.ok === null) {
            return default_value;
        }
        return this.ok;
    }

    unwrap_error(): Error {
        if (this.error === null) {
            throw new Error("Cannot unwrap ok result");
        }
        return this.error;
    }

}

export function Err<Ok, Error>(err: Error): Result<Ok, Error> {
    return Result.error(err);
}

export function Ok<Ok, Error>(ok: Ok): Result<Ok, Error> {
    return Result.ok(ok);
}
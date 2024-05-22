
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

    is_error(): boolean {
        return this.error !== null;
    }

    unwrap(): Ok {
        if (this.ok === null) {
            throw new Error("Cannot unwrap error result");
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
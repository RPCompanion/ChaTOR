
export class Result<Ok, Err> {

    private constructor(
        private readonly ok: Ok | null,
        private readonly err: Err | null
    ) {}

    static ok<Ok, Err>(value: Ok): Result<Ok, Err> {
        return new Result<Ok, Err>(value, null);
    }

    static error<Ok, Err>(value: Err): Result<Ok, Err> {
        return new Result<Ok, Err>(null, value);
    }

    static try<Ok>(callback: () => Ok): Result<Ok, Error> {
        try {
            return Result.ok(callback());
        } catch (error) {
            return Result.error(error instanceof Error ? error : new Error(String(error)));
        }
    }

    static async async_try<Ok>(callback: () => Promise<Ok>): Promise<Result<Ok, Error>> {
        try {
            return Result.ok(await callback());
        } catch (error) {
            return Result.error(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Transforms a Result<Ok, Err> to a Result<T, Err> only if the result is Err.
     */
    transform_ok<T>(): Result<T, Err> {

        if (this.err === null) {
            throw new Error("Cannot transform Result<Ok, Err> to Result<T, Err> if the result is Ok");
        }

        return Result.error(this.err!);

    }

    map_err<Other>(conversion: (err: Err) => Other): Result<Ok, Other> {
        if (this.ok !== null) {
            return Result.ok(this.ok);
        }
        return Result.error(conversion(this.err!));
    }

    is_ok(): boolean {
        return this.ok !== null;
    }

    is_ok_cb(callback: (value: Ok) => void) {
        if (this.ok !== null) {
            callback(this.ok);
        }
    }

    is_err(): boolean {
        return this.err !== null;
    }

    is_err_cb(callback: (value: Err) => void) {
        if (this.err !== null) {
            callback(this.err);
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

    unwrap_err(): Err {
        if (this.err === null) {
            throw new Error("Cannot unwrap ok result");
        }
        return this.err;
    }

}

export function Err<Ok, Error>(err: Error): Result<Ok, Error> {
    return Result.error(err);
}

export function Ok<Ok, Error>(ok: Ok): Result<Ok, Error> {
    return Result.ok(ok);
}
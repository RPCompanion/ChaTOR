
export class Option<T> {

    constructor(private readonly value: T | undefined) {}
    
    is_some(): boolean {
        return this.value !== undefined;
    }

    is_none(): boolean {
        return this.value === undefined;
    }

    unwrap(): T {
        if (this.value === undefined) {
            throw new Error("Cannot unwrap none option");
        }
        return this.value;
    }

}

export function Some<T>(value: T): Option<T> {
    return new Option(value);
}

export function None<T>(): Option<T> {
    return new Option<T>(undefined);
}
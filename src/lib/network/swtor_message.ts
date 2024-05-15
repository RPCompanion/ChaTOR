
export interface IColor {
    r: number;
    g: number;
    b: number;
}

export interface ISwtorMessage {
    character_name: string;
    timestamp?: string;
    color: IColor;
    message: string;
}
type ResponseValue<T> = { status: number; message: string } & T;

export type APIResponse<T = {}> = Promise<ResponseValue<T>>;

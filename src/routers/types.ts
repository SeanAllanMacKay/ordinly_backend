type ResponseValue<T> = { status: number; message: string } & T;

export type APIResponse<T = {}> = Promise<ResponseValue<T>>;

// Shared shape for FE select options. `imageUrl` is optional so entity options
// that carry an avatar/logo (e.g. company members) can include one without
// changing the contract for options that don't.
export type Option = {
  value: string;
  label: string;
  imageUrl?: string;
};

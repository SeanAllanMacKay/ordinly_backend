export type CommonDatabaseAttributesType = {
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;
};

export type ListParams<T = {}, Y = {}> = {
  queryParams?: { page?: number; pageSize?: number } & T;
} & Y;

export type ListResponse<T> = { total: number; data: T[] };

export type UpsertBody<T, Y = {}> = { body: T } & Y;

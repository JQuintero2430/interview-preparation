// Exercise 47.2, shared types (our model): the row, the query a user changes and the view the list shows.
export interface Row {
  readonly id: string;
  readonly name: string;
  readonly createdAt: number;
}

export interface ListQuery {
  readonly text: string;
  readonly sort: 'name' | 'createdAt';
  readonly dir: 'asc' | 'desc';
  /** One-based. */
  readonly page: number;
  /** At least 1. */
  readonly pageSize: number;
}

export interface ListView {
  readonly items: readonly Row[];
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
}

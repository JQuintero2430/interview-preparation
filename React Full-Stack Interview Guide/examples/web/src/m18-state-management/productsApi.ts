import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API, type Product } from './products';

/**
 * RTK Query API slice: server state (the product list) lives in its own cache inside the
 * Redux store, keyed by endpoint + argument, with tags driving refetches after mutations.
 */
export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  tagTypes: ['Product'],
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    updatePrice: build.mutation<Product, { id: string; price: number }>({
      query: ({ id, price }) => ({ url: `/products/${id}`, method: 'PATCH', body: { price } }),
      // Every query that provides 'Product' and is still subscribed refetches.
      invalidatesTags: ['Product'],
    }),
  }),
});

export const { useGetProductsQuery, useUpdatePriceMutation } = productsApi;

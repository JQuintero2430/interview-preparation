import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { InvalidResponseError, toApiError } from './api-error';
import { Product, isProduct } from './product';

export interface ProductWithEtag {
  readonly product: Product;
  readonly etag: string | null;
}

function parseProduct(body: unknown): Product {
  if (!isProduct(body)) throw new InvalidResponseError('Response is not a product');
  return body;
}

function parseProducts(body: unknown): Product[] {
  if (!Array.isArray(body)) throw new InvalidResponseError('Response is not a list');
  return body.map(parseProduct);
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);

  search(term: string, page: number): Observable<Product[]> {
    return this.http
      .get<unknown>('/api/products', { params: this.searchParams(term, page) })
      .pipe(map(parseProducts), catchError((err: unknown) => throwError(() => toApiError(err))));
  }

  get(id: number): Observable<ProductWithEtag> {
    return this.http.get<unknown>(`/api/products/${id}`, { observe: 'response' }).pipe(
      map((response) => ({ product: parseProduct(response.body), etag: response.headers.get('ETag') })),
      catchError((err: unknown) => throwError(() => toApiError(err))),
    );
  }

  protected searchParams(term: string, page: number): HttpParams | Record<string, string | number> {
    return { q: term, page };
  }
}

// The alternative of the worked solution: the same service with an `HttpParams` instance.
@Injectable({ providedIn: 'root' })
export class ProductsApiWithHttpParams extends ProductsApi {
  protected override searchParams(term: string, page: number): HttpParams {
    return new HttpParams().set('q', term).set('page', page);
  }
}

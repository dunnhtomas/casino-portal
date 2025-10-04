/**
 * Core Data Provider Interfaces
 * Single Responsibility: Define contracts for all data providers
 */

export interface IDataProvider<T> {
  provide(): T | Promise<T>;
}

export interface IAsyncDataProvider<T> {
  provide(): Promise<T>;
}

export interface ICacheableDataProvider<T> extends IDataProvider<T> {
  invalidateCache(): void;
  getCacheKey(): string;
}
import axios, { AxiosStatic, AxiosRequestConfig } from 'axios';

export type Method =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'

const DEFAULT_METHOD = 'get';

export type SearchBuilder = (data: any, config: AxiosRouterConfig) => any | undefined;

export const defaultSearchBuilder = (data: any, config: AxiosRouterConfig): any | undefined => {
  const method = config.method || DEFAULT_METHOD;
  if (['get', 'delete', 'head', 'options'].indexOf(method.toLowerCase()) > -1) {
    return data;
  } else {
    return void 0;
  }
}

export type DataBuilder = (data: any, config: AxiosRouterConfig) => any | undefined;

export const defaultBodyDataBuilder = (data: any, config: AxiosRouterConfig): any | undefined => {
  const method = config.method || DEFAULT_METHOD;
  if (['get', 'delete', 'head', 'options'].indexOf(method.toLowerCase()) > -1) {
    return void 0;
  } else {
    return data;
  }
}

export interface AxiosRouterConfig extends AxiosRequestConfig {
  path: string;
  method: Method;
  dataBuilder?: DataBuilder;
  searchBuilder?: SearchBuilder;
}

export interface AxiosRouterOptions {
  router: AxiosRouterConfig
}

class AxiosRouter {
  static Sender: AxiosStatic = axios;
  static dataBuilder: DataBuilder = defaultBodyDataBuilder;
  static searchBuilder: SearchBuilder = defaultSearchBuilder;

  constructor({ router }: AxiosRouterOptions) {

  }
}

export default AxiosRouter;

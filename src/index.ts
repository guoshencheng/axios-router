import axios, { AxiosStatic, AxiosRequestConfig, AxiosPromise } from 'axios';
import { compile } from 'path-to-regexp';

export type Method =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'

const DEFAULT_METHOD = 'get';

const isGetLike = (method) => ['get', 'delete', 'head', 'options'].indexOf(method.toLowerCase()) > -1;

export type SearchBuilder = (data: any, config: AxiosRouterConfig) => any | undefined;

export const defaultSearchBuilder = (data: any, config: AxiosRouterConfig): any | undefined => {
  const method = config.method || DEFAULT_METHOD;
  if (isGetLike(method)) {
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
  path?: string | ((data: any) => string);
  method?: Method;
  dataBuilder?: DataBuilder;
  searchBuilder?: SearchBuilder;
}

export interface AxiosRouterOptions {
  routers: {
    [key: string]: AxiosRouterConfig
  }
}

export type RequestSender = (value: any, config: AxiosRouterConfig) => AxiosPromise<any>

class AxiosRouter {
  static Sender: AxiosStatic = axios;
  static dataBuilder: DataBuilder = defaultBodyDataBuilder;
  static searchBuilder: SearchBuilder = defaultSearchBuilder;

  constructor({ routers }: AxiosRouterOptions) {
    this.$setRouters(routers);
  }

  $setRouters(routers: {
    [key: string]: AxiosRouterConfig
  }) {
    Object.keys(routers).forEach(key => {
      Object.defineProperty(this, key, {
        value: this.$sendRequest(routers[key]),
        writable: false,
      })
    })
  }

  $sendRequest(config: AxiosRouterConfig): RequestSender {
    return (value: any, c: AxiosRouterConfig): AxiosPromise => {
      const method = c.method || config.method || DEFAULT_METHOD;
      const dataBuilder = (c.dataBuilder || config.dataBuilder || AxiosRouter.dataBuilder)
      const searchBuilder = (c.searchBuilder || config.searchBuilder || AxiosRouter.searchBuilder)
      const path = c.path || config.path || '';
      let params, data, url;
      if (typeof path === 'string') {
        url = compile(path)(value);
      } else {
        url = path(value);
      }
      params = searchBuilder(value, {
        method,
      });
      data = dataBuilder(value, {
        method,
      });
      return AxiosRouter.Sender(Object.assign({
        url, params, data, method
      }, config, c));
    }
  }
}

export default AxiosRouter;

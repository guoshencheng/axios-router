import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import { compile } from 'path-to-regexp';

export { default as CreateQueueSender } from './sender/queue';

export type Method =
  | 'get'
  | 'delete'
  | 'head'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'

const DEFAULT_METHOD = 'get';

const isGetLike = (method: string) => ['get', 'delete', 'head', 'options'].indexOf(method.toLowerCase()) > -1;

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
  method?: string;
  dataBuilder?: DataBuilder;
  searchBuilder?: SearchBuilder;
}

export interface AxiosRouterOptions {
  routers: {
    [key: string]: AxiosRouterConfig
  }
}

export interface AxiosSender {
  (config: AxiosRequestConfig): AxiosPromise
}

export type RequestSender = (value?: any, config?: AxiosRouterConfig) => AxiosPromise<any>

export class Api {
  [key: string]: RequestSender
}

export class AxiosRouter {
  static Sender: AxiosSender = axios;
  static dataBuilder: DataBuilder = defaultBodyDataBuilder;
  static searchBuilder: SearchBuilder = defaultSearchBuilder;

  api: Api

  constructor({ routers }: AxiosRouterOptions) {
    this.api = new Api();
    this.$setRouters(routers);
  }

  $setRouters(routers: {
    [key: string]: AxiosRouterConfig
  }) {
    Object.keys(routers).forEach(key => {
      Object.defineProperty(this.api, key, {
        value: this.$sendRequest(routers[key]),
        writable: false,
      })
    })
  }

  $sendRequest(config: AxiosRouterConfig): RequestSender {
    return (value?: any, c?: AxiosRouterConfig): AxiosPromise => {
      c = c || {};
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

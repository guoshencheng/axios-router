import axios, { AxiosRequestConfig, AxiosStatic } from 'axios';

export type MethodKey = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options' | 'head';

export type Method = {
  [key: MethodKey]: string,
}

export const methods = [
  'get', 
  'post', 
  'delete', 
  'put', 
  'patch', 
  'options', 
  'head'
].reduce((pre, cur) => {
  pre[cur] = cur;
  return pre;
}, {}) as Method;

export type ParamsBuilder = (data: any, api: any) => any | undefined

export const searchParamsBuilder = (data: any, api): any | undefined  => {
  const method = api.method || DEFAULT_METHOD;
  if ([methods.get, methods.delete, methods.head, methods.options].indexOf(method.toLowerCase()) > -1) {
    return data;
  } else {
    return void 0;
  }
}

export const bodyDataBuilder = (data: any, api): any | undefined => {
  const method = api.method || DEFAULT_METHOD;
  if ([methods.get, methods.delete, methods.head, methods.options].indexOf(method.toLowerCase()) > -1) {
    return void 0;
  } else {
    return data;
  }
}

export interface AxiosRouterConfig {
  path: string;
}

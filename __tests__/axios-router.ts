import AxiosRouter from '../src';
import * as pathToRegexp from 'path-to-regexp';
import { compile } from 'path-to-regexp';
import { closeServer, startServer } from '../server';

beforeAll(() => {
  console.log('start server');
  startServer();
})

afterAll(() => {
  setTimeout(() => {
    console.log('stop server');
    startServer();
  }, 1000)
})

const routers = {
  user: {
    path: '/users/:id',
    searchBuilder: () => null
  },
  users: {
    path: '/users',
  },
  createUser: {
    path: '/users',
    method: 'post'
  },
  updateUser: {
    path: '/users/:id',
    method: 'put'
  },
  deleteUser: {
    path: '/users/:id',
    method: 'delete',
    searchBuilder: () => ({ soft: true }),
  }
}

describe('测试 axios-router的基本功能', () => {
  AxiosRouter.Sender.defaults.baseURL = 'http://localhost:8000';
  const axiosRouter = new AxiosRouter({
    routers,
  })
  it('测试get请求', () => {
    axiosRouter.api.users().then(response => {
      expect(response.data.result.url).toEqual(routers.users.path);
      expect(response.data.result.method).toEqual('GET');
    })
  })
  it('测试get请求，设置path', () => {
    axiosRouter.api.user({ id: 12 }).then(response => {
      expect(response.data.result.url).toEqual(compile(routers.user.path)({ id: 12 }));
      expect(response.data.result.method).toEqual('GET');
    })
  })
  it('测试post请求', () => {
    axiosRouter.api.createUser({ name: 'hehe' }).then(response => {
      expect(response.data.result.url).toEqual(compile(routers.createUser.path)());
      expect(response.data.result.method).toEqual('POST');
    })
  })
  it('测试put请求', () => {
    axiosRouter.api.updateUser({ name: 'hehe', id: '22' }).then(response => {
      expect(response.data.result.url).toEqual(compile(routers.updateUser.path)({ id: 22 }));
      expect(response.data.result.method).toEqual('PUT');
    })
  })
  it('测试put请求', () => {
    axiosRouter.api.deleteUser({ id: '22' }).then(response => {
      expect(response.data.result.url).toMatch(pathToRegexp(routers.deleteUser.path));
      expect(response.data.result.method).toEqual('DELETE');
    })
  })
})

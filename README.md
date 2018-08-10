### Axios Router

> axios 通过将一些restful常用的写法配置化来达到快速编码的目的

### 用法

```javascript
import AxiosRouter from 'axios-router';

const routers = {
  users: {
    path: '/users'
  }
}

const axiosRouter = new AxiosRouter({
  routers: routers
})
```

详见[test](./__tests__/axios-router.ts)

### Api

##### `new AxiosRouter(AxiosRouterOptions)`

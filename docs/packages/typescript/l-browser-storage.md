---
outline: deep
---

# 介绍

[源码点我](https://github.com/web-liuyang/l-browser-storage)

通过 typescript 编写对浏览器存储方法封装，可以进行数据加密

封装的方法有 localStorage、sessionStorage、cookie

cookie 是使用 [js-cookie](https://www.npmjs.com/package/js-cookie), 具体可以看官方文档

## 安装

```sh
# npm
npm i l-browser-storage

# yarn
yarn add l-browser-storage
```

## 使用

```tsx
// ES
import { local, session, cookie } from "l-browser-storage";

// CommonJS
const { local, session, cookie } = require("l-browser-storage");
```

## Local

`localStorage` 本地存储

### set(key, value, options)

设置存储

**参数说明**

| 属性值  |  类型  |     描述     | 必填 | 默认值 |
| :-----: | :----: | :----------: | :--: | :----: |
|   key   | string |  设置的 key  |  是  |   -    |
|  value  |  any   | 设置的 value |  是  |   -    |
| options | object |  额外的选项  |  否  |   -    |

**options**

额外选项的参数

|  属性值  |  类型   |   描述   | 必填 | 默认值 |
| :------: | :-----: | :------: | :--: | :----: |
|  encode  | boolean | 是否加密 |  否  |   -    |
| duration | number  | 有效时间 |  否  |   -    |

**return**

返回值

| 属性值 |  类型  |    描述    |
| :----: | :----: | :--------: |
|  code  | number |   状态码   |
|  data  |  any   | 设置的数据 |

**example**

示例

```tsx
import { local } from "l-browser-storage";

local.set("userinfo", { name: "LiuYang", age: 21 }, { encode: true, duration: 60000 });
```

### get(key, options)

获取存储

**参数说明**

| 属性值  |  类型  |    描述    | 必填 | 默认值 |
| :-----: | :----: | :--------: | :--: | :----: |
|   key   | string | 设置的 key |  是  |   -    |
| options | object | 额外的选项 |  否  |   -    |

**options**

额外选项的参数

| 属性值 |  类型   |   描述   | 必填 | 默认值 |
| :----: | :-----: | :------: | :--: | :----: |
| decode | boolean | 是否解析 |  -   |   -    |

**return**

返回值

| 属性值 |  类型  |    描述    |
| :----: | :----: | :--------: |
|  code  | number |   状态码   |
|  data  |  any   | 返回的数据 |

**example**

示例

```tsx
import { local } from "l-browser-storage";

local.get("userinfo", { decode: true });
```

### remove(key)

删除存储

**参数说明**

| 属性值 |  类型  |    描述    | 必填 | 默认值 |
| :----: | :----: | :--------: | :--: | :----: |
|  key   | string | 设置的 key |  是  |   -    |

**return**

返回值

| 属性值 |  类型  |    描述    |
| :----: | :----: | :--------: |
|  code  | number |   状态码   |
|  data  |  any   | 删除的数据 |

**example**

示例

```tsx
import { local } from "l-browser-storage";

local.remove("userinfo");
```

### clear()

清空存储

**example**

示例

```tsx
import { local } from "l-browser-storage";

local.clear();
```

## Session

### set(key, value, options)

设置存储

**参数说明**

| 属性值  |  类型  |     描述     | 必填 | 默认值 |
| :-----: | :----: | :----------: | :--: | :----: |
|   key   | string |  设置的 key  |  是  |   -    |
|  value  |  any   | 设置的 value |  是  |   -    |
| options | object |  额外的选项  |  否  |   -    |

**options**

额外选项的参数

|  属性值  |  类型   |   描述   | 必填 | 默认值 |
| :------: | :-----: | :------: | :--: | :----: |
|  encode  | boolean | 是否加密 |  否  |   -    |
| duration | number  | 有效时间 |  否  |   -    |

**return**

返回值

| 属性值 |  类型  |    描述    |
| :----: | :----: | :--------: |
|  code  | number |   状态码   |
|  data  |  any   | 设置的数据 |

**example**

示例

```tsx
import { session } from "l-browser-storage";

session.set("userinfo", { name: "LiuYang", age: 21 }, { encode: true, duration: 60000 });
```

### get(key, options)

获取存储

**参数说明**

| 属性值  |  类型  |    描述    | 必填 | 默认值 |
| :-----: | :----: | :--------: | :--: | :----: |
|   key   | string | 设置的 key |  是  |   -    |
| options | object | 额外的选项 |  否  |   -    |

**options**

额外选项的参数

| 属性值 |  类型   |   描述   | 必填 | 默认值 |
| :----: | :-----: | :------: | :--: | :----: |
| decode | boolean | 是否解析 |  -   |   -    |

**return**

返回值

| 属性值 |  类型  |    描述    |
| :----: | :----: | :--------: |
|  code  | number |   状态码   |
|  data  |  any   | 返回的数据 |

**example**

示例

```tsx
import { session } from "l-browser-storage";

session.get("userinfo", { decode: true });
```

### remove(key)

删除存储

**参数说明**

| 属性值 |  类型  |    描述    | 必填 | 默认值 |
| :----: | :----: | :--------: | :--: | :----: |
|  key   | string | 设置的 key |  是  |   -    |

**return**

返回值

| 属性值 |  类型  |    描述    |
| :----: | :----: | :--------: |
|  code  | number |   状态码   |
|  data  |  any   | 删除的数据 |

**example**

示例

```tsx
import { session } from "l-browser-storage";

session.remove("userinfo");
```

### clear()

清空存储

**example**

示例

```tsx
import { session } from "l-browser-storage";

session.clear();
```

## Cookie

`cookie` 本地存储

官方文档：[链接点我](https://github.com/js-cookie/js-cookie/blob/master/README.md)

<Cookie />

## 状态码

| 错误码 |  描述  |
| :----: | :----: |
| 10000  |  成功  |
| 10001  |  失败  |
| 10002  | 值为空 |
| 10003  | 不存在 |
| 10004  | 已过期 |

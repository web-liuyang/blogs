---
outline: deep
---

## OffsetBase

偏移量基类

### 构造函数

#### new OffsetBase (dx, dy)

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| dx   | number | x 偏移量 |
| dy   | number | y 偏移量 |

### 成员属性

#### dx: number

x 偏移量

#### dy: number

y 偏移量

## Offset

偏移量

### 继承

OffsetBase

### 构造函数

#### new Offset (dx, dy)

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| dx   | number | x 偏移量 |
| dy   | number | y 偏移量 |

### 静态方法

#### fromDirection(direction, distance): Offset

根据方向与距离创建 Offset

| 名称      | 类型   | 描述     |
| --------- | ------ | -------- |
| direction | number | 方向弧度 |
| distance  | number | 距离     |

#### zero(): Offset

创建 0 偏移量的 Offset

### 成员属性

#### distance

距离

#### direction

方向弧度

### 成员方法

#### offseted(offset): Offset

偏移

| 名称   | 类型       | 描述   |
| ------ | ---------- | ------ |
| offset | OffsetBase | 偏移量 |

#### scaled(sx, sy): Offset

缩放

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| sx   | number | x 倍率 |
| sy   | number | y 倍率 |

#### translated(tx, ty): Offset

平移

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| tx   | number | x 偏移量 |
| ty   | number | y 偏移量 |

#### mirrored(): Offset

镜像偏移量

#### toPoint(): Point

转换为 Point

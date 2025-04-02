---
outline: deep
---

## PointBase

坐标点基类

### 构造函数

#### new PointBase (x, y)

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| x    | number | x 坐标 |
| y    | number | y 坐标 |

### 成员属性

#### x: number

x 坐标

#### y: number

y 坐标

## Point

坐标点

### 继承

PointBase

### 构造函数

#### new Point (x, y)

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| x    | number | x 坐标 |
| y    | number | y 坐标 |

### 静态方法

#### origin(): Point

创建初始点

#### fromXY(xy: PointBase): Point

根据 x 与 y 创建坐标点

| 名称 | 类型      | 描述                  |
| ---- | --------- | --------------------- |
| xy   | PointBase | 包含 PointBase 的对象 |

### 成员方法

#### offseted(offset): Point

偏移

| 名称   | 类型       | 描述   |
| ------ | ---------- | ------ |
| offset | OffsetBase | 偏移量 |

#### added(point: PointBase): Point

加上坐标点

| 名称  | 类型      | 描述   |
| ----- | --------- | ------ |
| point | PointBase | 坐标点 |

#### subtracted(point: PointBase): Point

减去坐标点

| 名称  | 类型      | 描述   |
| ----- | --------- | ------ |
| point | PointBase | 坐标点 |

#### scaled(sx, sy): Point

缩放

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| sx   | number | x 倍率 |
| sy   | number | y 倍率 |

#### toOffset(): Offset

转换为 Offset

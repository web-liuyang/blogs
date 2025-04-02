---
outline: deep
---

## Line

线段

### 构造函数

#### new Line (start, end)

| 名称  | 类型  | 描述     |
| ----- | ----- | -------- |
| start | Point | 线段起点 |
| end   | Point | 线段终点 |

### 成员属性

#### start: Point

线段起点

#### end: Point

线段终点

### 成员方法

#### offseted(offset: OffsetBase): Line

线段偏移

| 名称   | 类型       | 描述   |
| ------ | ---------- | ------ |
| offset | OffsetBase | 偏移量 |

#### added(point: PointBase): Line

增加坐标点

| 名称  | 类型      | 描述   |
| ----- | --------- | ------ |
| point | PointBase | 坐标点 |

#### subtracted(point: PointBase): Line

减去坐标点

| 名称  | 类型      | 描述   |
| ----- | --------- | ------ |
| point | PointBase | 坐标点 |

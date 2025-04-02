---
outline: deep
---

## Aabb

轴对齐包围盒

### 静态方法

#### zero(): Aabb

零点

#### world(): Aabb

世界大小

### 构造函数

#### new Aabb (options)

| 名称 | 类型  | 描述       |
| ---- | ----- | ---------- |
| min  | Point | 最小坐标点 |
| max  | Point | 最大坐标点 |

### 成员属性

#### min: Point;

最小坐标点

#### max: Point;

最大坐标点

#### width: number

宽度

#### height: number

高度

### 成员方法

#### contains(point: Point): boolean

是否包含坐标点

| 名称  | 类型  | 描述   |
| ----- | ----- | ------ |
| point | Point | 偏移量 |

#### grew(offset: Offset): Aabb

成长

| 名称   | 类型   | 描述   |
| ------ | ------ | ------ |
| offset | Offset | 偏移量 |

#### offseted(offset: Offset): Aabb

偏移量坐标

| 名称   | 类型   | 描述   |
| ------ | ------ | ------ |
| offset | Offset | 偏移量 |

#### swapped(): Aabb

最大坐标点与最小坐标点交换

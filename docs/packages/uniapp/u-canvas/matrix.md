---
outline: deep
---

## Matrix

线段

### 构造函数

#### new Matrix (matrixArray)

| 名称        | 类型        | 描述     |
| ----------- | ----------- | -------- |
| matrixArray | MatrixArray | 矩阵数组 |

### 成员属性

#### a: number

#### b: number

#### c: number

#### d: number

#### e: number

#### f: number

#### matrixArray: MatrixArray

当前矩阵数组

### 成员方法

#### apply(point: Point): Point

应用于坐标点

| 名称  | 类型  | 描述   |
| ----- | ----- | ------ |
| point | Point | 坐标点 |

#### clone(): Matrix

克隆当前矩阵

#### replace(matrix: Matrix): Matrix

替换当前矩阵

| 名称   | 类型   | 描述 |
| ------ | ------ | ---- |
| matrix | Matrix | 矩阵 |

#### multiply(matrix: Matrix): Matrix

矩阵乘法

| 名称   | 类型   | 描述 |
| ------ | ------ | ---- |
| matrix | Matrix | 矩阵 |

#### translate(tx: number, ty: number): Matrix

平移

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| tx   | number | x 偏移量 |
| ty   | number | y 偏移量 |

#### rotate(xt: number, yt: number): Matrix

旋转

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| xt   | number | x 弧度 |
| xt   | number | y 弧度 |

#### setTranslate(tx: number, ty: number): Matrix

设置平移

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| tx   | number | x 偏移量 |
| ty   | number | y 偏移量 |

#### scale(x: number, y: number, point?: Point): Matrix

缩放

| 名称  | 类型               | 描述                 |
| ----- | ------------------ | -------------------- |
| x     | number             | x 倍率               |
| y     | number             | y 倍率               |
| point | Point \| undefined | 根据此坐标点进行缩放 |

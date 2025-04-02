---
outline: deep
---

## Path

画布

### 成员属性

#### records: AllRecord[];

落笔记录列表

### 成员方法

#### moveTo(x, y): void

移动落笔点

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| x    | number | x 坐标 |
| y    | number | y 坐标 |

#### lineTo(x, y): void

绘制一条线到坐标点

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| x    | number | x 坐标 |
| y    | number | y 坐标 |

#### rect(x, y, w, h, radii): void

绘制矩形

| 名称  | 类型   | 描述   |
| ----- | ------ | ------ |
| x     | number | x 坐标 |
| y     | number | y 坐标 |
| w     | number | 宽度   |
| h     | number | 高度   |
| radii | number | 圆角   |

#### arcTo(x1, y1, x2, y2, radius): void

根据控制点和半径绘制圆弧路径，使用当前的描点 (前一个 moveTo 或 lineTo 等函数的止点)。

根据当前描点与给定的控制点 1 连接的直线，和控制点 1 与控制点 2 连接的直线，作为使用指定半径的圆的切线，画出两条切线之间的弧线路径

| 名称   | 类型   | 描述           |
| ------ | ------ | -------------- |
| x1     | number | x 坐标控制点 1 |
| y1     | number | y 坐标控制点 1 |
| x2     | number | x 坐标控制点 2 |
| y2     | number | y 坐标控制点 2 |
| radius | number | 半径           |

#### closePath(): void

移动落笔点

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| x    | number | x 坐标 |
| y    | number | y 坐标 |

---
outline: deep
---

## Canvas

画布

### 构造函数

#### new Canvas (options)

| 名称    | 类型          | 描述            |
| ------- | ------------- | --------------- |
| options | CanvasOptions | Canvas 构造参数 |

### 成员属性

#### entities: AllEntity[];

绘制实例

### 成员方法

#### addCanvas(canvas, style): void

添加画布

| 名称   | 类型               | 描述 |
| ------ | ------------------ | ---- |
| canvas | Canvas             | 画布 |
| style  | Style \| undefined | 样式 |

#### translate(tx, ty): void

平移

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| tx   | number | x 偏移量 |
| ty   | number | y 偏移量 |

#### rotate(xt, yt): void

旋转

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| xt   | number | x 弧度 |
| xt   | number | y 弧度 |

#### scale(x, y): void

缩放

| 名称 | 类型   | 描述   |
| ---- | ------ | ------ |
| x    | number | x 倍率 |
| y    | number | y 倍率 |

#### drawLine(x1, y1, x2, y2, style): void

绘制线段

| 名称  | 类型               | 描述          |
| ----- | ------------------ | ------------- |
| x1    | number             | 起始点 x 坐标 |
| y1    | number             | 起始点 y 坐标 |
| x2    | number             | 结束点 x 坐标 |
| y2    | number             | 结束点 y 坐标 |
| style | Style \| undefined | 样式          |

#### drawPolygon(points, style): void

绘制多边形

| 名称   | 类型               | 描述       |
| ------ | ------------------ | ---------- |
| points | Point[]            | 坐标点集合 |
| style  | Style \| undefined | 样式       |

#### drawPolyline(points, style): void

绘制多线段

| 名称   | 类型               | 描述       |
| ------ | ------------------ | ---------- |
| points | Point[]            | 坐标点集合 |
| style  | Style \| undefined | 样式       |

#### drawRect(x, y, w, h, radii, style): void

绘制矩形

| 名称  | 类型               | 描述   |
| ----- | ------------------ | ------ |
| x     | number             | x 坐标 |
| y     | number             | y 坐标 |
| w     | number             | 宽度   |
| h     | number             | 高度   |
| radii | number             | 圆角   |
| style | Style \| undefined | 样式   |

#### drawCircle(cx, cy, radius, style): void

绘制圆形

| 名称   | 类型               | 描述   |
| ------ | ------------------ | ------ |
| cx     | number             | 中心点 |
| cy     | number             | 中心点 |
| radius | number             | 半径   |
| style  | Style \| undefined | 样式   |

#### drawText(text, x, y, style): void

绘制文字

| 名称  | 类型               | 描述        |
| ----- | ------------------ | ----------- |
| text  | string             | 文字        |
| x     | number             | 基点 x 坐标 |
| y     | number             | 基点 y 坐标 |
| style | Style \| undefined | 样式        |

#### drawPath(path, style): void

绘制路径

| 名称  | 类型               | 描述 |
| ----- | ------------------ | ---- |
| path  | Path               | 路径 |
| style | Style \| undefined | 样式 |

#### drawArc(cx, cy, radius, startAngle, endAngle, counterclockwise, style): void

绘制弧形

| 名称             | 类型               | 描述                                 |
| ---------------- | ------------------ | ------------------------------------ |
| cx               | number             | x 中心点                             |
| cy               | number             | y 中心点                             |
| radius           | number             | 半径                                 |
| startAngle       | number             | 开始弧度                             |
| endAngle         | number             | 结束弧度                             |
| counterclockwise | boolean            | 绘制方向, true 逆时针, false 顺时针. |
| style            | Style \| undefined | 样式                                 |

#### drawImage(image, x, y, w, h, dx, dy, dw, dh): void

绘制图像

| 名称  | 类型                | 描述                                                       |
| ----- | ------------------- | ---------------------------------------------------------- |
| image | ImageResource       | 图像资源                                                   |
| x     | number              | x 坐标                                                     |
| y     | number              | y 坐标                                                     |
| w     | number \| undefined | 宽度                                                       |
| h     | number \| undefined | 高度                                                       |
| dx    | number \| undefined | 裁剪图像数据的偏移量, 默认是整个图像数据的左上角（x 坐标） |
| dy    | number \| undefined | 裁剪图像数据的偏移量, 默认是整个图像数据的左上角（y 坐标） |
| dw    | number \| undefined | 裁剪图像数据的宽度, 默认是整个图像数据的宽度               |
| dh    | number \| undefined | 裁剪图像数据的宽度, 默认是整个图像数据的高度               |

#### drawImagePixel(imageData, x, y, dx, dy, dw, dh): void

绘制图像像素

| 名称      | 类型                | 描述                                                       |
| --------- | ------------------- | ---------------------------------------------------------- |
| imageData | ImageData           | 图像数据                                                   |
| x         | number              | 基点 x 坐标                                                |
| y         | number              | 基点 y 坐标                                                |
| dx        | number \| undefined | 裁剪图像数据的偏移量, 默认是整个图像数据的左上角（x 坐标） |
| dy        | number \| undefined | 裁剪图像数据的偏移量, 默认是整个图像数据的左上角（y 坐标） |
| dw        | number \| undefined | 裁剪图像数据的宽度, 默认是整个图像数据的宽度               |
| dh        | number \| undefined | 裁剪图像数据的宽度, 默认是整个图像数据的高度               |

---
outline: deep
---

## Circle

圆形

### 构造函数

#### new Circle (options)

| 名称    | 类型          | 描述              |
| ------- | ------------- | ----------------- |
| options | CircleOptions | Circle 的构造参数 |

### 成员属性

#### cx: number

圆心 x 坐标

#### cy: number

圆心 y 坐标

#### radius: number

半径

## Composition

组合图形

### 构造函数

#### new Composition (options)

| 名称    | 类型               | 描述                   |
| ------- | ------------------ | ---------------------- |
| options | CompositionOptions | Composition 的构造参数 |

### 成员属性

#### x: number

基点 x 坐标

#### y: number

基点 y 坐标

#### children: Graphic[]

子图形列表

### 成员方法

#### addChild(graphic): void

添加子图形

| 名称    | 类型    | 描述 |
| ------- | ------- | ---- |
| graphic | Graphic | 图形 |

#### removeChild(graphic): void

移除子图形

| 名称    | 类型    | 描述 |
| ------- | ------- | ---- |
| graphic | Graphic | 图形 |

#### clearChildren(): void

清空子图形列表

| 名称    | 类型    | 描述 |
| ------- | ------- | ---- |
| graphic | Graphic | 图形 |

## Graphic

基础图形

所有图形都是继承自这个类

### 构造函数

#### new Graphic (options)

| 名称    | 类型           | 描述               |
| ------- | -------------- | ------------------ |
| options | GraphicOptions | Graphic 的构造参数 |

### 成员属性

#### id: GraphicId

id

#### offset: Offset

全局偏移量

#### style?: Style

样式

#### uCanvas: UCanvas;

在调用 paint 之前注入的 uCanvas 实例

#### parent?: Graphic;

父图形

### 成员方法

#### getAabb(): Aabb

自身 aabb

#### getGlobalAabb(): Aabb

全局 aabb

#### paint(canvas, offset): void

绘制

| 名称   | 类型   | 描述       |
| ------ | ------ | ---------- |
| canvas | Canvas | 画布       |
| offset | Offset | 全局偏移量 |

#### hitTest(point): Graphic | undefined

命中测试

| 名称  | 类型  | 描述       |
| ----- | ----- | ---------- |
| point | Point | 全局坐标点 |

#### toGlobalPoint(point): Point

将局部坐标点转化为全局坐标点

| 名称  | 类型  | 描述       |
| ----- | ----- | ---------- |
| point | Point | 局部坐标点 |

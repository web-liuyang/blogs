## Circle

圆形

### 继承

Graphic

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

### 继承

Graphic

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

#### matrix: Matrix;

局部矩阵

#### worldMatrix: Matrix;

全局矩阵

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

## ImagePixel

像素图形

### 继承

Graphic

### 构造函数

#### new ImagePixel (options)

| 名称    | 类型              | 描述                  |
| ------- | ----------------- | --------------------- |
| options | ImagePixelOptions | ImagePixel 的构造参数 |

### 成员属性

#### imageData: ImageData

图像数据

#### x: number

基点 x 坐标

#### y: number

基点 y 坐标

#### dx: number

裁剪图像数据的偏移量, 默认是整个图像数据的左上角（x 坐标）

#### dy: number

裁剪图像数据的偏移量, 默认是整个图像数据的左上角（y 坐标）

#### dw: number

裁剪图像数据的宽度, 默认是整个图像数据的宽度

#### dh: number

裁剪图像数据的宽度, 默认是整个图像数据的高度

## Image

图像

### 继承

Graphic

### 构造函数

#### new Image (options)

| 名称    | 类型         | 描述             |
| ------- | ------------ | ---------------- |
| options | ImageOptions | Image 的构造参数 |

### 成员属性

#### imageData: ImageData

图像数据

#### x: number

基点 x 坐标

#### y: number

基点 y 坐标

#### w: number | undefined

宽度

#### h: number | undefined

高度

#### dx: number | undefined

裁剪图像数据的偏移量, 默认是整个图像数据的左上角（x 坐标）

#### dy: number | undefined

裁剪图像数据的偏移量, 默认是整个图像数据的左上角（y 坐标）

#### dw: number | undefined

裁剪图像数据的宽度, 默认是整个图像数据的宽度

#### dh: number | undefined

裁剪图像数据的宽度, 默认是整个图像数据的高度

## Pie

扇形

### 继承

Graphic

### 构造函数

#### new Pie (options)

| 名称    | 类型       | 描述           |
| ------- | ---------- | -------------- |
| options | PieOptions | Pie 的构造参数 |

### 成员属性

#### cx: number

中心点 x 坐标

#### cy: number

中心点 y 坐标

#### radius: number

半径

#### startAngle: number

起始角度

#### endAngle: number

结束角度

#### counterclockwise: boolean

绘制方向, true 逆时针, false 顺时针. 默认 false

## Polygon

多边形

### 继承

Graphic

### 构造函数

#### new Polygon (options)

| 名称    | 类型           | 描述               |
| ------- | -------------- | ------------------ |
| options | PolygonOptions | Polygon 的构造参数 |

### 成员属性

#### points: Point[]

点集合

#### close: boolean

闭合

## Polyline

多线段

### 继承

Graphic

### 构造函数

#### new Polyline (options)

| 名称    | 类型            | 描述                |
| ------- | --------------- | ------------------- |
| options | PolylineOptions | Polyline 的构造参数 |

### 成员属性

#### points: Point[]

点集合

## Rectangle

矩形

### 继承

Graphic

### 静态方法

#### fromCenter(options): Rectangle

| 名称    | 类型                       | 描述 |
| ------- | -------------------------- | ---- |
| options | RectangleFromCenterOptions | 参数 |

### 构造函数

#### new Rectangle (options)

| 名称    | 类型             | 描述                 |
| ------- | ---------------- | -------------------- |
| options | RectangleOptions | Rectangle 的构造参数 |

### 成员属性

#### x: number

基点 x 坐标

#### y: number

基点 y 坐标

#### w: number

宽度

#### h: number

高度

#### radii: number

圆角

#### cx: number

中心点 x 坐标

#### cy: number

中心点 y 坐标

## Ring

环形

### 构造函数

#### new Ring (options)

| 名称    | 类型        | 描述            |
| ------- | ----------- | --------------- |
| options | RingOptions | Ring 的构造参数 |

### 成员属性

#### cx: number

中心点 x 坐标

#### cy: number

中心点 y 坐标

#### innerRadius: number

内半径

#### outerRadius: number

外半径

#### startAngle: number

起始角度

#### endAngle: number

结束角度

#### counterclockwise: boolean

绘制方向, true 逆时针, false 顺时针. 默认 false

## Text

文本

### 继承

Graphic

### 构造函数

#### new Text (options)

| 名称    | 类型        | 描述            |
| ------- | ----------- | --------------- |
| options | TextOptions | Text 的构造参数 |

### 成员属性

#### x: number

基点 x 坐标

#### y: number

基点 y 坐标

#### text: string

文本

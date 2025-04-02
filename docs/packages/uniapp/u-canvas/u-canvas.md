---
outline: deep
---

## UCanvas

主程序类

## 构造函数

### new UCanvas (options)

| 名称    | 类型           | 描述               |
| ------- | -------------- | ------------------ |
| options | UCanvasOptions | UCanvas 的构造参数 |

## 成员属性

### canvasContext: CanvasContext

Canvas 上下文

### ctx: CanvasRenderingContext2D

原生绘制属性

### dpr: number

屏幕像素比

### isInitialized: bool

初始化状态

### matrix: Matrix

当前画布矩阵

### options: UCanvasOptions

构造参数

### renderer: Renderer

渲染类

### root: Composition

根图形

### style: Style

绘制样式

### viewbox: Viewbox

可视区域

## 成员方法

### addGraphic(graphic): void

添加图形

| 名称    | 类型    | 描述 |
| ------- | ------- | ---- |
| graphic | Graphic | 图形 |

### cancelAnimationFrame(taskId): void

取消一个先前通过调用 uni.requestAnimationFrame() 方法添加到计划中的动画帧请求

| 名称   | 类型   | 描述    |
| ------ | ------ | ------- |
| taskId | number | 任务 ID |

### cleanCanvas(): void

清除当前画布内容

### cleanGraphic(): void

清除所有图形

### createImageResource(src) : Promise\<ImageResource\>

创建 ImageResource

| 名称 | 类型   | 描述     |
| ---- | ------ | -------- |
| src  | string | 图片路径 |

### ensureInitialize(): Promise\<void\>

初始化 UCanvas

### makeImageData(options): ImageData

制作 ImageData

| 名称    | 类型                 | 描述 |
| ------- | -------------------- | ---- |
| options | MakeImageDataOptions | 参数 |

### removeGraphic(graphic): void

移除图形

| 名称    | 类型    | 描述 |
| ------- | ------- | ---- |
| graphic | Graphic | 图形 |

### render(): void

渲染

### requestAnimationFrame(callback): number

在下一次重绘之前，调用用户提供的回调函数

| 名称     | 类型                          | 描述     |
| -------- | ----------------------------- | -------- |
| callback | RequestAnimationFrameCallback | 回调函数 |

### toBlob(type?, quality?): Promise\<Blob\>

返回一个包含图片展示的 data URI

| 名称     | 类型                          | 描述     |
| -------- | ----------------------------- | -------- |
| callback | RequestAnimationFrameCallback | 回调函数 |

### toCanvasPoint(point): Point

屏幕坐标转成 Canvas 中的坐标

| 名称  | 类型  | 描述     |
| ----- | ----- | -------- |
| point | Point | 屏幕坐标 |

### toDataURL(): void

返回当前画布可视区域的 base64 图片

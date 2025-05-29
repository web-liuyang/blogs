# u-canvas

## 介绍

一款快速的, 灵活的, 开源的, 支持 UniappX 的 Canvas 基础图形绘制引擎.

随时跟进 Uniappx 的 Canvas 更新, 不参杂任何三方工具/库, 达到最小代码尺寸.

简单便捷的 API, 使用户快速上手, 多平台的支持包括 APP, WEB, MP.

## 功能介绍

1. 支持自定义图形

2. 支持图形嵌套

3. 支持图形矩阵

4. 内置常用图形

5. 统一绘制接口

## 快速开始

```uvue
<script lang="uts" setup>
	import * as ucan from "@/uni_modules/u-canvas";
	import {
		UCanvas,
		Composition,
		Text,
		Rectangle,
		Polyline,
		Ring,
		Pie,
		Circle,
		Polygon,
		Picture,
		ImagePixel,
		Point,
	} from "@/uni_modules/u-canvas";

	const uCanvas = new UCanvas({ canvasId: "ucanvas" });

	async function init() : Promise<void> {
		await uCanvas.ensureInitialize();
		uCanvas.addGraphic(
			new Composition({
				x: 10,
				y: 10,
				children: [
					new Rectangle({ x: 0, y: 0, w: 100, h: 100, radii: 10 }),
					new Text({ x: 0, y: 120, text: "Rectangle" }),
				],
			})
		);

		uCanvas.addGraphic(
			new Composition({
				x: 140,
				y: 10,
				children: [
					new Polyline({ points: [new Point(0, 0), new Point(100, 0), new Point(0, 100), new Point(100, 100)], }),
					new Text({ x: 0, y: 120, text: "Polyline" }),
				],
			})
		);
		uCanvas.addGraphic(
			new Composition({
				x: 270,
				y: 10,
				children: [
					new Polygon({ points: [new Point(0, 0), new Point(100, 0), new Point(0, 100)], }),
					new Text({ x: 0, y: 120, text: "Polygon" }),
				],
			})
		);
		uCanvas.addGraphic(
			new Composition({
				x: 10,
				y: 160,
				children: [
					new Pie({
						cx: 50,
						cy: 50,
						radius: 50,
						startAngle: 0,
						endAngle: Math.PI + Math.PI / 3,
					}),
					new Text({ x: 0, y: 120, text: "Pie" }),
				],
			})
		);
		uCanvas.addGraphic(
			new Composition({
				x: 140,
				y: 160,
				children: [
					new Circle({ cx: 50, cy: 50, radius: 50, }),
					new Text({ x: 0, y: 120, text: "Circle" }),
				],
			})
		);
		uCanvas.addGraphic(
			new Composition({
				x: 270,
				y: 160,
				children: [
					new Ring({
						cx: 50,
						cy: 50,
						innerRadius: 30,
						outerRadius: 50,
						startAngle: 0,
						endAngle: Math.PI + Math.PI / 1.5,
					}),
					new Text({ x: 0, y: 120, text: "Ring" }),
				],
			})
		);
		const data = new Uint8ClampedArray([
			parseInt("10000000", 2),
			parseInt("01000000", 2),
			parseInt("00100000", 2),
			parseInt("00010000", 2),
			parseInt("00001000", 2),
			parseInt("00000100", 2),
			parseInt("00000010", 2),
			parseInt("00000001", 2),
		]);
		uCanvas.addGraphic(
			new Composition({
				x: 10,
				y: 300,
				children: [
					new ImagePixel({
						imageData: uCanvas.makeImageData({ data, bytesPerScanline: 8, array: [12, 12] }),
						x: 0,
						y: 0,
					}),
					new Text({ x: 0, y: 120, text: "ImagePixel" }),
				],
			})
		);

		const image = await uCanvas.createImage("/static/logo.png");
		// const image = await uCanvas.createImage("https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni-app.png");
		uCanvas.addGraphic(
			new Composition({
				x: 140,
				y: 300,
				children: [
					new Picture({ image: image, x: 0, y: 0, w: 100, h: 100, }),
					new Text({ x: 0, y: 120, text: "Image" }),
				],
			})
		);
		uCanvas.addGraphic(
			new Composition({
				x: 10,
				y: 500,
				children: [
					new Text({ x: 0, y: 0, text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }),
					new Text({ x: 0, y: 24, text: "abcdefghijklmnopqrstuvwxyz" }),
				],
			})
		);
		uCanvas.render();
	}

	onReady(() => {
		init();
	});
</script>

<template>
	<view class="canvas-component">
		<canvas canvas-id="ucanvas" id="ucanvas" class="canvas" />
	</view>
</template>

<style>
	/* #ifdef WEB || MP */
	/* 禁止页面的回弹效果, APP 在 pages.json里面设置 */
	body {
		overflow: hidden;
	}

	/* #endif */

	.canvas-component {
		width: 100%;
		height: 100%;
	}

	.canvas {
		width: 100%;
		height: 100%;

		border: 1px solid red;
	}
</style>
```

## 相关链接

- [u-canvas 文档](https://www.webliuyang.com/packages/uniapp/u-canvas/guide.html)

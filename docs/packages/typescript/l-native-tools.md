---
outline: deep
---

# 介绍

[源码点我](https://github.com/web-liuyang/l-native-tools)

此 SDK 基于 TypeScript 所编写的常用工具库。

## 安装

```sh
# npm
npm i l-native-tools

# yarn
yarn add l-native-tools
```

## Array

### flatten

**数组扁平化**

将多维数组合为新的一维数组

**源码**

```tsx
/**
 * @description 数组扁平化
 * @param {any[]} origin - 源数组
 * @param {any[]} [target=[]] - 目标数组
 * @return {any[]} 扁平化后的数据
 */
function flatten(origin: any[], target: any[] = []): any[] {
	for (const item of origin) {
		if (typeOf(item) === "array") {
			flatten(item, target);
		} else {
			target.push(item);
		}
	}
	return target;
}
```

**示例**

```js
const origin = [1, 2, 3, [4, 5, 6], [7, [8, [9]]]];

flatten(origin);
// => [1,2,3,4,5,6,7,8,9];
```

### unique

**数组去重**

把源数组中相同的元素去除掉

**源码**

```tsx
/**
 * @description 数组去重
 * @param {any[]} origin - 源数组
 * @return {any[]} 去重后的数组
 */
export function unique(origin: any[]): any[] {
	if (typeOf(origin) !== "array") {
		throw new TypeError(`想要得到array类型的参数但是却得到：${typeOf(origin)}}类型的参数`);
	}
	return [...new Set(origin)];
}
```

**示例**

```tsx
const origin = [1, 1, 2, 2, 3, 3, 3];

unique(origin);
// => [1,2,3];
```

## Common

### typeOf

**类型检查**

浅判断类型

**源码**

```tsx
type Type =
	| "string"
	| "number"
	| "boolean"
	| "object"
	| "array"
	| "symbol"
	| "function"
	| "null"
	| "undefined"
	| "regexp"
	| "date"
	| "window"
	| "set"
	| "map";

/**
 * @description 浅判断类型
 * @param {*} origin - 判断的变量
 * @return {Type}
 */
export function typeOf(origin?: any): Type & string {
	return Object.prototype.toString.call(origin).slice(8, -1).toLowerCase() as Type & string;
}
```

**示例**

```js
const origin1 = {};
typeOf(origin1);
// => object;

const origin2 = [];
typeOf(origin2);
// => array;

const origin3 = function () {};
typeOf(origin3);
// => function;
```

### isEmpty

**判断是否为空**

判断某个值是否为空

**源码**

```tsx
/**
 * @description 判断某个值是否为空
 * @param {*} origin - 判断的值
 * @return {boolean} 空为true 非空为false
 */
export function isEmpty(origin?: any): boolean {
	switch (typeOf(origin)) {
		case "string":
			return !origin;
		case "number":
			return !origin;
		case "boolean":
			return !origin;
		case "object":
			for (const key in origin) return !key;
			return true;
		case "array":
			return origin.length === 0;
		case "null":
			return true;
		case "undefined":
			return true;
		default:
			return false;
	}
}
```

**示例**

```tsx
const origin1 = [];
isEmpty(origin1);
// => true

const origin2 = [1];
isEmpty(origin2);
// => false

const origin3 = {};
isEmpty(origin3);
// => true

const origin4 = { name: "liuyang" };
isEmpty(origin4);
// => false
```

### straightDistance

**直线距离计算**

根据两端经纬度进行距离计算，单位米

注：根据实际情况使用

**源码**

```tsx
/**
 * @description 直线距离计算
 * @param {string} origin - 当前经纬度。 经度在前，纬度在后，经度和纬度用","分割，经纬度小数点后不得超过6位
 * @param {string} target - 目标经纬度。 经度在前，纬度在后，经度和纬度用","分割，经纬度小数点后不得超过6位
 * @returns {number} 返回两端之间的距离,单位米
 */
export function straightDistance(origin: string, target: string): number {
	if (typeOf(origin) !== "string" || typeOf(target) !== "string") {
		throw new TypeError(`想要的到string类型的参数但是却得到：${typeOf(origin)}与${typeOf(target)}类型的参数`);
	}
	const { PI, asin, sqrt, pow, sin, cos, round } = Math;
	// 获取经纬度
	const [lon1, lat1] = origin.split(",");
	const [lon2, lat2] = target.split(",");
	const EARTH_RADIUS = 6378137.0; // 地球半径

	// 获取弧度
	function getRad(d: string) {
		return ((d as unknown as number) * PI) / 180.0;
	}

	const radLat1 = getRad(lat1);
	const radLat2 = getRad(lat2);
	const a = radLat1 - radLat2;
	const b = getRad(lon1) - getRad(lon2);

	let s = 2 * asin(sqrt(pow(sin(a / 2), 2) + cos(radLat1) * cos(radLat2) * pow(sin(b / 2), 2)));
	s = s * EARTH_RADIUS;
	s = round(round(s * 10000) / 10000.0);
	return s;
}
```

**示例**

```tsx
const origin1 = "104.061388,30.505552";
const target1 = "103.923298,30.636125";

straightDistance(origin1, target1);
// => 19658
```

### deepClone

**深拷贝**

不影响源对象使用的引用值类型的赋值

**源码**

```tsx
/**
 * @description 深拷贝
 * @template T
 * @param {T} origin - 拷贝的源对象
 * @return {T} 拷贝后的对象
 */
export function deepClone<T = {} | any[]>(origin: T): T {
	let clone = (typeOf(origin) === "array" ? [] : {}) as T;
	if (typeOf(origin) === "object" || typeOf(origin) === "array") {
		for (const key in origin) {
			if (typeOf(origin[key]) === "object" || typeOf(origin[key]) === "array") {
				clone[key] = deepClone(origin[key]);
			} else {
				clone[key] = origin[key];
			}
		}
	}
	return clone;
}
```

**示例**

```tsx
const origin = { a: 1, b: 2 };

deepClone(origin);
// => {a:1,b:2}
```

### getRandomColor

**随机 RGBA 颜色**

随机 RGBA 颜色，可用于颜色赋值

**源码**

```tsx
/**
 * @description 随机颜色获取
 * @param {number} [transparency=1] - 透明度
 * @return {string} rgba颜色
 */
export function getRandomColor(transparency: number = 1): string {
	const { floor, random } = Math;

	const r = floor(random() * 255);
	const g = floor(random() * 255);
	const b = floor(random() * 255);
	const color = `rgba(${r},${g},${b},${transparency})`;

	return color;
}
```

**示例**

```tsx
getRandomColor(0.5);
// => rgba(200,200,200,0.5)
```

## Number

### currency

**金额运算**

此计算不是特别的精准，建议适用于精度要求不是特别高的计算

注：金融类项目建议使用专用的金额运算库

**源码**

```tsx
/**
 * @description 金额运算
 * @param {'+' | '-' | '*' | '/'} method - 计算方法
 * @param {number[]} args 需要参与计算的数值或字符串
 * @return {number} 计算后的值
 */
export function currency(method: "+" | "-" | "*" | "/", numberArr: number[]): number {
	const arr = numberArr.map(item => Math.round((item *= 100)));
	let num = 0;
	switch (method) {
		case "+":
			num = arr.reduce((total, item) => total + item) / 100;
			break;
		case "-":
			num = arr.reduce((total, item) => total - item) / 100;
			break;
		case "*":
			num = arr.reduce((total, item) => (total * item) / 100, 1);
			break;
		case "/":
			num = arr.reduce((total, item) => (total * 100) / item) / 100;
			break;
	}
	return num;
}
```

**示例**

```js
const a = 5,
	b = 5;

currency("+", [a, b]);
// => 10

currency("-", [a, b]);
// => 0

currency("*", [a, b]);
// => 25

currency("/", [a, b]);
// => 1
```

### random

**获取两个数值之间的整数**

获取两个数值之间的整数，包含最大值与最小值

**源码**

```tsx
/**
 * @description 获取两个数值之间的整数，包含最大值与最小值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @return {number}
 */
export function random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
```

**示例**

```js
const min = 0,
	max = 10;

random(min, max);
// => 0

random(min, max);
// => 5

random(min, max);
// => 10
```

## Object

### getOwnKeys

**对象 Key 值获取**

目标对象的自身属性键组成的数组,不包括原型对象

**源码**

```tsx
/**
 * @description 目标对象的自身属性键组成的数组,不包括原型对象
 * @param {object | any[]} origin - 源对象
 * @return {PropertyKey[]} 源对象可枚举的数组
 */
export function getOwnKeys(origin: object | any[]): PropertyKey[] {
	if (typeOf(origin) !== "object" || typeOf(origin) !== "array") {
		throw new TypeError(`想要获取object与array类型的参数却获得：${typeOf(origin)}类型的参数`);
	}
	return Reflect.ownKeys(origin);
}
```

**示例**

```js
const obj = { a: 1, b: 2, c: 3 },
	arr = [];

getOwnKeys(obj);
// => [a,b,c]

getOwnKeys(arr);
// => [length]
```

### isDeepObjectEqual

**对象深度比较**

两个任意对象进行深度递归比较

**源码**

```tsx
/**
 * 深度比较两个对象是否全等
 * @param {*} obj1 - 对象1
 * @param {*} obj2 - 对象2
 * @return {boolean} true 相等 false 不相等
 */
export function isDeepObjectEqual(obj1: any, obj2: any): boolean {
	//1.如果是比较对象===，返回true
	if (obj1 === obj2) return true;

	//2.如果比较的是两个方法，转成字符串比较
	if (typeof obj1 === "function" && typeof obj2 === "function") return obj1.toString() === obj2.toString();

	//3如果obj1和obj2都是Date实例，获取毫秒值比较
	if (obj1 instanceof Date && obj2 instanceof Date) return obj1.getTime() === obj2.getTime();

	//4如果比较是两个类型不一致,无须比较直接返回false
	if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2) || typeof obj1 !== "object")
		return false;

	//5.获取对象所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性
	const obj1Props = Object.getOwnPropertyNames(obj1);
	const obj2Props = Object.getOwnPropertyNames(obj2);

	//自身属性长度相等,
	if (obj1Props.length !== obj2Props.length) return false;

	//递归调用判断每一个属性值是否相等
	return obj1Props.every(prop => isDeepObjectEqual(obj1[prop], obj2[prop]));
}
```

**示例**

```js
const obj1 = { a: 1, b: 2, c: 3 },
	obj2 = { a: 1, b: 2, c: 3 },
	obj3 = { a: 1, b: 2, c: 3, d: 4 };

isDeepObjectEqual(obj1, obj2);
// => true

isDeepObjectEqual(obj1, obj3);
// => false
```

## Performance

### debounce

**防抖**

一段时间内的最后一次点击有效

**源码**

```tsx
/**
 * @description 防抖
 * @param {Function} fn - 延迟执行的函数
 * @param {number} delay - 延迟执行毫秒数
 * @param {boolean} [immediate] - 是否第一次执行
 * @return {() => void}
 */
export function debounce(fn: Function, delay: number, immediate?: boolean): () => void {
	let timeout: NodeJS.Timeout | null = null;

	return function () {
		// @ts-ignore
		const ctx = this;
		const args: IArguments = arguments;
		// 如果timeout存在那么取消延时器
		if (timeout) clearTimeout(timeout);
		// 判断是否首次需要执行
		if (immediate) {
			// 判断延时器是否有值
			const now = !timeout;
			timeout = setTimeout(() => {
				timeout = null;
			}, delay);
			if (now) fn.apply(ctx, args);
		} else {
			timeout = setTimeout(function () {
				fn.apply(ctx, args);
			}, delay);
		}
	};
}
```

**示例**

```js
const callback = debounce(() => {
	console.log("debounce");
}, 300);

addEventListener("scroll", callback, false);
```

### throttle

**节流**

间隔时间达到 delay 时，才执行一次函数

**源码**

```tsx
/**
 * @description 节流
 * @param {Function} fn - 节流执行的函数
 * @param {number} delay - 节流毫秒数
 * @returns {() => void}
 */
export function throttle(fn: Function, delay: number): () => void {
	let timeout: NodeJS.Timeout | null = null,
		startTime: number = Date.now(); // 创建节流函数的时间

	return function () {
		let curTime: number = Date.now(), // 返回的这个函数被调用的时间
			remaining: number = delay - (curTime - startTime), // 设定的delay与[上一次被调用的时间与现在的时间间隔]的差值
			// @ts-ignore
			ctx = this, // 上下文对象
			args: IArguments = arguments; // 返回的这个函数执行时传入的参数

		// 首先清掉定时器
		timeout && clearTimeout(timeout);
		// // 假如距离上一次执行此函数的时间已经超过了设定的delay，则执行
		if (remaining <= 0) {
			fn.apply(ctx, args);
			startTime = Date.now(); // 重置最后执行时间为现在
			// 否则，等到间隔时间达到delay时，执行函数
		} else {
			timeout = setTimeout(() => {
				fn.apply(ctx, args);
			}, remaining);
		}
	};
}
```

**示例**

```js
const callback = throttle(() => {
	console.log("throttle");
}, 1000);

addEventListener("click", callback, false);
```

## String

### firstUpperCase

**将第一个字母转换成大写**

将第首字母转换成大写并返回

**源码**

```tsx
/**
 * @description 将第一个字母转换成大写
 * @param {string} str - 需要转换的字符串
 * @return {string} 转换后的字符串
 */
export function firstUpperCase(str: string): string {
	return str.replace(str[0], str[0].toUpperCase());
}
```

**示例**

```js
const str = "";

getOwnKeys(obj);
// => [a,b,c]

getOwnKeys(arr);
// => [length]
```

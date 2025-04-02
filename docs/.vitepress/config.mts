import { DefaultTheme, defineConfig } from "vitepress";

// vitepress
// 侧边栏不能在路径后面加 /, 要不然上/下一页无法被读取到

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "LiuYang",
	description: "LiuYang's Blogs",
	head: [
		[
			"link",
			{
				rel: "icon",
				sizes: "32x32",
				type: "image/png",
				href: "/favicon.png",
			},
		],
		[
			"script",
			{},
			`
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?79f707827aeccbcc6ce48133731d010c";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
`,
		],
	],
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		search: {
			provider: "local",
		},
		nav: nav(),
		sidebar: sidebar(),
		socialLinks: [{ icon: "github", link: "https://github.com/web-liuyang" }],
		footer: {
			copyright: "MIT Licensed | Copyright 2021-present LiuYang 蜀ICP备2021005160号",
		},
	},
});

function nav(): DefaultTheme.NavItem[] {
	return [
		// { text: "Introduction", link: "/introduction/" },
		// { text: "Guide", link: "/guide/" },
		{ text: "Standard", link: "/standard/guide", activeMatch: "/standard/" },
		{
			text: "Books",
			activeMatch: "/books/",
			items: [
				{ text: "Refactoring 2", link: "/books/refactoring2/", activeMatch: "/books/refactoring2/" },
				{ text: "Java", link: "/books/java/pojo/", activeMatch: "/books/java/" },
				{ text: "Shell", link: "/books/shell/guide/", activeMatch: "/books/shell/" },
				{ text: "Linux", link: "/books/linux/package/", activeMatch: "/books/linux/" },
			],
		},
		{
			text: "Packages",
			activeMatch: "/packages/",
			items: [
				{
					text: "TypeScript",
					items: [
						{
							text: "l-native-tools",
							link: "/packages/typescript/l-native-tools",
						},
						{
							text: "l-browser-storage",
							link: "/packages/typescript/l-browser-storage",
						},
					],
				},
				{
					text: "Vue",
					items: [
						{ text: "vuepress-plugin-handle-sidebar", link: "/packages/vue/vuepress-plugin-handle-sidebar" },
						//
					],
				},
				{
					text: "Uniapp",
					items: [
						// { text: "Components", link: "/packages/uniapp/components/" },
						// { text: "SDK", link: "/packages/uniapp/sdk/" },
						{ text: "u-canvas", link: "/packages/uniapp/u-canvas/guide" },
						{ text: "u-pointer", link: "/packages/uniapp/u-pointer/" },
					],
				},
			],
		},

		{
			text: "Practices",
			activeMatch: "/practices/",
			items: [
				{ text: "custom-promise", link: "/practices/custom-promise/" },
				{ text: "custom-vue", link: "/practices/custom-vue/" },
			],
		},

		{
			text: "Problems",
			activeMatch: "/problems/",
			items: [
				{ text: "React", link: "/problems/react/umi-dynamic-router", activeMatch: "/problems/react/" },
				//
			],
		},
	];
}

function sidebar(): DefaultTheme.Sidebar {
	return {
		"/standard/": { base: "/standard/", items: sidebarStandard() },
		"/books/java/": { base: "/books/java/", items: sidebarBooksJava() },
		"/books/shell/": { base: "/books/shell/", items: sidebarBooksShell() },
		"/books/linux/": { base: "/books/linux/", items: sidebarBooksLinux() },
		"/packages/uniapp/u-canvas/": { base: "/packages/uniapp/u-canvas/", items: sidebarPackagesUniappUCanvas() },
		"/problems/react/": { base: "/problems/react/", items: sidebarProblemsReact() },
	};
}

function sidebarStandard(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "Standard",
			items: [
				{ text: "Guide", link: "guide" },
				{ text: "HTML", link: "html" },
				{ text: "CSS", link: "css" },
				{ text: "JavaScript", link: "javascript" },
				{ text: "TypeScript", link: "typescript" },
				{ text: "Vue", link: "vue" },
				{ text: "React", link: "react" },
				{ text: "Format", link: "format" },
				{ text: "API", link: "api" },
			],
		},
	];
}

function sidebarBooksJava(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "POJO",
			link: "pojo",
		},
	];
}

function sidebarBooksShell(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "Shell",
			items: [
				{ text: "Guide", link: "guide" },
				{ text: "Basic", link: "basic" },
				{ text: "String", link: "string" },
				{ text: "Test", link: "test" },
			],
		},
	];
}

function sidebarBooksLinux(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "Package",
			link: "package",
		},
		{
			text: "Command",
			base: "/books/linux/command/",
			items: [
				{ text: "Compress", link: "compress" },
				{ text: "Directory", link: "directory" },
				{ text: "File", link: "file" },
				{ text: "Help", link: "help" },
				{ text: "Net", link: "net" },
				{ text: "Permission", link: "permission" },
				{ text: "Search", link: "search" },
				{ text: "Shutdown", link: "shutdown" },
				{ text: "User", link: "user" },
			],
		},
	];
}

function sidebarPackagesUniappUCanvas(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "Guide",
			link: "guide",
		},
		{
			text: "Aabb",
			link: "aabb",
		},
		{
			text: "Canvas",
			link: "canvas",
		},
		{
			text: "Path",
			link: "path",
		},
		{
			text: "UCanvas",
			link: "u-canvas",
		},
		{
			text: "Renderer",
			link: "renderer",
		},
		{
			text: "Graphics",
			link: "graphics",
		},
		{
			text: "Matrix",
			link: "matrix",
		},
		{
			text: "Line",
			link: "line",
		},
		{
			text: "Offset",
			link: "offset",
		},
		{
			text: "Point",
			link: "point",
		},
	];
}

function sidebarProblemsReact(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "Umi Dynamic Router",
			link: "umi-dynamic-router",
		},
		{
			text: "Antd Pro Dynamic Router",
			link: "antd-pro-dynamic-router",
		},
		{
			text: "Webpack React Config",
			link: "webpack-react-config",
		},
	];
}

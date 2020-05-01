# classic-cli

<p align="center">
  <a href="https://npmcharts.com/compare/classic-cli?minimal=true">
    <img src="https://img.shields.io/npm/dm/classic-cli.svg" alt="Downloads">
  </a>
  <a href="https://www.npmjs.com/package/classic-cli">
    <img src="https://img.shields.io/npm/v/classic-cli.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/classic-cli">
    <img src="https://img.shields.io/npm/l/classic-cli.svg" alt="License">
  </a>
</p>

> 一个快速创建H5专题页的命令行工具，方便使用者使用构建工具进行无侵入式开发（可随时脱离构建工具）。

***注意：需要使用硬盘文件内容变动能在编辑器中及时体现出来的编辑器，尽量不要用Webstorm、IDEA这类IDE（这类IDE默认情况下会对文件进行一个缓存）。***

适用人群：

1. 对JS执行速度、页面加载速度等要求高的项目，并且你具有一定geek精神。
2. 公司要求同时管理源码和编译产物两套代码，但你只想管理一套。
3. 喜欢掌控代码，不喜欢构建工具生成的一堆堆的、乱七八糟的代码，但手动给CSS添加浏览器前缀是万万不能忍的。

## 一、用法

1、安装命令行工具

```bash
# 全局安装命令行工具
npm i -g classic-cli
```

2、使用

```bash
# 进入任一使用传统方式开发的项目根目录，或者进入一个新的空目录，然后执行下述命令
classic
```

## 二、核心功能说明

* 🎄 会自动将当前目录下后缀名为`.js`（不包括`.min.js`）的文件编译成ES5代码，并直接覆盖更新原始文件。

* 📲 会自动将当前目录下后缀名为`.css`（不包括`.min.css`）的文件做一些常见的兼容处理，并直接覆盖更新原始文件。

* 🌐 会自动启动一个本地服务，一旦有`.html`、`.css`或者`.js`文件更新会自动刷新页面。默认端口为8080，可以通过`-p`或者`--port`参数指定，如`classic -p 8888`。

* 🙈 若执行`classic`命令的当前工作目录为空目录（即内部不含任何文件、文件夹），默认会使用远程模版来创建本地初始项目结构，如果使用场地的网络不佳，可以通过`-t local`或`--template local`来指定使用本地模版。

* 💪 本地模版会自动生成几个常见目录和空文件。

* 🔥 远程模版自带rem响应式支持（默认1rem = 100px，750px宽的设计稿对应7.5rem宽度）。

* 👫 远程模板集成了polyfill.js、jquery.js、fastclick.js和vue.js，可以自行决定是否要通过script标签引入使用。

* 🏇 修改文件时自动刷新浏览器，方便查看效果。

* 🏏 可通过在文件头部添加`classic-compress:true`注释来压缩（仅压缩，不混淆，是可逆的，传false就可以逆向解压缩）js、css，加快页面加载速度。

* 🚀 可通过在文件头部添加`classic-compress:false`注释来自动格式化（美化）css、js代码，保持较统一的代码风格。

* 🛠 借助babel，支持使用主流的ES6+新特性。

注：

1. 该功能会自动忽略根目录下的如下目录（如有）：`node_modules`、`.`开头的目录/文件（如`.git`、`.gitignore`）。
2. 需要使用硬盘文件内容变动能在编辑器中及时体现出来的编辑器，尽量不要用IDEA这类IDE（这类IDE默认情况下会对文件进行一个缓存）。
3. 本命令工具只会处理后缀名为`.js`（不包括`.min.js`）和`.css`（不包括`.min.css`）的文件，其他如`.html`文件、`.png`文件都不会被处理。

## 三、其他支持的特性和小技巧

1. 对不希望被编译处理的`.js`和`.css`文件，可在后缀名前加上`.min`，变成`.min.js`、`.min.css`。

2. 可以通过在`.js`、`.css`文件头部添加注释`classic-compress: true`或者`classic-compress: false`，
来告诉工具是否要对该文件进行压缩/解压缩处理（不涉及混淆，所示是个可逆向的过程）。如果不需要处理，不添加这些注释即可。

3. 对于`.css`文件，压缩后代码中的常规注释会消失，如果需要在开发时解压缩还得重新加注释，为避免这个问题，添加注释时需要在`/*`后面加个`!`——即`/*!`，如`/*! classic-compress:false */`。这类注释不会在压缩时被移除，便于切换。

## 四、License

MIT.

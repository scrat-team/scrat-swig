# [scrat](https://github.com/scrat-team/scrat) 后端渲染解决方案的模板扩展

scrat后端渲染组件化开发模式通过扩展 [swig](http://paularmstrong.github.io/swig/) 模板引擎实现了组件资源管理方案。

[![NPM Version](https://img.shields.io/npm/v/scrat-swig.svg?style=flat)](https://www.npmjs.org/package/scrat-swig)
[![Build Status](https://img.shields.io/travis/scrat-team/scrat-swig.svg?style=flat)](https://travis-ci.org/scrat-team/scrat-swig)

## 用法

```js
var express = require('express');
var engine = require('scrat-swig');
var app = express();
app.set('view engine', 'tpl');
app.set('views', 'path/to/template/dir');
app.engine('tpl', engine.renderFile);
engine.setDefaults(options);   //模板引擎默认配置
app.get('/page/*', engine.middleware(opt)); //中间件配置项
```

### 模板引擎默认配置

http://paularmstrong.github.io/swig/docs/api/#setDefaults

### 中间件配置项
* map：``Object|String`` 资源表数据或资源表文件路径
* cacheMap：``Boolean`` 是否缓存资源表（上线时应设置为true，以提高性能；本地开发中应设置为false，方便自动更新）
* comboURI：``Function`` 加工Combo请求的处理函数，不用关心，默认写好了
* logger：``Console`` 日志对象
* root：``String`` 模板目录

## 新增模板标签

### require

* 功能：资源/组件引用接口，调用后只是收集资源，并不会有内容输出。
* 闭合：NO
* 参数：
    * $id：字符串或模板变量。要引用的组件id或相对路径
    * __props：模块内的局部变量，只在当前模块上下文生效
* 示例：

    ```twig
    {% require $id="header" %}    {# 组件id #}
    {% require $id="./lib.js" %}  {# 工程路径 #}
    {% for val in obj %}
        {% require $id=val %}     {# 模板变量 #}
    {% endfor %}
    ```

    ```twig
    // index.tpl
    {% require $id="header" __title='tile' golbal='golbal' %}

    // header.tpl
    {{ __title }}   // title
    {{ golbal }}    // golbal
    {% require $id="nav" %}

    // nav.tpl
    {{ __title }}   // null
    {{ golbal }}    // golbal
    ```

### css

* 功能：动态引用样式，例如某些组件在某些条件下需要单独加载额外样式
* 闭合：NO
* 参数：
    * $id：字符串或模板变量。要引用的组件id或相对路径
* 示例：

    ``` twig
    {% if nation == "russia" %}
        {% css $id="widget/article/content/content.russia.css" %}
    {% endif %}
    ```

    渲染后的html：

    ``` html
    ...
    <link href="/public/c/widget/article/content/content.russia_86ab01f.css">
    ...
    ```


### html

* 功能：替代原生的 `<html>` 标签包裹页面主体部分，用于实现资源url输出时替换页面占位
* 闭合：YES
* 参数：
    * cdn:指定pagelet加载时所用的域名,可以是字符串字面量,也可以是模板变量
    * 任何其他参数都将转换为输出的html标签的属性。
* 示例：

    ```twig
    {% html class="abc" data-value="bcd" %}
    ...
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html class="abc" data-value="bcd">
    ...
    </html>
    ```

### head

* 功能：替代原生的 ``<head>`` 标签包裹页面head部分，用于实现资源CSS输出占位
* 闭合：YES
* 参数：任何参数都将转换为输出的head标签的属性。
* 示例：

    ```twig
    {% html%}
        {% head class="abc" data-xxx="bcd" %}
            ...
        {% endhead %}
        ...
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html>
        <head class="abc" data-xxx="bcd">
            ...
        </head>
        ...
    </html>
    ```

### body

* 功能：替代原生的 ``<body>`` 标签包裹页面body部分，用于实现资源JS输出占位
* 闭合：YES
* 参数：任何参数都将转换为输出的body标签的属性。
* 示例：

    ```twig
    {% html%}
        {% head %}
            ...
        {% endhead %}
        {% body class="main" id="main" data-ooo="abc" %}
            ...
        {% endbody %}
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html>
        <head>
            ...
        </head>
        <body class="main" id="main" data-ooo="abc">
            ...
        </body>
    </html>
    ```

### script

* 功能：替代原生的 ``script`` 标签，收集页面中散落的script脚本统一放到页面尾部输出。
* 闭合：YES
* 参数：无
* 示例：

    ```twig
    {% html%}
        {% head %}
            ...
            {% require $id="../lib/jquery.js" %}  {# 引用资源 #}
        {% endhead %}
        {% body %}
            ...
            {% script %}
                var header = require('header');
                header.init();
            {% endscript %}
            {% require $id="./index.js" %}  {# 引用资源 #}
        {% endbody %}
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html>
        <head>
            ...
        </head>
        <body>
            ...
            <script src="/views/lib/jquery.js"></script>
            <script src="/views/index/index.js"></script>
            <script>
                !function(){
                    var header = require('header');
                    header.init();
                }();
            </script>
        </body>
    </html>
    ```

* 注意：在body闭合标签之前，js输出的顺序是：
    1. require标签加载的外链js
    1. script标签收集的内联js

### pagelet

* 功能：页面区域划分，用于quickling加载页面
* 闭合：YES
* 注意：pagelet默认会生成一个dom结构，如果希望不生成任何结构，须设置 ``$tag`` 属性值为字符串 ``"none"``
* 参数：
    * $id：字符串|模板变量。定义pagelet的id
    * $tag：字符串|模板变量|"none"。要生成的占位标签的标签名，可以不指定，默认是 ``div``。如果指定为none，框架会输出一个注释来标注pagelet的范围。
    * 任何其他参数都将转换为输出的pagelet占位标签的属性。
* 示例：

    ```twig
    {% html%}
        {% head %}
            ...
        {% endhead %}
        {% body %}
            ...
            {% pagelet $id="main" class="main" %}
                <ul>
                    {% pagelet $id="list" $tag="none" %}
                        {% for item in list %}
                        <li>{{ loop.index }} - {{ loop.key }}: {{ x }}</li>
                        {% endfor %}
                    {% endpagelet %}
                </ul>
                {% pagelet $id="form" $tag="form" id="my-form" class="form-control" %}
                    <input type="text" name="username">
                {% endpagelet %}
            {% endpagelet %}
            ...
        {% endbody %}
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html>
        <head>
            ...
        </head>
        <body>
            ...
            <div class="main" data-pagelet="main">
                <ul>
                    <!-- pagelet [main.list] start -->
                    <li>0 - a: 123</li>
                    <li>0 - b: 456</li>
                    <!-- pagelet [main.list] end -->
                </ul>
                <form id="my-form" class="form-control" data-pagelet="main.form">
                    <input type="text" name="username">
                </form>
            </div>
            ...
        </body>
    </html>
    ```

### title

* 功能：如果使用quickling切换页面，你的页面此标签替代原生的 ``<title>`` 标签用以收集页面标题数据，这样页面切换后框架可以自动修改页面的title显示。
* 闭合：YES
* 参数：无
* 示例：

    ```twig
    {% html%}
        {% head %}
            ...
            {% title %}首页{% endtitle %}
        {% endhead %}
        {% body %}
            ...
        {% endbody %}
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html>
        <head>
            ...
            <title>首页</title>
        </head>
        <body>
            ...
        </body>
    </html>
    ```

### datalet

* 功能：在pagelet区域内收集模板数据将来在quickling加载时可以传递给前端框架。
* 闭合：NO
* 参数：请参考swig的 [set标签](http://paularmstrong.github.io/swig/docs/tags/#set) 用法
* 示例：

    ```twig
    {% html%}
        {% head %}
            ...
            {% title %} 列表页 - 第{{ offset }}页 {% endtitle %}
        {% endhead %}
        {% body %}
            ...
            {% pagelet $id="main" class="main" %}
                {% pagelet $id="list" $tag="ul" %}
                    {% for item in list %}
                    <li>{{ loop.index }} - {{ loop.key }}: {{ x }}</li>
                    {% endfor %}
                    {% datalet page=offset %}
                {% endpagelet %}
            {% endpagelet %}
            ...
        {% endbody %}
    {% endhtml %}
    ```

    假设前端获取main.list的pagelet数据：

    ```js
    {
        "title": "列表页 - 第5页",   // title收集
        "html": {
            "main.list": "..."      // pagelet的html内容
        },
        "data": {
            page: 5                 // datalet收集
        },
        "js": [ ... ],              // js依赖
        "css": [ ... ],             // css依赖
        "script": [ ... ]           // script收集
    }
    ```

### ATF

* 功能：收集位于`ATF`标签以上的css资源，并内嵌到主文档的head标签中。只会收集使用`require`标签加载的css资源，并不会收集link标签的css资源。用于加快首屏渲染速度的优化。
* 闭合：NO
* 参数：无
* 示例：

    ```twig
    {% html%}
        {% head %}
            ...
        {% endhead %}
        {% body %}
            ...
            {% require $id="header" %}
            {% require $id="./index.css" %}
            {% ATF %}
            {% require $id="footer" %}
            ...
        {% endbody %}
    {% endhtml %}
    ```

    渲染后的html：

    ```html
    <html>
        <head>
            ...
            <style>
                .header {...}
                .index {...}
            </style>
        </head>
        <body>
            ...
            <link rel="stylesheet" href="/co??c/footer/footer.css" data-defer>
            ...
        </body>
    </html>
    ```


1.1.0 / 2018-03-05
==================

  * feat: support service-worker (#21)

1.1.0-pwa6 / 2018-01-17
==================

  * refactor: reopen `stripPrefixMulti` (#20)

1.1.0-pwa5 / 2018-01-12
==================

  * feat: 去掉`stripPrefixMulti`，combo设置改回原来的方式，不支持动态设置combo (#19)

1.1.0-pwa4 / 2018-01-05
==================

  * feat: 修改注入sw脚本的位置为pagelet初始化后面 (#18)

1.1.0-pwa3 / 2018-01-02
==================

  * feat: 修改自动插入sw脚本逻辑 (#17)

1.1.0-pwa2 / 2017-12-26
==================

  * feat: support PWA (#16)

1.0.0 / 2017-06-06
==================

  * feat: folder use view and component (#15)

0.10.0 / 2017-04-12
===================

  * feat: allow pass swig to options (#14)

0.9.0 / 2017-04-10
==================

  * fix css tag (not ATF mode) bug & add test cases
  * style:eslint
  * fix:support egg view dir

0.8.1 / 2017-04-10
==================

  * fix: support egg view dir
  * fix: css tag include bug
  * test: add test cases for #9a162fda992e6d6355406c00eb069030d8989dfb


0.8.0 / 2017-03-29
==================

  * feat(lib/tags/css.js): add `css` tag support
  * feat(lib/lib/resource.js): 增加includeCSS()以支持css标签
  * test(fixtures/css/general): 添加css标签测试用例
  * doc(README.md): 添加css标签说明

0.7.1 / 2016-05-17
==================

  * fix:  函数执行的容错问题修复。

0.7.0 / 2016-04-08
==================

  * [UPD] combo url的max length如果没传，默认是正无穷
  * [UPD] 增加combo url长度配置参数，默认参数长度为1920。支持将combo请求切换为多个。 （解决局部地区运营商对url param做了长度限制的坑）

0.6.0 / 2016-03-27
==================

  * test(): 修改测试用例
  * doc(README.md): 修改文档
  * feat(lib/tags/require.js):  $$ swig 自身编译报错，改成 `__` 前缀
  * feat(lib/tags/require.js): 修改局部变量的前缀 `$_` => `$$`
  * doc(README.md): 添加require局部标签的说明
  * test(fixtures/require/general): 添加require标签 传入局部变量 $_  的测试
  * fix(test/lib/tags/require): fix window testcase bug
  * feat(lib/tags/require.js): require标签支持以 $_ 开头传入的变量只在模块内生效

0.5.3 / 2016-01-11
==================

  * chore: ignore cov report

0.5.2 / 2016-01-05
==================

  * feat: add exports

0.5.1 / 2016-01-05
==================

  * adjust folder
  * deps: still deps swig at index.js
  * deps: remove deps on swig

0.5.0 / 2016-01-04
==================

  * feat: code style use eslint airbnb legacy
  * feat: support bool

0.4.11
==================
  * {% html %} 标签支持cdn属性

0.4.6
==================
  * 支持ATF首屏CSS内嵌

0.4.0
==================
  * parser 增加参数校验
  * require 支持参数, 局部变量

0.3.8
==================
  * 代码重构, 抽离出parser, 全部属性支持
  * 补全测试用例

0.3.7
==================
  * body support var

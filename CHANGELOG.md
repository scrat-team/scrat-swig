
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

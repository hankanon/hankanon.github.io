### 常用的指令

```
在命令行中运行 Sass
    sass input.scss output.css
监视单个 Sass 文件，每次修改并保存时自动编译
    sass --watch input.scss:output.css
监视整个文件夹
    sass --watch app/scss:public/stylesheets
开启debug信息
    sass --watch input.scss:output.css --debug-info
选择编译格式并添加调试map
    sass --watch input.scss:output.css --style expanded --sourcemap
编译添加调试map
    sass --watch input.scss:output.css --sourcemap
编译格式
    sass --watch input.scss:output.css --style compact
```


### 选择器嵌套
css中重复写选择器是非常恼人的。尤其是html结构嵌套非常深的时候，scss的选择器嵌套可以避免重复输入父选择器，可以有效的提高开发效率，减少样式覆盖可能造成的异常问题。这也是最常用的功能。

```scss
// 正常的嵌套
.container {
  width: 1200px;
  margin: 0 auto;
  .header {
      .img {
          width: 100px;
          height: 60px;
      }
  }
}

// 编译后
.container {
  width: 1200px;
  margin: 0 auto;
}
.container .header .img {
  width: 100px;
  height: 60px;
}

// 属性嵌套 font-size font-family font-wwight
.container {
  font: {
    family: fantasy;
    size: 30em;
    weight: bold;
  }
}

// 编译后
.container {
  font-family: fantasy;
  font-size: 30em;
  font-weight: bold;
}


// 父元素选择器引用
.user {
  a {
      color: #333;
      &:hover {
           text-decoration: underline;
           color: #f00;
      }
  }
  &-name {
    color: #666
  }
}

// 编译后
.user a {
  color: #333;
}
.user a:hover {
  text-decoration: underline;
  color: #f00;
}
.user-name {
  color: #666;
}
```

### 变量
#### 变量声明

* 变量以美元符号$开头，后面跟变量名；
* 变量名是不以数字开头的可包含字母、数字、下划线、横线（连接符）；
* 通过连接符-与下划线_定义的同名变量为同一变量；
* 变量一定要先定义，后使用；
* 写法同css，即变量名和值之间用冒号:分隔；

1. 声明单个属性值
```scss
$highlight-color: #F90;
$highlight-border: 1px solid $highlight-color;
```
#### 变量作用域

* 变量作用域分为全局变量域和局部变量域：

全局变量：声明在最外层的变量，可在任何地方使用；
局部变量：嵌套规则内定义的变量只能在嵌套规则内使用。

* 将局部变量转换为全局变量可以添加!global 声明。

**1. 变量的作用域**
```scss
$nav-color: #F90; // 全局声明
nav {
  $width: 100px; // 局部声明
  width: $width; // 100px
  color: $nav-color; // #f90
}
// 这意味着是你可以在样式表的其他地方定义和使用$width变量，不会对这里造成影响。

```
**2. 将局部变量升级为全局变量 !global**
```scss
// 编译前 
#main {
  $width: 5em !global; // $width 为全局变量
  width: $width;
}
#sidebar {
  width: $width;
}

// 编译后
#main { 
  width: 5em; 
}
#sidebar { 
  width: 5em; 
}
```

**3. 变量默认值 !default**
可以在变量的结尾添加!default来给变量设置默认值，有点类似Javascript的逻辑运算符let content=content || "Second content"。注意，变量是 null时将视为未被!default赋值。
```scss
$w: 300px;
$w: 500px;

div {
  width: $w;
}

// 编译后
div {
  width: 500px;
}
```
如果给变量设置默认值，则变量没被覆盖的时候以默认值为主，被覆盖的时候以新值为主
```scss
$w: 300px;
$w: 500px !default; // 默认值

div {
  width: $w;
}
// 编译后
div {
  width: 300px;
}
```
可以将许多的全局变量定义为默认值，其他模块引入的时候，根据需要可以各自赋新值。

### 数据类型
scss支持7种主要的数据类型：

1. 数字，1rem、2vh、13、 10px；
2. 字符串，分有引号字符串与无引号字符串，"foo"、 'bar'、baz；
3. 颜色，blue, #04a3f9, rgba(255,0,0,0.5)；
4. 布尔型，true和false；
5. 空值，null是其类型的唯一值。表示缺少值，通常由函数返回以表示缺少结果；
6. 数组 (list)，用空格或逗号作分隔符，1.5em 1em 0 2em,Helvetica,Arial,sans-serif；
7. maps， 相当于 JavaScript 的 object，(key1: value1, key2: value2)；

```scss
$layer-index: 10;
$border-width: 3px;

$font-weight: bold;
$font-size: 16px;

$font-base-family: "Open Sans", Helvetica, Sans-Serif;
$block-base-padding: 6px 10px 6px 10px;

$top-bg-color: rgba(255, 147, 29, 0.6);

$blank-mode: true;

$var: null;

$fonts: (
  serif: "Helvetica Neue",
  monospace: "Consolas",
);

.container {
  font-family: $font-base-family;
  font-size: $font-size;
  padding: $block-base-padding;

  @if $blank-mode {
    background-color: #000;
  } @else {
    background-color: #fff;
  }

  content: type-of($var);
  content: length($var);
  color: $top-bg-color;
}

// 如果列表中包含空值，则生成的CSS中将忽略该空值。
.wrap {
  font: 18px $font-weight map-get($fonts, "sans");
}

// 编译后
.container {
  font-family: "Open Sans", Helvetica, Sans-Serif;
  font-size: 16px;
  padding: 6px 10px 6px 10px;
  background-color: #000;
  content: null;
  content: 1;
  color: rgba(255, 147, 29, 0.6);
}

.wrap {
  font: 18px bold;
}
```

### 运算符

1. 相等运算==和不相等运算!=
2. 四个关系运算符< > >= <=
3. 三个布尔运算符and or not
4. 操作运算符 + - * / %

**/ 在css中有分隔数字的用途，在scss中，以下三种情况会进行除法运算：**
* 如果值或值的一部分，是变量或者函数的返回值；
* 如果值被圆括号包裹；
* 如果值是算数表达式的一部分。
```scss
// == 与 !=
$theme:"blue";
.container {
    @if $theme == "blue" {
        background-color: red;
    }
    @else {
        background-color: blue;
    }
}
// > < >= <=
$num:3;
.container {
    @if $num >= 5 {
        background-color: red;
    }
    @else {
        background-color: blue;
    }
}
// and or not
$width: 100;
$height: 200;
$last: false;
div {
  @if $width>50 and $height<300 {
    font-size: 16px;
  } @else {
    font-size: 14px;
  }
  @if not $last {
    border-color: red;
  } @else {
    border-color: blue;
  }

  @if $width>500 or $height<300{
    line-height: 20px;
  } @else {
    line-height: 50px;
  }
}
// + - * /
$width: 1000px;
div {
    font: 16px/30px Arial, Helvetica, sans-serif; // 不运算
    width: ($width/2); // 使用变量与括号
    width: (#{$width}/2); // 使用 #{} 插值语句将变量包裹，避免运算。
    z-index: round(10)/2; // 使用了函数
    height: (500px/2); // 使用了括号
    margin-left: 5px + 8px/2px; // 使用了+表达式
}

// 如果需要使用变量，同时又要确保 / 不做除法运算而是完整地编译到 css文件中，只需要用 #{} 插值语句将变量包裹。

// 编译后
.container {
  background-color: red;
}

.container {
  background-color: blue;
}

div {
  font-size: 16px;
  border-color: red;
  line-height: 20px;
}

div {
  font: 16px/30px Arial, Helvetica, sans-serif;
  width: 500px;
  width: 1000px/2;
  z-index: 5;
  height: 250px;
  margin-left: 9px;
}
```

### 插值语句
通过 #{} 插值语句可以在选择器、属性名、注释中使用变量，使用#{}插值语句将变量包裹起来即可，和js中的模板字符串很像。
```scss
$font-size: 12px;
$line-height: 30px;
$class-name: danger;
$attr: color;
$author: "作者：ABC";

p {
    font: #{$font-size}/#{$line-height} Arial Helvetica, sans-serif;
}

/* 
* 这是文件的说明部分
* @author: #{$author}
*/

a.#{$class-name} {
    border-#{$attr}: #f00;
}

// 编译后
p {
  font: 12px/30px Arial Helvetica, sans-serif;
}

/* 
* 这是文件的说明部分
* @author: 作者：ABC
*/
a.danger {
  border-color: #f00;
}
```

### 流程控制
sass中流程控制包含四类，也是我们在js中常见的@if、@for、@each、@while。

#### @if语句

@if语法和js类似，基本格式是@if...@else if...@else。

```scss
$theme:3;
.container {
    @if $theme >= 5 {
        background-color: red;
    }
    @else {
        background-color: blue;
    }
}
// 编译后
.container {
  background-color: blue;
}
```

#### @for 语句

for在条件范围内重复操作，这个指令包含两种格式：

1. @for $var from 'start' through 'end'；
2. @for $var from 'start' to 'end'。

**两者区别在于 through 与 to 的含义：**
1. 使用 through时，条件范围包含 'start' 与 'end'的值；
2. 使用 to时条件范围只包含'start'的值不包含'end'的值；

$var 可以是任何变量，比如$i，'start' 和 'end' 必须是整数值。
```scss
@for $i from 1 to 3 {
	.loading span:nth-child(#{$i}) {
		width: 20 * ($i - 1) + px;
	}
}
@for $i from 1 through 3 {
	.loading div:nth-child(#{$i}) {
		width: 20 * ($i - 1) + px;
	}
}

// 编译后
.loading span:nth-child(1) {
  width: 0px;
}

.loading span:nth-child(2) {
  width: 20px;
}

.loading div:nth-child(1) {
  width: 0px;
}

.loading div:nth-child(2) {
  width: 20px;
}

.loading div:nth-child(3) {
  width: 40px;
}
```

#### @each语句
@each指令的格式是@each $var in $list , $var可以是任何变量名，而$list是一连串的值，也就是值列表。

```scss
$color-list:red green blue turquoise darkmagenta;
@each $color in $color-list {
    $index: index($color-list, $color); // index内置函数 返回 list 中的 第几个值的下标，从1开始
    .p#{$index - 1} {
        background-color: $color;
    }
}
// 编译后
.p0 {
    background-color: red;
}

.p1 {
    background-color: green;
}

.p2 {
    background-color: blue;
}

.p3 {
    background-color: turquoise;
}

.p4 {
    background-color: darkmagenta;
}
```

#### @while
@while 指令循环输出直到表达式返回结果为 false。这样可以实现比@for 更复杂的循环。
比如，可以借此生成栅格化布局。

```scss
$column:12;
@while $column>0 {
   .col-sm-#{$column} {
      width: $column / 12 * 100%;
   }
    $column:$column - 1;
}
// 编译后
.col-sm-12 {
    width: 100%;
}

.col-sm-11 {
    width: 91.6666666667%;
}

.col-sm-10 {
    width: 83.3333333333%;
}

.col-sm-9 {
    width: 75%;
}

.col-sm-8 {
    width: 66.6666666667%;
}

.col-sm-7 {
    width: 58.3333333333%;
}

.col-sm-6 {
    width: 50%;
}

.col-sm-5 {
    width: 41.6666666667%;
}

.col-sm-4 {
    width: 33.3333333333%;
}

.col-sm-3 {
    width: 25%;
}

.col-sm-2 {
    width: 16.6666666667%;
}

.col-sm-1 {
    width: 8.3333333333%;
}
```

#### @import
@import算是一个比较简易的模块系统。scss拓展了@import 的功能，允许其导入 scss或 sass文件。被导入的文件将合并编译到同一个 css文件中，被导入的文件中所包含的变量或者混合指令 (mixin) 都可以在导入的文件中使用。

以下情况下，@import 仅作为普通的css语句【原生的CSS导入】，不会导入scss文件：

文件拓展名是 .css ；
文件名以 http:// 开头；
文件名是 url() ；
@import包含媒体查询。
```scss
@import "common.css";
@import url(common);
@import "http://xxx.com/xxx";
@import 'landscape' screen and (orientation:landscape);
```
```scss
@import 'common.css';
@import '变量.scss';

span {
  font-size: 12px;
}

// 编译后
@import 'common.css'; // @import 导入的css文件仅仅作为普通的css语句，不做scss变异处理
.container {
  font-family: "Open Sans", Helvetica, Sans-Serif;
  font-size: 16px;
  padding: 6px 10px 6px 10px;
  background-color: #000;
  content: null;
  content: 1;
  color: rgba(255, 147, 29, 0.6);
}

.wrap {
  font: 18px bold;
}

span {
  font-size: 12px;
}
```

导入文件也可以使用 #{} 插值语句动态导入，可以理解为JS中的字符串模板。但不是通过变量动态导入 scss文件，只能作用于 css的 url() 导入方式
```scss
$family: unquote("Droid+Sans");
@import url("http://fonts.googleapis.com/css?family=#{$family}");
// 编译后
@import url("http://fonts.googleapis.com/css?family=Droid+Sans");
```

#### @Partials
如果需要导入 scss 或 sass 文件，但又希望将其编译为css，只需要在文件名前加下划线
1. 导入的 语句中不需要添加下划线
2. 不可以同时存在添加下划线和未添加下划线的同名文件，否则，添加下划线的文件将被忽略

_common.scss
```scss
$color:red;
```
index.scss
```scss
@import "common.scss";
.container {
    border-color: $color;
}
// 编译为

.container {
  border-color: red;
}
```
**_common.scss文件不会编译成 _common.css 文件。**

Partials主要是用来定义公共样式的，专门用于被其他的 scss文件 import进行使用的。

#### @media 媒体查询增强
@media 指令与 css中用法一样，只是增加了一点额外的功能，允许在css规则中嵌套。如果@media 嵌套在 css规则内，编译时，@media 将被编译到文件的最外层，包含嵌套的父选择器

```scss
.sidebar {
    width: 300px;
    @media screen and (orientation: landscape) {
      width: 500px;
      .item {
        height: auto;
      }
    }
  }

// 编译后
.sidebar {
  width: 300px;
}
@media screen and (orientation: landscape) {
  .sidebar {
    width: 500px;
  }
  .sidebar .item {
    height: auto;
  }
}
```

允许相互嵌套，允许在嵌套中使用差值语句，变量、函数以及运算符代替条件的名称或值
```scss
  $media: screen;
  $feature: -webkit-min-device-pixel-ratio;
  $value: 1.5;
  
  @media #{$media} {
    .sidebar {
        @media ($feature: $value) {
            width: 500px;
        }
    }
  }
  // 编译后
  @media screen and (-webkit-min-device-pixel-ratio: 1.5) {
  .sidebar {
    width: 500px;
  }
}
```

#### @mixin 混合指令
可以用于定义重复使用的样式。混合指令可以包含所有的css规则，绝大部分的scss规则，可以通过参数功能引入变量，使输出多样化。
使用方法：
```scss
@mixin mixin-name() {
    /* css 声明 */
}
// 使用
@include mixin-name;
```
**用例：**
```scss
// 定义一个区块基本的样式
@mixin block {
    width: 96%;
    margin-left: 2%;
    border-radius: 8px;
    border: 1px #f6f6f6 solid;
}
// 使用混入 
.container {
    .block {
        @include block;
    }
}
// 编译为
.container .block {
    width: 96%;
    margin-left: 2%;
    border-radius: 8px;
    border: 1px #f6f6f6 solid;
}
```
**参数用例**
```scss

// 定义块元素内边距，参数指定默认值
@mixin block-padding($top:0, $right:0, $bottom:0, $left:0) {
    padding-top: $top;
    padding-right: $right;
    padding-bottom: $bottom;
    padding-left: $left;
}

// 可指定参数赋值
.container {
    /** 不带参数 */
    @include block-padding;
    /** 按顺序指定参数值 */
    @include block-padding(10px,20px);
    /** 给指定参数指定值 */
    @include block-padding($left: 10px, $top: 20px)
}

// 编译为
.container {
  /** 不带参数 */
  padding-top: 0;
  padding-right: 0;
  padding-bottom: 0;
  padding-left: 0;
  /** 按顺序指定参数值 */
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 0;
  padding-left: 0;
  /** 给指定参数指定值 */
  padding-top: 20px;
  padding-right: 0;
  padding-bottom: 0;
  padding-left: 10px;
}
```
**可变参数用例**
使用...处理参数不固定的情况，类似于js中的函数的剩余参数
```scss
@mixin linear-gradient($direction, $gradients...) {
    background-color: nth($gradients, 1);
    background-image: linear-gradient($direction, $gradients);
}

.table-data {
    @include linear-gradient(to right, #F00, orange, yellow);
}
// 编译为
.table-data {
  background-color: #F00;
  background-image: linear-gradient(to right, #F00, orange, yellow);
}
```

mixin是可以重复使用的一组css声明，有助于减少重复代码，只需声明一次，就可在文件中引用；
混合指令可以包含所有的 css规则，绝大部分scss规则，可以传递参数，输出多样化的样式；
使用参数时建议加上默认值；
@import导入局部模块化样式（类似功能、同一组件）；
@mixin定义的是可重复使用的样式

#### @function
@function用于封装复杂的操作，可以很容易地以一种可读的方式抽象出通用公式和行为，函数提供返回值，常用来做计算方面的工作。
```scss
//change-color和hue是内置方法
//hue 返回$color的颜色为0到360度之间的一个数字。
//change-color 用于设置颜色的属性
@function invert($color, $amount: 100%) {
    // @error hue($color); 调试 210deg
    $inverse: change-color($color, $hue: hue($color) + 180);
    @return mix($inverse, $color, $amount);
}

$primary-color: #036;
.header {
    background-color: invert($primary-color, 80%);
}
// 编译后
.header {
  background-color: #523314;
}

// 指定参数
$primary-color: #036;
.banner {
    //scale-color Fluidly scales one or more properties of .$color
    background-color: $primary-color;
    color: scale-color($primary-color, $lightness: +40%);
}
// 编译后
.banner {
  background-color: #036;
  color: #0a85ff;
}

// 可变参数
@function sum($numbers...) {
    $sum: 0;
    @each $number in $numbers {
        $sum: $sum + $number;
    }
    @return $sum;
}

$widths: 50px, 30px, 100px;
.micro {
    width: sum($widths...);
}
// 编译后
.micro {
    width: 180px;
}
```

#### @return
@return只允许在@function内使用，和js一样，遇到return就会返回。
```scss
@function red() {
    $is: true;
    @if $is {
        @return 'is';
    }
    @return red;
}
.con{
    color: red();
}

// 编译后
.con {
  color: "is";
}
```
@function和@mixin参数的使用方式没啥区别；
@function用来计算，@mixin用来封装样式，@import用来抽离他们为一个模块。

#### @extend继承
可以使用@extend继承已经存在的样式，原理是使用逗号选择器。
```scss
.btn {
    width: 100px;
    height: 20px;
    border-radius: 20px;
    font-size: 14px;
}

.btn-default {
    @extend .btn;
    color: blue;
    background-color: scale-color(blue, $lightness: +40%);;
}

.btn-error {
    @extend .btn;
    color: red;
    background-color: scale-color(red, $lightness: +40%);;
}

// 编译后
.btn, .btn-error, .btn-default {
  width: 100px;
  height: 20px;
  border-radius: 20px;
  font-size: 14px;
}

.btn-default {
  color: blue;
  background-color: #6666ff;
}

.btn-error {
  color: red;
  background-color: #ff6666;
}


```
继承不仅会继承父元素自身的所有样式，任何跟父元素有关的组合选择器样式也会被子元素以组合选择器的形式继承
```scss
.error {
  border: 1px solid red;
  background-color: #fdd;
}
.seriousError {
  @extend .error;
  border-width: 3px;
}

//.seriousError 从 .error继承样式
.error a{  //应用到.seriousError a
  color: red;
  font-weight: 100;
}
h1.error { //应用到hl.seriousError
  font-size: 1.2rem;
}
// 编译后
.error, .seriousError {
  border: 1px solid red;
  background-color: #fdd;
}

.seriousError {
  border-width: 3px;
}

.error a, .seriousError a {
  color: red;
  font-weight: 100;
}

h1.error, h1.seriousError {
  font-size: 1.2rem;
}
```
##### 何时使用继承
```
混合器主要用于展示性样式的重用，而类名用于语义化样式的重用。
当一个元素拥有的类（比如说.seriousError）表明它属于另一个类（比如说.error），这时使用继承再合适不过了。
综上所述你应该使用@extend。让.seriousError从.error继承样式，使两者之间的关系非常清晰。
更重要的是无论你在样式表的哪里使用.error.seriousError都会继承其中的样式。
```

可以使用多个@extend， 引用的类和每个@extend，各自,存在、
```scss
.alert {
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 12px;
}

.important {
    font-weight: bold;
    font-size: 14px;
}
.alert-danger {
    @extend .alert;
    @extend .important;
    color: #a94442;
    background-color: #f2dede;
    border-color: #ebccd1;
}
// 编译后
.alert, .alert-danger {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
}

.important, .alert-danger {
  font-weight: bold;
  font-size: 14px;
}

.alert-danger {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}
```

**多层继承**

b 继承 a， c 又继承 b
```scss
.a {
    width: 100px;
}

.b {
    @extend .a;
    height: 20px;
}

.c {
    @extend .b;
    color: #a94442;
}

// 编译后
.a, .b, .c {
  width: 100px;
}

.b, .c {
  height: 20px;
}

.c {
  color: #a94442;
}
```
@extend背后最基本的想法是，如果.seriousError @extend .error， 那么样式表中的任何一处.error都用.error.seriousError这一选择器组进行替换。
@extend的优点
    跟混合器相比，继承生成的css代码相对更少。因为继承仅仅是重复选择器，而不会重复属性，所以使用继承往往比混合器生成的css体积更小。如果你非常关心你站点的速度，请牢记这一点。
    继承遵从css层叠的规则。当两个不同的css规则应用到同一个html元素上时，并且这两个不同的css规则对同一属性的修饰存在不同的值，css层叠规则会决定应用哪个样式。相当直观：通常权重更高的选择器胜出，如果权重相同，定义在后边的规则胜出。


#### 占位符选择器
占位符选择器%，与常用的id 与 class选择器写法相似，只是 # 或 . 替换成了%，占位符选择器必须通过 @extend 指令调用。
```scss
%base {
   width: 100px;
    height: 20px;
    border-radius: 20px;
    font-size: 14px;
}

.btn-default {
    @extend %base;
    color: blue;
    background-color: scale-color(blue, $lightness: +40%);;
}

.btn-error {
    @extend %base;
    color: red;
    background-color: scale-color(red, $lightness: +40%);;
}
// 编译后

.btn-error, .btn-default {
  width: 100px;
  height: 20px;
  border-radius: 20px;
  font-size: 14px;
}

.btn-default {
  color: blue;
  background-color: #6666ff;
}

.btn-error {
  color: red;
  background-color: #ff6666;
}
```
占位符选择器%所属的样式未使用时，不会被编译到css文件中，算是一个小优化吧。

#### @use
css真正意义上的模块化，可以从其它 scss样式表中加载mixin、function和变量，并将来自多个样式表的 css组合在一起。scss还提供了很多内置模块，我们可以通过@use使用。

**@import缺点**
多处导入，存在样式重复加载。
因为没有命名空间，为了避免撞名，不敢使用简写的 classname，因此起名总是需要注意。
没有私有函数的概念，样式完全暴露在使用import的地方，这对ui库不够友好。
```scss
// vars.scss
$color: red;
$radius: 3px;
@mixin rounded {
    border-radius: $radius;
}

// use.scss
@use "vars"; // 可以使用被引入的文件名作为模块名，不会存在变量污染的问题

@use "vars" as c; // 也可以使用as作为别名, 跟JS语法相似

.button {
    @include vars.rounded;
    padding: 5px + vars.$radius;
}

.button {
    @include c.rounded;
    padding: 5px + c.$radius;
}
@use "vars" as *; // 使用as*，那么这一模块就处于全局命名空间。
.button {
    @include rounded;
    padding: 5px + $radius;
}

// 编译后 

.button {
  border-radius: 3px;
  padding: 8px;
}

```

#### 私有模块
使用scss可以轻松地定义私有成员，私有成员命名以-或开头。私有成员不能再其他模块中被使用
```scss
$-radius: 3px;

@mixin rounded {
    border-radius: $-radius;
}

@use "vars";

.button {
    @include corners.rounded;
    // Error: Private members can't be accessed from outside their modules.
    padding: 5px + vars.$-radius;
}
```
#### @forward
@forward语句可以引入另一个模块的所有变量、mixins和函数, 将他们作为当前模块的 API 暴露出去，不会真的在当前模块中增加代码。
跟@use 的区别为，不能给变量添加命名空间。
用法： 将所有其他文件的变量汇总在一个文件，使用的时候只引用当前的文件即可。
```scss
// a.scss

@mixin rounded {
    border-radius: 100px;
}
footer {
    height: 1px;
}
```
```scss
// b.scss
$radius: 3px;
```

```scss
//  c.scss 汇总 a b 文件中定义的变量，a b 文件中正常 写的CSS样式会被拷贝过来
@forward "a";
@forward "b";

//编译后
footer {
  height: 1px;
}
```

```scss
// index.scss
@import "c.scss";

.button {
    @include rounded;
    padding: $radius;
}
// 编译后
footer {
  height: 1px;
}

.button {
  border-radius: 100px;
  padding: 3px;
}

// @use 引用方法
@use 'c.scss';
.button {
    @include c.rounded;
    padding: c.$radius;
}
```

##### **show/ hide**
通过控制 show和 hide，可以决定模块中的哪些成员对引入后的模板可见. 可以间接的实现变量的私有化
```scss
@forward "a" show rounded;
@forward "b" hide $radius;
```

```scss
@import "c.scss";

.button {
    @include rounded;
    padding: $radius;
}
// Error: Undefined variable. padding: $radius;
```
##### 使用 as* 号为子模块添加前缀
一个样式库一般会存在一个入口文件 index.scss，在 index.scss 中引入其他的文件。index.scss文件中就可以使用 as 'prefix'-*语句,为子模块添加前缀来区分。
示例 
```scss
@forward "a" as mixin-*;
@forward "b" as var-*;
```

```scss
// index.scss
@import "c.scss";

.button {
    @include mixin-rounded;
    padding: $var-radius;
}
```

#### @at-root
@at-root用来跳出嵌套，在多级嵌套时比较常用，包含without和with。
```scss
//没有跳出
.parent-1 {
    color:#f00;
    .child {
        width:100px;
    }
}

//单个选择器跳出
.parent-2 {
    color:#f00;
    @at-root .child {
        width:200px;
    }
}

//多个选择器跳出
.parent-3 {
    background:#f00;
    @at-root {
        .child1 {
            width:300px;
        }
        .child2 {
            width:400px;
        }
    }
}

// 编译后
.parent-1 {
  color: #f00;
}
.parent-1 .child {
  width: 100px;
}

.parent-2 {
  color: #f00;
}
.child {
  width: 200px;
}

.parent-3 {
  background: #f00;
}
.child1 {
  width: 300px;
}

.child2 {
  width: 400px;
}
```

默认@at-root只会跳出选择器嵌套，而不能跳出@media或@support，如果要跳出这两种，则需使用@at-root (without: media)或@at-root (without: support)，@at-root的关键词有四个：

* all 表示所有；
* rule 表示常规css选择器；
* media 表示media；
* support表示support（@support主要是用于检测浏览器是否支持css的某个属性）。
 @at-root默认的嵌套时是@at-root (without:rule)
 
 ```scss
/*跳出父级元素嵌套*/
@media print {
    .parent1{
        color:#f00;
        @at-root .child1 {
            width:200px;
        }
    }
}

/*跳出media嵌套，父级有效*/
@media print {
    .parent2{
        color:#f00;
        @at-root (without: media) {
            .child2 {
                width:200px;
            }
        }
    }
}

/*跳出media和父级*/
@media print {
    .parent3{
        color:#f00;
        @at-root (without: all) {
            .child3 {
                width:200px;
            }
        }
    }
}

// 编译后
/*跳出父级元素嵌套*/
@media print {
  .parent1 {
    color: #f00;
  }
  .child1 {
    width: 200px;
  }
}
/*跳出media嵌套，父级有效*/
@media print {
  .parent2 {
    color: #f00;
  }
}
.parent2 .child2 {
  width: 200px;
}
/*跳出media和父级*/
@media print {
  .parent3 {
    color: #f00;
  }
}
.child3 {
  width: 200px;
}
```

@at-root与 & 配合使用
```scss
.child{
    @at-root .parent &{
        color:#f00;
    }
}
// 编译后
.parent .child {
  color: #f00;
}
```

应用于@keyframe
将同一个模块的样式写在一块，用@at-root来分开层级
```scss
.demo {
    animation: motion 3s infinite;
    @at-root {
        @keyframes motion {
        }
    }
}
// 编译后
.demo {
    animation: motion 3s infinite;
}
@keyframes motion {}
```
### 静默注释
```
sass另外提供了一种不同于css标准注释格式/* ... */的注释语法，
即静默注释，其内容不会出现在生成的css文件中。
将 ! 作为多行注释的第一个字符表示在压缩输出模式下保留这条注释并输出到 CSS 文件中，通常用于添加版权信息。
body {
  color: #333; // 这种注释内容不会出现在生成的css文件中(静默注释)
  padding: 0; /* 这种注释内容会出现在生成的css文件中 */
}


当注释出现在原生css不允许的地方，如在css属性或选择器中，sass将不知如何将其生成到对应css文件中的相应位置，于是这些注释被抹掉。
body {
  color /* 这块注释内容不会出现在生成的css中 */: #333;
  padding: 1; /* 这块注释内容也不会出现在生成的css中 */ 0;
}
```
### 小知识点

* 占位符选择器 %foo (Placeholder Selectors: %foo)

* 字符串 (Strings)
    有引号字符串 与 无引号字符串 (unquoted strings)

* 数组 (Lists)
    nth 函数可以直接访问数组中的某一项；
    join 函数可以将多个数组连接在一起；
    append 函数可以在数组中添加新值；
    @each 指令能够遍历数组中的每一项。

* Maps
    $map: (key1: value1, key2: value2, key3: value3);

* 颜色 (Colors)

* 运算 (Operations)

    所有数据类型均支持相等运算 == 或 !=，此外，每种数据类型也有其各自支持的运算方式。
    SassScript 支持数字的加减乘除、取整等运算 (+, -, *, /, %)，如果必要会在不同单位间转换值。
    字符串运算 (String Operations)
    ```scss
    p {
      cursor: e + -resize;
    }
    ```

* 布尔运算 (Boolean Operations)
    SassScript 支持布尔型的 and or 以及 not 运算。

* 圆括号 (Parentheses)
    width: 1em + (2em * 3);

* 插值语句 #{} (Interpolation: #{})
    $attr: border;
    #{$attr}-color: blue;

* & in SassScript
    父选择器标识符

* 变量定义 !default (Variable Defaults: !default)

* @import 并可以嵌套
    导入其他scss文件

* @extend
* 控制指令 (Control Directives)
    @if 声明后面可以跟多个 @else if 声明，或者一个 @else 声明。
    @if 1 + 1 == 2 { border: 1px solid; }
    @if 5 < 3 { border: 2px dotted; }
    @for
    ```scss
    @for $i from 1 through 3 {
      .item-#{$i} { width: 2em * $i; }
    }
    ```
    @each
    ```scss
    @each $animal in puma, sea-slug, egret, salamander {
      .#{$animal}-icon {
        background-image: url('/images/#{$animal}.png');
      }
    }
    ```
    @while
    ```scss
    $i: 6;
    @while $i > 0 {
      .item-#{$i} { width: 2em * $i; }
      $i: $i - 2;
    }
    ```


### 总结
```
变量（声明及使用）：
    可以声明全局和局部变量。声明方法：$var-name
嵌套CSS规则：
    article a {
      color: blue;
      &:hover { color: red } // 父选择器的标识符&，此时代表 a 元素
    }
导入SASS文件：
    在一个scss文件同导入其他scss文件。导入方法：@import "sidebar";
静默注释：
    在scss文件中有注释，编译之后注释被抹掉。注释方法为：// 
混合器：
    混合器允许用户编写语义化样式的同时避免视觉层面上样式的重复。
    定义混合器使用@mixin标识符。
    使用混合器@include。        
使用选择器继承来精简CSS：
    继承允许你声明类之间语义化的关系，通过这些关系可以保持你的css的整洁和可维护性。
    这个通过@extend语法实现。 
```
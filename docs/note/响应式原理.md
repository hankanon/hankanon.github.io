---
layout: vue3
title: Vue3响应式原理
date: 2021-05-09 20:03:12
tags:
- Vue3 原理
categories: 
- Vue3
---
## Vue3.0 composition-api的用法
```html
<body>
  <h3>reactive</h3>
  <div id='app'>
    <button @click='click'>reverse</button> 
    <div style="margin-top: 20px">{{ state.message }}</div>
    <div style="margin-top: 20px">{{ state.count }}</div>
    <div style="margin-top: 20px">{{ state.doubleCount }}</div>
  </div>
</body>
<script>
  const { createApp, reactive, defineComponent, computed, watchEffect, onMounted } = Vue
  const App = {
      setup(props, {attrs, slots, emit}=ctx) {
          // setup 函数里面不能使用this
          
          // 数据响应式处理
          const state = reactive({
              message: 'Hello Vue3!!',
              count: 1,
              // 计算属性
              doubleCount: computed(()=>{return state.count * 2})
          })
          // 方法
          click = () => {
              state.message = state.message.split('').reverse().join('')
          }
          // 监听函数
          watchEffect(()=>{
            console.log(state.message)
          })
          // 生命周期
          onMounted(()=>{})
          return {
              state,
              click
          }
      },
      // 指令
      directives: {
        'focus': (el, { value }) => {
          if (value) {
            el.focus()
          }
        }
      }
  }
  createApp(App).mount('#app')
  // Vue2 的 初始化方式
  new Vue({
      render: h => h(App)
    }).$mount('#app')
</script>

```

### Vue2 版本响应式处理的一些局限性

* 无法监控到数组下标的变化，导致通过数组下标添加元素，不能实时响应
* 只能劫持对象的属性，从而需要对每个对象，每个属性进行遍历，如果，属性值是对象，还需要深度遍历。

#### Vue3 和 Vue2 响应式方案对比
| 实现方式 | Vue2 | Vue3  |
| ---    | --- | --- |
| 差异  | 劫持的是对象中的属性 | 劫持的是整个对象 |
| 优势  | 兼容性好，支持IE9+，性能好 | 能够监听整个对象的变化，对数组、对象的属性增加、删除都能监听到，不需要循环遍历监听，初始化阶段性能好  |
| 不足  | 不能监听对象、数组的增删、删除，不支持，Map，Set等数据结构的响应式 | 不支持IE浏览器 |

## Vue2 和Vue3 运行机制对比
Vue2 运行机制：
![](https://gitee.com/hankanon/public/raw/master/WX20201221-015918@2x.png)
图片来自：[掘金小册：剖析 Vue.js 内部运行机制](https://juejin.cn/book/6844733705089449991)
Vue3 运行机制：
![](https://gitee.com/hankanon/public/raw/master/20201221001406.png)

## Vue3数据响应式原理
### Proxy 和 Reflect

* Proxy： 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。Proxy 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”
* Reflect： 是一个内置的对象，它提供拦截 JavaScript 操作的方法。Reflect不是一个函数对象，因此它是不可构造的。不能通过**new运算符**对其进行调用

链接：[【Proxy具体用法】](https://es6.ruanyifeng.com/#docs/proxy)
链接：[【Reflect具体用法】](https://es6.ruanyifeng.com/#docs/reflect)

### 不同类型的Reactive

#### ① reactive
建立响应式reactive，返回proxy对象，这个reactive可以深层次递归，也就是如果发现展开的属性值是引用类型的而且被引用，还会用reactive递归处理。而且属性是可以被修改的。
#### ② shallowReactive
建立响应式shallowReactive，返回proxy对象。和reactive的区别是只建立一层的响应式，也就是说如果发现展开属性是引用类型也不会递归。
#### ③ readonly
返回的proxy处理的对象，可以展开递归处理，但是属性是只读的，不能修改。可以做props传递给子组件使用。
#### ④ shallowReadonly
返回经过处理的proxy对象，但是建立响应式属性是只读的，不展开引用也不递归转换，可以这用于为有状态组件创建props代理对象。

### 储存对象与proxy

存储代理对象和原对象之间的映射关系
```js
// 键值对 ： { [targetObject] : obseved } 
// 键是原对象， 值是代理对象
export const reactiveMap = new WeakMap<Target, any>()

// { [target] : obseved }
// 键是原对象， 值是代理对象
export const readonlyMap = new WeakMap<Target, any>()

```


### reactive入口解析
通过reactive() 函数来观察Vue3数据响应式的实现原理
```js
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}


```
**其实就是通过createReactiveObject方法来产生一个Proxy，并根据不同的数据类型给了不同的处理方式**

```js
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  if (!isObject(target)) {
    return target
  }
  // 如果已经是proxy对象则直接返回，有个例外，如果是readOnly作用于响应式 则继续
  if (
    target[ReactiveFlags.RAW] && 
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE]) 
  ) {
    return target
  }
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  // 已经有了对应的proxy映射 直接
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const targetType = getTargetType(target)
  // 只有在白名单中的数据类型才可以被响应式
  if (targetType === TargetType.INVALID) {
    return target
  }
  // 通过Proxy API劫持target对象，把它变成响应式
  const proxy = new Proxy(
    target,
    // Map Set WeakMap WeakSet用collectionhandlers代理 Object Array用baseHandlers代理
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  // 存储一个原始类型和proxy数据类型的映射 
  proxyMap.set(target, proxy)
  return proxy
}
```

* 首先判断是否是对象类型，如果不是就直接返回，否则继续
* 判断如果目标对象已经是proxy了直接返回，否则继续
* 然后获取当前的目标对象的ProxyMap，如果存在就返回对应的proxy(在函数最后，我们会使用一个WeakMap类型的对象存储原始数据类型和proxy数据类型的映射) 否则继续
* 判断目标对象是否在可响应式数据类型的白名单中，如果不在直接返回目标对象，否则继续。

**响应式数据白名单只对这6种类型的数据做响应式处理**
```js
function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}
```
#### collectionHandlers 和 baseHandlers

* baseHandlers： 处理Object 和 Array 类型
* collectionHandlers： 处理 Map、Set、WeakMap、WeakSet 类型

#### 普通的响应式对象处理
```js

const get = /*#__PURE__*/ createGetter()
const set = /*#__PURE__*/ createSetter()
export const mutableHandlers: ProxyHandler<object> = {
  get, // 对数据的读取属性进行拦截 包含target.语法和target[]
  set, // 对数据的存入属性进行拦截
  deleteProperty, // delete操作符进行拦截 可以监听到属性的删除操作
  has, // 对对象的in操作符进行属性拦截
  ownKeys // 访问对象属性名的时候会触发ownKeys函数
}
```
##### createGetter函数
```js
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // 如果是只读属性 直接return target
    
    // 求值 
    // 如果是数组单独处理
    const targetIsArray = isArray(target)
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    
    // 对象
    const res = Reflect.get(target, key, receiver)
    
    if (!isReadonly) {
      // 依赖收集
      track(target, TrackOpTypes.GET, key)
    }
    // 递归调用响应式
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    // 返回结果
    return res
  }
}
```
当我们访问对象的属性的时候会触发get函数，这个函数中的主要步骤有三个，首先会使用Reflect.get进行求值, 然后判断是否是只读的，如果不是就调用track进行依赖收集，然后对求值的结果进行判断，如果是对象则递归调用reactive或者readonly对结果继续进行响应式处理,最后将获取的结果返回。

注意：这里和Vue2响应式处理的方式有所不同，这也是Vue3响应式在初始化的时候性能优化的一个点。

* Vue2在实现响应式的时候会在初始化阶段判断对象的属性是否是Object类型,如果是的话就会递归的调用Observer将子对象也变成响应式。
* Vue3的实现流程则是在初始化阶段的时候只对第一层的属性进行响应式，当返回proxy的属性被访且是对象的话再进行递归响应式，Proxy劫持的是对象本身，并不能劫持子对象的变化，正是利用这种特性可以延时定义子对象响应式的实现，在初始化的时候性能也会得到提升。

##### createSetter函数
```js
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    // 1.先获取oldValue
    const oldValue = (target as any)[key]
    // 2.设置新值
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    // 派发更新
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
```

当我们更新响应式对象的属性的时候会触发set函数,set函数内部的主要步骤也是三个，首先获取这个属性的oldValue，然后通过Reflect.set对属性进行赋值操作,最后调用trigger进行派发更新，在派发更新阶段如果是新增属性则trigger的type是add,如果value!==oldValue则trigger的type是set。

#### track - 依赖收集
#### trigger - 派发更新


## 完整的响应式图

![](https://gitee.com/hankanon/public/raw/master/20201220225052.png)
链接：[图片来自掘金：深入学习vue3.0核心实现原理](https://juejin.cn/post/6874754047891472391)

**问题：Vue2 中可以this访问到定义在data、methods中的变量或方法，是通过 defineProperty 进行数据上下文代理，让我们可以直接通过 this 进行访问，并在更改值后触发 get、set。
Vue3 是怎么实现的？**






/*
 * @Description: vue实现
 * @Author: Hexon
 * @Date: 2021-06-23 15:22:30
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-23 17:14:17
 */

// 根据该课程https://www.vuemastery.com/courses/advanced-components/the-introduction 实现的代码

let target = null

// 发布-订阅模式
class Dep {
  constructor() {
    this.subscribers = []
  }

  depend() {
    // 将target添加到订阅者中
    if (typeof target === 'function' && !this.subscribers.includes(target)) {
      this.subscribers.push(target)
    }
  }

  notify() {
    this.subscribers.forEach(sub => sub())
  }
}

// 监听myFunc，其实就是监听myFunc中依赖的数据
function watcher(myFunc) {
  target = myFunc;
  // 这一步执行为了触发myFunc中依赖数据的getter方法，从而将myFunc添加到依赖数据的subscribers中，
  // 如此，就将myFunc的执行与其依赖的数据关联起来了，从这可知，watcher其实就是用于收集依赖的
  target();
  target = null
}

let deps = new Map()


// 数据劫持
function reactive(data) {
  Object.keys(data).forEach(key => {
    deps.set(key, new Dep())
  })
  const goods_no_proxy = data;

  // 使用proxy来劫持数据
  return new Proxy(goods_no_proxy, {
    get(target, prop) {
      deps.get(prop).depend()
      return target[prop]
    },
    set(target, prop, newVal) {
      target[prop] = newVal
      deps.get(prop).notify()
      return true
    }
  })
}

let goods = { price: 1, quantity: 20, total: 0 }
goods = reactive(goods)

// 添加一个watcher 
watcher(() => {
  goods.total = goods.price * goods.quantity
})

console.log('total = ', goods.total);
goods.price = 10
console.log('total = ', goods.total);
goods.price = 100
console.log('total = ', goods.total);

// 如果是使用Object.defineProxy来劫持数据，那么无法检测到对象的新增属性，这也是为什么vue官方建议在data中将可能要用的属性全部定义出来，
// 而不是在代码中去新增属性，这样新增的属性将不是响应式的，也就是到数据有更新时，无法通知用到的用到该数据的地方，如template中用到
deps.set('discount', new Dep())
goods.discount = -5

let salePrice = 0

watcher(() => {
  salePrice = goods.price + goods.discount
})
console.log('salePrice = ', salePrice)
goods.discount = -50
console.log('salePrice = ', salePrice)



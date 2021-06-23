/*
 * @Description: vue实现
 * @Author: Hexon
 * @Date: 2021-06-23 15:22:30
 * @LastEditors: Hexon
 * @LastEditTime: 2021-06-23 16:24:53
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

// 数据劫持
function reactive(data) {
  // 通过defineProperty劫持data中的每个属性
  Object.keys(data).forEach(key => {
    let internalVal = data[key]
    // data中的每个属性都实例化一个Dep，用于收集依赖
    const dep = new Dep()
    Object.defineProperty(data, key, {
      get() {
        dep.depend()
        return internalVal
      },
      set(newVal) {
        internalVal = newVal
        dep.notify()
      }
    })
  })
}

const goods = { price: 1, quantity: 20, total: 0 }

reactive(goods)

// 添加一个watcher 
watcher(() => {
  goods.total = goods.price * goods.quantity
})

console.log('total = ', goods.total);
goods.price = 10
console.log('total = ', goods.total);
goods.price = 100
console.log('total = ', goods.total);



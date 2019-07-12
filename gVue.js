class gVue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;

    this.observer(this.$data);
    new Compile(this.$el, this)
    if (options.created && typeof options.created === 'function') {
      options.created.call(this);
    }
  }

  observer(data) {
    Object.keys(data).forEach(key => {
      this.dataHijacked(data, key, data[key]);
      // this.proxy(this, key, data[key])
    })
  }

  // 数据劫持
  dataHijacked(obj, key, value) {
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        // 将新创建的new Watcher实例添加到依赖中
        Dep.target && dep.addDep(Dep.target);
        return value;
      },
      set(newValue) {
        // obj[key] = newValue;
        obj[key] = newValue;
        // 通过依赖中所有的watcher实例，触发更新
        dep.notify();
      }
    })
  }

  // 数据代理
  proxy (obj, key, value) {
    Object.defineProperty(obj, key, {
      get() {
        return value;
      },
      set (newValue) {
        this.$data[key] = newValue;
      }
    })
  }
}

class Dep {
  constructor() {
    this.deps = [];
  }

  addDep(dep) {
    this.deps.push(dep);
  }

  notify() {
    this.deps.forEach(watcher => {
      watcher.update();
    })
  }
}

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    Dep.target = this;
    // 添加watcher到依赖中
    vm.$data[key];
    Dep.target = null;
  }

  update() {
    this.cb(this.vm.$data[this.key]);
  }
}
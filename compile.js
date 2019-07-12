class Compile {
  constructor(el, vm) {
    this.$el = document.querySelector(el);
    this.$vm = vm;

    if (this.$el) {
      // 创建代码片段
      this.$fragment = this.node2fragment(this.$el);
      // 执行编译

      // 将编译结果添加到el节点中
    }

    // 编译阶段
    this.compile(this.$fragment);
    // 将编译后的元素添加到el中
    this.$el.appendChild(this.$fragment);
  }
  // 将节点转化为片段
  node2fragment(el) {
    let fragment = document.createDocumentFragment();
    let child;

    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  // 编译
  compile(el) {
    let childNodes = el.childNodes;
    if (childNodes.length > 0) {
      Array.from(childNodes).forEach(node => {
        // 对所有节点进行处理 根据节点不同做不同的处理
        this.handleNode(node);
      })
    }
  }

  handleNode(node) {
    if (this.isElement(node)) {
      console.log('元素节点');






    } else if (this.isInterpolation(node)) {
      node.textContent = this.$vm.$data[RegExp.$1];
      // 创建观察者，实例，key，回调函数
      new Watcher(this.$vm, RegExp.$1, function (value) {
        node.textContent = value;
      });








    }

    if (node.childNodes.length !== 0) {
      this.compile(node);
    }

    
  }





  isElement(node) {
    return node.nodeType === 1;
  }
  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }

}
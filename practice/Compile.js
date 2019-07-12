// 用法 new Compile (el, vm);
class Compile {
    constructor(el, vm) {
        // 要遍历的宿主节点
        this.$el = document.querySelector(el);
        this.$vm = vm;

        // 编译
        if (this.$el) {
            // 转换内部内容为片段 fragment
            this.$fragment = this.node2Fragment(this.$el);
            // 执行编译
            this.compile(this.$fragment)
            // 将编译后的html结果追加到$el中
            this.$el.appendChild(this.$fragment)
        }
    }

    // 将宿主内的元素拿出来遍历，添加到代码片段内，这样做是为了高效
    node2Fragment(el) {
        // 创建节点片段
        let fragment = document.createDocumentFragment();
        // 遍历宿主元素
        let childNode;
        while (childNode = el.firstChild) {
            fragment.appendChild(childNode);
        }

        return fragment;
    }

    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            // 针对不同类型的元素节点做不同的处理
            if (this.isElement(node)) {
                // 指令解析
                const nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(attr => {
                    let attrName = attr.name;
                    let attrValue = attr.value;

                    if (this.isDirective(attrName) && !this.isBind(attrName)) {
                        // 指令 k-text k-html
                        const dir = attrName.substr(2);
                        // 处理指令
                        this[dir] && this[dir](node, this.$vm, attrValue);


                    } else if (this.isEvent(attrName)) {
                        // 事件
                        const event = attrName.substr(1) + 'Handle';
                        this[event] && this[event](node, this.$vm, attrValue)

                    } else if (this.isBind(attrName)) {
                        // 双向绑定
                        console.log('双向绑定', attrName);
                        this.bindHandle && this.bindHandle(node, this.$vm, attrValue);


                    }
                })

            } else if (this.isText(node)) {
                // 处理文本节点
                this.update(node, this.$vm, RegExp.$1, 'text');


            }

            // 递归处理子节点
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }
        })
    }

    /**
     * 
     * @param {Object} node  需要更新的节点
     * @param {Object} vm 当前的vue实例
     * @param {String} exp 更新的key  RegExp.$1
     * @param {String} dir 更新的指令
     */
    update(node, vm, exp, dir) {
        let updatefn = this[dir + 'Updater'];
        updatefn && updatefn(node, vm[exp]);

        // 编译时添加依赖，节点有变动时，可以及时更新
        new Watcher(vm, exp, function (value) {
            updatefn && updatefn(node, value);
        })

    }

    // 更新文本节点
    textUpdater(node, value) {
        node.textContent = value;
    }
    // 处理k-text
    text(node, vm, exp) {
        this.update(node, vm, exp, 'text');
    }
    htmlUpdater(node, value) {
        node.innerHTML = value;
    }
    // 处理k-html
    html(node, vm, exp) {
        this.update(node, vm, exp, 'html');
    }

    // 处理点击
    clickHandle(node, vm, method) {
        node.addEventListener('click', () => {
            vm.$methods[method].call(this.$vm);
        })
    }

    // 处理input的value
    modelUpdater(node, value) {
        node.value = value;
    }

    // 处理双向绑定
    bindHandle(node, vm, value) {
        // 模型向视图的绑定
        this.update(node, vm, value, 'model');
        // 监听input节点的change事件，触发setter
        node.addEventListener('input', function (e) {
            vm[value] = e.target.value;
        })
    }



    isElement(node) {
        return node.nodeType === 1;
    }
    isText(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
    isDirective(attrName) {
        return /^k-.*/.test(attrName);
    }
    isEvent(attrName) {
        return /^@.*/.test(attrName);
    }
    isBind(attrName) {
        return /^k-model$/.test(attrName)
    }

}
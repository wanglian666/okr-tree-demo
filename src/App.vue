<template>
  <div id="app">
    <div>
      <input
        type="text"
        placeholder="请输入姓名"
        v-model="name"
        @keydown.enter="onSearch"
      />
      <button @click="onSearch">搜索</button>
    </div>
    <vue-okr-tree
      v-show="viewTreeData.length > 0"
      :data="viewTreeData"
      show-collapsable
      default-expand-all
      :props="treeProps"
      :render-content="renderContent"
    ></vue-okr-tree>
    <h2 v-show="viewTreeData.length <= 0">暂无数据</h2>
  </div>
</template>

<script>
import { VueOkrTree } from "vue-okr-tree";
import "vue-okr-tree/dist/vue-okr-tree.css";
import { array2tree, getNumCurrentLayer, getSubLayerNum } from "@/utils/index";

// 节点筛选-树形数据
function searchNodeByName(nodeList, name) {
  const list = [];
  function fn(nodeList, name) {
    if (!nodeList || nodeList.length == 0) {
      return;
    }
    nodeList.forEach((node) => {
      if (node.realName.indexOf(name) != -1) {
        list.push(node);
      }
      fn(node.children, name);
    });
  }
  fn(nodeList, name);
  return list;
}

// 节点筛选-遍历map
function searchNodeByNameOfMap(map, name) {
  // 拿到map中所有值
  const nodes = Object.values(map);
  console.log(nodes, "nodes");
  return nodes.filter((v) => v.realName.indexOf(name) != -1);
}

export default {
  name: "App",
  components: {
    VueOkrTree,
  },
  data() {
    return {
      query: {
        name: "",
      },
      name: "", //输入框输入的姓名
      treeData: [],
      treeNodeMap: {},
    };
  },
  computed: {
    viewTreeData() {
      if (this.query.name == "") {
        return this.treeData;
      }
      //   let matchNodes = searchNodeByName(this.treeData, this.query.name);
      let matchNodes = searchNodeByNameOfMap(this.treeNodeMap, this.query.name);

      matchNodes = matchNodes.map((v) => {
        return {
          ...v,
          children: null,
        };
      });

      return matchNodes;
    },
    treeProps() {
      return {
        label: "realName",
      };
    },
  },
  created() {
    this.getEmpList();
  },
  methods: {
    // 自定义节点内容
    renderContent(h, node) {
      return (
        <div class="diy-wrapper">
          <div class="diy-con-name">用户编号：{node.data.id}</div>
          <div class="diy-con-content">真实姓名：{node.data.realName}</div>
          <div class="diy-con-content">身份证号：{node.data.idcard}</div>
          <div class="diy-con-content">上级编号：{node.data.pid}</div>
          {/* 筛选出来的结果，不展示下面的字段信息，避免展示歧义 */}
          {!this.query.name && (
            <div>
              <div class="diy-con-content">
                子级总数：{node.data.subNum || 0}
              </div>
              <div class="diy-con-content">
                当前层数：{node.data.currentLayerNum}
              </div>
              <div class="diy-con-content">
                子级层数：{node.data.subLayerNum}
              </div>
            </div>
          )}
        </div>
      );
    },

    getEmpList() {
      // 通过jsonp形式获取数据
      let script = document.createElement("script");
      // 指定回调函数名为_callback
      script.src = "/services/getEmpList?callback=_callback";
      script.onload = () => {
        // 脚本执行完成后移除节点，并移除_callback引用
        document.body.removeChild(script);
        window._callback = null;
      };
      document.body.appendChild(script);
      window._callback = this.callback;
    },
    callback(empList) {
      let treeData = array2tree(empList);
      treeData = empList = [
        {
          id: 1,
          realName: "高配室",
          idcard: "xxxx",
          children: [
            {
              id: 2,
              realName: "第一个子节点",
              idcard: "xxxx",
              children: [
                {
                  id: 8,
                  realName: "孙子节点",
                  idcard: "xxxx",
                  children: [],
                },
              ],
            },
            {
              id: 5,
              realName: "第二个子节点",
              idcard: "xxxx",
              children: [
                {
                  id: 10,
                  realName: "不不不",
                  idcard: "xxxx",
                  children: [
                    {
                      id: 11,
                      realName: "出差错",
                      idcard: "xxxx",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 9,
          realName: "啊啊啊",
          idcard: "xxxx",
          children: [
            {
              id: 111,
              realName: "点对点",
              idcard: "xxxx",
            },
          ],
        },
      ];
      getNumCurrentLayer(treeData);
      const map = getSubLayerNum(treeData);
      this.treeNodeMap = map;
      this.treeData = treeData;
      console.log("emp", this.treeData);
      console.log("empMap", this.treeNodeMap);
    },

    // 节点筛选
    onSearch() {
      this.query.name = this.name;
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  background-color: rgba(131, 168, 135, 0.3);
}

.diy-wrapper {
  text-align: left;
}
</style>
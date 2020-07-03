<template>
  <div style="height: 100%;width: 100%;">
    <div class="about">
      <svg id="hot" width="100%" height="100%" />
    </div>
    <div class="fixed">
      盒子长：
      <input type="text" v-model="boxWidth" />
      <br />盒子高：
      <input type="text" v-model="boxHeight" />
      <el-button type="text" size="mini" @click="add">增加一个顶级</el-button>
      <el-tree :data="flowData" node-key="id" default-expand-all :expand-on-click-node="false">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>
            <input type="text" v-model="data.name" />
            id:
            <input type="text" v-model="data.id" />
            <el-button type="text" size="mini" @click="resize">确定</el-button>
          </span>
          <span style="margin-left: 100px">
            <el-button type="text" size="mini" @click="() => append(data)">增加下一步</el-button>
            <el-button type="text" size="mini" @click="() => remove(node, data)">删除</el-button>
          </span>
        </span>
      </el-tree>
      <el-button type="text" size="mini" @click="Clog">输出代码</el-button>
      <el-input type="textarea" :autosize="{ minRows: 20, maxRows: 20}" readonly v-model="svghtml"></el-input>
    </div>
  </div>
</template>

<script>
const Snap = require(`imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js`);
export default {
  name: "flow",
  data() {
    return {
      flowData: [
        {
          id: "kpi1",
          name: "未命名",
          x: 10,
          y: 50,
          children: [],
          line: {},
          father: {}
        },
        {
          id: "kpi2",
          name: "未命名",
          x: 10,
          y: 200,
          children: [],
          line: {},
          father: {}
        }
      ],
      boxWidth: 95,
      boxHeight: 95,
      id: 0,
      svghtml: "",
      flowMap: {}
    };
  },
  mounted() {
    this.creatFlow(this.flowData);
  },
  updated() {
    this.flowMap = {};
    Snap("#hot").clear();
    this.creatFlow(this.flowData);
  },
  methods: {
    creatFlow(data) {
      let boxWidth = this.boxWidth;
      let boxHeight = this.boxHeight;
      let span = Snap("#hot");
      let vm = this;
      function creatChildren(data) {
        data.forEach(element => {
          if (!vm.flowMap[element.id]) {
            // 创造矩形
            element.rect = span
              .rect(element.x, element.y, boxWidth, boxHeight, 10)
              .attr({
                fill: "#fff",
                strokeWidth: 1,
                stroke: "rgba(37, 135, 238, 0.6)"
              })
              .hover(
                function() {
                  // 移入
                  this.attr({
                    fill: "rgba(37, 135, 238, 0.15)"
                  });
                },
                function() {
                  // 移出
                  this.attr({
                    fill: "#fff"
                  });
                }
              );
            // 名称
            element.text = span
              .text(
                element.x + boxWidth / 2,
                element.y + boxHeight / 2 + 20,
                element.name
              )
              .attr({
                textAnchor: "middle",
                fontSize: "12px"
              });
            // 条数
            element.text2 = span
              .text(element.x + boxWidth / 2, element.y + boxHeight / 2, [
                "0",
                " ",
                "条"
              ])
              .attr({
                textAnchor: "middle",
                fontSize: "12px"
              });
            element.text2.node.childNodes[0].style.fontWeight = "bold";
            element.text2.node.childNodes[0].style.fontSize = "20px";
            span
              .g(element.rect, element.text, element.text2)
              .drag(function(dx, dy, x, y) {
                element.x = x - boxWidth / 2;
                element.y = y - boxHeight / 2;
                // 控制元素移动
                element.rect.attr({
                  x: element.x,
                  y: element.y
                });
                element.text2.attr({
                  x: element.x + boxWidth / 2,
                  y: element.y + boxHeight / 2
                });
                element.text.attr({
                  x: element.x + boxWidth / 2,
                  y: element.y + boxHeight / 2 + 20
                });
                // 重新划线
                // 如果有下一步的画线情况
                element.children.forEach(val => {
                  // 清空
                  if (vm.flowMap[val.id]) {
                    vm.flowMap[val.id].line[element.id].remove();
                    vm.flowMap[val.id].line[element.id] = vm.creatLine(
                      element.x,
                      element.y,
                      vm.flowMap[val.id].x,
                      vm.flowMap[val.id].y
                    );
                    vm.flowMap[val.id].father[element.id] = {
                      fatherX: element.x,
                      fatherY: element.y
                    };
                  } else {
                    val.line[element.id].remove();
                    val.line[element.id] = vm.creatLine(
                      element.x,
                      element.y,
                      val.x,
                      val.y
                    );
                    val.father[element.id] = {
                      fatherX: element.x,
                      fatherY: element.y
                    };
                  }
                });
                // 给上一步画线
                for (const key in element.line) {
                  element.line[key].remove();
                  element.line[key] = vm.creatLine(
                    element.father[key].fatherX,
                    element.father[key].fatherY,
                    element.x,
                    element.y
                  );
                }
              });
            vm.flowMap[element.id] = element;
          }
          // 划线  递归
          if (element.children) {
            element.children.forEach(val => {
              if (!vm.flowMap[val.id]) {
                // 如果指定的节点不存在
                val.father[element.id] = {
                  fatherX: element.x,
                  fatherY: element.y
                };
                val.line[element.id] = vm.creatLine(
                  element.x,
                  element.y,
                  val.x,
                  val.y
                );
              } else {
                // 如果指定的节点存在
                val = vm.flowMap[val.id];
                val.father[element.id] = {
                  fatherX: element.x,
                  fatherY: element.y
                };
                val.line[element.id] = vm.creatLine(
                  element.x,
                  element.y,
                  vm.flowMap[val.id].x,
                  vm.flowMap[val.id].y
                );
              }
            });
            creatChildren(element.children);
          }
        });
      }
      creatChildren(data);
    },
    add() {
      this.flowData.push({
        id: this.id++,
        name: "未命名",
        x: 0,
        y: 0,
        children: [],
        line: {},
        father: {}
      });
    },
    creatLine(x, y, x1, y1) {
      let boxWidth = this.boxWidth;
      let boxHeight = this.boxHeight;
      // 添加一个路径
      let span = Snap("#hot");
      let path = ``;
      if (x > x1 + boxWidth) {
        path = `M ${x},${y + boxHeight / 2} L${x1 +
          (x - x1 - boxWidth) / 2 +
          boxWidth},${y + boxHeight / 2} L${x1 +
          (x - x1 - boxWidth) / 2 +
          boxWidth},${y1 + boxHeight / 2} L${x1 + boxWidth},${y1 +
          boxHeight / 2}`;
      } else if (x1 > x + boxWidth) {
        path = `M ${x + boxWidth},${y + boxHeight / 2} L${x +
          (x1 - x - boxWidth) / 2 +
          boxWidth},${y + boxHeight / 2} L${x +
          (x1 - x - boxWidth) / 2 +
          boxWidth},${y1 + boxHeight / 2} L${x1},${y1 + boxHeight / 2}`;
      } else if (y > y1 + boxHeight / 2) {
        path = `M ${x + boxWidth / 2},${y} L${x1 + boxWidth / 2},${y1 +
          boxHeight}`;
      } else if (y1 > y + boxHeight / 2) {
        path = `M ${x + boxWidth / 2},${y + boxHeight} L${x1 +
          boxWidth / 2},${y1}`;
      }
      let p2 = span.path(path).attr({
        // 描边
        stroke: "#2587ee",
        strokeWidth: 2,
        fill: "none",
        "stroke-dasharray": "5, 5"
      });
      let animation = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animateMotion"
      );
      animation.setAttributeNS(null, "id", "temp_" + new Date().getTime());
      animation.setAttributeNS(null, "path", path);
      animation.setAttributeNS(null, "rotate", "auto");
      animation.setAttributeNS(null, "repeatCount", "indefinite");
      animation.setAttributeNS(null, "begin", "0s");
      animation.setAttributeNS(null, "dur", "5s");
      let t = span
        .path("m-2.23417,2.92186l6.00287,-6.00287l6.00287,6.00287l-12.00575,0z")
        .attr({
          fill: "#2587ee",
          transform:
            "rotate(89.83505249023438 3.7687072753906254,-0.07957983016967786)",
          strokeWidth: 0
        })
        .append(animation);
      let g = span.g(p2, t);
      return g;
    },
    append(data) {
      const newChild = {
        id: this.id++,
        name: "未命名",
        x: data.x + 140,
        y: data.y,
        children: [],
        line: {},
        father: {}
      };
      if (!data.children) {
        this.$set(data, "children", []);
      }
      data.children.push(newChild);
      this.flowMap = {};
      Snap("#hot").clear();
      this.creatFlow(this.flowData);
    },
    remove(node, data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.id === data.id);
      children.splice(index, 1);
      this.flowMap = {};
      Snap("#hot").clear();
      delete this.flowMap[data.id];
      this.creatFlow(this.flowData);
    },
    resize() {
      this.flowMap = {};
      Snap("#hot").clear();
      this.creatFlow(this.flowData);
    },
    Clog() {
      let span = Snap("#hot");
      this.svghtml = span.toString();
    }
  }
};
</script>

<style scoped>
.about {
  float: left;
  height: 100%;
  width: 50%;
  background-color: #fff;
}

.fixed {
  float: left;
  height: 100%;
  width: 50%;
  text-align: left;
}

.input {
  margin: 10px 0;
}
</style>

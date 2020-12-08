<template>
  <el-row id="search">
    <el-form inline :model="search" ref="search">
      <el-form-item label="公司" prop="company">
        <el-cascader
          v-model="search.company"
          :options="organizations"
          :props="companyProps"
          clearable
          class="search__input"
        />
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="search.time"
          :clearable="false"
          type="datetimerange"
          range-separator="至"
          :default-time="['00:00:00','23:59:59']"
        />
      </el-form-item>
      <el-form-item id="search__confidence" label="置信度" prop="confidence">
        <el-slider v-model="search.confidence" :max="1" :step="0.1" range />
      </el-form-item>
      <el-form-item
        label="审核类型"
        prop="is_atlas"
        :rules="[
      { required: true, message: '请选择审核类型', trigger: 'change' },
    ]"
      >
        <el-select v-model="search.is_atlas" clearable collapse-tags @change="currentSel">
          <el-option :value="false" label="生产现场管理" />
          <el-option :value="true" label="标准图册" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核结果" prop="audit">
        <el-select v-model="search.audit" multiple clearable collapse-tags>
          <el-option
            v-for="item in yieldTypeList"
            :value="item.value"
            :label="item.label"
            :key="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="违规原因">
        <el-select
          v-model="search.violationReasons"
          @change="currentViolation"
          multiple
          clearable
          collapse-tags
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备名称" prop="name">
        <el-input v-model.trim="search.name" />
      </el-form-item>
      <el-form-item label="设备IP" prop="ip">
        <el-input v-model.trim="search.ip" />
      </el-form-item>
      <el-form-item label="是否查看昨日违规图片" prop="rectify">
        <el-checkbox v-model="search.rectify" true-label="1" false-label></el-checkbox>
      </el-form-item>
      <el-form-item label="是否查看图册不合格图片" v-if="showAlias" prop="isSmartCubeUnqualified">
        <el-checkbox v-model="search.isSmartCubeUnqualified"></el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch('search')">查询</el-button>
        <el-button @click="handleExport(true)">导出违规图片</el-button>
        <el-button @click="handleExport(false)">导出原始图片</el-button>
        <el-button @click="handleResult">查看审核结果</el-button>
        <el-button @click="handleReplenish">补充今日数据</el-button>
        <!-- <el-button @click="open">抓图计划配置</el-button> -->
      </el-form-item>
    </el-form>
    <el-dialog
      id="search__result"
      :visible="results !== null"
      title="审核结果"
      :width="dialogWidth"
      @close="handleClose"
    >
      <ul v-if="Array.isArray(results)">
        <li>总计 {{results.length}}条</li>
        <li v-for="({company, count, capture, audit }, index) in results" :key="index">
          {{company}} 抓图任务 {{count}} 条，
          抓图成功 {{capture}} 条，
          审核合规 {{audit[0]}} 条，
          普通违规 {{audit[2]}} 条，
          <span
            v-if="hide"
          >灯塔工厂违规 {{audit[3]}} 条，</span>
          <span v-if="hide">作业期间违规 {{audit[4]}} 条，</span>
        </li>
      </ul>
    </el-dialog>
    <el-dialog title="抓图配置" :visible.sync="dialogFormVisible" width="35%">
      <div class="tomorrow">
        <h1>次日抓图配置-第二天开始生效</h1>
        <el-form
          :model="dynamicValidateForm"
          ref="dynamicValidateForm"
          label-width="100px"
          class="demo-dynamic"
        >
          <el-form-item
            v-for="(domain, index) in dynamicValidateForm.domains"
            :label="'第' + (index+1) +'轮抓图'"
            :key="domain.key"
          >
            <el-time-select
              v-model="domain.value"
              :picker-options="{
                start: '08:00',
                step: '00:60',
                end: '18:30'
              }"
              placeholder="选择时间"
            ></el-time-select>
            <el-button @click.prevent="removeDomain(domain)" class="tomorrow_del">删除</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('dynamicValidateForm')">提交</el-button>
            <el-button @click="addDomain">新增</el-button>
            <!-- <el-button @click="addDomain" type="primary" style="width:220px">新增</el-button> -->
            <el-button @click="resetForm('dynamicValidateForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="today">
        <h1>今日抓图配置-仅当日有效</h1>
        <div class="today_list clearfix">
          <span>当前抓图计划</span>
          <ul>
            <li v-for="(item,ind) in todayPlainList" :key="ind">
              第{{ind+1}}轮抓图
              <i>{{item}}</i>
            </li>
          </ul>
        </div>
        <div class="temporary">
          <!-- <span>临时抓图</span>
          <el-time-select
            v-model="total"
            :picker-options="{
                start: '08:00',
                step: '00:60',
                end: '18:30'
              }"
            placeholder="选择时间"
          ></el-time-select>-->
          <el-form ref="form" label-width="85px">
            <el-form-item label="临时抓图">
              <el-time-select
                v-model="total"
                :picker-options="{
                start: '08:00',
                step: '00:60',
                end: '18:30'
              }"
                placeholder="选择时间"
              ></el-time-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import moment from "moment";

import {
  exportImages,
  // getResult,
  replenish,
  exportAllImages,
} from "@/api/inspect";

import { getAllOrganizations } from "@/api/organization";
import {
  exportAtlasImages,
  exportAtlasAllImages,
  getCapturePlan,
  editCapturePlan,
  getInspectResult,
  getAuditResult,
} from "@/api/photoes";
export default {
  // global awareness

  name: "Search",

  watch: {
    search: {
      handler(newSearch) {
        if (newSearch.is_atlas) {
          this.showAlias = false;
          this.hide = false;
          this.dialogWidth = "650px";
          this.yieldTypeList = [
            {
              label: "合格",
              value: 0,
            },
            {
              label: "不合格",
              value: 2,
            },
          ];
        } else {
          this.showAlias = true;
          this.hide = true;
          this.dialogWidth = "900px";
          this.yieldTypeList = [
            {
              label: "合格",
              value: 0,
            },
            {
              label: "不合格",
              value: 2,
            },
            {
              label: "灯塔工厂不合格",
              value: 3,
            },
            {
              label: "作业期间不合格",
              value: 4,
            },
            {
              label: "严重违规",
              value: 1,
            },
          ];
        }
      },
      deep: true,
    },
  },
  // local state
  data() {
    const now = moment();
    return {
      search: {
        company: null,
        time: [
          moment(now).startOf("day").toDate(),
          moment(now).endOf("day").toDate(),
        ],
        confidence: [0, 1],
        audit: [],
        name: "",
        ip: "",
        rectify: "",
        is_atlas: false,
        violationReasons: [],
        isSmartCubeUnqualified: "",
      },
      dialogWidth: "900px",
      organizations: [],
      companyProps: {
        expandTrigger: "hover",
        emitPath: false,
      },
      showAlias: true,
      results: null,
      yieldTypeList: [
        {
          label: "合格",
          value: 0,
        },
        {
          label: "不合格",
          value: 2,
        },
        {
          label: "灯塔工厂不合格",
          value: 3,
        },
        {
          label: "作业期间不合格",
          value: 4,
        },
        {
          label: "严重违规",
          value: 1,
        },
      ],
      options: [
        {
          label: "全部",
          value: "全部",
        },
        {
          label: "物料摆放不整齐",
          value: "物料摆放不整齐",
        },
        {
          label: "物料占道",
          value: "物料占道",
        },
        {
          label: "物料混放",
          value: "物料混放",
        },
        {
          label: "物料压线",
          value: "物料压线",
        },
        {
          label: "物料乱放",
          value: "物料乱放",
        },
        {
          label: "物料错放",
          value: "物料错放",
        },
        {
          label: "其他",
          value: "其他",
        },
      ],
      oldOptions: [[]],
      dialogFormVisible: false,
      total: "",
      dynamicValidateForm: {
        domains: [
          {
            value: "8:00",
          },
        ],
      },
      todayPlainList: [],
      hide: true,
    };
  },

  // events
  async created() {
    // this._getCapturePlan();
    const data = await getAllOrganizations();
    let organizations = [
      {
        label: "重机事业部",
        value: 51,
        children: [
          {
            label: "昆山小挖",
            value: 80,
          },
          {
            label: "临港中挖",
            value: 6,
          },
          {
            label: "昆山大挖",
            value: 78,
          },
          {
            label: "北京桩机",
            value: 8,
          },
          {
            label: "常熟索特",
            value: 15,
          },
          {
            label: "常熟华威",
            value: 97,
          },
          {
            label: "昆山华湘",
            value: 81,
          },
          {
            label: "杭州力龙",
            value: 82,
          },
        ],
      },
      {
        label: "泵送事业部",
        value: 49,
        children: [
          {
            label: "长沙泵送",
            value: 29,
          },
          {
            label: "娄底中兴",
            value: 11,
          },
          {
            label: "娄底中源",
            value: 12,
          },
          {
            label: "三一专汽",
            value: 26,
          },
          {
            label: "常德路机",
            value: 14,
          },
          {
            label: "益阳中阳",
            value: 25,
          },
          {
            label: "泵送车身",
            value: 67,
          },
          {
            label: "三一动力",
            value: 4,
          },
          {
            label: "三一西北",
            value: 5,
          },
        ],
      },
      {
        label: "重起事业部",
        value: 54,
        children: [
          {
            label: "宁乡起重机",
            value: 13,
          },
          {
            label: "湖州装备",
            value: 23,
          },
        ],
      },
      {
        label: "重装事业部",
        value: 55,
        children: [
          {
            label: "沈阳重装",
            value: 22,
          },
        ],
      },
      {
        label: "港机事业部",
        value: 52,
        children: [
          {
            label: "珠海港机",
            value: 24,
          },
          {
            label: "长沙港机",
            value: 30,
          },
        ],
      },
      {
        label: "重能事业部",
        value: 56,
        children: [
          {
            label: "重能电机",
            value: 76,
          },
          {
            label: "南口重能",
            value: 9,
          },
          {
            label: "张家口叶片",
            value: 16,
          },
        ],
      },
      {
        label: "重卡事业部",
        value: 47,
        children: [
          {
            label: "三一重卡",
            value: 45,
          },
        ],
      },
      {
        label: "筑工事业部",
        value: 57,
        children: [
          {
            label: "长沙快而居",
            value: 28,
          },
        ],
      },
      {
        label: "石油事业部",
        value: 58,
        children: [
          {
            label: "三一石油",
            value: 44,
          },
        ],
      },
      {
        label: "环保事业部",
        value: 101,
        children: [
          {
            label: "三一环保",
            value: 102,
          },
        ],
      },
    ];
    let datatop = data.filter((e) => !e.pid);
    let dataother = data.filter((e) => e.pid);
    let arr = [];
    datatop.forEach((item) => {
      if (!organizations.some((e) => e.label === item.name)) {
        arr.push({
          label: item.name,
          value: item.id,
          children: [],
        });
      }
    });
    organizations = [...organizations, ...arr];
    dataother.forEach((i) => {
      let obj = organizations
        .reduce((p, n) => [...n.children, ...p], [])
        .find((item) => item.label === i.name);

      if (!obj) {
        organizations
          .find((e) => e.value == i.pid)
          .children.push({
            label: i.name,
            value: Number(i.id),
          });
      }
    });
    organizations = organizations.map((item) => {
      return {
        ...item,
        children: item.children.length > 0 ? item.children : null,
      };
    });
    this.organizations = organizations;
    let init = JSON.parse(sessionStorage.getItem("search"));
    if (init) {
      this.search = {
        company: init.company,
        time: [init.start_time, init.end_time],
        confidence: [init.confidence_min, init.confidence_max],
        audit: init.audit,
        name: init.name,
        ip: init.ip,
        rectify: init.rectify,
        is_atlas: init.is_atlas,
        violationReasons: init.violationReasons,
      };
    }
  },

  // non-reactive properties
  methods: {
    // handle search
    handleSearch(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("search", this.search);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // handle change
    currentSel(val) {
      if (val) {
        this.yieldTypeList = [
          {
            label: "合格",
            value: 0,
          },
          {
            label: "不合格",
            value: 2,
          },
        ];
      } else {
        this.search.isSmartCubeUnqualified = "";
        this.yieldTypeList = [
          {
            label: "合格",
            value: 0,
          },
          {
            label: "不合格",
            value: 2,
          },
          {
            label: "灯塔工厂不合格",
            value: 3,
          },
          {
            label: "作业期间不合格",
            value: 4,
          },
          {
            label: "严重违规",
            value: 1,
          },
        ];
      }
    },

    currentViolation(val) {
      let allValues = [];
      //保留所有值
      for (let item of this.options) {
        allValues.push(item.value);
      }

      // 用来储存上一次的值，可以进行对比
      const oldVal = this.oldOptions.length === 1 ? [] : this.oldOptions[1];

      // 若是全部选择
      if (val.includes("全部")) this.search.violationReasons = allValues;

      // 取消全部选中  上次有 当前没有 表示取消全选
      if (oldVal.includes("全部") && !val.includes("全部"))
        this.search.violationReasons = [];

      // 点击非全部选中  需要排除全部选中 以及 当前点击的选项
      // 新老数据都有全部选中
      if (oldVal.includes("全部") && val.includes("全部")) {
        const index = val.indexOf("全部");
        val.splice(index, 1); // 排除全选选项
        this.search.violationReasons = val;
      }

      //全选未选 但是其他选项全部选上 则全选选上 上次和当前 都没有全选
      if (!oldVal.includes("全部") && !val.includes("全部")) {
        if (val.length === allValues.length - 1)
          this.search.violationReasons = ["全部"].concat(val);
      }

      //储存当前最后的结果 作为下次的老数据
      this.oldOptions[1] = this.search.violationReasons;
    },
    // handle export images
    handleExport(signed) {
      if (this.search.is_atlas) {
        if (this.search.audit.includes(0)) {
          this.$alert("暂不支持合规图片数据包", "提示");
          return;
        } else if (this.search.company === null) {
          window.location.href = exportAtlasAllImages(
            this.search.time,
            this.search.confidence,
            this.search.audit,
            signed
          );
          this.$alert("请不要刷新页面，耐心等待系统生成数据包", "提示");
          return;
        } else {
          window.location.href = exportAtlasImages(
            this.search.company,
            this.search.time,
            this.search.confidence,
            this.search.audit,
            signed
          );
          this.$alert("请不要刷新页面，耐心等待系统生成数据包", "提示");
          return;
        }
      } else {
        if (this.search.audit.includes(0)) {
          this.$alert("暂不支持合规图片数据包", "提示");
          return;
        } else if (this.search.company === null) {
          window.location.href = exportAllImages(
            this.search.time,
            this.search.confidence,
            this.search.audit,
            signed
          );
          this.$alert("请不要刷新页面，耐心等待系统生成数据包", "提示");
          return;
        } else {
          window.location.href = exportImages(
            this.search.company,
            this.search.time,
            this.search.confidence,
            this.search.audit,
            signed
          );
          this.$alert("请不要刷新页面，耐心等待系统生成数据包", "提示");
          return;
        }
      }
    },

    // handle show inspect result
    async handleResult() {
      if (this.search.is_atlas == "") {
        this.$alert("请选择审核类型", "提示");
        return;
      }
      if (this.search.is_atlas) {
        this.results = await getAuditResult(
          this.search.company,
          this.search.time[0],
          this.search.time[1]
        );
      } else {
        this.results = await getInspectResult(
          this.search.company,
          this.search.time[0],
          this.search.time[1]
        );
      }
    },

    // handle replenish the image data
    async handleReplenish() {
      if (this.search.company === null) {
        this.$alert("请选择公司", "提示");
        return;
      }
      try {
        await replenish(this.search.company);
        this.$message.success(
          "系统已开始补充数据，请稍后刷新页面，查看数据补充情况。"
        );
      } catch (e) {
        this.$message.error("系统补充数据失败，请稍后再试。");
      }
    },

    async _getCapturePlan() {
      try {
        let res = await getCapturePlan();
        let todayList = [];
        let tommoryList = [];
        for (let item of res) {
          if (item.type === 0) {
            //0代表临时抓图
            todayList.push(item.captureTime);
          } else {
            //1代表次日抓图
            tommoryList.push(item.captureTime);
          }
        }
        this.todayPlainList = todayList;
      } catch (error) {
        console.log(error);
      }
    },

    open() {
      this.dialogFormVisible = true;
      // this.$prompt("请输入密码", "提示", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   inputPattern: /\d/,
      //   inputType: "password",
      //   inputErrorMessage: "密码不正确",
      // })
      //   .then(({ value }) => {
      //     if (value == 123456) {
      //       this.dialogFormVisible = true;
      //     } else {
      //       this.$message({
      //         type: "error",
      //         message: "密码不正确",
      //       });
      //     }
      //   })
      //   .catch(() => {
      //     this.$message({
      //       type: "info",
      //       message: "取消输入",
      //     });
      //   });
    },

    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const now = moment();
          let today = moment(now).format("YYYY-MM-DD ");
          let tommory = moment(now).add(1, "days").format("YYYY-MM-DD ");
          let arr = [
            {
              createDay: tommory,
              captureTimes: [],
              type: 1,
            },
            {
              createDay: today,
              captureTimes: [],
              type: 0,
            },
          ];
          arr.map((item) => {
            if (item.type == 0) {
              if (this.total) {
                item.captureTimes.push(this.total);
              }
            } else if (item.type == 1) {
              for (let key in this.dynamicValidateForm.domains) {
                if (this.dynamicValidateForm.domains[key].value) {
                  item.captureTimes.push(
                    this.dynamicValidateForm.domains[key].value
                  );
                }
              }
            }
          });
          let result = await editCapturePlan(arr);
          if (result == null) {
            this.$message({
              type: "success",
              message: "保存成功",
            });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    removeDomain(item) {
      var index = this.dynamicValidateForm.domains.indexOf(item);
      if (index !== -1) {
        this.dynamicValidateForm.domains.splice(index, 1);
      }
    },
    addDomain() {
      if (this.dynamicValidateForm.domains.length > 4) {
        this.$message({
          type: "info",
          message: "最多支持五项",
        });
        return;
      }
      this.dynamicValidateForm.domains.push({
        value: "",
        key: Date.now(),
      });
    },
    // handle close result dialog
    async handleClose() {
      this.results = null;
    },
  },
};
</script>

<style lang="scss">
#search {
  .el-form-item {
    margin: 0 20px 15px 0;
  }
  .search__input {
    width: 300px;
  }
  #search__confidence > .el-form-item__content {
    width: 190px;
    margin-left: 10px;
  }
  #search__result ul {
    list-style: none;
  }
}

.today,
.tomorrow {
  h1 {
    padding-bottom: 5px;
    font-size: 14px;
  }
  .tomorrow_del {
    margin-left: 12px;
  }
}
.today_list {
  span {
    float: left;
    font-size: 14px;
  }
  ul {
    float: left;
    list-style: none;
    padding-left: 12px;
    font-size: 14px;
    li {
      line-height: 25px;
    }
    i {
      font-style: normal;
    }
  }
}
.temporary {
  padding: 10px;
  height: 52px;
  span {
    display: inline-block;
    padding-right: 33px;
  }
}

.clearfix:after {
  /*伪元素是行内元素 正常浏览器清除浮动方法*/
  content: "";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
</style>
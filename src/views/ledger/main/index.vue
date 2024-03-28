<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备名称" prop="devName">
        <el-select-v2 style="width:167.5px"
                      v-model="queryParams.devName"
                      placeholder="请输入设备名称"
                      filterable
                      :options="devOps"
                      clearable
                      @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="序列号" prop="sn">
        <el-input
            v-model="queryParams.sn"
            placeholder="请输入序列号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备简称" prop="abbreviation">
        <el-input
            v-model="queryParams.abbreviation"
            placeholder="请输入简称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备型号" prop="devModelId">
        <el-select-v2 style="width:167.5px"
                      v-model="queryParams.devModelId"
                      placeholder="请输入设备型号"
                      filterable
                      :options="devModelOps"
                      clearable
                      @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="运维时间" style="width: 308px">
        <el-date-picker
            v-model="daterangeOpDatetime"
            value-format="YYYY-MM-DD"
            clearable
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="电源类型" prop="supplyId">
        <el-select-v2 style="width:167.5px"
                      v-model="queryParams.supplyId"
                      placeholder="请输入电源类型"
                      :options="powerSupplyOps"
                      clearable
                      filterable
                      @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="系统类型" prop="sysTypeId">
        <el-select-v2 style="width:167.5px"
                      v-model="queryParams.sysTypeId"
                      placeholder="请输入系统类型"
                      :options="systemOps"
                      clearable
                      filterable
                      @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机柜名" prop="locId">
        <el-select-v2 style="width:167.5px"
                      v-model="queryParams.locId"
                      placeholder="请输入机柜名"
                      :options="locationOps"
                      clearable
                      filterable
                      @keyup.enter="handleQuery"
        />
      </el-form-item>
      <div v-show="isExpandAll">
      </div>
      <el-form-item>
        <!--        <el-button-->
        <!--            type="info"-->
        <!--            plain-->
        <!--            icon="Sort"-->
        <!--            @click="toggleExpandAll"-->
        <!--        >展开/折叠-->
        <!--        </el-button>-->
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['ledger:device:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['ledger:device:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['ledger:device:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ledger:device:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deviceList" height="500" @selection-change="handleSelectionChange"
              @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--      <el-table-column fixed label="主键id" align="center" prop="id"/>-->
      <el-table-column fixed label="所属机柜" align="center" prop="ledgerLocation.name"/>
      <el-table-column fixed label="设备名称" align="center" prop="devName"/>
      <el-table-column fixed label="设备简称" align="center" prop="abbreviation"/>
      <el-table-column label="设备型号" align="center" prop="ledgerDevDetails.devModel"/>
      <el-table-column label="序列号" align="center" prop="sn"/>
      <el-table-column label="设备类型" align="center" prop="ledgerDevDetails.devType"/>
      <el-table-column label="运维时间" align="center" prop="opDatetime" width="180"
                       :sort-orders="['descending','ascending']" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.opDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电源类型" align="center" prop="ledgerPowerSupply.status"/>
      <el-table-column label="系统类型" align="center" prop="ledgerSystem.sysType"/>
      <el-table-column label="描述" align="center" prop="description"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleUpdate(scope.row)"
                     v-hasPermi="['ledger:device:query']">查看详情
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['ledger:device:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改设备信息对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-tabs v-if="title=='添加设备信息'" v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit">
        <el-tab-pane
            v-for="(item, index) in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
        >
          <el-form :model="uploadForm[index]" :rules="rules" label-width="80px">
            <el-form-item label="设备名称" prop="devName">
              <el-input v-model="uploadForm[index].devName" clearable placeholder="请输入设备名称"/>
            </el-form-item>
            <el-form-item label="序列号" prop="sn">
              <el-input v-model="uploadForm[index].sn" clearable placeholder="请输入序列号"/>
            </el-form-item>
            <el-form-item label="简称" prop="abbreviation">
              <el-input v-model="uploadForm[index].abbreviation" clearable placeholder="请输入简称"/>
            </el-form-item>
            <el-form-item label="设备型号" prop="devModelId">
              <el-select-v2 style="width: 100%"
                            v-model="uploadForm[index].devModelId"
                            placeholder="请输入设备名称"
                            filterable
                            :options="devModelOps"
                            clearable
              />
            </el-form-item>
            <el-form-item label="运维时间" prop="opDatetime">
              <el-date-picker clearable
                              style="width: 590px"
                              v-model="uploadForm[index].opDatetime"
                              type="date"
                              value-format="YYYY-MM-DD"
                              popper-class="tzy-popper"
                              placeholder="格式YYYY-MM-DD，可手动输入">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="电源类型" prop="supplyId">
              <el-select-v2 style="width: 100%"
                            v-model="uploadForm[index].supplyId"
                            placeholder="请输入电源类型"
                            filterable
                            :options="powerSupplyOps"
                            clearable
              />
            </el-form-item>
            <el-form-item label="系统类型" prop="sysTypeId">
              <el-select-v2 style="width: 100%"
                            v-model="uploadForm[index].sysTypeId"
                            placeholder="请输入系统类型"
                            filterable
                            :options="systemOps"
                            clearable
              />
            </el-form-item>
            <el-form-item label="机柜" prop="locId">
              <el-select-v2 style="width: 100%"
                            v-model="uploadForm[index].locId"
                            placeholder="请输入机柜名"
                            filterable
                            :options="locationOps"
                            clearable
              />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="uploadForm[index].description" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="IP列表" v-if="title=='设备信息'">
              <div class="tag" v-for="(tag,index) in devIps">
                <el-tag size="large" :key="index">{{ tag }}</el-tag>
              </div>
            </el-form-item>
          </el-form>

        </el-tab-pane>
      </el-tabs>
      <el-form v-if="title!='添加设备信息'" ref="deviceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备名称" prop="devName">
          <el-input v-model="form.devName" placeholder="请输入设备名称"/>
        </el-form-item>
        <el-form-item label="序列号" prop="sn">
          <el-input v-model="form.sn" placeholder="请输入序列号"/>
        </el-form-item>
        <el-form-item label="简称" prop="abbreviation">
          <el-input v-model="form.abbreviation" placeholder="请输入简称"/>
        </el-form-item>
        <el-form-item label="设备型号" prop="devModelId">
          <el-select-v2 style="width: 100%"
                        v-model="form.devModelId"
                        placeholder="请输入设备名称"
                        filterable
                        :options="devModelOps"
                        clearable
          />
        </el-form-item>
        <el-form-item label="运维时间" prop="opDatetime">
          <el-date-picker clearable
                          v-model="form.opDatetime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择运维时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="电源类型" prop="supplyId">
          <el-select-v2 style="width: 100%"
                        v-model="form.supplyId"
                        placeholder="请输入电源类型"
                        filterable
                        :options="powerSupplyOps"
                        clearable
          />
        </el-form-item>
        <el-form-item label="系统类型" prop="sysTypeId">
          <el-select-v2 style="width: 100%"
                        v-model="form.sysTypeId"
                        placeholder="请输入系统类型"
                        filterable
                        :options="systemOps"
                        clearable
          />
        </el-form-item>
        <el-form-item label="机柜" prop="locId">
          <el-select-v2 style="width: 100%"
                        v-model="form.locId"
                        placeholder="请输入机柜名"
                        filterable
                        :options="locationOps"
                        clearable
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="IP列表" v-if="title=='设备信息'">
          <div class="tag" v-for="(tag,index) in devIps">
            <el-tag size="large" :key="index">{{ tag }}</el-tag>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Device">
import {listDevice, getDevice, delDevice, addDevice, updateDevice, getDevOptions, batchAdd} from "@/api/ledger/device";
import {cloneDeep, isEqual} from "lodash";
import {getDevModelOps} from "@/api/ledger/deviceDetails.js";
import {getLocationOps} from "@/api/ledger/location.js";
import {getPowerSupplyOps} from "@/api/ledger/supply.js";
import {getSystemOps} from "@/api/ledger/sys.js";
import {getDevIps} from "@/api/ledger/ip.js";


const {proxy} = getCurrentInstance();
const isExpandAll = ref(false);
const deviceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeOpDatetime = ref([]);
const devOps = ref([]);
const updateForm = ref({});
const devModelOps = ref([]);
const locationOps = ref([]);
const powerSupplyOps = ref([]);
const systemOps = ref([]);
const devIps = ref([]);
// 批量添加的标签页
const editableTabsValue = ref('1');
const editableTabs = ref([{
  title: '新增设备 1',
  name: '1',
}]);
const tabIndex = ref(1);
const uploadForm = ref([
  {
    sn: null,
    abbreviation: null,
    id: null,
    devName: null,
    devModelId: null,
    ledgerIpList: null,
    ledgerDevDetails: {
      id: null,
      devType: null,
      devModel: null
    },
    opDatetime: null,
    description: null,
    supplyId: null,
    ledgerPowerSupply: {
      id: null,
      status: null
    },
    sysTypeId: null,
    ledgerSystem: {
      id: null,
      sysType: null
    },
    locId: null,
    ledgerLocation: {
      id: null,
      name: null
    },
  }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sn: null,
    abbreviation: null,
    id: 1,
    devName: null,
    devModelId: null,
    ledgerIpList: null,
    ledgerDevDetails: {
      id: null,
      devType: null,
      devModel: null
    },
    opDatetime: null,
    description: null,
    supplyId: null,
    ledgerPowerSupply: {
      id: null,
      status: null
    },
    sysTypeId: null,
    ledgerSystem: {
      id: null,
      sysType: null
    },
    locId: null,
    ledgerLocation: {
      id: null,
      name: null
    },
    orderByColumn: undefined,
    isAsc: undefined
  },
  rules: {}
});

const {queryParams, form, rules} = toRefs(data);

/** 查询设备信息列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};

  if (null != daterangeOpDatetime && '' != daterangeOpDatetime && daterangeOpDatetime.value != null && daterangeOpDatetime.value.length > 0) {
    queryParams.value.params["beginOpDatetime"] = daterangeOpDatetime.value[0];
    queryParams.value.params["endOpDatetime"] = daterangeOpDatetime.value[1];
  }
  listDevice(queryParams.value).then(response => {
    deviceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  editableTabsValue.value = '1'
  editableTabs.value = [{
    title: '新建设备 1',
    name: '1',
  }]
  tabIndex.value = 1
  uploadForm.value = [
    {
      sn: null,
      abbreviation: null,
      id: null,
      devName: null,
      devModelId: null,
      ledgerIpList: null,
      ledgerDevDetails: {
        id: null,
        devType: null,
        devModel: null
      },
      opDatetime: null,
      description: null,
      supplyId: null,
      ledgerPowerSupply: {
        id: null,
        status: null
      },
      sysTypeId: null,
      ledgerSystem: {
        id: null,
        sysType: null
      },
      locId: null,
      ledgerLocation: {
        id: null,
        name: null
      },
    }
  ]
  form.value = [{
    sn: null,
    abbreviation: null,
    id: null,
    devName: null,
    devModelId: null,
    ledgerIpList: null,
    ledgerDevDetails: {
      id: null,
      devType: null,
      devModel: null
    },
    opDatetime: null,
    description: null,
    supplyId: null,
    ledgerPowerSupply: {
      id: null,
      status: null
    },
    sysTypeId: null,
    ledgerSystem: {
      id: null,
      sysType: null
    },
    locId: null,
    ledgerLocation: {
      id: null,
      name: null
    },
  }];
  // proxy.resetForm("deviceRef");
}

function toggleExpandAll() {
  isExpandAll.value = !isExpandAll.value;
}

function getSystemList() {
  getSystemOps().then(res => {
    systemOps.value = res.data
  })
}

function getPowerSupplyList() {
  getPowerSupplyOps().then(res => {
    powerSupplyOps.value = res.data
  })
}

function getLocationList() {
  getLocationOps().then(res => {
    locationOps.value = res.data
  })
}

function getDevIpList(_id) {
  getDevIps(_id).then(res => {
    devIps.value = res.data
    console.log(res.data)
  })
}

function getDevList() {
  getDevOptions().then(res => {
    devOps.value = res.data.map(item => {
      item.value = item.label;
      return item;
    });
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeOpDatetime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function getDevModelList() {
  getDevModelOps().then(res => {
    devModelOps.value = res.data
  })
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加设备信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDevIpList(_id)
  getDevice(_id).then(response => {
    updateForm.value = cloneDeep(response.data)
    form.value = response.data;
    open.value = true;
    title.value = "设备信息";

  });
}

/** 提交按钮 */
function submitForm() {


  // 判断是否需要像后台提交
  if (isEqual(updateForm.value, form.value)) {
    proxy.$modal.msg("无修改");
    open.value = false;
    return;
  } else if (form.value.id != null) {
    updateDevice(form.value).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      open.value = false;
      getList();
    });
  } else {
    console.log(uploadForm.value)
    batchAdd(uploadForm.value).then(response => {
      proxy.$modal.msgSuccess("新增成功");
      open.value = false;
      getList();
    });
  }

}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除设备信息编号为"' + _ids + '"的数据项？').then(function () {
    return delDevice(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/device/export', {
    ...queryParams.value
  }, `device_${new Date().getTime()}.xlsx`)
}

function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
};

// 监听数据变化，如果用deep的话有bug，所以分开写
watch(() => data.queryParams.devName, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.sn, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.abbreviation, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.devModelId, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.locId, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.supplyId, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.sysTypeId, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => daterangeOpDatetime, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == []) {
    resetQuery()
  } else {
    handleQuery()
  }
}, {deep: true});

function handleTabsEdit(targetName, action) {
  if (action === 'add') {
    let template = JSON.parse(JSON.stringify(uploadForm.value[uploadForm.value.length - 1]))
    uploadForm.value.push(template)
    let newTabName = ++tabIndex.value + '';
    // uploadForm.value[tabIndex.value] = template
    editableTabs.value.push({
      title: '新建设备 ' + tabIndex.value,
      name: newTabName,
    });
    editableTabsValue.value = newTabName;
    console.log(uploadForm.value)
  }
  if (action === 'remove') {
    let tabs = editableTabs.value;
    let activeName = editableTabsValue.value;
    if (activeName === targetName) {
      tabs.forEach((tab, index) => {
        if (tab.name === targetName) {
          let nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            activeName = nextTab.name;
          }
        }
      });
    }

    editableTabsValue.value = activeName;
    // 删除该标签页对应的内容就可以
    let index = tabs.findIndex(tab => tab.name === targetName);
    console.log(index)
    uploadForm.value.splice(index, 1)
    console.log(uploadForm.value)
    editableTabs.value = tabs.filter(tab => tab.name !== targetName);
  }
}

getList();
onMounted(() => {
  getDevList();
  getDevModelList();
  getLocationList();
  getPowerSupplyList();
  getSystemList();

});
</script>
<style>
.tag {
  width: 100%;
  margin-bottom: 10px; /* 可选的，用于添加标签之间的间距 */
}
.tzy-popper{
  margin-left: -10%;
}
</style>

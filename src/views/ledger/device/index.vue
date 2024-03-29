<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备名称" prop="devName">
        <el-input
            v-model="queryParams.devName"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备型号id" prop="devModelId">
        <el-input
            v-model="queryParams.devModelId"
            placeholder="请输入设备型号id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="运维时间" style="width: 308px">
        <el-date-picker
            v-model="daterangeOpDatetime"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="电源id" prop="supplyId">
        <el-input
            v-model="queryParams.supplyId"
            placeholder="请输入电源id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统类型id" prop="sysTypeId">
        <el-input
            v-model="queryParams.sysTypeId"
            placeholder="请输入系统类型id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机柜id" prop="locId">
        <el-input
            v-model="queryParams.locId"
            placeholder="请输入机柜id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
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

    <el-table v-loading="loading" :data="deviceList" height="500" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键id" align="center" prop="id"/>
      <el-table-column label="设备名称" align="center" prop="devName"/>
      <el-table-column label="设备型号id" align="center" prop="devModelId"/>
      <el-table-column label="运维时间" align="center" prop="opDatetime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.opDatetime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description"/>
      <el-table-column label="电源id" align="center" prop="supplyId"/>
      <el-table-column label="系统类型id" align="center" prop="sysTypeId"/>
      <el-table-column label="机柜id" align="center" prop="locId"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['ledger:device:edit']">修改
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
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <div>
        <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit">
          <el-tab-pane
              v-for="item in editableTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
          >
            <el-form ref="deviceRef" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="设备名称" prop="devName">
                <el-input v-model="form.devName" placeholder="请输入设备名称"/>
              </el-form-item>
              <el-form-item label="设备型号id" prop="devModelId">
                <el-input v-model="form.devModelId" placeholder="请输入设备型号id"/>
              </el-form-item>
              <el-form-item label="运维时间" prop="opDatetime">
                <el-date-picker clearable
                                v-model="form.opDatetime"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="请选择运维时间">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input v-model="form.description" type="textarea" placeholder="请输入内容"/>
              </el-form-item>
              <el-form-item label="电源id" prop="supplyId">
                <el-input v-model="form.supplyId" placeholder="请输入电源id"/>
              </el-form-item>
              <el-form-item label="系统类型id" prop="sysTypeId">
                <el-input v-model="form.sysTypeId" placeholder="请输入系统类型id"/>
              </el-form-item>
              <el-form-item label="机柜id" prop="locId">
                <el-input v-model="form.locId" placeholder="请输入机柜id"/>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" v-hasPermi="['ledger:device:edit','ledger:device:add']">确 定
          </el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Device">
import {listDevice, getDevice, delDevice, addDevice, updateDevice} from "@/api/ledger/device";

const {proxy} = getCurrentInstance();

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
// 批量添加的标签页
const editableTabsValue = '1';
const editableTabs = [{
  title: '新增设备 1',
  name: '1',
}];
const tabIndex = 1;

const data = reactive({
  form: [],
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    devName: null,
    devModelId: null,
    opDatetime: null,
    description: null,
    supplyId: null,
    sysTypeId: null,
    locId: null
  },
  rules: {},

});

const {queryParams, form, rules} = toRefs(data);

/** 查询设备信息列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeOpDatetime && '' != daterangeOpDatetime) {
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
  form.value = {
    id: null,
    devName: null,
    devModelId: null,
    opDatetime: null,
    description: null,
    supplyId: null,
    sysTypeId: null,
    locId: null
  };
  proxy.resetForm("deviceRef");
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
  getDevice(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改设备信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDevice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
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

function handleTabsEdit(targetName, action) {
  if (action === 'add') {
    let template = JSON.parse(JSON.stringify(this.form[0]))
    this.form.push(template)
    let newTabName = ++this.tabIndex + '';
    this.editableTabs.push({
      title: '新建设备 ' + this.tabIndex,
      name: newTabName,
    });
    this.editableTabsValue = newTabName;
  }
  if (action === 'remove') {
    let tabs = this.editableTabs;
    let activeName = this.editableTabsValue;
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

    this.editableTabsValue = activeName;
    // 删除该标签页对应的内容就可以
    this.form.splice(targetName - 1, 1, '')
    this.form = this.form.filter(f => f !== '')
    this.editableTabs = tabs.filter(tab => tab.name !== targetName);
  }
}

getList();
</script>

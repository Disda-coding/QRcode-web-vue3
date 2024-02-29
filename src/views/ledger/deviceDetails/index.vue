<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="设备类型" prop="devType">
        <el-select-v2
            v-model="queryParams.devType"
            placeholder="请输入设备类型"
            filterable
            :options="devTypeOps"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备型号" prop="devModel">
        <el-select-v2
            v-model="queryParams.devModel"
            placeholder="请输入设备型号"
            filterable
            :options="devModelOps"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
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
            v-hasPermi="['ledger:deviceDetails:add']"
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
            v-hasPermi="['ledger:deviceDetails:edit']"
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
            v-hasPermi="['ledger:deviceDetails:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ledger:deviceDetails:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="deviceDetailsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="主键id" align="center" prop="id"/>
      <el-table-column label="设备类型" align="center" prop="devType"/>
      <el-table-column label="设备型号" align="center" prop="devModel"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['ledger:deviceDetails:edit']">修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['ledger:deviceDetails:remove']">删除
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

    <!-- 添加或修改设备详情对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="deviceDetailsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备类型" prop="devType">
          <el-input v-model="form.devType" placeholder="请输入设备类型"/>
        </el-form-item>
        <el-form-item label="设备型号" prop="devModel">
          <el-input v-model="form.devModel" placeholder="请输入设备型号"/>
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

<script setup name="DeviceDetails">
import {
  listDeviceDetails,
  getDeviceDetails,
  delDeviceDetails,
  addDeviceDetails,
  updateDeviceDetails, getDevTypeOps, getDevModelOps
} from "@/api/ledger/deviceDetails";
import {cloneDeep, isEqual} from "lodash";

const {proxy} = getCurrentInstance();

const deviceDetailsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const devTypeOps = ref([]);
const devModelOps = ref([]);
const updateForm =  ref({});

const data = reactive({

  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    devType: null,
    devModel: null
  },
  rules: {
    devModel:[{required:true, message: '请输入设备型号', trigger: 'blur'}],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询所有设备类型 **/
function getDevTypeList() {
  getDevTypeOps().then(res => {
    const options = Array.from({length: res.data.length}).map((_, idx) => ({
      value: `${res.data[idx]}`,
      label: `${res.data[idx]}`,
    }))
    devTypeOps.value = options
  })
}

/** 查询所有型号类型 **/
function getDevModelList() {
  getDevModelOps().then(res => {
    devModelOps.value = res.data.map(item => {
      return { value: item.label, label: item.label };
    });
  })
}


/** 查询设备详情列表 */
function getList() {
  loading.value = true;
  listDeviceDetails(queryParams.value).then(response => {
    deviceDetailsList.value = response.rows;
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
    devType: null,
    devModel: null
  };
  proxy.resetForm("deviceDetailsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
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
  title.value = "添加设备详情";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDeviceDetails(_id).then(response => {
    updateForm.value =cloneDeep(response.data)
    form.value = response.data;
    open.value = true;
    title.value = "修改设备详情";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deviceDetailsRef"].validate(valid => {
    if (valid) {
      // 判断是否需要像后台提交
      if(isEqual(updateForm.value,form.value)){
        proxy.$modal.msgSuccess("无修改");
        open.value = false;
        return ;
      }
      if (form.value.id != null) {
        updateDeviceDetails(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDeviceDetails(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除设备详情编号为"' + _ids + '"的数据项？').then(function () {
    return delDeviceDetails(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/deviceDetails/export', {
    ...queryParams.value
  }, `deviceDetails_${new Date().getTime()}.xlsx`)
}

getList();
onBeforeMount(() => {
  getDevTypeList(); // 在beforeCreate时调用方法
  getDevModelList(); // 在beforeCreate时调用方法
});
watch(() => data.queryParams, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
    handleQuery()
},{deep:true});
</script>

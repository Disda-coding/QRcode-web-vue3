<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="ip地址" prop="ipAddr">
        <el-input
            v-model="queryParams.ipAddr"
            placeholder="请输入ip地址"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地址类型" prop="type">
        <el-select-v2
            v-model="queryParams.type"
            placeholder="请输入地址类型"
            filterable
            :options="ipTypeOps"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备id" prop="devId">
        <el-input
            v-model="queryParams.devId"
            placeholder="请输入设备id"
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
            v-hasPermi="['ledger:ip:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['ledger:ip:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['ledger:ip:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ledger:ip:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ipList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="ip地址" align="center" prop="ipAddr" />
      <el-table-column label="地址类型" align="center" prop="type" />
      <el-table-column label="设备id" align="center" prop="devId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:ip:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ledger:ip:remove']">删除</el-button>
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

    <!-- 添加或修改IP地址详情对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ipRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="ip地址" prop="ipAddr">
          <el-input v-model="form.ipAddr" placeholder="请输入ip地址" />
        </el-form-item>
        <el-form-item label="地址类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入地址类型" />
        </el-form-item>
        <el-form-item label="设备id" prop="devId">
          <el-input v-model="form.devId" placeholder="请输入设备id" />
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

<script setup name="Ip">
import {listIp, getIp, delIp, addIp, updateIp, getIpTypeOps} from "@/api/ledger/ip";
import {getLocationOps} from "@/api/ledger/location.js";

const { proxy } = getCurrentInstance();

const ipList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const ipTypeOps=ref([])
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ipAddr: null,
    type: null,
    devId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询IP地址详情列表 */
function getList() {
  loading.value = true;
  listIp(queryParams.value).then(response => {
    ipList.value = response.rows;
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
    ipAddr: null,
    type: null,
    devId: null
  };
  proxy.resetForm("ipRef");
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
  title.value = "添加IP地址详情";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getIp(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改IP地址详情";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ipRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateIp(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addIp(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除IP地址详情编号为"' + _ids + '"的数据项？').then(function() {
    return delIp(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/ip/export', {
    ...queryParams.value
  }, `ip_${new Date().getTime()}.xlsx`)
}

function getIpTypeList() {
  getIpTypeOps().then(res=>{
    const options = Array.from({ length: res.data.length }).map((_, idx) => ({
      value: `${res.data[idx]}`,
      label: `${res.data[idx]}`,
    }))
    ipTypeOps.value=options

  })
}

onBeforeMount(() => {
  getIpTypeList(); // 在beforeCreate时调用方法
});
// 监听事件，可以实现输入为空时自动查询数据库
watch(() => data.queryParams, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue==''){
    resetQuery()
  }else{
    handleQuery()
  }
},{deep:true});
getList();
</script>
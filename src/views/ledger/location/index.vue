<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="机柜名" prop="name">
        <el-select-v2
            v-model="queryParams.name"
            placeholder="请输入机柜名"
            filterable
            :options="locationOps"
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
            v-hasPermi="['ledger:location:add']"
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
            v-hasPermi="['ledger:location:edit']"
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
            v-hasPermi="['ledger:location:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ledger:location:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="locationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
<!--      <el-table-column label="主键id" align="center" prop="id"/>-->
      <el-table-column label="机柜名" align="center" prop="name"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleUpdate(scope.row)"
                     v-hasPermi="['ledger:location:query']">查看详情
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['ledger:location:remove']">删除
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

    <!-- 添加或修改机柜地址对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="locationRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机柜名" prop="name">
          <el-input v-model="form.name" clearable placeholder="请输入机柜名"/>
        </el-form-item>
        <el-form-item label="主机列表" v-if="title=='机柜地址'">
        <div class="tag" v-for="(tag,index) in devList">
          <el-tag  size="large"  :key="index">{{ tag }}</el-tag>
        </div>
        </el-form-item>
        <el-form-item label="二维码" v-if="title=='机柜地址'">
          <br/><span>  &nbsp;&nbsp;点击下图即可下载二维码</span>
          <div class="code">
            <img :src="codeUrl" @click="downloadQRCode(form.name)"/>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" v-hasPermi="['ledger:location:edit','ledger:location:add']">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Location">
import {
  listLocation,
  getLocation,
  delLocation,
  addLocation,
  updateLocation,
  getLocationOps, getDevList, getLocQRcode
} from "@/api/ledger/location";
import {getDevTypeOps} from "@/api/ledger/deviceDetails.js";
import {cloneDeep, isEqual} from "lodash";

const {proxy} = getCurrentInstance();
const codeUrl = ref("");
const locationList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const locationOps = ref([]);
const updateForm = ref({});
const devList = ref([]);

function downloadQRCode(name){
  const link = document.createElement('a')
  link.href = codeUrl.value
  link.download = name+'.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
function getLocationList() {
  getLocationOps().then(res => {
    locationOps.value = res.data.map(item => {
      item.value = item.label;
      return item;
    });
  })
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    id:null
  },
  rules: {
    name:[{required:true, message: '请输入机柜名', trigger: 'blur'}],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询机柜地址列表 */
function getList() {
  loading.value = true;
  listLocation(queryParams.value).then(response => {
    locationList.value = response.rows;
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
    name: null
  };
  proxy.resetForm("locationRef");
  codeUrl.value=""
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
  title.value = "添加机柜地址";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDevList(_id).then(res => {
    devList.value = res.data;
    console.log(devList.value)
  });
  getLocQRcode(_id).then(res=>{
    codeUrl.value = "data:image/gif;base64," + res.img;
  });
  getLocation(_id).then(response => {
    updateForm.value = cloneDeep(response.data)
    form.value = response.data;
    open.value = true;
    title.value = "机柜地址";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["locationRef"].validate(valid => {
    if (valid) {
      // 判断是否需要像后台提交
      if (isEqual(updateForm.value, form.value)) {
        proxy.$modal.msg("无修改");
        open.value = false;
        return;
      }
      if (form.value.id != null) {
        updateLocation(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLocation(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除机柜地址编号为"' + _ids + '"的数据项？').then(function () {
    return delLocation(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/location/export', {
    ...queryParams.value
  }, `location_${new Date().getTime()}.xlsx`)
}

getList();
onMounted(() => {
  getLocationList(); // 在beforeCreate时调用方法
});
// 监听事件，可以实现输入为空时自动查询数据库
watch(() => data.queryParams.name, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
</script>
<style>
.tag {
  width: 100%;
  margin-bottom: 10px; /* 可选的，用于添加标签之间的间距 */
}
</style>

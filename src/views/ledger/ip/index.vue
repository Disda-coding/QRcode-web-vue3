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
      <el-form-item label="设备名称" prop="devId">
        <el-select-v2
            v-model="queryParams.devId"
            placeholder="请输入设备名称"
            filterable
            :options="devOps"
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
            v-hasPermi="['ledger:ip:add']"
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
            v-hasPermi="['ledger:ip:edit']"
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
            v-hasPermi="['ledger:ip:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ledger:ip:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ipList" height="500" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
<!--      <el-table-column label="主键id" align="center" prop="id"/>-->
      <el-table-column label="ip地址" align="center" prop="ipAddr"/>
      <el-table-column label="地址类型" align="center" prop="type"/>
      <el-table-column label="设备名称" align="center" prop="device"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ledger:ip:edit']">
            修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['ledger:ip:remove']">删除
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

    <!-- 添加或修改IP地址详情对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ipRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="ip网段" prop="ipSeg">
          <el-input v-model="form.ipSeg" placeholder="请输入ip网段信息" style="width: 52%"/>
          &nbsp/&nbsp
          <el-form-item label="" prop="netmask" style="width: 20%">
            <el-input v-model="form.netmask" placeholder="24"/>
          </el-form-item>
          <el-button :icon="Search" @click="checkIPSeg" style="margin-left: 10px">验 证</el-button>
        </el-form-item>
        <div v-show="title!=='添加IP地址详情' || ipFlag==true ">
          <el-form-item label="ip地址" prop="ipAddr">
            <el-select-v2 v-model="form.ipAddr"
                          placeholder="请输入设备名称"
                          filterable
                          :options="allIpList"
                          style="width: 100%"
                          clearable>
            </el-select-v2>
          </el-form-item>
          <el-form-item label="地址类型"  prop="type">
            <el-autocomplete style="width: 100%"
                v-model="form.type"
                :fetch-suggestions="querySearch"
                clearable
                placeholder="请输入地址类型"
            />

          </el-form-item>
          <el-form-item label="设备名称" prop="devId">
            <el-select-v2 style="width: 100%"
                          v-model="form.devId"
                          placeholder="请输入设备名称"
                          filterable
                          :options="devOps"
                          clearable
            />
          </el-form-item>

        </div>
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
import {listIp, getIp, delIp, addIp, updateIp, getIpTypeOps, getAllIps} from "@/api/ledger/ip";
import {getLocationOps} from "@/api/ledger/location.js";
import {getDevOptions} from "@/api/ledger/device.js";
import {cloneDeep, isEqual} from "lodash";
import {Check, Search} from "@element-plus/icons-vue";


const {proxy} = getCurrentInstance();

const ipList = ref([]);
const open = ref(false);
const ipFlag = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const ipTypeOps = ref([]);
const devOps = ref([]);
const updateForm = ref({});
const ipAddr = ref("");
const netmask = ref("");
const allIpList = ref([])

const data = reactive({
  form: {
    netmask: 24,
    ipSeg: null,
    type:''
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    netmask: 24,
    type: null,
    devId: null,
    device: null
  },
  rules: {
    ipSeg: [{required: true, validator: isValidIp, message: '请输入正确网段信息', trigger: 'blur'}],
    netmask: [{required: true, validator: checkMaxVal, message: '请输入正确的', trigger: 'blur'}
    ]
  }
});

function checkMaxVal(rule, value, callback) {
  if (value < 1 || value > 32) {
    callback(new Error('请输入[1,32]之间的数字'));
  } else {
    callback();
  }
}

function isValidIp(rule, value, callback) { // 校验IP是否符合规则
  if (value === null) {
    // 这里根据需求处理 value 为 null 的情况，可以直接通过或者返回错误信息
    return ;
  }

  var regEx = /,/g
  var ipList = value.toString().replace(regEx, ',').split(',')
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  for (var i in ipList) {
    if (!reg.test(ipList[i])) {
      return callback(new Error('请输入节点ip地址'))
    } else {
      callback()
    }
  }
  return true
}

const {queryParams, form, rules} = toRefs(data);

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
  ipFlag.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    ipAddr: null,
    type: '',
    devId: null,
    dev_name: null,
    ipSeg: null,
    netmask: 24,
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
  allIpList.value=[]
  getIp(_id).then(response => {
    form.value = response.data;
    data.form.ipSeg = '1.1.1.1'
    data.form.netmask = 1
    open.value = true;
    title.value = "修改IP地址详情";
    updateForm.value = cloneDeep(response.data)
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ipRef"].validate(valid => {
    if (valid) {
      if (isEqual(updateForm.value, form.value)) {
        proxy.$modal.msgSuccess("无修改");
        open.value = false;
        ipFlag.value = false;
        return;
      }
      if (form.value.id != null) {
        updateIp(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          ipFlag.value = false;
          getList();
        });
      } else {
        addIp(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          ipFlag.value = false;
          getList();
        });
      }
    }
  });
}

function noExistIPSeg() {

}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除IP地址详情编号为"' + _ids + '"的数据项？').then(function () {
    return delIp(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('ledger/ip/export', {
    ...queryParams.value
  }, `ip_${new Date().getTime()}.xlsx`)
}

function checkIPSeg() {
  proxy.$refs["ipRef"].validate(valid => {
    if (valid) {

      getAllIps({'ipAddr': data.form.ipSeg, 'netmask': data.form.netmask}).then(res => {
        const options = Array.from({length: res.data.allIpList.length}).map((_, idx) => ({
          value: `${res.data.allIpList[idx]}`,
          label: `${res.data.allIpList[idx]}`,
        }))
        allIpList.value = options
        if (res.data.flag=='true'){
          proxy.$modal.confirm('数据库中无该网段，是否继续分配IP').then(function () {
          }).then(() => {
            ipFlag.value=true
          }).catch(() => {
            data.form.ipSeg=null
            data.form.netmask=24
          });
        }else{
          ipFlag.value=true
        }
      })


    } else {
      proxy.$modal.msgError("请输入正确的网段信息");
    }
  })

}

function getDevList() {
  getDevOptions().then(res => {
    devOps.value = res.data
  })
}

function getIpTypeList() {
  getIpTypeOps().then(res => {
    const options = Array.from({length: res.data.length}).map((_, idx) => ({
      value: `${res.data[idx]}`,
      label: `${res.data[idx]}`,
    }))
    ipTypeOps.value = options
  })
}

onBeforeMount(() => {
  getDevList();
  getIpTypeList(); // 在beforeCreate时调用方法


});

const querySearch = (queryString,cb) => {
  if (queryString==null) queryString="网"
  const results = queryString
      ? ipTypeOps.value.filter(createFilter(queryString))
      : ipTypeOps.value
  // call callback function to return suggestions
  cb(results)
};
const createFilter=(queryString) => {
  return(item)=>{
   return(item.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
  }
};


// 使得ip输入的框框也能随着窗口关闭而隐藏
watch(()=>open.value,(newValue,oldValue)=>{
  if (open.value==false){
    ipFlag.value=false
  }
})

watch(() => data.queryParams.ipAddr, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.type, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
watch(() => data.queryParams.devId, (newValue, oldValue) => {
  // 在这里处理数据变化时的操作
  if (newValue == '') {
    resetQuery()
  } else {
    handleQuery()
  }
});
getList();
</script>

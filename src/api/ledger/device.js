import request from '@/utils/request'

export function batchAdd(data){
  return request({
    url: '/ledger/device/batchAdd',
    method: 'post',
    data: data
  })
}

export function getDevOptions() {
  return request({
    url: '/ledger/ip/getIpDevOptions',
    method: 'get',
  })
}
// 查询设备信息列表
export function listDevice(query) {
  return request({
    url: '/ledger/device/list',
    method: 'get',
    params: query
  })
}

// 查询设备信息详细
export function getDevice(id) {
  return request({
    url: '/ledger/device/' + id,
    method: 'get'
  })
}

// 新增设备信息
export function addDevice(data) {
  return request({
    url: '/ledger/device',
    method: 'post',
    data: data
  })
}

// 修改设备信息
export function updateDevice(data) {
  return request({
    url: '/ledger/device',
    method: 'put',
    data: data
  })
}

// 删除设备信息
export function delDevice(id) {
  return request({
    url: '/ledger/device/' + id,
    method: 'delete'
  })
}

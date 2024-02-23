import request from '@/utils/request'

// 查询机柜unique列表
export function getLocationOps() {
  return request({
    url: '/ledger/location/getLocationOps',
    method: 'get',
  })
}


// 查询机柜地址列表
export function listLocation(query) {
  return request({
    url: '/ledger/location/list',
    method: 'get',
    params: query
  })
}

// 查询机柜地址详细
export function getLocation(id) {
  return request({
    url: '/ledger/location/' + id,
    method: 'get'
  })
}

// 新增机柜地址
export function addLocation(data) {
  return request({
    url: '/ledger/location',
    method: 'post',
    data: data
  })
}

// 修改机柜地址
export function updateLocation(data) {
  return request({
    url: '/ledger/location',
    method: 'put',
    data: data
  })
}

// 删除机柜地址
export function delLocation(id) {
  return request({
    url: '/ledger/location/' + id,
    method: 'delete'
  })
}

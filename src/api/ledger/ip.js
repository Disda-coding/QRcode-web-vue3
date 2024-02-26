import request from '@/utils/request'


export function getIpTypeOps() {
  return request({
    url: '/ledger/ip/getIpTypeOps',
    method: 'get',
  })
}
// 查询ip地址列表
export function listIp(query) {
  return request({
    url: '/ledger/ip/list',
    method: 'get',
    params: query
  })
}

// 查询ip地址详细
export function getIp(id) {
  return request({
    url: '/ledger/ip/' + id,
    method: 'get'
  })
}

// 新增ip地址
export function addIp(data) {
  return request({
    url: '/ledger/ip',
    method: 'post',
    data: data
  })
}

// 修改ip地址
export function updateIp(data) {
  return request({
    url: '/ledger/ip',
    method: 'put',
    data: data
  })
}

// 删除ip地址
export function delIp(id) {
  return request({
    url: '/ledger/ip/' + id,
    method: 'delete'
  })
}

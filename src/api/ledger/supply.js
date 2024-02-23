import request from '@/utils/request'

// 查询电源详情列表
export function listSupply(query) {
  return request({
    url: '/ledger/supply/list',
    method: 'get',
    params: query
  })
}

// 查询电源详情详细
export function getSupply(id) {
  return request({
    url: '/ledger/supply/' + id,
    method: 'get'
  })
}

// 新增电源详情
export function addSupply(data) {
  return request({
    url: '/ledger/supply',
    method: 'post',
    data: data
  })
}

// 修改电源详情
export function updateSupply(data) {
  return request({
    url: '/ledger/supply',
    method: 'put',
    data: data
  })
}

// 删除电源详情
export function delSupply(id) {
  return request({
    url: '/ledger/supply/' + id,
    method: 'delete'
  })
}

import request from '@/utils/request'

// 查询操作系统列表
export function listSys(query) {
  return request({
    url: '/ledger/sys/list',
    method: 'get',
    params: query
  })
}

// 查询操作系统详细
export function getSys(id) {
  return request({
    url: '/ledger/sys/' + id,
    method: 'get'
  })
}

// 新增操作系统
export function addSys(data) {
  return request({
    url: '/ledger/sys',
    method: 'post',
    data: data
  })
}

// 修改操作系统
export function updateSys(data) {
  return request({
    url: '/ledger/sys',
    method: 'put',
    data: data
  })
}

// 删除操作系统
export function delSys(id) {
  return request({
    url: '/ledger/sys/' + id,
    method: 'delete'
  })
}

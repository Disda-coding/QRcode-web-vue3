import request from '@/utils/request'

// 查询设备ip映射列表
export function listIp(query) {
    return request({
        url: '/ledger/devIp/list',
        method: 'get',
        params: query
    })
}

// 查询设备ip映射详细
export function getIp(id) {
    return request({
        url: '/ledger/devIp/' + id,
        method: 'get'
    })
}

// 新增设备ip映射
export function addIp(data) {
    return request({
        url: '/ledger/devIp',
        method: 'post',
        data: data
    })
}

// 修改设备ip映射
export function updateIp(data) {
    return request({
        url: '/ledger/devIp',
        method: 'put',
        data: data
    })
}

// 删除设备ip映射
export function delIp(id) {
    return request({
        url: '/ledger/devIp/' + id,
        method: 'delete'
    })
}

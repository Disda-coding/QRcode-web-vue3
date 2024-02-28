import request from '@/utils/request'
//查询设备型号
export function getDevModelOps() {
    return request({
        url: '/ledger/deviceDetails/getDevModelOps',
        method: 'get',
    })
}
//查询设备类型
export function getDevTypeOps() {
    return request({
        url: '/ledger/deviceDetails/getDevTypeOps',
        method: 'get',
    })
}
// 查询设备详情列表
export function listDeviceDetails(query) {
    return request({
        url: '/ledger/deviceDetails/list',
        method: 'get',
        params: query
    })
}

// 查询设备详情详细
export function getDeviceDetails(id) {
    return request({
        url: '/ledger/deviceDetails/' + id,
        method: 'get'
    })
}

// 新增设备详情
export function addDeviceDetails(data) {
    return request({
        url: '/ledger/deviceDetails',
        method: 'post',
        data: data
    })
}

// 修改设备详情
export function updateDeviceDetails(data) {
    return request({
        url: '/ledger/deviceDetails',
        method: 'put',
        data: data
    })
}

// 删除设备详情
export function delDeviceDetails(id) {
    return request({
        url: '/ledger/deviceDetails/' + id,
        method: 'delete'
    })
}

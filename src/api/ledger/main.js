import request from "@/utils/request.js";

export function listAllDeviceDetails(){
    return request({
        url:'/ledger/main/listDeviceDetails',
        method:'get'
    })
}

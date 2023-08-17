//品牌管理模块的接口
import request from '@/utils/request';
import type { TradeMarkResponseData, TradeMark } from './type'

enum API{
    //获取品牌接口地址
    TRADEMARK_URL='/admin/product/baseTrademark/',
    //添加品牌的接口地址
    ADDTRADEMARK_URL='/admin/product/baseTrademark/save',
    //修改已有品牌的数据
    UPDATETRADMARK_URL='/admin/product/baseTrademark/update'
}

//获取已有品牌的接口方法
export const reqHasTrademark = (page: number, limit:number) => request.get<any, TradeMarkResponseData>(API.TRADEMARK_URL+`${page}/${limit}`);
//添加与修改已有品牌的接口方法
export const reqAddOrUpdateTrademark = (data:TradeMark) => {
    //修改已有品牌的数据
    if(data.id) {
        return request.put<any,any>(API.UPDATETRADMARK_URL, data);
    } else {
        //新增品牌
        return request.post<any, any>(API.ADDTRADEMARK_URL, data);
    }
}
import request from '@/utils/request'
import type {
  SpuData,
  HasSaleAttrResponseData,
  HasSpuResponseData,
  AllTradeMark,
  SpuHasImg,
  SaleAttrResponseData,
} from './type'

enum API {
  //获取已有的SPU数据
  HASSPU_URL = '/admin/product/',
  //获取全部品牌的数据
  ALLTRADEMARK_URL = '/admin/product/baseTrademark/getTrademarkList',
  //获取某一个SPU下的全部的照片的数据
  IMAGE_URL = '/admin/product/spuImageList/',
  //获取某一个SPU下的全部已有的销售属性接口地址
  SPUHASSALEATTR_URL = '/admin/product/spuSaleAttrList/',
  //获取整个项目全部的销售属性
  ALLSALEATTR_URL = '/admin/product/baseSaleAttrList',
  //追加一个新的SPU
  ADDSPU_URL = '/admin/product/saveSpuInfo',
  //更新已有的SPU
  UPDATESPU_URL = '/admin/product/saveSpuInfo',
}

//获取某一个三级分类下已有的SPU数据
export const reqHasSpu = (
  page: number,
  limit: number,
  category3Id: string | number,
) =>
  request.get<any, HasSpuResponseData>(
    API.HASSPU_URL + `${page}/${limit}?category3Id=${category3Id}`,
  )
//获取全部的SPU的品牌的数据
export const reqAllTradeMark = () =>
  request.get<any, AllTradeMark>(API.ALLTRADEMARK_URL)
//获取某一个已有SPU下全部商品的图片地址
export const reqSpuImageList = (spuId: number) =>
  request.get<any, SpuHasImg>(API.IMAGE_URL + spuId)
//获取某一个已有的SPU拥有多少个销售属性
export const reqSpuHasSaleAttr = (spuId: number) =>
  request.get<any, SaleAttrResponseData>(API.SPUHASSALEATTR_URL + spuId)
//获取全部的销售属性
export const reqALLSaleAttr = () =>
  request.get<any, HasSaleAttrResponseData>(API.ALLSALEATTR_URL)
//添加或更新一个新的SPU的接口
export const reqAddOrUpdateSpu = (data: SpuData) => {
  //更新已有的SPU
  if (data.id) {
    return request.post<any, any>(API.UPDATESPU_URL, data)
  } else {
    return request.post<any, any>(API.ADDSPU_URL, data)
  }
}

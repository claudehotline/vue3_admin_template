//服务器全部接口返回的数据类型
export interface ResponseData {
    code: number
    message: string
    ok: boolean
}

//SPU数据的ts类型
export interface SpuData {
    category3Id: number | string
    id?: number
    spuName: string
    tmId: number | string
    description: string
    spuImageList: null | SpuImg[]
    spuSaleAttrList: null | SaleAttr[]
}

//数组包含元素都是已有的SPU数据类型
export type Records = SpuData[]

//定义获取已有SPU接口返回数据ts类型
export interface HasSpuResponseData extends ResponseData {
    data: {
        records: Records
        total: number
        size: number
        current: number
        searchCount: boolean
        pages: number
    }
}

//品牌数据的ts类型
export interface Trademark {
    id: number
    tmName: string
    logoUrl: string
}

//品牌接口返回的数据ts类型
export interface AllTradeMark extends ResponseData {
    data: Trademark[]
}

//商品图片的ts类型
export interface SpuImg {
    id?: number
    imgName?: string
    imgUrl?: string
    createTime?: string
    updateTime?: string
    spuId?: number
    name?: string
    url?: string
}

//已有SPU的照片数据的类型
export interface SpuHasImg extends ResponseData {
    data: SpuImg[]
}

//已有的销售属性值对象的ts类型
export interface SaleAttrValue {
    id?: number
    createTime?: null
    updateTime?: null
    spuId?: number
    baseSaleAttrId: number | string
    saleAttrValueName: string
    saleAttrName?: string
    isChecked?: null
}

//存储已有的销售属性值数据类型
export type spuSaleAttrList = SaleAttrValue[]

//销售属性对象ts类型
export interface SaleAttr {
    id?: number
    createTime?: null
    updateTime?: null
    spuId?: number
    baseSaleAttrId: number | string
    saleAttrName: string
    spuSaleAttrValueList: spuSaleAttrList,
    flag?: boolean,
    saleAttrValue?: string
}

//SPU已有的销售属性接口返回的数据的ts类型
export interface SaleAttrResponseData extends ResponseData {
    data: SaleAttr[]
}

//已有的全部SPU返回数据的ts类型
export interface HasSaleAttr {
    id: number
    name: string
}

export interface HasSaleAttrResponseData extends ResponseData {
    data: HasSaleAttr[]
}


export interface Attr{
    attrId: number | string,
    valueId: number | string,
}

export interface SaleArr{
    saleAttrId: number | string,
    saleAttrValueId: number | string
}

export interface SkuData {
    category3Id: string | number,
    spuId: string | number,
    tmId: string | number,
    skuName: string,
    price: string | number,
    weight: string | number,
    skuDesc: string,
    skuAttrValueList?: Attr[],
    skuSaleAttrValueList?: SaleArr[],
    skuDefaultImg: string
}

//获取SKU数据接口的ts类型
export interface SkuInfoData extends ResponseData{
    data: SkuData[];
}
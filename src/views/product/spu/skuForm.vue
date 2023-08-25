<template>
  <div>
    <el-form>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuParams.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格（元）">
        <el-input placeholder="价格为(元)" type="number" v-model="skuParams.price"></el-input>
      </el-form-item>
      <el-form-item label="重量(g)">
        <el-input placeholder="重量(g)" type="number" v-model="skuParams.weight"></el-input>
      </el-form-item>
      <el-form-item label="sku描述">
        <el-input placeholder="SKU描述" type="textarea" v-model="skuParams.skuDesc"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true">
          <el-form-item v-for="(item, index) in attrArr" :key="item.id" :label="item.attrName">
            <el-select v-model="item.attrIdAndValueId">
              <el-option :value="`${item.id}:${attrValue.id}`" v-for="(attrValue, index) in item.attrValueList"
                :key="attrValue.id" :label="attrValue.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true">
          <el-form-item :label="item.saleAttrName" v-for="(item, index) in saleArr" :key="item.id">
            <el-select v-model="item.saleIdAndValueId">
              <el-option :value="`${item.id}:${saleAttrValue.id}`" v-for="(saleAttrValue, index) in item.spuSaleAttrList"
                :key="saleAttrValue.id" :label="saleAttrValue.saleAttrValueName"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片名称">
        <el-table border :data="imgArr" ref="table">
          <el-table-column type="selection" width="80px" align="center"></el-table-column>
          <el-table-column label="图片">
            <template #="{ row, $index }">
              <img :src="row.imgUrl" style="width:100px;height:100px" />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName"></el-table-column>
          <el-table-column label="操作">
            <template #="{ row, $index }">
              <el-button type="primary" size="small" @click="handler(row)">默认设置</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default" @click="save">保存</el-button>
        <el-button type="primary" size="default">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
//引入请求的API
import { reqAttr } from '@/api/product/attr';
import { reqSpuImageList, reqSpuHasSaleAttr, reqAddSku } from '@/api/product/spu';
import type { SkuData } from '@/api/product/spu/type';
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';

let attrArr = ref<any>([]);
let saleArr = ref<any>([]);
let imgArr = ref<any>([]);
let table = ref<any>();
//收集SKU的参数
let skuParams = reactive<SkuData>({
  category3Id: "",
  spuId: "",
  tmId: "",
  skuName: "",
  price: "",
  weight: "",
  skuDesc: "",
  skuAttrValueList: [],
  skuSaleAttrValueList: [],
  skuDefaultImg: ""
})
const cancel = () => {
  $emit('changeScene', {
    flag: 0,
    params: ''
  })
}

//当前子组件的方法对外暴露
const initSkuData = async (c1Id: number | string, c2Id: number | string, spu: any) => {

  skuParams.category3Id = spu.category3Id;
  skuParams.spuId = spu.id;
  skuParams.tmId = spu.tmId;

  //获取平台属性
  let result: any = await reqAttr(c1Id, c2Id, spu.category3Id);
  //获取销售属性
  let result1: any = await reqSpuHasSaleAttr(spu.id);
  //获取照片墙的数据
  let result2: any = await reqSpuImageList(spu.id);

  attrArr.value = result.data;
  saleArr.value = result1.data;
  imgArr.value = result2.data;
}

const handler = (row: any) => {
  //点击先让全部复选框不勾选
  imgArr.value.forEach((item: any) => {
    table.value.toggleRowSelection(item, false)
  });
  table.value.toggleRowSelection(row, true);
  skuParams.skuDefaultImg = row.imgUrl;
}

const save = async() => {
  skuParams.skuAttrValueList = attrArr.value.reduce((prev: any, next: any) => {
    if (next.attrIdAndValueId) {
      let [attrId, valueId] = next.attrIdAndValueId.split(':');
      prev.push({
        attrId,
        valueId
      })
    }
    return prev;
  }, []);

  skuParams.skuSaleAttrValueList = saleArr.value.reduce((prev: any, next: any) => {
    if (next.saleIdAndValueId) {
      let [saleAttrId, saleAttrValueId] = next.saleIdAndValueId.split(':');
      prev.push({
        saleAttrId,
        saleAttrValueId
      })
    }
    return prev
  }, []);

  let result:any = await reqAddSku(skuParams);

  if(result.code==200) {
    ElMessage({
      type: 'success',
      message: '添加SKU成功'
    });
    $emit('changeScene',{ 
      flag: 0,
      params: ''
    })
  }else {
    ElMessage({
      type: 'error',
      message: '添加SKU失败'
    })
  }
}

defineExpose({
  initSkuData
})
let $emit = defineEmits(['changeScene'])
</script>

<style scoped></style>

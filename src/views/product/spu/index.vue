<template>
  <div>
    <div v-show="scene == 0">
      <!--三级分类结构-->
      <Category :scene="scene" />
      <el-card style="margin: 10px 0px">
        <el-button @click="addSpu" type="primary" size="default" icon="Plus"
          :disabled="categoryStore.c3Id ? false : true">
          添加SPU
        </el-button>
        <el-table style="margin: 10px 0px" border :data="records">
          <el-table-column label="序号" type="index" align="center" width="80px"></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"></el-table-column>
          <el-table-column label="SPU描述" prop="description" show-overflow-tooltip></el-table-column>
          <el-table-column label="操作">
            <template #="{ row, $index }">
              <el-button type="primary" size="small" icon="Plus" title="添加SKU" @click="addSku(row)"></el-button>
              <el-button type="primary" size="small" icon="Edit" title="修改SKU" @click="updateSpu(row)"></el-button>
              <el-button type="primary" size="small" icon="View" title="查看SKU列表" @click="findSku(row)"></el-button>
              <el-popconfirm :title="`你确定要删除${row.spuName}?`" width="200px" @confirm="deleteSpu(row)">
                <template #reference>
                  <el-button type="primary" size="small" icon="Delete" title="删除SKU"></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[3, 5, 7, 9]"
          :background="true" layout="prev, pager, next, jumper,->, total, sizes" :total="total"
          @current-change="getHasSpu" @size-change="changeSize" />
      </el-card>
    </div>
    <!--添加SPU|修改SPU子组件-->
    <SpuForm ref="spu" v-show="scene == 1" @changeScene="changeScene" />
    <!--添加SKU的子组件-->
    <SkuForm ref="sku" v-show="scene == 2" @changeScene="changeScene" />
    <!--dialog对话框：展示已有的SKU的数据-->
    <el-dialog v-model="show" title="SKU列表">
      <el-table border :data="skuArr">
        <el-table-column label="sku名字" prop="skuName"></el-table-column>
        <el-table-column label="sku价格" prop="price"></el-table-column>
        <el-table-column label="sku重量" prop="weight"></el-table-column>
        <el-table-column label="sku图片">
          <template #="{ row, $index }">
            <img :src="row.skuDefaultImg" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  SkuInfoData,
  HasSpuResponseData,
  Records,
  SpuData,
  SkuData,
} from '@/api/product/spu/type'
import { reqHasSpu, reqSkuList, reqRemoveSpu } from '@/api/product/spu'
import SpuForm from './spuForm.vue'
import SkuForm from './skuForm.vue'
//引入分类的仓库
import useCategoryStore from '@/store/modules/category'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount } from 'vue'
let categoryStore = useCategoryStore()
//场景的数据
let scene = ref<number>(0) //0显示已有的SPU; 1添加或修改已有SPU; 2添加SKU场景
let pageNo = ref<number>(1)
let pageSize = ref<number>(3)
let records = ref<Records>([])
let total = ref<number>(0)
//获取子组件实例Spuform
let spu = ref<any>()
let sku = ref<any>()
//存储全部的SKU数据
let skuArr = ref<SkuData[]>([])
let show = ref<boolean>(false);
//监听三级分类ID的变化
watch(
  () => categoryStore.c3Id,
  () => {
    //务必保证有三级分类ID
    if (!categoryStore.c3Id) return
    getHasSpu()
  },
)

//此方法执行可以获取某一个三级分类下全部的SPU
const getHasSpu = async (pager = 1) => {
  pageNo.value = pager
  let result: HasSpuResponseData = await reqHasSpu(
    pageNo.value,
    pageSize.value,
    categoryStore.c3Id,
  )
  console.log(result)
  if (result.code == 200) {
    records.value = result.data.records
    total.value = result.data.total
  }
}

//分页器的下拉菜单值发生变化的时候
const changeSize = () => {
  getHasSpu()
}

//点击添加新的SPU按钮的回调
const addSpu = () => {
  scene.value = 1
  spu.value.initAddSpu(categoryStore.c3Id);
}

//修改SPU的按钮的回调
const updateSpu = (row: SpuData) => {
  scene.value = 1
  //调用子组件实例的方法获取已有的完整的SPU的数据
  spu.value.initHasSpuData(row)
}

//子组件SpuForm绑定的自定义事件
const changeScene = (obj: any) => {
  scene.value = obj.flag;
  //再次获取已有的SPU
  if (obj.params == 'update') {
    getHasSpu(pageNo.value);
  } else {
    getHasSpu();
  }
}

//添加SKU按钮的回调
const addSku = (row: SpuData) => {
  scene.value = 2;

  sku.value.initSkuData(categoryStore.c1Id, categoryStore.c2Id, row);
}

//查看SKU列表的数据
const findSku = async (row: SpuData) => {
  let result: SkuInfoData = await reqSkuList((row.id as number));

  if (result.code == 200) {
    skuArr.value = result.data;
    //对话框显示出来
    show.value = true;
  }
}

const deleteSpu = async(row:SpuData)=> {
  let result:any = await reqRemoveSpu((row.id as number));

  if(result.code == 200){
    ElMessage({
      type:'success',
      message: '删除成功'
    });
    //获取剩余的SPU数据
    getHasSpu(records.value.length>1?pageNo.value:pageNo.value-1)
  } else{
    ElMessage({
      type:'error',
      message: '删除失败'
    })
  }
}

//路由组件销毁前，清空仓库关于分类的数据
onBeforeUnmount(()=>{
  categoryStore.$reset();
})
</script>

<style scoped></style>

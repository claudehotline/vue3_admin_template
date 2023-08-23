<template>
  <div>
    <!--三级分类全局组件-->
    <Category :scene="scene" />
    <el-card style="margin:10px 0px;">
      <div v-show="scene == 0">
        <el-button type="primary" icon="Plus" :disabled="categoryStore.c3Id ? false : true"
          @click="addAttr">添加属性</el-button>
        <el-table border style="margin:10px 0px;" :data="attrArr">
          <el-table-column label="序号" type="index" align="center" width="80px"></el-table-column>
          <el-table-column label="属性名称" width="120px" prop="attrName"></el-table-column>
          <el-table-column label="属性值名称">
            <template #="{ row, $index }">
              <el-tag style="margin: 5px;" v-for="(item, index) in row.attrValueList" :key="item.id">{{ item.valueName
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120px">
            <template #="{ row, $index }">
              <el-button type="primary" size="small" icon="Edit" @click="updateAttr(row)"></el-button>
              <el-popconfirm :title='`你确定删除${row.attrName}?`' width="200px" @confirm="deleteAttr(row.id)">
                <template #reference>
                  <el-button type="primary" size="small" icon="Delete"></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="scene == 1">
        <!--展示添加属性和修改属性的结构-->
        <el-form :inline="true">
          <el-form-item label="属性名称">
            <el-input placeholder="请你输入属性的名称" v-model="attrParams.attrName"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="addAttrValue" :disabled="attrParams.attrName ? false : true" type="primary" size="default"
          icon="Plus">添加属性值</el-button>
        <el-button type="primary" size="default" @click="cancel">取消</el-button>
        <el-table border style="margin:10px 0px;" :data="attrParams.attrValueList">
          <el-table-column label="序号" width="80px" type="index" align="center"></el-table-column>
          <el-table-column label="属性值的名称">
            <template #="{ row, $index }">
              <el-input :ref="(vc:any)=>inputArr[$index]=vc" v-if="row.flag" @blur="toLook(row, $index)" size="small" placeholder="请你输入属性值名称"
                v-model="row.valueName"></el-input>
              <div v-else @click="toEdit(row, $index)">{{ row.valueName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作值操作">
            <template #="{row, $index}">
              <el-button type="primary" size="small" icon="Delete" @click="attrParams.attrValueList.splice($index, 1)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" size="default" @click="save" :disabled="attrParams.attrName.length>0?true:false">保存</el-button>
        <el-button type="primary" size="default" @click="cancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, reactive, nextTick, onBeforeUnmount } from 'vue';
//引入已有属性与属性值接口
import { reqAttr, reqAddOrUpdateAttr, reqRemoveAttr } from '@/api/product/attr';
import type { AttrResponseData, Attr, AttrValue } from '@/api/product/attr/type';
//获取分类仓库
import useCategoryStore from "@/store/modules/category";
import { ElMessage } from 'element-plus';
let categoryStore = useCategoryStore();
let attrArr = ref<Attr[]>([]);
let scene = ref<number>(0); //scene==0,显示table， scene==1显示
let attrParams = reactive<Attr>({
  attrName: '',
  attrValueList: [],
  categoryId: '',
  categoryLevel: 3,

});

//准备一个数组将来存储对应的组件实例el-input
let inputArr = ref<any>([]);
// let flag = ref<boolean>(true);
watch(() => categoryStore.c3Id, async () => {
  //清空上一次请求的数据
  attrArr.value = [];
  //保证三级分类有才发请求
  if (!categoryStore.c3Id) return;
  //获取分类ID
  getAttr();
})

//获取已有的属性和属性值的方法
const getAttr = async () => {
  const { c1Id, c2Id, c3Id } = categoryStore;
  let result: AttrResponseData = await reqAttr(c1Id, c2Id, c3Id);
  if (result.code == 200) {
    attrArr.value = result.data;
  }
}

//添加属性按钮的回调
const addAttr = () => {
  //清空一下数据，再收集数据
  Object.assign(attrParams, {
    attrName: '',
    attrValueList: [],
    categoryId: categoryStore.c3Id,
    categoryLevel: 3,
  });

  scene.value = 1;
}
//table表格修改已有属性按钮的回调
const updateAttr = (row:Attr) => {
  scene.value = 1;

  Object.assign(attrParams, JSON.parse(JSON.stringify(row)));
}

const cancel = () => {
  scene.value = 0;
}

//添加属性值按钮的回调
const addAttrValue = () => {
  attrParams.attrValueList.push({
    valueName: '',
    flag: true
  });

  //获取最后的el-input组件聚焦
  nextTick(() => {
    inputArr.value[attrParams.attrValueList.length-1].focus();
  })
}

//保存按钮的回调
const save = async () => {
  let result: any = await reqAddOrUpdateAttr(attrParams);

  if (result.code == 200) {
    scene.value = 0;

    ElMessage({
      type: 'success',
      message: attrParams.id ? '修改成功' : '添加成功'
    });

    //获取全部已有的属性与属性值
    getAttr();
  } else {
    ElMessage({
      type: 'success',
      message: attrParams.id ? '修改失败' : '添加失败'
    })
  }
}

//表格input框失去焦点的回调
const toLook = (row: AttrValue, $index:number) => {
  //非法情况一
  if(row.valueName.trim()==''){
    //删除掉对应的属性值
    attrParams.attrValueList.splice($index);
    ElMessage({
      type:'error',
      message: '属性值不能为空'
    })
    return;
  }

  //非法情况二
  let repeat = attrParams.attrValueList.find((item) => {
    if(item != row){
      return item.valueName === row.valueName;
    }
  });
  if(repeat) {
    //将重复的属性值从数组中删除
    attrParams.attrValueList.splice($index);
    ElMessage({
      type: 'error',
      message: '属性值不能重复'
    })
    return;
  }

  row.flag = false;
}

const toEdit = (row: AttrValue, $index:number) => {

  row.flag = true;

  nextTick(() => {
    inputArr.value[$index].focus();
  })
  
}

//删除某一个已有的属性的方法的回调
const deleteAttr = async(attrId:number) => {
  let result:any = await reqRemoveAttr(attrId);

  if(result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
    getAttr();
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败'
    })
  }
}

onBeforeUnmount(() => {
  //清空仓库的数据
  categoryStore.$reset();
})
</script>

<style scoped></style>

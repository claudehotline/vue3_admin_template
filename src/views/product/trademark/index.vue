<template>
  <div>
    <el-card class="box-card">
      <!--卡片顶部的添加品牌按钮-->
      <el-button type="primary" @click="addTrademark" icon="Plus">
        添加品牌
      </el-button>
      <!--表格组件，用于展示已有的平台数据-->
      <!--
        table
        ---border:可以设置表格是否有竖着的边框
        table-column
        --label:某一列的标题
        --width：设置这列的宽度
        --align：设置这里的对齐方式
      -->
      <el-table style="margin: 10px 0px" border :data="trademarkArr">
        <el-table-column label="序号" width="80px" align="center" type="index"></el-table-column>
        <!--table-column:默认展示数据用div-->
        <el-table-column label="品牌名称" prop="tmName">
          <template #="{ row, $index }">
            <pre>{{ row.tmName }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="品牌LOGO" prop="logoUrl">
          <template #="{ row, $index }">
            <img :src="row.logoUrl" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
        <el-table-column label="品牌操作">
          <template #="{ row, $index }">
            <el-button type="primary" size="small" icon="Edit" @click="updateTrademark(row)"></el-button>
            <el-button type="primary" size="small" icon="Delete"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页器组件-->
      <el-pagination v-model:current-page="pageNo" v-model:page-size="limit" :page-sizes="[3, 5, 6, 9]" :background="true"
        layout="prev, pager, next, jumper, -> , total, sizes" :total="total" :page-count="9"
        @current-change="getHasTrademark" @size-change="sizeChange" />
    </el-card>
    <!--会话框组件：在添加品牌与修改已有品牌的业务时候使用结构-->
    <el-dialog v-model="dialogFormVisible" :title="trademarkParams.id?'修改品牌':'添加品牌'">
      <el-form style="width: 80%">
        <el-form-item label="品牌名称" label-width="80px">
          <el-input placeholder="请您输入品牌的名称" v-model="trademarkParams.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="80px">
          <el-upload class="avatar-uploader" action="/api/admin/product/fileUpload" :show-file-list="false"
            :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess">
            <img v-if="trademarkParams.logoUrl" :src="trademarkParams.logoUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { reqHasTrademark, reqAddOrUpdateTrademark } from '@/api/product/trademark'
import type {
  TradeMarkResponseData,
  Records,
  TradeMark,
} from '@/api/product/trademark/type'
import { ElMessage } from 'element-plus'
//当前页码
let pageNo = ref<number>(1)
let limit = ref<number>(3)
//存储已有品牌数据的总量
let total = ref<number>(0)
//存储已有品牌的数据
let trademarkArr = ref<Records>([])
//控制对话框显示与隐藏
let dialogFormVisible = ref<boolean>(false)
//定义一个收集新增品牌的数据
let trademarkParams = reactive<TradeMark>({
  tmName: '',
  logoUrl: '',
})
//获取已有品牌的接口函数
const getHasTrademark = async (pager = 1) => {
  //当前页码
  pageNo.value = pager
  let result: TradeMarkResponseData = await reqHasTrademark(
    pageNo.value,
    limit.value,
  )
  if (result.code == 200) {
    total.value = result.data.total
    trademarkArr.value = result.data.records
  }
}

//组件挂载完毕的钩子
onMounted(() => {
  getHasTrademark()
})

//分页器当前页码发生变化的时候会触发
// const changePageNo = () => {
//   //当前页码发生变化的时候再次发请求获取对应已有品牌数据展示
//   getHasTrademark();
// }

//当下拉菜单发生变化的时候会触发此方法
const sizeChange = () => {
  getHasTrademark()
}

//添加品牌按钮的回调
const addTrademark = () => {
  dialogFormVisible.value = true;
  //清空数据情况
  trademarkParams.tmName = ''
  trademarkParams.logoUrl = ''
}
//修改已有品牌的按钮的回调
//row:当前已有的品牌
const updateTrademark = (row:TradeMark) => {
  dialogFormVisible.value = true
  //展示已有品牌的数据
  // trademarkParams.tmName = row.tmName;
  // trademarkParams.logoUrl = row.logoUrl;
  // trademarkParams.id = row.id;
  //ES6语法合并对象
  Object.assign(trademarkParams, row);
}

//对话框按钮隐藏
const cancel = () => {
  dialogFormVisible.value = false
}

const confirm = async () => {

  let result: any = await reqAddOrUpdateTrademark(trademarkParams);
  //添加或修改已有品牌
  if (result.code == 200) {
    dialogFormVisible.value = false
    ElMessage({
      type: 'success',
      message: trademarkParams.id?'修改品牌成功':'添加品牌成功'
    })
    //再次发请求获取全部品牌的数据
    getHasTrademark();
  } else {
    ElMessage({
      type: 'error',
      message: trademarkParams.id?'修改品牌失败':'添加品牌失败'
    });
    dialogFormVisible.value = false;
  }
}

//上传图片组件 -> 上传图片之前触发的钩子函数
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (
    rawFile.type == 'image/png' ||
    rawFile.type == 'image/jpeg' ||
    rawFile.type == 'image/gif'
  ) {
    if (rawFile.size / 1024 / 1024 < 4) {
      return true
    } else {
      ElMessage({
        type: 'error',
        message: '上传的文件大小应小于4M',
      })
      return false;
    }
  } else {
    ElMessage({
      type: 'error',
      message: '上传的文件类型务必时PNG|JPG|GIF',
    })
    return false
  }
}

//图片上传成功的钩子
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  //response: 即为当前上传图片返回的数据
  trademarkParams.logoUrl = response.data;
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>

<template>
  <el-table
    :data="permissionArr"
    style="width:100%; margin-bottom: 20px"
    row-key="id"
    border
  >
    <el-table-column prop="name" label="名称"/>
    <el-table-column prop="code" label="权限值"/>
    <el-table-column prop="updateTime" label="修改时间"/>
    <el-table-column label="操作">
      <template #="{row, $index}">
        <el-button type="primary" @click="addPermission" size="small" :disabled="row.level==4?true:false">{{ row.level==3?'添加功能':'添加菜单' }}</el-button>
        <el-button type="primary" @click="updatePermission(row)" size="small" :disabled="row.level==1?true:false">编辑</el-button>
        <el-button type="primary" size="small" :disabled="row.level==1?true:false">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <!--添加或更新已有的数据结构-->
  <el-dialog v-model="dialogVisible" title="添加菜单">
    <el-form>
      <el-form-item label="名称">
        <el-input placeholder="请你输入菜单的名称"></el-input>
      </el-form-item>
      <el-form-item label="权限">
        <el-input placeholder="请你输入权限的数值"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="dialogVisible=false">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
//引入获取菜单请求API
import { reqAllPermission } from '@/api/acl/menu';
//返回数据的ts类型
import type { PermissionResponseData, PermissionList, Permission } from '@/api/acl/menu/type';

let permissionArr = ref<PermissionList>([]);
let dialogVisible = ref<boolean>(false);

onMounted(() => {
  getHasPermission();
})

const getHasPermission = async() => {
  let result:PermissionResponseData = await reqAllPermission();
  if(result.code==200){
    permissionArr.value = result.data;
  }
}

const addPermission = () => {
  dialogVisible.value = true;
}

const updatePermission = (row:Permission)=>{
  dialogVisible.value = true;
}
</script>

<style scoped></style>

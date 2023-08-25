<template>
  <el-card style="height:80px;">
    <el-form :inline="true" class="form">
      <el-form-item label="用户名：">
        <el-input placeholder="请你输入用户的名字"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default">搜索</el-button>
        <el-button type="primary" size="default">重置</el-button>
      </el-form-item>
    </el-form>  
  </el-card>
  <el-card style="margin: 10px 0px;">
    <el-button type="primary" size="default">添加用户</el-button>
    <el-button type="primary" size="default">批量删除</el-button>
    <el-table style="margin: 10px 0px;" border>
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column type="index" label="#" align="center"></el-table-column>
      <el-table-column label="ID" align="center"></el-table-column>
      <el-table-column label="用户名字" align="center"></el-table-column>
      <el-table-column label="用户名称" align="center"></el-table-column>
      <el-table-column label="用户角色" align="center"></el-table-column>
      <el-table-column label="创建时间" align="center"></el-table-column>
      <el-table-column label="更新时间" align="center"></el-table-column>
      <el-table-column label="操作" width="260px" align="center"></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[5, 7, 9, 11]"
      :backgroud="true" layout="prev, pager, next, jumper,->, total, sizes" :total="total" @current-change="getHasSku"
      @size-change="handler" />
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

let pageNo = ref<number>(1);
let pageSize = ref<number>(5);
let total = ref<number>(0);

</script>

<style scoped>
.form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

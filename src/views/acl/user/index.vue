<template>
  <el-card style="height: 80px">
    <el-form :inline="true" class="form">
      <el-form-item label="用户名：">
        <el-input placeholder="请你输入用户的名字" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default">搜索</el-button>
        <el-button type="primary" size="default">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin: 10px 0px">
    <el-button type="primary" size="default" @click="addUser">添加用户</el-button>
    <el-button type="primary" size="default">批量删除</el-button>
    <el-table style="margin: 10px 0px" border :data="userArr">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column type="index" label="#" align="center"></el-table-column>
      <el-table-column label="ID" align="center" prop="id"></el-table-column>
      <el-table-column label="用户名字" align="center" prop="username" show-overflow-tooltip></el-table-column>
      <el-table-column label="用户名称" align="center" prop="name" show-overflow-tooltip></el-table-column>
      <el-table-column label="用户角色" align="center" prop="roleName" show-overflow-tooltip></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip></el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="300px" align="center">
        <template #="{ row, $index }">
          <el-button type="primary" size="small" icon="User">分配角色</el-button>
          <el-button type="primary" size="small" icon="Edit" @click="updateUser(row)">编辑</el-button>
          <el-button type="primary" size="small" icon="Delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[5, 7, 9, 11]"
      :backgroud="true" layout="prev, pager, next, jumper,->, total, sizes" :total="total" @current-change="getHasUser"
      @size-change="handler" />
  </el-card>
  <!--抽屉结构：完成添加的用户账号|更新已有的用户-->
  <el-drawer v-model="drawer">
    <template #header>
      <h4>添加用户</h4>
    </template>
    <template #default>
      <el-form>
        <el-form-item label="用户姓名">
          <el-input placeholder="请输入用户的姓名" v-model="userParams.username"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input placeholder="请输入用户的昵称" v-model="userParams.name"></el-input>
        </el-form-item>
        <el-form-item label="用户密码">
          <el-input placeholder="请输入用户的密码" v-model="userParams.password"></el-input>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { reqUserInfo, reqAddOrUpdateUser } from '@/api/acl/user';
import type { UserResponseData, Records, User } from '@/api/acl/user/type';
import { ElMessage } from 'element-plus';
let pageNo = ref<number>(1)
let pageSize = ref<number>(5)
let total = ref<number>(0)
let userArr = ref<Records>([])
let drawer = ref<boolean>(false)
let userParams = reactive<User>({
  username: '',
  name: '',
  password: ''
})
onMounted(() => {
  getHasUser();
});

const getHasUser = async (pager = 1) => {

  pageNo.value = pager;

  let result: UserResponseData = await reqUserInfo(pageNo.value, pageSize.value);

  if (result.code == 200) {
    total.value = result.data.total;
    userArr.value = result.data.records;
  }
}

const handler = () => {
  getHasUser();
}

const addUser = () => {
  drawer.value = true;

  Object.assign(userParams, {
    username: '',
    name: '',
    password: ''
  })
}


const updateUser = (row: User) => {
  //抽屉显示出来
  drawer.value = true;
}

const save = async () => {
  let result = await reqAddOrUpdateUser(userParams);
  if (result.code == 200) {
    drawer.value = false;
    ElMessage({
      type: 'success',
      message: userParams.id ? '更新成功' : '添加成功'
    });
    getHasUser();
  } else {
    drawer.value = false;
    ElMessage({
      type: 'error',
      message: userParams.id ? '更新失败' : '添加失败'
    });
  }
}

const cancel = () => {
  drawer.value = false;
}
</script>

<style scoped>
.form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>

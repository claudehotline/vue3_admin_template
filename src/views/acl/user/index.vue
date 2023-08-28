<template>
  <el-card style="height: 80px">
    <el-form :inline="true" class="form">
      <el-form-item label="用户名：">
        <el-input placeholder="请你输入用户的名字" v-model="keyword"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default" :disabled="keyword?false:true" @click="search">搜索</el-button>
        <el-button type="primary" size="default" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin: 10px 0px">
    <el-button type="primary" size="default" @click="addUser">
      添加用户
    </el-button>
    <el-button type="primary" size="default" :disabled="selectIdArr.length?false:true" @click="deleteSelectUser">批量删除</el-button>
    <el-table @selection-change="selectChange" style="margin: 10px 0px" border :data="userArr">
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
          <el-button type="primary" size="small" icon="User" @click="setRole(row)">
            分配角色
          </el-button>
          <el-button type="primary" size="small" icon="Edit" @click="updateUser(row)">
            编辑
          </el-button>
          <el-popconfirm @confirm="deleteUser(row.id)" :title="`你确定要删除${row.username}？`" width="260px">
            <template #reference>
              <el-button type="primary" size="small" icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
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
      <h4>{{ userParams.id ? '更新用户' : '添加用户' }}</h4>
    </template>
    <template #default>
      <el-form :model="userParams" :rules="rules" ref="formRef">
        <el-form-item label="用户姓名" prop="username">
          <el-input placeholder="请输入用户的姓名" v-model="userParams.username"></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="name">
          <el-input placeholder="请输入用户的昵称" v-model="userParams.name"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password" v-if="!userParams.id">
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
  <!--抽屉结构：用于某一个账号进行职位分配-->
  <el-drawer v-model="drawer1">
    <template #header>
      <h4>分配角色(职位)</h4>
    </template>
    <template #default>
      <el-form :model="userParams" :rules="rules" ref="formRef">
        <el-form-item label="用户姓名" prop="username">
          <el-input placeholder="请输入用户的姓名" v-model="userParams.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="职位列表" prop="name">
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
            全选
          </el-checkbox>
          <!--显示职位的复选框-->
          <el-checkbox-group v-model="userRole" @change="handleChange">
            <el-checkbox v-for="(role, index) in allRole" :key="index" :label="role">{{ role.roleName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawer1 = false">取消</el-button>
        <el-button type="primary" @click="confirmClick">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import userLayoutSettingStore from '@/store/modules/setting'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { reqUserInfo, reqAddOrUpdateUser, reqAllRole, reqSetUserRole, reqRemoveUser, reqSelectUser } from '@/api/acl/user'
import type { UserResponseData, Records, User, AllRoleResponseData, AllRole, SetRoleData } from '@/api/acl/user/type'
import { ElMessage } from 'element-plus'
import useLayOutSettingStore from '@/store/modules/setting'
let pageNo = ref<number>(1)
let pageSize = ref<number>(5)
let total = ref<number>(0)
let userArr = ref<Records>([])
let drawer = ref<boolean>(false)
let drawer1 = ref<boolean>(false)
let allRole = ref<AllRole>([])
let userRole = ref<AllRole>([])
let userParams = reactive<User>({
  username: '',
  name: '',
  password: '',
})
let selectIdArr = ref<User[]>([]);
let formRef = ref<any>()
let keyword = ref<string>('')
let settingStore = useLayOutSettingStore();
onMounted(() => {
  getHasUser()
})

const getHasUser = async (pager = 1) => {
  pageNo.value = pager

  let result: UserResponseData = await reqUserInfo(pageNo.value, pageSize.value, keyword.value);

  if (result.code == 200) {
    total.value = result.data.total
    userArr.value = result.data.records
  }
}

const handler = () => {
  getHasUser()
}

const addUser = () => {
  drawer.value = true

  Object.assign(userParams, {
    id: 0,
    username: '',
    name: '',
    password: '',
  })

  nextTick(() => {
    formRef.value.clearValidate('username')
    formRef.value.clearValidate('name')
    formRef.value.clearValidate('password')
  })
}

const updateUser = (row: User) => {
  //抽屉显示出来
  drawer.value = true

  Object.assign(userParams, row);

  nextTick(() => {
    formRef.value.clearValidate('username')
    formRef.value.clearValidate('name')
    formRef.value.clearValidate('password')
  })
}

const save = async () => {

  await formRef.value.validate();

  let result: any = await reqAddOrUpdateUser(userParams)
  if (result.code == 200) {
    drawer.value = false
    ElMessage({
      type: 'success',
      message: userParams.id ? '更新成功' : '添加成功',
    })
    // getHasUser(userParams.id ? pageNo.value:1);
    //浏览器自动刷新一次
    window.location.reload();
  } else {
    drawer.value = false
    ElMessage({
      type: 'error',
      message: userParams.id ? '更新失败' : '添加失败',
    })
  }
}

const cancel = () => {
  drawer.value = false
}

//校验用户名字的回调函数
const validatorUsername = (rule: any, value: any, callBack: any) => {
  //用户的名字或昵称长度至少5位
  if (value.trim().length >= 5) {
    callBack();
  } else {
    callBack(new Error('用户的名字至少为5位'))
  }
}

const validatorname = (rule: any, value: any, callBack: any) => {
  //用户的名字或昵称长度至少5位
  if (value.trim().length >= 5) {
    callBack();
  } else {
    callBack(new Error('用户的昵称至少为5位'))
  }
}

const validatorPassword = (rule: any, value: any, callBack: any) => {
  //用户的名字或昵称长度至少5位
  if (value.trim().length >= 6) {
    callBack();
  } else {
    callBack(new Error('用户的密码至少为6位'))
  }
}

//表单检验的规则对象
const rules = {
  username: [{ required: true, trigger: 'blur', vilidator: validatorUsername }],
  name: [{ required: true, trigger: 'blur', vilidator: validatorname }],
  password: [{ required: true, trigger: 'blur', vilidator: validatorPassword }]
}

const setRole = async (row: User) => {

  Object.assign(userParams, row)

  let result: AllRoleResponseData = await reqAllRole((userParams.id as number));
  if (result.code == 200) {
    allRole.value = result.data.allRolesList;
    userRole.value = result.data.assignRoles;
    drawer1.value = true;
  }
}

//收集顶部复选框全选
const checkAll = ref<boolean>(false)
//设置不确定的样式
let isIndeterminate = ref<boolean>(true)
//顶部复选框的change事件
const handleCheckAllChange = (val: boolean) => {
  //val：true（全选）|false（未全选）
  userRole.value = val ? allRole.value : [];
  //不确定的样式(确定样式)
  isIndeterminate.value = false;
}
const handleChange = (value: string[]) => {
  const checkedCount = value.length
  //勾选的个数与全部的职位个数相等
  checkAll.value = checkedCount === allRole.value.length
  //不确定的样式
  isIndeterminate.value = !(checkedCount === allRole.value.length);
}

const confirmClick = async () => {
  let data: SetRoleData = {
    userId: (userParams.id as number),
    roleIdList: userRole.value.map(item => {
      return (item.id) as number
    })
  };
  //分配用户的职位
  let result: any = await reqSetUserRole(data);
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '分配职位成功'
    });
    //关闭抽屉
    drawer1.value = false;
    //获取更新完毕用户的信息，留在当前页
    getHasUser(pageNo.value);
  }

}

//删除某一个用户
const deleteUser = async (userId: number) => {
  let result: any = await reqRemoveUser(userId);
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
    getHasUser(userArr.value.length > 1 ? pageNo.value : pageNo.value - 1)
  }
}

//table复选框勾选的时候会触发的事件
const selectChange = (value: any) => {
  selectIdArr.value= value;
}

//批量删除按钮的回调
const deleteSelectUser = async() => {
  let idsList:any = selectIdArr.value.map(item => {
    return item.id;
  });
  //批量删除的请求
  let result:any = await reqSelectUser(idsList);
  if(result.code==200){
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
    getHasUser(userArr.value.length > 1 ? pageNo.value : pageNo.value - 1)
  }
}

//搜索按钮的回调
const search = () => {
  getHasUser();
  //清空关键字
  keyword.value = '';
}

const reset = () => {
  settingStore.refsh = !settingStore.refsh;
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

<template>
  <el-card>
    <el-form :inline="true" class="form">
      <el-form-item label="职位搜索">
        <el-input
          placeholder="请你输入搜索职位的关键字"
          v-model="keyword"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="default"
          :disabled="keyword ? false : true"
          @click="search"
        >
          搜索
        </el-button>
        <el-button type="primary" size="default" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin: 10px 0px">
    <el-button type="primary" size="default" icon="Plus" @click="addRole">
      添加职位
    </el-button>
    <el-table border style="margin: 10px 0px" :data="allRole">
      <el-table-column type="index" align="center" label="#"></el-table-column>
      <el-table-column align="center" label="ID" prop="id"></el-table-column>
      <el-table-column
        align="center"
        label="职位名称"
        prop="roleName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        align="center"
        label="更新时间"
        prop="updateTime"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column align="center" label="操作" width="280px">
        <template #="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            icon="User"
            @click="setPermission(row)"
          >
            分配权限
          </el-button>
          <el-button
            type="primary"
            size="small"
            icon="Edit"
            @click="updateRole(row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            :title="`你确定删除${row.roleName}?`"
            width="260px"
            @confirm="removeRole(row.id)"
          >
            <template #reference>
              <el-button type="primary" size="small" icon="Delete">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      :backgroud="true"
      layout="prev, pager, next, jumper,->, total, sizes"
      :total="total"
      @current-change="getHasRole"
      @size-change="sizeChange"
    />
  </el-card>
  <!--添加职位与更新已有的职位的结构:对话框-->
  <el-dialog
    v-model="dialogVisible"
    :title="RoleParams.id ? '更新职位' : '添加职位'"
  >
    <el-form :model="RoleParams" :rules="rules" ref="from">
      <el-form-item label="职位名称" prop="roleName">
        <el-input
          placeholder="请你输入职位的名称"
          v-model="RoleParams.roleName"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" size="default" @click="dialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" size="default" @click="save">确定</el-button>
    </template>
  </el-dialog>
  <!--抽屉组件：分配职位的菜单的权限和按钮的权限-->
  <el-drawer v-model="drawer">
    <template #header>
      <h4>分配菜单与按钮的权限</h4>
    </template>
    <template #default>
      <!--树形控件-->
      <el-tree
        :data="menuArr"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="selectArr"
        :props="defaultProps"
        ref="tree"
      />
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawer = false">取消</el-button>
        <el-button type="primary" @click="handler">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import {
  reqAllRoleList,
  reqAddOrUpdateRole,
  reqAllMenuList,
  reqSetPersmission,
  reqRemoveRole,
} from '@/api/acl/role'
import type {
  Records,
  RoleResponseData,
  RoleData,
  MenuResponseData,
  MenuList,
} from '@/api/acl/role/type'
import useLayOutSettingStore from '@/store/modules/setting'
import { ElMessage } from 'element-plus'
let pageNo = ref<number>(1)
let pageSize = ref<number>(10)
let total = ref<number>(0)
let keyword = ref<string>('')
let allRole = ref<Records>([])
let dialogVisible = ref<boolean>(false)
let form = ref<any>()
let drawer = ref<boolean>(false)
let menuArr = ref<MenuList>([])
let selectArr = ref<number[]>([])
let tree = ref<any>()
let RoleParams = reactive<RoleData>({
  roleName: '',
})
let settingStore = useLayOutSettingStore()
onMounted(() => {
  getHasRole()
})

const getHasRole = async (pager = 1) => {
  //修改当前的页码
  let result: RoleResponseData = await reqAllRoleList(
    pageNo.value,
    pageSize.value,
    keyword.value,
  )
  if (result.code == 200) {
    total.value = result.data.total
    allRole.value = result.data.records
  }
}

const sizeChange = () => {
  getHasRole()
}

const search = () => {
  getHasRole()
  keyword.value = ''
}

const reset = () => {
  settingStore.refsh = !settingStore.refsh
}

//添加职位按钮的回调
const addRole = () => {
  dialogVisible.value = true
  //清空数据
  Object.assign(RoleParams, {
    roleName: '',
    id: 0,
  })

  //清空表单上一次校验的结果
  nextTick(() => {
    form.value.clearValidate('roleName')
  })
}

const updateRole = (row: RoleData) => {
  dialogVisible.value = true

  Object.assign(RoleParams, row)
  //清空表单上一次校验的结果
  nextTick(() => {
    form.value.clearValidate('roleName')
  })
}

const validatorRoleName = (rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 2) {
    callBack()
  } else {
    callBack(new Error('职位名称至少两位'))
  }
}

//职位的相关的校验规则
const rules = {
  roleName: [
    {
      required: true,
      trigger: 'blur',
      validator: validatorRoleName,
    },
  ],
}

//确定按钮的回调
const save = async () => {
  await form.value.validate()

  let result: any = await reqAddOrUpdateRole(RoleParams)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: RoleParams.id ? '更新成功' : '添加成功',
    })
    dialogVisible.value = false
    getHasRole(RoleParams.id ? pageNo.value : 1)
  } else {
    ElMessage({
      type: 'error',
      message: RoleParams.id ? '更新失败' : '添加失败',
    })
    dialogVisible.value = false
  }
}

const setPermission = async (row: RoleData) => {
  drawer.value = true
  //收集当前要分配职位的数据
  Object.assign(RoleParams, row)
  //根据职位去获取权限的数据
  let result: MenuResponseData = await reqAllMenuList(RoleParams.id as number)
  if (result.code == 200) {
    menuArr.value = result.data
    selectArr.value = filterSelectArr(menuArr.value, [])
  }
}

const filterSelectArr = (allData: any, initArr: any) => {
  allData.forEach((item: any) => {
    if (item.select && item.level == 4) {
      initArr.push(item.id)
    }
    if (item.children && item.children.length > 0) {
      filterSelectArr(item.children, initArr)
    }
  })

  return initArr
}

//树形控件测试数据
const defaultProps = {
  children: 'children',
  label: 'name',
}

const handler = async () => {
  const roleId = RoleParams.id as number
  let arr = tree.value.getCheckedKeys()
  let arr1 = tree.value.getHalfCheckedKeys()
  let permissionId = arr.concat(arr1)
  let result: any = await reqSetPersmission(roleId, permissionId)
  if (result.code == 200) {
    drawer.value = false

    ElMessage({
      type: 'success',
      message: '分配权限成功',
    })

    window.location.reload()
  }
}

const removeRole = async (id: number) => {
  let result: any = await reqRemoveRole(id)
  if (result.code == 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    getHasRole(allRole.value.length > 1 ? pageNo.value : pageNo.value - 1)
  }
}
</script>

<style scoped lang="scss">
.form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}
</style>

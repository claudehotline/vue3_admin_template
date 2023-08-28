//用户管理模块的接口
import request from '@/utils/request'
import type {
  UserResponseData,
  User,
  AllRoleResponseData,
  SetRoleData,
} from './type'
//枚举地址
enum API {
  //获取全部已有用户账号信息
  ALLUSER_URL = '/admin/acl/user/',
  //添加一个新的用户的账号
  ADDUSER_URL = '/admin/acl/user/save/',
  //更新已有用户的账号
  UPDATEUSER_URL = '/admin/acl/user/update/',
  //获取全部职位，以及当前账号拥有的职位接口
  ALLROLE_URL = '/admin/acl/user/toAssign/',
  //给已有的用于分配相应角色的接口
  SETROLE_URL = '/admin/acl/user/doAssignRole',
  //删除某一个账号
  DELETEUSER_URL = '/admin/acl/user/remove/',
  //批量删除的接口
  DELETEALLUSER_URL = '/admin/acl/user/batchRemove',
}
//获取用户信息账号信息的接口方法
export const reqUserInfo = (page: number, limit: number, username: string) =>
  request.get<any, UserResponseData>(
    API.ALLUSER_URL + `${page}/${limit}/?username=${username}`,
  )
//添加用户与更新已有用的接口
export const reqAddOrUpdateUser = (data: User) => {
  if (data.id) {
    return request.put<any, any>(API.UPDATEUSER_URL, data)
  } else {
    return request.post<any, any>(API.ADDUSER_URL, data)
  }
}
//获取全部职位以及包含当前用户的已有的职位
export const reqAllRole = (userId: number) =>
  request.get<any, AllRoleResponseData>(API.ALLROLE_URL + userId)
//分配职务
export const reqSetUserRole = (data: SetRoleData) =>
  request.post<any, any>(API.SETROLE_URL, data)
//删除某一个账号的信息
export const reqRemoveUser = (userId: number) =>
  request.delete<any, any>(API.DELETEUSER_URL + userId)
//批量删除的接口
export const reqSelectUser = (idList: number[]) =>
  request.delete(API.DELETEALLUSER_URL, { data: idList })

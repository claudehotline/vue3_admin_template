//用户管理模块的接口
import request from '@/utils/request'
//枚举地址
enum API {
  //获取全部已有用户账号信息
  ALLUSER_URL = 'admin/acl/user/',
}
//获取用户信息账号信息的接口方法
export const reqUserInfo = (page: number, limit: number) =>
  request.get(API.ALLUSER_URL + `${page}/${limit}`)

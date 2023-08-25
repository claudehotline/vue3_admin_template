//账号信息的ts类型
export interface ResponseData{
    code: number,
    message: string,
    ok: boolean
}

//代表一个账号信息的ts类型
export interface User{
    id?: number,
    createTime: string,
    updateTime: string,
    username: string,
    password: string,
    name: string,
    phone: null,
    roleName: string
}
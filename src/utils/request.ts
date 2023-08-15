//进行axiso二次封装:使用请求和相应拦截器
import axios from "axios";
import { ElMessage } from "element-plus";
import useUserStore from '@/store/modules/user';
//利用axios对象create方法，去创建axios实例
let request = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 5000//超时的时间设置
});
//第二部：request实例添加请求与响应拦截器
request.interceptors.request.use((config) => {
    let userStore = useUserStore();
    if(userStore.token){
        config.headers.token = userStore.token;
    }
    //config配置对象，header属性请求头
    //返回配置对象
    return config;
})

//第三步：响应拦截器
request.interceptors.response.use((response) => {
    //简化数据
    return response.data;
}, (error) => {
    //失败的回调:处理http网络错误的
    //定义一个变量：存储网络错误信息
    let message = '';
    let status = error.response.status;
    switch(status) {
        case 401:
            message = "TOKEN过期";
            break;
        case 403:
            message = "无权访问";
            break;
        case 404:
            message = "请求地址错误";
            break;
        case 500:
            message = "服务器出现问题";
            break;
        default:
            message = "网络出现问题";
            break;
    }
    ElMessage({
        type:"error",
        message
    });
    return Promise.reject(error);
});

export default request;
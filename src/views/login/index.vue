<template>
    <div class="login_container">
        <el-row>
            <el-col :span="12" :xs="0"></el-col>
            <el-col :span="12" :xs="24">
                <el-form class="login_form" :model="loginForm" :rules="rules" ref="loginForms">
                    <h1>Hello</h1>
                    <h2>欢迎来到硅谷甄选</h2>
                    <el-form-item prop="username">
                        <el-input :prefix-icon="User" v-model="loginForm.username"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input type="password" :prefix-icon="Lock" v-model="loginForm.password" show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="loading" class="login_btn" type="primary" size="default"
                            @click="login">登录</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue';
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElNotification } from 'element-plus';
import { getTime } from '@/utils/time';
//引入用户相关的小仓库
import useUserStore from '@/store/modules/user';
let useStore = useUserStore();
let $router = useRouter();
let $route = useRoute();
let loginForms = ref();
let loading = ref(false);
//收集账号与密码的数据
let loginForm = reactive({
    username: 'admin',
    password: '111111'
})

//登录按钮的回调
const login = async () => {
    //保证表单校验通过
    await loginForms.value.validate();

    loading.value = true;
    //通知仓库发登录请求
    //请求成功->首页展示数据的地方
    //请求失败->弹出登录失败的信息
    try {
        //可以书写.then写法
        await useStore.userLogin(loginForm);

        //编程式导航跳转到首页
        //判断登录的时候，路由路径当中是否有query参数，如果没有就挑战到首页
        let redirect:any = $route.query.redirect;
        $router.push({path:redirect||'/'});
        //登录成功的提示
        ElNotification({
            message: '登录成功',
            type: 'success',
            title: `HI, ${getTime()}好！`
        });
        loading.value = false;
    } catch (error) {
        loading.value = false;
        //登录失败的提示
        ElNotification({
            message: '登录失败',
            type: (error as Error).message
        })
    }

}

//自定义校验规则函数
const validatorUserName = (rule: any, value: any, callback: any) => {
  //rule:即为校验规则对象
  //value:即为表单元素文本内容
  //函数:如果符合条件callBack放行通过即为
  //如果不符合条件callBack方法,注入错误提示信息
  if (value.length >= 5) {
    callback();
  } else {
    callback(new Error('账号长度至少五位'));
  }
}

const validatorPassword = (rule: any, value: any, callback: any) => {
  if (value.length >= 6) {
    callback();
  } else {
    callback(new Error('密码长度至少六位'));
  }
}

//定义表单校验需要配置对象
const rules = {
    // username: [
    //     // { required: true, message: '用户名不能为空', trigger: 'blur' },
    //     { required: true, min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'change' }
    // ],
    // password: [
    //     // { required: true, message: '密码不能为空', trigger: 'blur' },
    //     { required: true, min: 6, max: 15, message: '长度在 6 到 10 个字符', trigger: 'change' }
    // ]

    username: [
    // { required: true, min: 6, max: 10, message: '账号长度至少六位', trigger: 'change' }
    { trigger: 'change', validator: validatorUserName }
  ],
  password: [
    // { required: true, min: 6, max: 15, message: '密码长度至少6位', trigger: 'change' }
    { trigger: 'change', validator: validatorPassword }
  ]
}
</script>

<style scoped lang="scss">
.login_container {
    width: 100%;
    height: 100vh;
    background: url('@/assets/images/background.jpg') no-repeat;
    background-size: cover;

    .login_form {
        position: relative;
        width: 80%;
        top: 30vh;
        background: url('@/assets/images/login_form.png') no-repeat;
        background-size: cover;
        padding: 40px;

        h1 {
            color: white;
            font-size: 40px;
        }

        h2 {
            font-size: 20px;
            color: white;
            margin: 20px 0px;
        }

        .login_btn {
            width: 100%;
        }
    }
}
</style>
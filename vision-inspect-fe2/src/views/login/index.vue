<template>
  <div class="login-container">
    <div class="center-group">
      <el-form
        :model="loginData"
        status-icon
        ref="ruleForm"
        label-position="left"
        label-width="60px"
        class="login-form-group"
        @submit.native.prevent="submitForm('ruleForm')"
      >
        <el-form-item label-width="0">
          <div class="login-title">
            <span style="color:#e50012">SANY</span>
            现场管理审核平台
          </div>
        </el-form-item>
        <el-form-item prop="username" label-width="0">
          <el-input v-model="loginData.username" placeholder="请输入账号">
            <i slot="prefix" class="el-input__icon el-icon-user"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" style="min-height:60px" label-width="0">
          <el-input
            type="password"
            v-model="loginData.password"
            auto-complete="off"
            show-password
            placeholder="请输入密码"
          >
            <i slot="prefix" class="el-input__icon el-icon-lock"></i>
          </el-input>
          <div class="forget-password" @click="forgetPassword">忘记密码？</div>
        </el-form-item>

        <el-form-item label-width="0">
          <el-button :loading="showLoading" native-type="submit" class="login-button">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      showLoading: false,
      loginData: {
        password: "",
        username: ""
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.login();
        } else {
          return false;
        }
      });
    },

    goHome() {
      this.$router.push("/home");
    },
    login() {
      this.showLoading = true;
      setTimeout(() => {
        this.showLoading = false;
        this.goHome();
      }, 1000);
    },
    forgetPassword(){
      this.$message('请联系管理员！');
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  position: absolute;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: url('../../assets/img/login_bg.png');
  background-size: 100%;
  background-repeat: no-repeat;
}
.center-group {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 16%;
  width: 28%;
  height: 50%;
  margin: auto;
  background: url("../../assets/img/login_form_group_bg.png");
  background-size: 100%;
  background-repeat: no-repeat;
}
.login-form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  align-items: center;
}
.el-form-item {
  position: relative;
  width: 100%;
}
.forget-password {
  cursor: pointer;
  position: absolute;
  color: #eee;
  right: 15%;
}
.login-title {
  font-size: 24px;
  width: 100%;
  padding-bottom: 10px;
  text-align: center;
  color: #fff;
}
.el-input {
  width: 70%;
  margin-left: 15%;
}
.login-button {
  background: #e50012;
  border: none;
  width: 70%;
  margin-left: 15%;
  font-size: 16px;
  color: #fff;
  &:hover {
    opacity: 0.8;
  }
}
</style>
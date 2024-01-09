<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="register-title">注册</h2>
      <form @submit.prevent="register" class="register-form">
        <label for="username">用户名:</label>
        <input v-model="username" type="text" id="username" required />
        <br />
        <label for="password">密码:</label>
        <input v-model="password" type="password" id="password" required />
        <br />
        <label for="confirmPassword">确认密码:</label>
        <input v-model="confirmPassword" type="password" id="confirmPassword" required />
        <br />
        <label for="nickname">昵称:</label>
        <input v-model="nickname" type="text" id="nickname" required />
        <br />
        <label for="phone">手机号:</label>
        <input v-model="phone" type="text" id="phone" required />
        <br />
        <label for="phone">邮箱:</label>
        <input v-model="email" type="text" id="email" required />
        <br />
        <div>
          <label>
            <input type="radio" v-model="role" value="teacher" /> 老师
          </label>
        </div>
        <div>
          <label>
            <input type="radio" v-model="role" value="parent" /> 家长
          </label>
        </div>

        <button type="submit" class="register-button">注册</button>
      </form>
      <p class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      phone: '',
      isTeacher: false,
      isParents:false,
      role:'',
      email:''
    };
  },
  methods: {
    async register() {
      try {
        // 检查密码和确认密码是否一致
        if (this.password !== this.confirmPassword) {
          alert('密码和确认密码不一致');
          return;
        }

        const response1 = await axios.get('http://localhost:8080/queryByUsername/'+this.username, {
          withCredentials: true,
        });

        console.log(response1)

        if(response1.data.info.result!=='success'){
          alert("用户名不得重复");
          return;
        }

        if(this.role==='teacher'){
          const response1 = await axios.post('http://localhost:8080/requestRegist', {
            username: this.username,
            password: this.password,
            nickname: this.nickname,
            email:this.email,
            phone: this.phone,
          });

          // 处理注册成功的情况
          if (response1.data.code === '100' && response1.data.info.result === 'success') {
            alert('教师注册成功，等待审核通过');
            // 可以在这里跳转到登录页，或者根据实际情况处理
            this.$router.push('/login');
          } else {
            console.log(response1)
            // 处理注册失败的情况
            console.error('注册失败:', response1.data.msg);
            alert('注册失败，请检查输入信息');
          }
          return;
        }

        // 发送注册请求
        const response = await axios.post('http://localhost:8080/addUser', {
          username: this.username,
          password: this.password,
          nickname: this.nickname,
          email:this.email,
          phone: this.phone,
          roleId:2
        });

        // 处理注册成功的情况
        if (response.data.code === '100' && response.data.info.result === 'success') {
          alert('注册成功');
          // 可以在这里跳转到登录页，或者根据实际情况处理
          this.$router.push('/login');
        } else {
          // 处理注册失败的情况
          console.error('注册失败:', response.data.msg);
          alert('注册失败，请检查输入信息');
        }
      } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请稍后重试');
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-box {
  max-width: 400px;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.register-form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
}

input {
  padding: 8px;
  margin-bottom: 16px;
}

.register-button {
  background-color: #3498db;
  color: #fff;
  padding: 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.register-button:hover {
  background-color: #2980b9;
}

.login-link {
  text-align: center;
  margin-top: 10px;
}

.login-link a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
v

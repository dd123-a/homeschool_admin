<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">登录</h2>
      <form @submit.prevent="login" class="login-form">
        <label for="username">用户名:</label>
        <input v-model="username" type="text" id="username" required />
        <br />
        <label for="password">密码:</label>
        <input v-model="password" type="password" id="password" required />
        <br />
        <button type="submit" class="login-button">登录</button>
      </form>
      <p class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
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
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:8080/login/auth', {
          username: this.username,
          password: this.password,
        },{
          withCredentials: true,
        });

        if (response.data.code === '100' && response.data.info.result === 'success') {
          const response2 = await axios.post('http://localhost:8080/login/getInfo', {
            username: this.username,
            password: this.password,
          },{
            withCredentials: true,
          });
            // 跳转到其他页面
            this.$router.push('/home');
        } else {
          console.error('登录失败:', response.data.msg);
          alert('登录失败，请检查用户名和密码');
        }
      } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请稍后重试');
      }
    },

    // 用于在其他页面获取存储的cookie值
    getStoredCookie() {
      return localStorage.getItem('myAppAccessToken');
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-box {
  max-width: 400px;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.login-form {
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

.login-button {
  background-color: #4caf50;
  color: #fff;
  padding: 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.login-button:hover {
  background-color: #45a049;
}

.register-link {
  text-align: center;
  margin-top: 10px;
}

.register-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>

<template>
  <div>
    <h1>你好，欢迎光临家校通管理系统</h1>
    <h1>2021414120219 唐闻谦 21软卓二班</h1>
    <div>
      当前的用户信息为：
      用户ID：{{this.userInfo}}
      用户角色：{{this.roleName}}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userInfo:'',
      roleName:'',
    };
  },
  mounted() {
    // 在组件挂载后先发送 POST 请求获取用户信息，再发送 GET 请求获取用户列表
    this.fetchUserInfoAndUserList();
    // this.isCreator();
  },
  methods: {
    async fetchUserInfoAndUserList() {
      try {
        // 发送 POST 请求获取用户信息
        const responseInfo = await axios.post('http://localhost:8080/login/getInfo', {}, {
          withCredentials: true,
        });

        this.userInfo=responseInfo.data.info.userPermission.userId;
        this.roleList=responseInfo.data.info.userPermission.roleId;
        this.roleName=responseInfo.data.info.userPermission.roleName;

        // 发送 GET 请求获取用户列表数据
        const responseList = await axios.get('http://localhost:8080/classNotice/list', {
          params: {
            pageNum: this.currentPage,
          },
          withCredentials: true,
        });

        console.log(responseList);

        // 根据返回的数据判断不同的情况
        if (responseList.data.code === '100') {
          // 用户列表获取成功
          this.userList = responseList.data.info.list;
          const myMap=new Map();
          for (const classInfo of this.userList) {
            const responseInfo1 = await axios.post('http://localhost:8080/class/isMember', {
              userId: parseInt(this.userInfo),
              classId: parseInt(classInfo.classId)
            }, {
              withCredentials: true,
            });
            // 将classId和对应的isMember状态存入Map
            myMap.set(classInfo.classId, "success" === responseInfo1.data.info.result);
          }
          this.classIdToIsMemberMap=myMap;
          // this.currentPage=1;
          console.log(responseList);
        } else {
          // 权限不足或其他错误情况
          this.errorCode = responseList.data.code;
          this.errorMessage = responseList.data.msg;
        }
      } catch (error) {
        // 发生网络请求或其他错误
        console.error('Error fetching user info and list:', error);
      }
    },
  },
};
</script>

<style>
/* 可以保留空的 <style> 部分，或者直接删除 */
</style>

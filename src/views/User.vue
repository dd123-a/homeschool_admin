<template>
  <div>
    <!-- 根据不同情况显示不同内容 -->
    <p v-if="errorCode === '502'">{{ errorMessage }}</p>
    <p v-else-if="userList.length === 0">No users available.</p>

    <!-- el-table 只有在 userList 不为空时才渲染 -->
    <el-table
      v-if="userList.length > 0"
      :data="filteredUserList"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="userId"
        label="编号"
      ></el-table-column>
      <el-table-column
        prop="username"
        label="用户名"
      ></el-table-column>
      <el-table-column
        prop="phone"
        label="手机号"
      ></el-table-column>
      <el-table-column
        prop="nickname"
        label="昵称"
      ></el-table-column>
      <el-table-column
        prop="roleName"
        label="用户权限"
      ></el-table-column>
      <el-table-column
        prop="deleteStatus"
        label="删除状态"
      ></el-table-column>

      <el-table-column
        fixed="right"
      >
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="search"
            size="mini"
            placeholder="输入关键字搜索"
          />
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleConfirmDelete(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="userList.length !== 0">
      <!-- 上一页按钮 -->
      <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
      <!-- 当前页和总页数显示 -->
      <span>当前页：{{ currentPage }}</span>
      <!-- 下一页按钮 -->
      <el-button @click="nextPage" :disabled="isNextPageDisabled">下一页</el-button>
      <!-- 输入页码跳转 -->
      <el-input type="number" v-model="inputPage" />
      <el-button @click="goToPage">跳转</el-button>
    </div>

    <!-- 编辑框 -->
    <el-dialog
      title="编辑用户信息"
      :visible="editDialogVisible"
      @close="handleCloseEditDialog"
    >
      <el-form :model="editedUser" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="editedUser.phone"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editedUser.nickname"></el-input>
        </el-form-item>
        <el-form-item label="用户权限">
          <el-select v-model="editedUser.roleId" placeholder="请选择用户权限">
            <!-- 这里添加下拉框选项，可以从后端获取或者硬编码在前端 -->
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="删除状态">
          <el-input v-model="editedUser.deleteStatus"></el-input>
        </el-form-item>
        <!-- 其他需要编辑的字段 -->
      </el-form>
      <el-button type="primary" @click="handleSaveEdit">保存</el-button>
    </el-dialog>

    <!-- 添加用户按钮 -->
    <el-button type="primary" @click="handleAddUser" v-if='userInfo===1'>添加用户</el-button>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible="addDialogVisible"
      @close="handleCloseAddDialog"
    >
      <el-form :model="newUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="newUser.username"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="newUser.phone"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="newUser.nickname"></el-input>
        </el-form-item>
        <!-- 其他需要添加的字段 -->
      </el-form>
      <el-button type="primary" @click="handleSaveAdd">保存</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userList: [], // 存储用户列表数据
      errorCode: null, // 存储错误代码
      errorMessage: null, // 存储错误消息
      search: '', // 存储搜索关键字
      editDialogVisible: false, // 控制编辑框的显示与隐藏
      addDialogVisible: false, // 控制添加用户框的显示与隐藏
      editedUser: {}, // 存储正在编辑的用户信息
      roleList: [],
      newUser: {
        username: '',
        phone: '',
        nickname: '',
        deleteStatus: '1',
        password:'123'
        // 其他需要添加的字段
      }, // 存储新添加的用户信息
      currentPage: 1, // 当前页数
      pageSize: 10, // 每页显示条数
      totalPages: 100, // 总页数
      inputPage: 1, // 输入的页码
      userInfo:''
    };
  },
  computed: {
    isNextPageDisabled() {
      return this.currentPage === this.totalPages;
    },
    // 计算属性，根据搜索关键字过滤用户列表
    filteredUserList() {
      return this.userList.filter(user =>
        user.username.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  mounted() {

    // 在组件挂载后先发送 POST 请求获取用户信息，再发送 GET 请求获取用户列表
    this.fetchUserInfoAndUserList();
    this.fetchRoleList();
  },
  methods: {
    async fetchRoleList() {
      try {
        // 发送请求获取用户权限列表
        const response = await axios.get('http://localhost:8080/user/getAllRoles', {
          withCredentials: true,
        });
        console.log(response)
        // 根据返回的数据判断不同的情况
        if (response.data.code === '100') {
          // 用户权限列表获取成功
          this.roleList = response.data.info.list;
          console.log(response);
        } else {
          // 处理其他错误情况
          console.error('Error fetching role list:', response.data.msg);
        }
      } catch (error) {
        // 处理网络请求错误
        console.error('Error fetching role list:', error);
      }
    },
    async fetchUserInfoAndUserList() {
      try {
        // 发送 POST 请求获取用户信息
        const responseInfo = await axios.post('http://localhost:8080/login/getInfo', {}, {
          withCredentials: true,
        });

        this.userInfo=responseInfo.data.info.userPermission.userId

        // 从 localStorage 中获取存储的 cookie
        const myAppAccessToken = localStorage.getItem('myAppAccessToken');
        console.log(myAppAccessToken);

        // 发送 GET 请求获取用户列表数据
        const responseList = await axios.get('http://localhost:8080/user/list', {
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
    handleEdit(index, row) {
      // 处理编辑按钮点击事件
      this.editedUser = { ...row }; // 克隆用户信息，避免直接修改原始数据
      this.editDialogVisible = true; // 显示编辑框
    },
    handleCloseEditDialog() {
      // 关闭编辑框时重置编辑状态
      this.editedUser = {};
      this.editDialogVisible = false;
    },
    async handleSaveEdit() {
      // 处理保存编辑内容的逻辑
      // 发送请求保存编辑后的用户信息
      try {
        // 发送请求删除用户信息
        const response = await axios.post('http://localhost:8080/user/updateUser', this.editedUser, {
          withCredentials: true,
        });
        if (response.data.code === '100') {
          // 删除成功，可以进行其他操作，如刷新用户列表等
          console.log('User deletion successful');
          await this.fetchUserInfoAndUserList();
        } else {
          // 删除失败，处理错误信息
          console.error('User deletion failed:', response.data.msg);
        }
      } catch (error) {
        // 处理请求错误
        console.error('Error during user deletion:', error);
      }
      // 成功后关闭编辑框，并刷新用户列表等操作
      this.editDialogVisible = false;
      // 刷新用户列表等操作...
    },
    async prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
      const responseList = await axios.get('http://localhost:8080/user/list', {
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
        console.log(responseList);
      } else {
        // 权限不足或其他错误情况
        this.errorCode = responseList.data.code;
        this.errorMessage = responseList.data.msg;
      }
    },
    // 下一页按钮点击事件
    async nextPage() {
      const responseList = await axios.get('http://localhost:8080/user/list', {
        params: {
          pageNum: this.currentPage+1,
        },
        withCredentials: true,
      });

      console.log(responseList);

      // 根据返回的数据判断不同的情况
      if (responseList.data.code === '100') {
        // 用户列表获取成功
        if (responseList.data.info.list.length === 0) {
          this.totalPages = this.currentPage; // 如果下一页没有数据，将总页数设为当前页
        } else {
          this.userList = responseList.data.info.list;
          this.totalPages = this.currentPage+2; // 如果下一页有数据，增加总页数
          this.currentPage++;
        }
        console.log(responseList);
      } else {
        // 权限不足或其他错误情况
        this.errorCode = responseList.data.code;
        this.errorMessage = responseList.data.msg;
      }
    },
    // 跳转到输入的页码
    async goToPage() {
      const targetPage = parseInt(this.inputPage, 10);
      const responseList = await axios.get('http://localhost:8080/user/list', {
        params: {
          pageNum: targetPage,
        },
        withCredentials: true,
      });

      console.log(responseList);

      // 根据返回的数据判断不同的情况
      if (responseList.data.code === '100') {
        // 用户列表获取成功
        if (responseList.data.info.list.length === 0) {
          alert("没有数据");
          return
        }else {
          this.currentPage = targetPage;
          this.userList = responseList.data.info.list;
        }
      }
    },
    handleConfirmDelete(index, row) {
      // 弹出确认框
      this.$confirm('确定删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        // 用户点击确定时执行的逻辑
        this.confirmDelete(index, row);
      }).catch(() => {
        // 用户点击取消时执行的逻辑
        this.$message.info('已取消删除');
      });
    },

    // 处理确认删除的逻辑
    async confirmDelete(index, row) {
      try {
        // 发送请求删除用户信息
        const response = await axios.post('http://localhost:8080/user/updateUser', {
          userId: row.userId,
          nickname:row.nickname,
          roleId:row.roleId,
          password:row.password,
          deleteStatus:!row.deleteStatus
        },{
          withCredentials: true,
        });
        if (response.data.code === '100') {
          // 删除成功，可以进行其他操作，如刷新用户列表等
          console.log('User deletion successful');
          await this.fetchUserInfoAndUserList();
        } else {
          // 删除失败，处理错误信息
          console.error('User deletion failed:', response.data.msg);
        }
      } catch (error) {
        // 处理请求错误
        console.error('Error during user deletion:', error);
      }
    },
    handleAddUser() {
      // 添加用户按钮点击事件
      this.addDialogVisible = true; // 显示添加用户对话框
    },
    handleCloseAddDialog() {
      // 关闭添加用户对话框时重置添加用户状态
      this.newUser = {};
      this.addDialogVisible = false;
    },
    async handleSaveAdd() {
      // 处理保存添加用户内容的逻辑
      // 发送请求保存新添加的用户信息
      console.log(this.newUser)
      try{
      const response = await axios.post('http://localhost:8080/addUser', this.newUser);

      // 处理注册成功的情况
      if (response.data.code === '100' && response.data.info.result === 'success') {
        alert("添加成功");
        console.log(response)
      } else {
        // 处理注册失败的情况
        alert('添加用户失败，请检查输入信息');
      }
    } catch (error) {
      console.error('添加用户失败:', error);
      alert('添加用户失败，请稍后重试');
    }
      // 成功后关闭添加用户对话框，并刷新用户列表等操作
      await this.fetchUserInfoAndUserList();
      this.addDialogVisible = false;
      // 刷新用户列表等操作...
    },
  },
};
</script>

<style scoped>
/* 新增样式，根据需要自定义样式 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}
</style>

<template>
  <div>
    <!-- 根据不同情况显示不同内容 -->
<!--    <div v-if="isLoading">Loading...</div>-->
    <p v-if="errorCode === '502'">{{ errorMessage }}</p>
    <p v-else-if="userList.length === 0">No users available.</p>
    <el-button type="primary" @click="handleMyClass" >我的班级</el-button>

    <!-- el-table 只有在 userList 不为空时才渲染 -->
    <el-table
      v-if="userList.length > 0"
      :data="filteredUserList"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="classId"
        label="班级编号"
      ></el-table-column>
      <el-table-column
        prop="className"
        label="班级名称"
      ></el-table-column>
      <el-table-column
        prop="adviserName"
        label="老师名称"
      ></el-table-column>
      <el-table-column
        prop="classInfo"
        label="班级信息"
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
          v-if="check(scope.row.classId)"
          size="mini"
          @click="handleEdit(scope.$index, scope.row)"
        >编辑</el-button>

        <!-- 显示删除按钮 -->
        <el-button
          v-if="check(scope.row.classId)&&(String(scope.row.classAdviser)===String(userInfo))&&rowId===3"
          size="mini"
          type="danger"
          @click="handleConfirmDelete(scope.$index, scope.row)"
        >删除</el-button>

        <!-- 显示加入按钮 -->
        <el-button
          v-if="!check(scope.row.classId)"
          size="mini"
          @click="handleJoin(scope.$index, scope.row)"
        >加入</el-button>
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

    <el-dialog
      title="班级信息"
      :visible="editDialogVisible"
      @close="handleCloseEditDialog"
    >
      <!-- 编辑班级信息的表单 -->
      <el-form :model="editedUser" label-width="80px">
        <el-form-item label="班级ID">
          <el-input v-model="editedUser.classId" disabled></el-input>
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="editedUser.className" disabled></el-input>
        </el-form-item>
        <el-form-item label="老师名称">
          <el-input v-model="editedUser.adviserName" disabled></el-input>
        </el-form-item>
        <el-form-item label="班级信息">
          <el-input v-model="editedUser.classInfo" disabled></el-input>
        </el-form-item>
        <!-- 其他需要编辑的字段 -->
      </el-form>



      <!-- 显示班级成员的表格 -->
      <el-table :data="editedUser.members" border style="width: 100%">
        <el-table-column label="成员ID" prop="userId"></el-table-column>
        <el-table-column label="成员名称" prop="username"></el-table-column>
        <el-table-column label="班级ID" prop="class_id"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              @click="handleMessage(scope.row.class_id,scope.row.userId)"
            >
              消息
            </el-button>
            <el-button
              v-if=" (String(editedUser.classAdviser) !== String(scope.row.userId))&&(String(userInfo)===String(editedUser.classAdviser))&&rowId===3"
              type="danger"
              size="mini"
              @click="handleRemoveMember(scope.$index,scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 保存按钮 -->
      <el-button v-if='String(this.userInfo)!==String(this.editedUser.classAdviser)' type="primary" @click="handleSaveEdit">
        退出课程</el-button>
      <el-button v-if='rowId===3' type="primary" @click="handleSaveEdit1()">
        创建班级通知</el-button>
    </el-dialog>

    <el-dialog
      title="添加班级通知"
      :visible="addDialogVisible1"
      @close="handleCloseAddDialog"
    >
      <el-form :model="newUser" label-width="80px">
        <el-form-item label="班级ID">
          <el-input v-model="newUser.classId"></el-input>
        </el-form-item>
        <el-form-item label="作者姓名">
          <el-input v-model="newUser.classNoticeAuthor"></el-input>
        </el-form-item>
        <el-form-item label="通知标题">
          <el-input v-model="newUser.classNoticeTitle"></el-input>
        </el-form-item>
        <el-form-item label="通知主题">
          <el-input v-model="newUser.classNoticeTheme"></el-input>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input v-model="newUser.classNoticeContent"></el-input>
        </el-form-item>
        <!-- 其他需要添加的字段 -->
      </el-form>
      <el-button type="primary" @click="handleSaveAdd">保存</el-button>
    </el-dialog>


    <!-- 添加用户按钮 -->
    <el-button type="primary" @click="handleAddUser" v-if='rowId===3'>创建班级</el-button>

    <el-dialog
      title="创建班级"
      :visible="addDialogVisibleClass"
      @close="handleCloseAddDialog1"
    >
      <el-form :model="newUser" label-width="80px">
        <el-form-item label="班级名称">
          <el-input v-model="newUser.className"></el-input>
        </el-form-item>
        <el-form-item label="创建者ID">
          <el-input v-model="newUser.classAdviser"></el-input>
        </el-form-item>
        <el-form-item label="创建者名称">
          <el-input v-model="newUser.adviserName"></el-input>
        </el-form-item>
        <el-form-item label="班级消息">
          <el-input v-model="newUser.classInfo"></el-input>
        </el-form-item>
        <!-- 其他需要添加的字段 -->
      </el-form>
      <el-button type="primary" @click="handleSaveAddClass">发送</el-button>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="发送消息"
      :visible="addDialogVisible"
      @close="handleCloseAddDialog"
    >
      <el-form :model="newUser" label-width="80px">
        <el-form-item label="班级ID">
          <el-input v-model="newUser.classId"></el-input>
        </el-form-item>
        <el-form-item label="接收方">
          <el-input v-model="newUser.recipient"></el-input>
        </el-form-item>
        <el-form-item label="消息标题">
          <el-input v-model="newUser.messageTitle"></el-input>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="newUser.messageContent"></el-input>
        </el-form-item>
        <!-- 其他需要添加的字段 -->
      </el-form>
      <el-button type="primary" @click="handleSaveAddMessage">发送</el-button>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      addDialogVisibleClass:false,
      userList: [], // 存储用户列表数据
      errorCode: null, // 存储错误代码
      errorMessage: null, // 存储错误消息
      search: '', // 存储搜索关键字
      editDialogVisible: false, // 控制编辑框的显示与隐藏
      addDialogVisible: false, // 控制添加用户框的显示与隐藏
      editedUser: {}, // 存储正在编辑的用户信息
      roleList: [],
      newUser: {}, // 存储新添加的用户信息
      currentPage: 1, // 当前页数
      pageSize: 10, // 每页显示条数
      totalPages: 100, // 总页数
      inputPage: 1, // 输入的页码
      myClass:false,
      userInfo:'',
      classIdToIsMemberMap:new Map(),
      rowId:'',
      addDialogVisible1:false,
      currentClassId:''
    };
  },
  computed: {
    isNextPageDisabled() {
      return this.currentPage === this.totalPages;
    },
    // 计算属性，根据搜索关键字过滤用户列表
    filteredUserList() {
      // return this.userList.filter();
      return this.userList.filter(user =>
        user.className.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  mounted() {
    // 在组件挂载后先发送 POST 请求获取用户信息，再发送 GET 请求获取用户列表
    this.fetchUserInfoAndUserList();
    // this.isCreator();
  },
  methods: {
    async handleSaveEdit1() {
      const responseInfo = await axios.post('http://localhost:8080/login/getInfo', {}, {
        withCredentials: true,
      });
      console.log(responseInfo)
      this.newUser.classId=this.currentClassId
      this.addDialogVisible1 = true; // 显示添加用户对话框
    },
    async handleSaveAddClass() {
      // 处理保存添加用户内容的逻辑
      // 发送请求保存新添加的用户信息
      console.log(this.newUser)
      try {
        this.newUser.sender = this.userInfo
        const response = await axios.post('http://localhost:8080/requestClass', this.newUser,
          {
            withCredentials: true,
          }
        );
        console.log(response)
        // 处理注册成功的情况
        if (response.data.code === '100' && response.data.info.result === 'success') {
          alert("班级创建信息发送成功");
        } else {
          // 处理注册失败的情况
          alert('班级创建信息发送失败，请检查输入信息');
        }
      } catch (error) {
        console.error('班级创建信息发送失败:', error);
        alert('班级创建信息发送失败，请稍后重试');
      }
      // 成功后关闭添加用户对话框，并刷新用户列表等操作
      await this.fetchUserInfoAndUserList();
      this.addDialogVisibleClass = false;
      // 刷新用户列表等操作...
    },
    handleMessage(classID,userId){
      this.editDialogVisible=false
      this.newUser.classId=classID
      this.newUser.recipient=userId
      this.addDialogVisible=true
    },
    async handleRemoveMember(index, row) {
      const responseInfo1 = await axios.post('http://localhost:8080/expelMember', {
        userId: parseInt(row.userId),
        classId: parseInt(row.class_id)
      }, {
        withCredentials: true,
      });
      if (responseInfo1.data.code === '100') {
        alert("删除成员成功")
      }
    },
    check(className){
      return this.classIdToIsMemberMap.get(className)
    },

    async handleMyClass() {
      if (!this.myClass) {
        const responseInfo = await axios.post('http://localhost:8080/login/getInfo', {}, {
          withCredentials: true,
        });
        const response = await axios.get('http://localhost:8080/listMyClass/' + responseInfo.data.info.userPermission.userId, {
          withCredentials: true,
        });
        this.userList = response.data.info.list;
      } else {
        await this.fetchUserInfoAndUserList();
      }

      // 切换 this.myClass 的状态
      this.myClass = !this.myClass;
    },
    async fetchUserInfoAndUserList() {
      try {
        // 发送 POST 请求获取用户信息
        const responseInfo = await axios.post('http://localhost:8080/login/getInfo', {}, {
          withCredentials: true,
        });

        this.userInfo=responseInfo.data.info.userPermission.userId;
        this.rowId=responseInfo.data.info.userPermission.roleId;

        // 发送 GET 请求获取用户列表数据
        const responseList = await axios.get('http://localhost:8080/listClass', {
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
          console.log(this.classIdToIsMemberMap)
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
    async handleEdit(index, row) {
      // 处理编辑按钮点击事件
      this.editedUser = { ...row };
      const response=await axios.get('http://localhost:8080/listMember/'+row.classId,{
        withCredentials: true,
      });
      this.currentClassId=row.classId
      this.editedUser.members=response.data.info.list;
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
        // 确保 this.editedUser 存在
        if (this.editedUser) {
          console.log(this.editedUser)
          // 将 userId 转换为整数
          this.editedUser.userId = parseInt(this.userInfo, 10);

          // 将 classId 转换为整数
          this.editedUser.classId = parseInt(this.editedUser.classId, 10);
        }
        const response = await axios.post('http://localhost:8080/exitClass', this.editedUser, {
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
      const responseList = await axios.get('http://localhost:8080/listClass', {
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
        console.log(responseList);
      } else {
        // 权限不足或其他错误情况
        this.errorCode = responseList.data.code;
        this.errorMessage = responseList.data.msg;
      }
    },
    // 下一页按钮点击事件
    async nextPage() {
      const responseList = await axios.get('http://localhost:8080/listClass', {
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
      const responseList = await axios.get('http://localhost:8080/listClass', {
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
        }
      }
    },
    handleConfirmDelete(index, row) {
      // 弹出确认框
      this.$confirm('确定删除该班级吗？', '提示', {
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

    async handleJoin(index, row) {
      const response = await axios.post('http://localhost:8080/join/isDuplicate', {
        memberId:this.userInfo,
        classAdviser:row.classAdviser,
        classId:row.classId
      }, {
        withCredentials: true,
      });
      console.log(response)
      if(response.data.code==='100'&&response.data.info.result==='success'){
        alert("你已申请加入班级，请勿重复操作")
        return
      }
      const responseInfo = await axios.post('http://localhost:8080/addJoin', {
        memberId:this.userInfo,
        classAdviser:row.classAdviser,
        classId:row.classId
      }, {
        withCredentials: true,
      });
      console.log(responseInfo)
      alert("申请加入班级成功，等待班级创建者审核");
    },

    // 处理确认删除的逻辑
    async confirmDelete(index, row) {
      try {
        // 发送请求删除用户信息
        const response = await axios.get('http://localhost:8080/deleteClass/'+row.classId, {
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
    async handleAddUser() {
      // 添加用户按钮点击事件
      const responseInfo = await axios.post('http://localhost:8080/login/getInfo', {}, {
        withCredentials: true,
      });
      console.log(responseInfo)
      this.newUser.classAdviser = responseInfo.data.info.userPermission.userId;
      this.newUser.adviserName = responseInfo.data.info.userPermission.username;
      this.addDialogVisibleClass = true; // 显示添加用户对话框
    },
    handleCloseAddDialog() {
      // 关闭添加用户对话框时重置添加用户状态
      this.newUser = {};
      this.addDialogVisible1 = false;
    },
    handleCloseAddDialog1(){
      this.newUser = {};
      this.addDialogVisible = false;
    },
    async handleSaveAddMessage() {
      console.log(this.newUser)
      try {
        this.newUser.sender = this.userInfo
        const response = await axios.post('http://localhost:8080/sendMessage', this.newUser,
          {
            withCredentials: true,
          }
        );
        console.log(response)
        // 处理注册成功的情况
        if (response.data.code === '100' && response.data.info.result === 'success') {
          alert("发送信息成功");
        } else {
          // 处理注册失败的情况
          alert('发送信息失败，请检查输入信息');
        }
      } catch (error) {
        console.error('发送信息失败:', error);
        alert('发送信息，请稍后重试');
      }
      // 成功后关闭添加用户对话框，并刷新用户列表等操作
      await this.fetchUserInfoAndUserList();
      this.addDialogVisible = false;
    },
    async handleSaveAdd() {
      // 处理保存添加用户内容的逻辑
      // 发送请求保存新添加的用户信息
      // 处理保存添加用户内容的逻辑
      // 发送请求保存新添加的用户信息
      console.log(this.newUser)
      try{
        const response = await axios.post('http://localhost:8080/classNotice/addClassNotice', this.newUser,
          {
            withCredentials: true,
          }
        );
        console.log(response)
        // 处理注册成功的情况
        if (response.data.code === '100' && response.data.info.result === 'success') {
          alert("添加班级通知成功");
        } else {
          // 处理注册失败的情况
          alert('添加班级通知失败，请检查输入信息');
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

import Mock from 'mockjs';
import homeApi from './mockServerData/home';

Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
Mock.XHR.prototype.send = function () {
  if (this.custom.xhr) {
    this.custom.xhr.withCredentials = this.withCredentials || false
  }
  this.proxy_send(...arguments)
}
//定义mock请求拦截
Mock.mock('/api/home/getData', 'get', homeApi.getStatisticalData);

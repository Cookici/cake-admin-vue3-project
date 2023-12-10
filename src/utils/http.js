import axios from "axios";
import {message} from "@/utils/resetMessage.js";
import router from "@/router/index";
import qs from 'qs'


const http = axios.create({
    timeout: 1000 *30,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
})


// 添加拦截器
http.interceptors.request.use(config => {
    config.headers['Authorization'] = localStorage.getItem("token")
    return config
}, error => {
    return Promise.reject(error)
})


http.interceptors.response.use(response => {
    return response
}, error => {

    if (error.response.data.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        message.error("登录过期,请重新登录")
        router.push({path: '/login'})
    }

    if (error.response.data.code === 403) {
        message.error("无权操作")
    }

    return Promise.reject(error)
})


/**
 * get请求参数处理
 * @param {*} params 参数对象
 */
http.adornParams = (params = {}) => {
    return params
}

/**
 * post请求数据处理
 * @param {*} data 数据对象
 * @param {*} openDefaultData 是否开启默认数据?
 * @param {*} contentType 数据格式
 *  json: 'application/json; charset=utf-8'
 *  form: 'application/x-www-form-urlencoded; charset=utf-8'
 */
http.adornData = (data = {}, contentType = 'json') => {
    return contentType === 'json' ? JSON.stringify(data) : qs.stringify(data,{charset:"utf-8",arrayFormat: "repeat"})
}

export default http
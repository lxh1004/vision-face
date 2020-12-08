/**
 * ajax tool functions
 * @author duanj
 */

import axios from 'axios';
// import Qs from 'qs'
axios.defaults.withCredentials = true;

export function request({method, url, data}) {
	let config = {method, url};
	if (method === 'get') {
		config.params = data;
	}
	else {
		config.data = data;
	}
	return axios.request(config)
		.then(response => {
			if (response.data) {
				if (response.data.e === 0) {
					return response.data.data;
				}else if(response.data.success){
					return response.data.data
				}
				if (response.data.msg) {
					throw new Error(response.data.msg);
				}
			}
			throw new Error('发生未知错误，请稍后再试。');
		});
}

export function get(url, data = {}) {
	return request({method: 'get', url, data});
}

export function post(url, data = {}) {
	return request({method: 'post', url, data});
}

export function put(url, data = {}) {
	return request({method: 'put', url, data});
}

export function del(url, data = {}) {
	return request({method: 'delete', url, data});
}

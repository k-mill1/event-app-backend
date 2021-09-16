import axios from "axios";
const url = "http://localhost:3002/";

export class ApiClient {
  constructor(tokenProvider, logoutHandler) {
    this.tokenProvider = tokenProvider
    this.logoutHandler = logoutHandler
  }

  apiCall(method, url, data) {
    return axios({
      method,
      url,
      headers: {
        authorization: this.tokenProvider()
      },
      data,
    }).catch((error) => {
      if(error.response.status === 403) {
        this.logoutHandler()
        return Promise.reject()
      } else {
        throw error;
      }  
    });
  }

  getEvents() {
    return this.apiCall("get", url);
  }

  getByLocation(location) {
    return this.apiCall("get", `${url}${location}`) ;
  }

  getByName(name) {
    return this.apiCall("get", `${url}name/${name}`) ;
  }

  addEvent(name, location, information, date) {
    return this.apiCall("post", url, { name, location, information, date });
  }

  removeEvent(id) {
    return this.apiCall("delete", `${url}${id}`);
  }

  updateEvent(id, name, location, information, date) {
    return this.apiCall("put", `${url}${id}`, { name, location, information, date }) ;
  }

  async login(username, password) {
    return await axios({
      method: 'post',
      url: `${url}auth`,
      data: {
        username,
        password,
      }
    })
  }

}

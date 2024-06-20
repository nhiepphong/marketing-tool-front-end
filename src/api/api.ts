class Api {
  static async get(url: string = "", params = {}, jwt: string = "") {
    var raw = JSON.stringify(params);
    const config: any = {
      method: "GET",
      headers: await this.getHeaders(jwt),
    };
    if (raw != "{}") {
      config.body = raw;
    }

    const response = await fetch(url, config);
    const data: any = await response.json();

    return {
      data: data,
      status: response.status,
      message: response.statusText,
    };
  }

  static async post(url: string = "", params = {}, jwt: string = "") {
    var raw = JSON.stringify(params);
    const config: any = {
      method: "POST",
      headers: await this.getHeaders(jwt),
    };
    if (raw != "{}") {
      config.body = raw;
    }
    const response = await fetch(url, config);
    const data: any = await response.json();
    return {
      data: data,
      status: response.status,
      message: response.statusText,
    };
  }

  // to be updated
  static async update(url: string = "", params = {}, jwt: string = "") {
    var raw = JSON.stringify(params);

    const config: any = {
      method: "PUT",
      headers: await this.getHeaders(jwt),
    };
    if (raw != "{}") {
      config.body = raw;
    }

    const response: any = await fetch(url, config);

    const data = await response.json();
    return {
      data: data,
      status: response.status,
      message: response.statusText,
    };
  }

  // to be delete
  static async delete() {
    // do nothing.
  }

  static async getHeaders(jwt: string = "") {
    if (jwt) {
      return {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: "Bearer " + jwt,
      };
    } else {
      return {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: "Bearer " + process.env.REACT_APP_API_KEY,
      };
    }
  }
}

export default Api;

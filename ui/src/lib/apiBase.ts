import axios from "axios";

let APIUrl;

if (process.env.NODE_ENV === "production") {
  // production api
  APIUrl = "";
} else {
  // development api
  APIUrl = "http://localhost:8000/";
}

const AXIOS_BASE = axios.create({
  baseURL: APIUrl,
  withCredentials: true,
});

export default AXIOS_BASE;

import axios from "axios";

const axiosInstance = axios.create({
  //   baseURL: "https://cricket-scoring-system.onrender.com/api",
  baseURL: "http://localhost:5000/api",
});

export default axiosInstance;

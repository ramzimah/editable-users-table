import { api } from "../config/api";

export const getUsers = async () => {
  try {
    const response = await api.get("/api/v1/users");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch users: " + error.message);
  }
};

export const addUser = async (user) => {
  try {
    const response = await api.post("/api/v1/users", user);
    console.log("response", response);
    return response.data;
  } catch (error) {
    throw new Error("Failed to add user: " + error.message);
  }
};

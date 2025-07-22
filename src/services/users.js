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
    return response.data;
  } catch (error) {
    throw new Error("Failed to add user: " + error.message);
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/v1/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete user: " + error.message);
  }
};

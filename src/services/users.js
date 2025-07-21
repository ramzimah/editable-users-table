import { api } from "../config/api";
export const getUsers = async () => {
  try {
    const response = await api.get("/api/v1/users");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch users: " + error.message);
  }
};

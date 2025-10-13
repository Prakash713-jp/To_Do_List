import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL;

  // Debug: Log API URL on mount
  useEffect(() => {
    console.log("=================================");
    console.log("🔗 API_URL:", API_URL);
    console.log("=================================");
    
    if (!API_URL) {
      console.error("❌ VITE_API_URL is not defined! Check your .env file");
    }
  }, []);

  // Load auth data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        console.log("✅ User loaded from localStorage");
      } catch (err) {
        console.error("❌ Error loading user:", err);
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  // Fetch tasks when token is available
  useEffect(() => {
    if (token) {
      console.log("🔑 Token found, fetching tasks...");
      fetchTasks();
    }
  }, [token]);

  // GET - Fetch all tasks
  const fetchTasks = async () => {
    try {
      console.log(`📡 GET ${API_URL}/tasks`);
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Tasks fetched: ${res.data.length} tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch tasks");
      console.error("Status:", err.response?.status);
      console.error("Message:", err.response?.data?.message || err.message);
    }
  };

  // POST - Add new task
  const addTask = async (taskData) => {
    try {
      console.log(`📡 POST ${API_URL}/tasks`);
      const res = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Task added successfully");
      setTasks((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("❌ Failed to add task");
      console.error("Status:", err.response?.status);
      console.error("Message:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // PUT - Update task
  const updateTask = async (id, updates) => {
    try {
      console.log(`📡 PUT ${API_URL}/tasks/${id}`);
      const res = await axios.put(`${API_URL}/tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Task updated successfully");
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? res.data : task))
      );
      return res.data;
    } catch (err) {
      console.error("❌ Failed to update task");
      console.error("Status:", err.response?.status);
      console.error("Message:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // DELETE - Remove task
  const deleteTask = async (id) => {
    try {
      console.log(`📡 DELETE ${API_URL}/tasks/${id}`);
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Task deleted successfully");
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete task");
      console.error("Status:", err.response?.status);
      console.error("Message:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Login
  const login = (userData, jwtToken) => {
    console.log("🔐 Logging in user:", userData.username);
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  // Logout
  const logout = () => {
    console.log("👋 Logging out");
    setUser(null);
    setToken(null);
    setTasks([]);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tasks,
        loading,
        login,
        logout,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
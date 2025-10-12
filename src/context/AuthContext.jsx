import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
 const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL:", API_URL);


  // ✅ Load auth data from localStorage on mount
 // ✅ Load auth data from localStorage on mount
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  if (storedUser && storedToken) {
    setUser(JSON.parse(storedUser));
    setToken(storedToken);
  }

  setLoading(false); // ✅ Immediately stop loading
}, []);


  // ✅ Fetch tasks when token is available
  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // ✅ CRUD TASK METHODS
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch tasks", err);
    }
  };

  const addTask = async (taskData) => {
    try {
      const res = await axios.post(`${API_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("❌ Failed to add task", err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? res.data : task))
      );
    } catch (err) {
      console.error("❌ Failed to update task", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete task", err);
    }
  };

  // ✅ AUTH METHODS
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTasks([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ CONTEXT PROVIDER
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

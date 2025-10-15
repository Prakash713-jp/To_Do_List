import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ NEW STATE FOR HISTORY
    const [history, setHistory] = useState([]);

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
            // ✅ NEW: Fetch history when token is available
            fetchHistory();
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

    // ----------------------------------------------------
    // ✅ HISTORY FUNCTIONS (UPDATED recordHistoryAction)
    // ----------------------------------------------------

    // POST - Record a history action (completed or deleted)
    // taskDetails contains the full task object (title, priority, category, etc.)
    const recordHistoryAction = async (taskDetails, actionType) => {
        try {
            // 💥 CRITICAL UPDATE: Construct history record to match backend History Schema's taskSnapshot
            const historyData = {
                action: actionType, // "COMPLETED", "DELETED", etc.
                taskSnapshot: {
                    title: taskDetails.title,
                    description: taskDetails.description || 'No description provided.',
                    category: taskDetails.category || 'N/A',
                    priority: taskDetails.priority || 'N/A',
                    originalCreatedAt: taskDetails.createdAt, // Use the original task creation date
                },
                // Add action-specific timestamps for the backend controller to log
                completedAt: actionType === 'COMPLETED' ? new Date().toISOString() : undefined,
                deletedAt: actionType === 'DELETED' ? new Date().toISOString() : undefined,
                updatedAt: (actionType === 'UPDATED' || actionType === 'PENDING') ? new Date().toISOString() : undefined,
            };

            console.log(`📡 POST ${API_URL}/history (${actionType})`);
            
            // NOTE: The `history.routes.js` POST route calls `createHistoryRecord`
            const res = await axios.post(`${API_URL}/history`, historyData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            console.log("✅ History record added successfully");

            // Update local history state
            setHistory((prev) => [res.data, ...prev]);

            return res.data;
        } catch (err) {
            console.error(`❌ Failed to record history (${actionType})`);
            console.error("Status:", err.response?.status);
            console.error("Message:", err.response?.data?.message || err.message);
            // Do not throw an error here, as the task operation should continue
        }
    };

    // GET - Fetch all history records
    const fetchHistory = async () => {
        try {
            console.log(`📡 GET ${API_URL}/history`);
            const res = await axios.get(`${API_URL}/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`✅ History fetched: ${res.data.length} records`);
            setHistory(res.data);
            return res.data; // Return data for immediate use if needed
        } catch (err) {
            console.error("❌ Failed to fetch history");
            console.error("Status:", err.response?.status);
            console.error("Message:", err.response?.data?.message || err.message);
            return [];
        }
    };
    
    // DELETE - Remove history record
    const deleteHistoryRecord = async (id) => {
        try {
            console.log(`📡 DELETE ${API_URL}/history/${id}`);
            await axios.delete(`${API_URL}/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("✅ History record deleted successfully from backend.");
            // Update local state: remove the deleted record
            setHistory(prev => prev.filter(record => record._id !== id));
        } catch (error) {
            console.error("Error deleting history record:", error);
            throw error; // Propagate error for the UI (toast)
        }
    };

    // ----------------------------------------------------
    // END HISTORY FUNCTIONS
    // ----------------------------------------------------

    // POST - Add new task
    const addTask = async (taskData) => {
        try {
            console.log(`📡 POST ${API_URL}/tasks`);
            const res = await axios.post(`${API_URL}/tasks`, taskData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Task added successfully");
            setTasks((prev) => [...prev, res.data]);
            
            // 💡 OPTIONAL: Record task creation history
            // await recordHistoryAction(res.data, "CREATED");

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
            
            // 💡 OPTIONAL: Record task update/pending history
            // Determine action type (UPDATED or PENDING)
            // const actionType = updates.completed === false ? "PENDING" : "UPDATED";
            // await recordHistoryAction(res.data, actionType);

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
        setHistory([]); // Clear history on logout
        localStorage.clear();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                tasks,
                history, // ✅ EXPOSE HISTORY STATE
                loading,
                login,
                logout,
                fetchTasks,
                addTask,
                updateTask,
                deleteTask,
                recordHistoryAction, // ✅ EXPOSE NEW FUNCTION
                fetchHistory, // ✅ EXPOSE NEW FUNCTION
                deleteHistoryRecord, // ✅ EXPOSE NEW FUNCTION
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
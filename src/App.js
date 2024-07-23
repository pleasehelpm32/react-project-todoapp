import "./index.css";
import React, { useState, useEffect, useRef } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState({ id: null, text: "" });
  const [selectedDay, setSelectedDay] = useState("Sunday");
  const inputRef = useRef(null);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    inputRef.current.focus();

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) {
      setTasks(savedTasks);
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return; // Prevent adding empty tasks
    const newTask = {
      id: Date.now(),
      text: input,
      completed: false,
      day: selectedDay, // Store the selected day
    };
    setTasks([...tasks, newTask]);
    setInput("");
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEdit = (task) => {
    setIsEditing(true);
    setCurrentTask(task);
  };

  const handleEditChange = (e) => {
    setCurrentTask({ ...currentTask, text: e.target.value });
  };

  const handleUpdate = () => {
    setTasks(
      tasks.map((task) =>
        task.id === currentTask.id ? { ...task, text: currentTask.text } : task
      )
    );
    setIsEditing(false);
    setCurrentTask({ id: null, text: "" });
  };

  const handleDelete = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const updatedTasks = tasks.map((task) => {
      if (task.id === parseInt(taskId)) {
        return { ...task, day: day };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const calculateDailyProgress = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const dailyTasks = tasks.filter((task) => task.day === today);
    const completedTasks = dailyTasks.filter((task) => task.completed).length;
    return dailyTasks.length === 0
      ? 0
      : (completedTasks / dailyTasks.length) * 100;
  };

  const calculateWeeklyProgress = () => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    return tasks.length === 0 ? 0 : (completedTasks / tasks.length) * 100;
  };

  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);

    const options = { weekday: "short", month: "short", day: "numeric" };

    return daysOfWeek.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date.toLocaleDateString("en-US", options);
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="app-container">
      <h1>Weekly To Do App</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Enter your task"
          ref={inputRef}
        />
        <button type="submit">Add Task</button>
      </form>
      <div className="progress-bars">
        <div className="progress-bar-container">
          <label>Daily Progress</label>
          <div
            className="progress-bar"
            style={{ width: `${calculateDailyProgress()}%` }}
          ></div>
        </div>
        <div className="progress-bar-container">
          <label>Weekly Progress</label>
          <div
            className="progress-bar"
            style={{ width: `${calculateWeeklyProgress()}%` }}
          ></div>
        </div>
      </div>
      <div className="weekly-tasks">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className="day-column"
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDrop(e, day)}
          >
            <h2>{weekDates[index]}</h2>
            <ul className="tasks">
              {tasks
                .filter((task) => task.day === day)
                .map((task) => (
                  <li
                    key={task.id}
                    className={`task ${task.completed ? "completed" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, day)}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                    />
                    {isEditing && currentTask.id === task.id ? (
                      <>
                        <input
                          type="text"
                          value={currentTask.text}
                          onChange={handleEditChange}
                        />
                        <button onClick={handleUpdate}>Update</button>
                      </>
                    ) : (
                      <>
                        {task.text}
                        <button
                          className="edit"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDelete(task.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

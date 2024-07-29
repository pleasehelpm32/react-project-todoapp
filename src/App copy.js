import "./index.css";
import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Import arrow icons
import Confetti from "react-confetti"; // Import confetti
import { CSSTransition, TransitionGroup } from "react-transition-group"; // Import transition components

const APP_VERSION = "1.0.1"; // Update this version whenever you make significant changes

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState({ id: null, text: "" });
  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [weekOffset, setWeekOffset] = useState(0); // Track the current week offset
  const [repeatWeekly, setRepeatWeekly] = useState(false); // State to manage repeat task
  const [showConfetti, setShowConfetti] = useState(false); // State to manage confetti
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

    const storedVersion = localStorage.getItem("app_version");

    if (storedVersion !== APP_VERSION) {
      localStorage.clear(); // Clear local storage if versions differ
      localStorage.setItem("app_version", APP_VERSION); // Set the new version in local storage
    }

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) {
      setTasks(savedTasks);
    }

    // Ensure the current week is shown by default
    const now = new Date();
    if (now.getDay() === 0) {
      // If today is Sunday, reset weekOffset to 0
      setWeekOffset(0);
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return; // Prevent adding empty tasks

    const weekStartDate = getWeekStartDate(weekOffset);

    if (repeatWeekly) {
      // Create a task for each day of the active week
      const newTasks = daysOfWeek.map((day, index) => ({
        id: Date.now() + index, // Unique ID for each task
        text: input,
        completed: false,
        day: day,
        weekStartDate: weekStartDate,
      }));
      setTasks([...tasks, ...newTasks]);
    } else {
      // Create a single task for the selected day
      const newTask = {
        id: Date.now(),
        text: input,
        completed: false,
        day: selectedDay, // Store the selected day
        weekStartDate: weekStartDate, // Add week start date
      };
      setTasks([...tasks, newTask]);
    }

    setInput("");
    setRepeatWeekly(false); // Reset the repeat weekly checkbox
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          if (!task.completed) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000); // Show confetti for 3 seconds
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      })
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

  const calculateWeeklyProgress = () => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    return tasks.length === 0 ? 0 : (completedTasks / tasks.length) * 100;
  };

  const getWeekDates = (offset) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7); // Adjust for week offset
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

  const weekDates = getWeekDates(weekOffset);

  const getWeekStartDate = (offset) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7); // Adjust for week offset
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const hasTasksInPreviousWeeks = () => {
    const previousWeekStart = getWeekStartDate(weekOffset - 1);
    return tasks.some(
      (task) =>
        new Date(task.weekStartDate).getTime() === previousWeekStart.getTime()
    );
  };

  const canNavigateLeft = hasTasksInPreviousWeeks();
  const canNavigateRight = weekOffset < 4;

  const navigateWeek = (direction) => {
    if (direction === "left" && canNavigateLeft) {
      setWeekOffset(weekOffset - 1);
    } else if (direction === "right" && canNavigateRight) {
      setWeekOffset(weekOffset + 1);
    }
  };

  const navigateToToday = () => {
    setWeekOffset(0);
  };

  return (
    <div className="app-container">
      {showConfetti && <Confetti />}{" "}
      {/* Conditionally render Confetti component */}
      <h1>Weekly To Do App</h1>
      <div className="week-navigation">
        <button
          onClick={() => navigateWeek("left")}
          disabled={!canNavigateLeft}
        >
          <FaArrowLeft />
        </button>
        <button onClick={() => navigateToToday()}>Today</button>
        <button
          onClick={() => navigateWeek("right")}
          disabled={!canNavigateRight}
        >
          <FaArrowRight />
        </button>
      </div>
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
        <div>
          <label>
            <input
              type="checkbox"
              checked={repeatWeekly}
              onChange={(e) => setRepeatWeekly(e.target.checked)}
            />
            Repeat daily
          </label>
        </div>
        <button type="submit">Add Task</button>
      </form>
      <div className="progress-bars">
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
            <TransitionGroup component="ul" className="tasks">
              {tasks
                .filter(
                  (task) =>
                    task.day === day &&
                    new Date(task.weekStartDate).getTime() ===
                      getWeekStartDate(weekOffset).getTime()
                )
                .map((task) => (
                  <CSSTransition key={task.id} timeout={300} classNames="task">
                    <li
                      className={`task ${task.completed ? "completed" : ""}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
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
                  </CSSTransition>
                ))}
            </TransitionGroup>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Confetti from "react-confetti";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import TimePicker from "react-time-picker";

const APP_VERSION = "1.3.0";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [weekOffset, setWeekOffset] = useState(0);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState("light");
  const [view, setView] = useState("week"); // 'week' or 'three-day'
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("12:00");
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
      localStorage.clear();
      localStorage.setItem("app_version", APP_VERSION);
    }
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) setTasks(savedTasks);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
    const now = new Date();
    if (now.getDay() === 0) setWeekOffset(0);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme;
  }, [theme]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    const weekStartDate = getWeekStartDate(weekOffset);
    if (repeatWeekly) {
      const newTasks = daysOfWeek.map((day, index) => ({
        id: Date.now() + index,
        text: input,
        completed: false,
        day: day,
        weekStartDate: weekStartDate,
        time: showTimePicker ? selectedTime : null,
      }));
      setTasks([...tasks, ...newTasks]);
    } else {
      const newTask = {
        id: Date.now(),
        text: input,
        completed: false,
        day: selectedDay,
        weekStartDate: weekStartDate,
        time: showTimePicker ? selectedTime : null,
      };
      setTasks([...tasks, newTask]);
    }
    setInput("");
    setRepeatWeekly(false);
    setShowTimePicker(false);
    setSelectedTime("12:00");
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          if (!task.completed) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
  };

  const handleEdit = (task) => {
    setInput(task.text);
    setSelectedDay(task.day);
    setShowTimePicker(!!task.time);
    setSelectedTime(task.time || "12:00");
    handleDelete(task.id);
  };

  const handleDelete = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const calculateWeeklyProgress = () => {
    const currentWeekTasks = tasks.filter(
      (task) =>
        new Date(task.weekStartDate).getTime() ===
        getWeekStartDate(weekOffset).getTime()
    );
    const completedTasks = currentWeekTasks.filter(
      (task) => task.completed
    ).length;
    return currentWeekTasks.length === 0
      ? 0
      : (completedTasks / currentWeekTasks.length) * 100;
  };

  const getWeekDates = (offset) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const options = { weekday: "short", month: "short", day: "numeric" };
    return daysOfWeek.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date.toLocaleDateString("en-US", options);
    });
  };

  const getWeekStartDate = (offset) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const dayOfWeek = now.getDay();
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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getCurrentDay = () => {
    const today = new Date();
    return daysOfWeek[today.getDay()];
  };

  const getVisibleDays = () => {
    if (view === "week") return daysOfWeek;
    const currentDayIndex = daysOfWeek.indexOf(getCurrentDay());
    return [
      daysOfWeek[(currentDayIndex - 1 + 7) % 7],
      getCurrentDay(),
      daysOfWeek[(currentDayIndex + 1) % 7],
    ];
  };

  const weekDates = getWeekDates(weekOffset);

  return (
    <div className={`app-container ${theme}`}>
      {showConfetti && <Confetti />}
      <header className="app-header">
        <h1>Enhanced Weekly To-Do App</h1>
        <div className="header-controls">
          <button
            onClick={() => setView(view === "week" ? "three-day" : "week")}
            className="view-toggle"
          >
            {view === "week" ? "3-Day View" : "Week View"}
          </button>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>
      </header>
      <div className="week-navigation">
        <button
          onClick={() => navigateWeek("left")}
          disabled={!canNavigateLeft}
        >
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => navigateToToday()} className="today-button">
          Today
        </button>
        <button
          onClick={() => navigateWeek("right")}
          disabled={!canNavigateRight}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-row">
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
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your task"
            ref={inputRef}
          />
          <button type="submit">Add Task</button>
        </div>
        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={repeatWeekly}
              onChange={(e) => setRepeatWeekly(e.target.checked)}
            />
            Repeat daily
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showTimePicker}
              onChange={(e) => setShowTimePicker(e.target.checked)}
            />
            Add time
          </label>
          {showTimePicker && (
            <TimePicker
              onChange={setSelectedTime}
              value={selectedTime}
              clearIcon={null}
              clockIcon={<Clock size={18} />}
            />
          )}
        </div>
      </form>
      <div className="progress-bar-container">
        <label>Weekly Progress</label>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${calculateWeeklyProgress()}%` }}
          ></div>
        </div>
      </div>
      <div className={`tasks-container ${view}`}>
        {getVisibleDays().map((day, index) => (
          <div
            key={day}
            className={`day-column ${
              day === getCurrentDay() ? "current-day" : ""
            }`}
          >
            <h2>{weekDates[daysOfWeek.indexOf(day)]}</h2>
            <ul className="tasks">
              {tasks
                .filter(
                  (task) =>
                    task.day === day &&
                    new Date(task.weekStartDate).getTime() ===
                      getWeekStartDate(weekOffset).getTime()
                )
                .map((task) => (
                  <li
                    key={task.id}
                    className={`task ${task.completed ? "completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                    />
                    <span className="task-text">
                      {task.text}
                      {task.time && (
                        <span className="task-time">{task.time}</span>
                      )}
                    </span>
                    <div className="task-actions">
                      <button className="edit" onClick={() => handleEdit(task)}>
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              <li className="task new-task">
                <input type="checkbox" disabled />
                <span className="task-text">To-do</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

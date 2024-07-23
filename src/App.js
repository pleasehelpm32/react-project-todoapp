import "./index.css";
import React, { useState, useEffect, useRef } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState({ id: null, text: "" });
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();

    // Load tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) {
      console.log("Loaded tasks from localStorage:", savedTasks); // Debugging log
      setTasks(savedTasks);
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage
    console.log("Saving tasks to localStorage:", tasks); // Debugging log
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return; // Prevent adding empty tasks
    const newTask = { id: Date.now(), text: input, completed: false };
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

  return (
    <div className="app-container">
      <h1>To Do App - Gang Gang No Lame Grr</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Enter your task"
          ref={inputRef}
        />
        <button type="submit">Add Task</button>
      </form>
      <ul className="tasks">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task ${task.completed ? "completed" : ""}`}
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
                <button className="edit" onClick={() => handleEdit(task)}>
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
  );
}

export default App;

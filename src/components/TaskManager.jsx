import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Plus,
  Search,
  X,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Circle,
  Timer,
} from "lucide-react";

// Mock API - Replace with your actual FastAPI endpoints
const API_BASE = "";

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const TaskManager = () => {
  const [view, setView] = useState("kanban");
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [draggedTask, setDraggedTask] = useState(null);

  // New task form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    due_date: "",
    status: "open",
    priority: "medium",
    tags: "",
  });

  // Priority colors
  const priorityColors = {
    high: "bg-red-100 border-red-300 text-red-800",
    medium: "bg-yellow-100 border-yellow-300 text-yellow-800",
    low: "bg-green-100 border-green-300 text-green-800",
  };

  // Status colors
  const statusColors = {
    open: "bg-blue-50 border-blue-200",
    in_progress: "bg-purple-50 border-purple-200",
    done: "bg-green-50 border-green-200",
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      // const res = await fetch(`${API_BASE}/tasks`);
      // const data = await res.json();

      const mockTasks = [
        {
          id: 1,
          title: "Design new landing page",
          description: "Create mockups for the new product landing page",
          status: "in_progress",
          assignee: "Sarah",
          due_date: new Date(Date.now() + 86400000).toISOString(),
          priority: "high",
          tags: "design,ui",
          source: "local",
        },
        {
          id: 2,
          title: "Fix login bug",
          description: "Users unable to login with email",
          status: "open",
          assignee: "John",
          due_date: new Date(Date.now() + 172800000).toISOString(),
          priority: "high",
          tags: "bug,backend",
          source: "basecamp",
        },
        {
          id: 3,
          title: "Update documentation",
          description: "Add API endpoint documentation",
          status: "open",
          assignee: "Mike",
          due_date: new Date(Date.now() + 259200000).toISOString(),
          priority: "low",
          tags: "docs",
          source: "local",
        },
        {
          id: 4,
          title: "Client meeting prep",
          description: "Prepare slides for quarterly review",
          status: "in_progress",
          assignee: "Sarah",
          due_date: new Date(Date.now() + 345600000).toISOString(),
          priority: "medium",
          tags: "meeting,client",
          source: "local",
        },
        {
          id: 5,
          title: "Code review",
          description: "Review PRs from last sprint",
          status: "done",
          assignee: "John",
          due_date: new Date(Date.now() - 86400000).toISOString(),
          priority: "medium",
          tags: "code",
          source: "local",
        },
      ];

      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterAssignee) {
      filtered = filtered.filter((task) => task.assignee === filterAssignee);
    }

    if (filterStatus) {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  }, [searchQuery, filterAssignee, filterStatus, tasks]);

  const createTask = async () => {
    try {
      const taskData = {
        ...newTask,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
      };

      // Mock create - replace with actual API call
      // await fetch(`${API_BASE}/tasks`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(taskData),
      // });

      const mockNewTask = {
        id: Date.now(),
        ...taskData,
        source: "local",
      };

      setTasks([...tasks, mockNewTask]);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        due_date: "",
        status: "open",
        priority: "medium",
        tags: "",
      });
      setShowNewTask(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Mock update - replace with actual API call
      // await fetch(`${API_BASE}/tasks/${taskId}`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ status: newStatus }),
      // });

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const completeTask = async (taskId) => {
    await updateTaskStatus(taskId, "done");
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      await updateTaskStatus(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  const uniqueAssignees = [...new Set(tasks.map((t) => t.assignee).filter(Boolean))];

  const KanbanView = () => {
    const columns = [
      { status: "open", title: "To Do", icon: Circle },
      { status: "in_progress", title: "In Progress", icon: Timer },
      { status: "done", title: "Done", icon: CheckCircle2 },
    ];

    return (
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        {columns.map(({ status, title, icon: Icon }) => (
          <div
            key={status}
            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white">
              <div className="flex items-center gap-2">
                <Icon size={20} />
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                {filteredTasks.filter((t) => t.status === status).length}
              </span>
            </div>

            <div className="max-h-[calc(100vh-300px)] flex-1 space-y-3 overflow-y-auto p-4">
              {filteredTasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={`${statusColors[task.status]} border-2 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="flex-1 font-semibold text-slate-800">{task.title}</h3>
                      {status !== "done" && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="ml-2 rounded-full p-1 text-green-600 hover:bg-green-100 hover:text-green-700"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                    </div>

                    {task.description && <p className="mb-3 text-sm text-slate-600">{task.description}</p>}

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {task.priority && (
                        <span
                          className={`${priorityColors[task.priority]} rounded-full border px-2 py-1 font-medium`}
                        >
                          {task.priority}
                        </span>
                      )}

                      {task.assignee && (
                        <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-blue-800">
                          <User size={12} />
                          {task.assignee}
                        </span>
                      )}

                      {task.due_date && (
                        <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-slate-700">
                          <Clock size={12} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}

                      {task.source === "basecamp" && (
                        <span className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-xs text-orange-800">
                          Basecamp
                        </span>
                      )}
                    </div>

                    {task.tags && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.split(",").map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CalendarView = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    const goToPrevWeek = () => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentWeekStart(newDate);
    };

    const getTasksForDay = (date) => {
      const dateStr = date.toISOString().split("T")[0];
      return filteredTasks.filter((task) => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date).toISOString().split("T")[0];
        return taskDate === dateStr;
      });
    };

    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-center gap-4">
          <button onClick={goToPrevWeek} className="rounded-lg p-2 transition-colors hover:bg-slate-200">
            <ChevronLeft size={24} />
          </button>

          <div className="text-lg font-semibold">
            {days[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} - {" "}
            {days[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>

          <button onClick={goToNextWeek} className="rounded-lg p-2 transition-colors hover:bg-slate-200">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
          {days.map((date, idx) => {
            const dayTasks = getTasksForDay(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-xl bg-white shadow-md ${isToday ? "ring-2 ring-blue-500" : ""}`}
              >
                <div
                  className={`p-3 text-center ${
                    isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-medium">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                </div>

                <div className="min-h-[200px] max-h-[400px] space-y-2 overflow-y-auto p-2">
                  {dayTasks.map((task) => (
                    <div key={task.id} className={`${statusColors[task.status]} rounded-lg border-2 p-2 text-xs`}>
                      <div className="mb-1 font-semibold text-slate-800">{task.title}</div>

                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(task.due_date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {task.assignee && (
                          <span className="ml-2 flex items-center gap-1">
                            <User size={10} />
                            {task.assignee}
                          </span>
                        )}
                      </div>

                      {task.priority && (
                        <span
                          className={`${priorityColors[task.priority]} mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px]`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-md">
        <div className="px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Task Manager Pro</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTasks}
                className="rounded-lg p-2 transition-colors hover:bg-slate-100"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>

              <button
                onClick={() => setShowNewTask(!showNewTask)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus size={20} />
                New Task
              </button>
            </div>
          </div>

          {/* View Toggle & Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setView("kanban")}
                className={`rounded-md px-4 py-2 transition-colors ${
                  view === "kanban" ? "bg-white shadow-sm" : "hover:bg-slate-200"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
                  view === "calendar" ? "bg-white shadow-sm" : "hover:bg-slate-200"
                }`}
              >
                <Calendar size={16} />
                Calendar
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400"
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assignees</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </header>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800">Create New Task</h2>
              <button onClick={() => setShowNewTask(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Assignee</label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Assignee name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="design, urgent, client"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createTask}
                  disabled={!newTask.title}
                  className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="rounded-lg border border-slate-300 px-6 py-3 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {view === "kanban" ? <KanbanView /> : <CalendarView />}
    </div>
  );
};

export default TaskManager;

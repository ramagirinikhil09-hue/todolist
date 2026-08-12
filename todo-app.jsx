import React, { useState, useMemo, useRef } from "react";
import { Plus, Trash2, GripVertical, Flag, Calendar, X, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "work", label: "Work", color: "#5EEAD4" },
  { id: "personal", label: "Personal", color: "#FFB627" },
  { id: "creative", label: "Creative", color: "#C084FC" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: "#5F5E5A" },
  { id: "medium", label: "Medium", color: "#5EEAD4" },
  { id: "high", label: "High", color: "#FFB627" },
  { id: "urgent", label: "Urgent", color: "#FF6B6B" },
];

const initialTasks = [
  { id: 1, text: "Sketch the new landing page hero", category: "creative", priority: "high", due: "", done: false },
  { id: 2, text: "Reply to internship recruiter email", category: "work", priority: "urgent", due: "", done: false },
  { id: 3, text: "Buy groceries for the week", category: "personal", priority: "low", due: "", done: false },
  { id: 4, text: "Mix down the demo track", category: "creative", priority: "medium", due: "", done: true },
];

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}
function priInfo(id) {
  return PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];
}

export default function TodoApp() {
  const [tasks, setTasks] = useState(initialTasks);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("work");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [justCompleted, setJustCompleted] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const visibleTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.category === filter);
  }, [tasks, filter]);

  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  function addTask() {
    if (!text.trim()) return;
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      category,
      priority,
      due,
      done: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setText("");
    setDue("");
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nowDone = !t.done;
        if (nowDone) {
          setJustCompleted(id);
          setTimeout(() => setJustCompleted(null), 500);
        }
        return { ...t, done: nowDone };
      })
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleDragStart(index) {
    dragItem.current = index;
  }
  function handleDragEnter(index) {
    dragOverItem.current = index;
  }
  function handleDragEnd() {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) return;
    setTasks((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
    dragItem.current = null;
    dragOverItem.current = null;
  }

  const ringTicks = 24;
  const litTicks = Math.round((pct / 100) * ringTicks);

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#121212",
        color: "#F3F0E9",
        minHeight: "100vh",
        padding: "40px 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .stg { font-family: 'Space Grotesk', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .task-row { transition: transform 0.18s ease, opacity 0.18s ease, background 0.15s ease; }
        .task-row:hover { background: #1E1E21 !important; }
        .task-row.done { opacity: 0.5; }
        .task-row.pulse { animation: pulseGlow 0.5s ease; }
        @keyframes pulseGlow {
          0% { background: rgba(255,182,39,0.18); }
          100% { background: transparent; }
        }
        .check-box { transition: all 0.15s ease; }
        .check-box.checked { transform: scale(1.05); }
        .pill { transition: all 0.15s ease; cursor: pointer; }
        .pill:hover { filter: brightness(1.15); }
        .add-btn { transition: transform 0.12s ease, background 0.15s ease; }
        .add-btn:active { transform: scale(0.94); }
        input::placeholder { color: #6B6A66; }
        input, select { outline: none; }
        ::selection { background: #FFB627; color: #121212; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Sparkles size={18} color="#FFB627" />
              <span className="mono" style={{ fontSize: 12, letterSpacing: 2, color: "#8B8981", textTransform: "uppercase" }}>
                Today's queue
              </span>
            </div>
            <h1 className="stg" style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
              Signal
            </h1>
          </div>

          {/* Progress ring - signature element */}
          <div style={{ position: "relative", width: 76, height: 76 }}>
            <svg width="76" height="76" viewBox="0 0 76 76">
              {Array.from({ length: ringTicks }).map((_, i) => {
                const angle = (i / ringTicks) * 2 * Math.PI - Math.PI / 2;
                const isLit = i < litTicks;
                const x1 = 38 + 30 * Math.cos(angle);
                const y1 = 38 + 30 * Math.sin(angle);
                const x2 = 38 + 34 * Math.cos(angle);
                const y2 = 38 + 34 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isLit ? "#FFB627" : "#2B2B2E"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ transition: "stroke 0.25s ease" }}
                  />
                );
              })}
              <text x="38" y="34" textAnchor="middle" fontSize="16" fontWeight="700" fill="#F3F0E9" fontFamily="Space Grotesk, sans-serif">
                {pct}%
              </text>
              <text x="38" y="48" textAnchor="middle" fontSize="9" fill="#8B8981" fontFamily="JetBrains Mono, monospace">
                {doneCount}/{total}
              </text>
            </svg>
          </div>
        </div>

        {/* Add task */}
        <div
          style={{
            background: "#1A1A1C",
            border: "1px solid #2B2B2E",
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Capture a task..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#F3F0E9",
                fontSize: 15,
                padding: "8px 4px",
              }}
            />
            <button
              onClick={addTask}
              className="add-btn"
              style={{
                background: "#FFB627",
                border: "none",
                borderRadius: 10,
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Plus size={18} color="#121212" strokeWidth={2.5} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                background: "#232326",
                border: "1px solid #2B2B2E",
                borderRadius: 8,
                color: "#F3F0E9",
                fontSize: 12,
                padding: "6px 10px",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                background: "#232326",
                border: "1px solid #2B2B2E",
                borderRadius: 8,
                color: "#F3F0E9",
                fontSize: 12,
                padding: "6px 10px",
              }}
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#232326", border: "1px solid #2B2B2E", borderRadius: 8, padding: "6px 10px" }}>
              <Calendar size={13} color="#8B8981" />
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                style={{ background: "transparent", border: "none", color: "#F3F0E9", fontSize: 12, colorScheme: "dark" }}
              />
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            className="pill"
            style={{
              background: filter === "all" ? "#F3F0E9" : "#1A1A1C",
              color: filter === "all" ? "#121212" : "#8B8981",
              border: "1px solid #2B2B2E",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className="pill"
              style={{
                background: filter === c.id ? c.color : "#1A1A1C",
                color: filter === c.id ? "#121212" : "#F3F0E9",
                border: "1px solid " + (filter === c.id ? c.color : "#2B2B2E"),
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: filter === c.id ? "#121212" : c.color }} />
              {c.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {visibleTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#5F5E5A" }}>
              <div className="stg" style={{ fontSize: 18, marginBottom: 6, color: "#8B8981" }}>
                All clear
              </div>
              <div style={{ fontSize: 13 }}>Nothing queued in this category. Add a task above.</div>
            </div>
          )}
          {visibleTasks.map((task, index) => {
            const cat = catInfo(task.category);
            const pri = priInfo(task.priority);
            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`task-row ${task.done ? "done" : ""} ${justCompleted === task.id ? "pulse" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 12px",
                  background: "#1A1A1C",
                  borderRadius: 10,
                  borderLeft: `3px solid ${pri.color}`,
                }}
              >
                <GripVertical size={14} color="#5F5E5A" style={{ cursor: "grab", flexShrink: 0 }} />
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`check-box ${task.done ? "checked" : ""}`}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${task.done ? "#FFB627" : "#5F5E5A"}`,
                    background: task.done ? "#FFB627" : "transparent",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {task.done && (
                    <svg width="11" height="11" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-6" stroke="#121212" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      textDecoration: task.done ? "line-through" : "none",
                      color: task.done ? "#5F5E5A" : "#F3F0E9",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.text}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: cat.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cat.color }} />
                      {cat.label}
                    </span>
                    {task.due && (
                      <span className="mono" style={{ fontSize: 10.5, color: "#5F5E5A" }}>
                        {task.due}
                      </span>
                    )}
                  </div>
                </div>

                <Flag size={13} color={pri.color} style={{ flexShrink: 0 }} />
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, opacity: 0.5 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.5)}
                >
                  <Trash2 size={14} color="#FF6B6B" />
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 11, color: "#3F3F3D" }} className="mono">
          drag rows to reorder · click a check to complete
        </div>
      </div>
    </div>
  );
}

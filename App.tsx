
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ListTodo, BrainCircuit, Activity, Calendar, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { Task, Priority, Category, SubTask } from './types';
import TaskItem from './components/TaskItem';
import { getSmartSuggestions } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('gemini-pulse-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [category, setCategory] = useState<Category>(Category.WORK);
  const [aiInsight, setAiInsight] = useState<{ tip: string, prioritySuggestion: string, reason: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    localStorage.setItem('gemini-pulse-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!taskInput.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskInput,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
      subTasks: []
    };

    setTasks([newTask, ...tasks]);
    setTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addSubTask = (taskId: string, text: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newSub: SubTask = { id: crypto.randomUUID(), text, completed: false };
        return { ...t, subTasks: [...t.subTasks, newSub] };
      }
      return t;
    }));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return t;
    }));
  };

  const handleAIExpand = (taskId: string, subTasks: string[]) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newSubs: SubTask[] = subTasks.map(text => ({
          id: crypto.randomUUID(),
          text,
          completed: false
        }));
        return { ...t, subTasks: [...t.subTasks, ...newSubs] };
      }
      return t;
    }));
  };

  const fetchAIInsights = async () => {
    if (tasks.length === 0) return;
    setLoadingAI(true);
    try {
      const insight = await getSmartSuggestions(tasks);
      setAiInsight(insight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f172a] text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-slate-800 p-6 flex flex-col gap-8 bg-[#0a0f1e]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Pulse AI</h1>
        </div>

        <nav className="space-y-2">
          <button className="flex items-center gap-3 w-full p-3 bg-blue-500/10 text-blue-400 rounded-xl font-medium transition-all">
            <ListTodo className="w-5 h-5" />
            Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl font-medium transition-all">
            <Calendar className="w-5 h-5" />
            Calendar
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl font-medium transition-all">
            <Activity className="w-5 h-5" />
            Analytics
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400">DAILY PROGRESS</span>
              <span className="text-xs font-bold text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Today's Focus</h2>
              <p className="text-slate-400">Organize and optimize your workflow with Gemini.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchAIInsights}
                disabled={loadingAI || tasks.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all border border-slate-700"
              >
                {loadingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4 text-purple-400" />}
                Get AI Insights
              </button>
            </div>
          </header>

          {/* AI Insights Card */}
          {aiInsight && (
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-24 h-24 text-white" />
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0">
                  <BrainCircuit className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="text-indigo-300 font-bold text-sm uppercase tracking-widest">Recommended Next</span>
                    <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">AI PRIORITY</span>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-100">{aiInsight.prioritySuggestion}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">"{aiInsight.reason}"</p>
                  <div className="pt-2 border-t border-indigo-500/20 flex items-center gap-2 text-indigo-200">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs italic">Tip: {aiInsight.tip}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Task Input */}
          <form onSubmit={addTask} className="bg-slate-800/40 p-1 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-2 transition-all focus-within:border-blue-500/50">
            <input 
              type="text" 
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="What needs to be done? Press enter to add..."
              className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-100 placeholder:text-slate-500"
            />
            <div className="flex items-center gap-2 px-2 pb-2 md:pb-0">
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-slate-700/50 border-none rounded-xl text-xs font-bold text-slate-300 py-2 px-3 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={Priority.LOW}>LOW</option>
                <option value={Priority.MEDIUM}>MEDIUM</option>
                <option value={Priority.HIGH}>HIGH</option>
              </select>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="bg-slate-700/50 border-none rounded-xl text-xs font-bold text-slate-300 py-2 px-3 outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                <ListTodo className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No tasks yet. Start by adding one above!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onAddSubTask={addSubTask}
                  onToggleSubTask={toggleSubTask}
                  onAIExpand={handleAIExpand}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

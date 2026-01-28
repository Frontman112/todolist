
import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { CheckCircle, Circle, Trash2, ChevronDown, ChevronUp, Sparkles, Plus, X } from 'lucide-react';
import { decomposeTask } from '../services/geminiService';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubTask: (taskId: string, text: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onAIExpand: (taskId: string, subTasks: string[]) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onAddSubTask, onToggleSubTask, onAIExpand }) => {
  const [expanded, setExpanded] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [newSubTask, setNewSubTask] = useState('');

  const priorityColors = {
    [Priority.HIGH]: 'text-rose-400 bg-rose-400/10',
    [Priority.MEDIUM]: 'text-amber-400 bg-amber-400/10',
    [Priority.LOW]: 'text-emerald-400 bg-emerald-400/10',
  };

  const handleAIExpand = async () => {
    if (isExpanding) return;
    setIsExpanding(true);
    try {
      const suggestions = await decomposeTask(task.title);
      onAIExpand(task.id, suggestions);
      setExpanded(true);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className={`group bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all hover:border-blue-500/30 ${task.completed ? 'opacity-60' : ''}`}>
      <div className="p-4 flex items-center gap-4">
        <button 
          onClick={() => onToggle(task.id)}
          className="text-slate-400 hover:text-blue-400 transition-colors"
        >
          {task.completed ? <CheckCircle className="w-6 h-6 text-blue-500" /> : <Circle className="w-6 h-6" />}
        </button>

        <div className="flex-1">
          <h3 className={`font-medium text-slate-100 ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          <div className="flex gap-2 mt-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {task.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleAIExpand}
            disabled={isExpanding}
            className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-all disabled:animate-pulse"
            title="AI Decompose"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-12 pb-4 pt-0 space-y-2 border-t border-slate-700/30 mt-2 bg-slate-900/20">
          {task.subTasks.map(sub => (
            <div key={sub.id} className="flex items-center gap-3 py-1 group/sub">
              <button 
                onClick={() => onToggleSubTask(task.id, sub.id)}
                className="text-slate-500 hover:text-blue-400"
              >
                {sub.completed ? <CheckCircle className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4" />}
              </button>
              <span className={`text-sm text-slate-300 ${sub.completed ? 'line-through text-slate-500' : ''}`}>
                {sub.text}
              </span>
            </div>
          ))}
          
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="text" 
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              placeholder="Add sub-task..."
              className="flex-1 bg-transparent border-none text-sm text-slate-300 focus:ring-0 placeholder:text-slate-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubTask.trim()) {
                  onAddSubTask(task.id, newSubTask);
                  setNewSubTask('');
                }
              }}
            />
            {newSubTask && (
              <button 
                onClick={() => {
                  onAddSubTask(task.id, newSubTask);
                  setNewSubTask('');
                }}
                className="p-1 text-blue-400 hover:bg-blue-400/10 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;

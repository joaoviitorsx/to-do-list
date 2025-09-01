import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Edit3, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  onEdit: () => void;
  onSaveEdit: (title: string) => void;
  onCancelEdit: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  style?: React.CSSProperties;
}

export const TodoItem = ({
  todo,
  isEditing,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onDelete,
  style,
}: TodoItemProps) => {
  const [editValue, setEditValue] = useState(todo.title);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(todo.title);
  }, [todo.title, isEditing]);

  const handleSave = () => {
    onSaveEdit(editValue);
  };

  const handleCancel = () => {
    setEditValue(todo.title);
    onCancelEdit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-300 animate-slide-up hover:shadow-md",
        todo.completed && "opacity-75 bg-muted/50"
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={onToggleComplete}
          className="h-6 w-6"
        />
        
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                ref={editInputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSave}
                className="h-10 px-3"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-10 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span 
              className={cn(
                "text-lg font-medium cursor-pointer transition-all",
                todo.completed && "line-through text-muted-foreground"
              )}
              onClick={onToggleComplete}
            >
              {todo.title}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="h-10 px-3 hover:bg-accent"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="h-10 px-3 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
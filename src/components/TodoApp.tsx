import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TodoItem } from './TodoItem';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, ListTodo } from 'lucide-react';
import type { Todo } from '@/types/todo';

const MAX_TODOS = 10;

export const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, title: string} | null>(null);
  const { toast } = useToast();

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleAddTodo = useCallback(() => {
    const trimmedTitle = newTodo.trim();
    
    if (!trimmedTitle) {
      toast({
        title: "Erro",
        description: "O título da tarefa não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    if (todos.length >= MAX_TODOS) {
      toast({
        title: "Limite atingido",
        description: `Você pode ter no máximo ${MAX_TODOS} tarefas.`,
        variant: "destructive",
      });
      return;
    }

    const newTodoItem: Todo = {
      id: Date.now().toString(),
      title: capitalizeFirst(trimmedTitle),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodoItem, ...todos]);
    setNewTodo('');
    
    toast({
      title: "Tarefa adicionada!",
      description: "Nova tarefa foi criada com sucesso.",
      variant: "default",
    });
  }, [newTodo, todos, setTodos, toast]);

  const handleEditTodo = useCallback((id: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    
    if (!trimmedTitle) {
      toast({
        title: "Erro",
        description: "O título da tarefa não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, title: capitalizeFirst(trimmedTitle) } : todo
    ));
    setEditingId(null);
    
    toast({
      title: "Tarefa editada!",
      description: "A tarefa foi atualizada com sucesso.",
    });
  }, [todos, setTodos, toast]);

  const handleToggleComplete = useCallback((id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    // Sort: incomplete tasks first, completed tasks last
    const sortedTodos = updatedTodos.sort((a, b) => {
      if (a.completed === b.completed) {
        return a.createdAt - b.createdAt;
      }
      return a.completed ? 1 : -1;
    });
    
    setTodos(sortedTodos);
    
    const todo = todos.find(t => t.id === id);
    if (todo) {
      toast({
        title: todo.completed ? "Tarefa reaberta" : "Tarefa concluída!",
        description: todo.completed ? "A tarefa foi marcada como pendente." : "Parabéns! Tarefa concluída.",
        variant: todo.completed ? "default" : "default",
      });
    }
  }, [todos, setTodos, toast]);

  const handleDeleteTodo = useCallback((id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setDeleteConfirm({ id, title: todo.title });
    }
  }, [todos]);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    
    const { id, title } = deleteConfirm;
    setTodos(todos.filter(todo => todo.id !== id));
    setDeleteConfirm(null);
    
    toast({
      title: "Tarefa removida",
      description: `"${title}" foi removida da sua lista.`,
      action: (
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => {
            // Restore the todo
            const restoredTodo = { 
              id, 
              title, 
              completed: false, 
              createdAt: Date.now() 
            };
            setTodos([restoredTodo, ...todos.filter(t => t.id !== id)]);
            toast({
              title: "Tarefa restaurada",
              description: `"${title}" foi restaurada.`,
            });
          }}
        >
          Desfazer
        </Button>
      ),
    });
  }, [deleteConfirm, todos, setTodos, toast]);

  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const allTodos = [...incompleteTodos, ...completedTodos];

  return (
    <div className="min-h-screen bg-gradient-soft p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <ListTodo className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Lista de Atividades
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Organize suas tarefas de forma simples e eficiente
          </p>
        </div>

        <Card className="p-6 mb-6 shadow-lg animate-slide-up">
          <div className="flex gap-3">
            <Input
              placeholder="Digite sua nova tarefa..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              className="flex-1 text-lg"
            />
            <Button 
              onClick={handleAddTodo}
              size="lg"
              className="px-6"
              disabled={todos.length >= MAX_TODOS}
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar
            </Button>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-4">
            <span>{todos.length} / {MAX_TODOS} tarefas</span>
            <span>{completedTodos.length} concluídas</span>
          </div>
        </Card>

        <div className="space-y-3">
          {allTodos.length === 0 ? (
            <Card className="p-8 text-center animate-fade-in">
              <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Nenhuma tarefa ainda
              </h3>
              <p className="text-muted-foreground">
                Adicione sua primeira tarefa para começar!
              </p>
            </Card>
          ) : (
            allTodos.map((todo, index) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isEditing={editingId === todo.id}
                onEdit={() => setEditingId(todo.id)}
                onSaveEdit={(title) => handleEditTodo(todo.id, title)}
                onCancelEdit={() => setEditingId(null)}
                onToggleComplete={() => handleToggleComplete(todo.id)}
                onDelete={() => handleDeleteTodo(todo.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja remover "${deleteConfirm?.title}"?`}
      />
    </div>
  );
};
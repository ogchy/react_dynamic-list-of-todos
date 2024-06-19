import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal/TodoModal';
import { Loader } from './components/Loader';
import { Todo } from './types/Todo';
import { User } from './types/User';
import { getTodos, getUser } from './api';

export interface TodoWithUser extends Todo {
  user: User;
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTodoWithUser, setSelectedTodoWithUser] =
    useState<TodoWithUser | null>(null);

  useEffect(() => {
    setLoading(true);
    getTodos()
      .then(loadedTodos => {
        setTodos(loadedTodos);
        setFilteredTodos(loadedTodos);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleShowTodo = (todo: Todo) => {
    setLoadingUser(true);
    setSelectedTodoWithUser(null);

    try {
      getUser(todo.userId)
        .then(user => {
          setSelectedTodoWithUser({
            ...todo,
            user,
          });
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('Error', error);
        })
        .finally(() => {
          setLoadingUser(false);
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedTodoWithUser(null);
  };

  useEffect(() => {
    let filtered = todos;

    if (query) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    setFilteredTodos(filtered);
  }, [query, filter, todos]);

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                query={query}
                onQueryChange={setQuery}
                filter={filter}
                onFilterChange={setFilter}
              />
            </div>
            <div className="block">
              {loading ? (
                <Loader />
              ) : (
                <TodoList
                  todos={filteredTodos}
                  onShowTodo={handleShowTodo}
                  selectedTodoId={
                    selectedTodoWithUser ? selectedTodoWithUser.id : null
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedTodoWithUser && (
        <TodoModal
          todoWithUser={selectedTodoWithUser}
          loadingUser={loadingUser}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

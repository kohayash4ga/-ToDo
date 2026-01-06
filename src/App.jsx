import { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'タスク1をスワイプして完了', completed: false, strikeProgress: 0 },
    { id: 2, text: 'タスク2を完了する', completed: false, strikeProgress: 0 },
    { id: 3, text: 'タスク3を追加', completed: false, strikeProgress: 0 },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [swipeState, setSwipeState] = useState({
    todoId: null,
    startX: 0,
    currentX: 0,
    isSwiping: false,
  });

  const addTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: inputValue,
          completed: false,
          strikeProgress: 0,
        },
      ]);
      setInputValue('');
    }
  };

  const handleTouchStart = (e, todoId) => {
    const touch = e.touches[0];
    setSwipeState({
      todoId,
      startX: touch.clientX,
      currentX: touch.clientX,
      isSwiping: true,
    });
  };

  const handleTouchMove = (e, todoId) => {
    if (!swipeState.isSwiping || swipeState.todoId !== todoId) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const distance = currentX - swipeState.startX;

    // スワイプの進行度を計算（0〜100%）
    const element = e.currentTarget;
    const maxWidth = element.offsetWidth;
    const progress = Math.min(Math.max((distance / maxWidth) * 100, 0), 100);

    // 振動を発生させる（ペンで書いている感覚）
    if (navigator.vibrate && progress > 0) {
      // 微細な振動（5ミリ秒）
      navigator.vibrate(5);
    }

    setSwipeState((prev) => ({
      ...prev,
      currentX,
    }));

    // リアルタイムで線の進行状況を更新
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId ? { ...todo, strikeProgress: progress } : todo
      )
    );
  };

  const handleTouchEnd = (e, todoId) => {
    if (!swipeState.isSwiping || swipeState.todoId !== todoId) return;

    const todo = todos.find((t) => t.id === todoId);

    // 70%以上スワイプしたら完了とする
    if (todo.strikeProgress >= 70) {
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todoId
            ? { ...t, completed: true, strikeProgress: 100 }
            : t
        )
      );
      // 完了時に少し長めの振動
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } else {
      // 70%未満の場合は元に戻す
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === todoId ? { ...t, strikeProgress: 0 } : t
        )
      );
    }

    setSwipeState({
      todoId: null,
      startX: 0,
      currentX: 0,
      isSwiping: false,
    });
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          📝 スワイプTodo
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={addTodo} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              追加
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
              onTouchStart={(e) => handleTouchStart(e, todo.id)}
              onTouchMove={(e) => handleTouchMove(e, todo.id)}
              onTouchEnd={(e) => handleTouchEnd(e, todo.id)}
            >
              <div className="p-4 relative select-none cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 relative">
                    <span
                      className={`text-lg ${
                        todo.completed ? 'text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {todo.text}
                    </span>

                    {/* スワイプによる横線 */}
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-red-500 transition-all duration-100"
                      style={{
                        width: `${todo.strikeProgress}%`,
                        transform: 'translateY(-50%)',
                      }}
                    />
                  </div>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    削除
                  </button>
                </div>

                {/* プログレスバー */}
                {todo.strikeProgress > 0 && !todo.completed && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-100"
                      style={{ width: `${todo.strikeProgress}%` }}
                    />
                  </div>
                )}

                {todo.completed && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✓ 完了
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            タスクがありません。新しいタスクを追加してください。
          </div>
        )}

        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700 mb-2">使い方：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• タスクを左から右へスワイプして横線を引きます</li>
            <li>• スワイプ中に微細な振動が発生します（対応デバイスのみ）</li>
            <li>• 70%以上スワイプすると完了になります</li>
            <li>• マウスの場合はクリックして削除してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

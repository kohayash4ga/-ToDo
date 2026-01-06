import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: '買い物に行く', completed: false, strikeProgress: 0 },
    { id: 2, text: '報告書を書く', completed: false, strikeProgress: 0 },
    { id: 3, text: '友達に電話する', completed: false, strikeProgress: 0 },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [swipeState, setSwipeState] = useState({
    todoId: null,
    startX: 0,
    currentX: 0,
    isSwiping: false,
  });
  const lastVibrateRef = useRef(0);

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

    // ボールペンで紙に書くような振動を発生させる
    if (navigator.vibrate && progress > 0) {
      const now = Date.now();
      // 20ミリ秒ごとに振動（滑らかなペンの感触）
      if (now - lastVibrateRef.current > 20) {
        navigator.vibrate(15);
        lastVibrateRef.current = now;
      }
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
      // 完了時の爽快感を演出する振動パターン
      if (navigator.vibrate) {
        // 強めの振動で達成感を演出（100ミリ秒）
        navigator.vibrate(100);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 新しいタスク追加の付箋 */}
        <div
          className="bg-gradient-to-br from-yellow-200 to-yellow-300 p-6 shadow-lg"
          style={{
            transform: 'rotate(-0.5deg)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          <form onSubmit={addTodo}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="新しいタスク..."
              className="w-full bg-transparent border-b-2 border-amber-900/30 focus:border-amber-900/60 outline-none text-lg px-2 py-2 placeholder-amber-900/40"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            />
          </form>
        </div>

        {/* タスク付箋のリスト */}
        <div className="space-y-6">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              className="bg-gradient-to-br from-yellow-200 to-yellow-300 p-6 shadow-lg relative"
              style={{
                transform: `rotate(${index % 2 === 0 ? '0.5deg' : '-0.5deg'})`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onTouchStart={(e) => handleTouchStart(e, todo.id)}
              onTouchMove={(e) => handleTouchMove(e, todo.id)}
              onTouchEnd={(e) => handleTouchEnd(e, todo.id)}
            >
              <div className="relative select-none">
                <p className={`text-xl leading-relaxed ${todo.completed ? 'text-gray-600' : 'text-gray-900'}`}
                   style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {todo.text}
                </p>

                {/* ボールペンで引いた横線 */}
                <div
                  className="absolute top-1/2 left-0 bg-black transition-all duration-75"
                  style={{
                    width: `${todo.strikeProgress}%`,
                    height: '2px',
                    transform: 'translateY(-50%)',
                    opacity: 0.8
                  }}
                />
              </div>

              {/* 削除ボタン */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 text-xl"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import "./index.css";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

export default function Admin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [players, setPlayers] = useState([]);

  const loadPlayers = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const json = await res.json();
      setPlayers(json);
    } catch (err) {
      console.log("Не удалось загрузить игроков");
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const handleLogin = () => {
    if (login === "admin" && password === "Skillset2026!") {
      setAuthorized(true);
    } else {
      alert("Неверный логин или пароль");
    }
  };

  const addUser = async () => {
    if (!name.trim() || !amount) {
      alert("Заполни ник и сумму");
      return;
    }

    const res = await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-login": login,
        "x-admin-password": password,
      },
      body: JSON.stringify({
        name: name.trim(),
        amount,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Ошибка");
      return;
    }

    alert("Очки добавлены");
    setName("");
    setAmount("");
    loadPlayers();
  };

  const reset = async () => {
    if (!confirm("Точно сбросить всю таблицу?")) return;

    const res = await fetch(`${API_URL}/reset`, {
      method: "POST",
      headers: {
        "x-admin-login": login,
        "x-admin-password": password,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Ошибка");
      return;
    }

    alert("Таблица сброшена");
    loadPlayers();
  };

  if (!authorized) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="admin-badge">RSN ADMIN</div>
          <h1 className="admin-title">Вход в админку</h1>
          <p className="admin-subtitle">Управление leaderboard</p>

          <div className="admin-form">
            <input
              className="admin-input"
              placeholder="Логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />

            <input
              className="admin-input"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="admin-button" onClick={handleLogin}>
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-badge">CONTROL PANEL</div>
        <h1 className="admin-title">Админ панель</h1>
        <p className="admin-subtitle">Добавление суммы и управление таблицей</p>

        <div className="admin-form">
          <div className="admin-row">
            <input
              className="admin-input"
              list="players-list"
              placeholder="Ник игрока"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="admin-input"
              type="number"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <datalist id="players-list">
            {players.map((player, index) => (
              <option key={index} value={player["НИК"]} />
            ))}
          </datalist>

          <button className="admin-button" onClick={addUser}>
            Добавить очки
          </button>

          <button
  className="admin-button history"
  onClick={() => window.location.href = "/admin/history"}
>
  История
</button>

<button className="admin-button danger" onClick={reset}>
  Сбросить всё
</button>

        </div>
      </div>
    </div>
  );
}
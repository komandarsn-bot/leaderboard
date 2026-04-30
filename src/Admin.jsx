import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

export default function Admin() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [players, setPlayers] = useState([]);

  // 🔥 ФИЛЬТР ДАТ
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const handleLogin = async () => {
    if (!login || !password) {
      alert("Введите логин и пароль");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin-check`, {
        method: "POST",
        headers: {
          "x-admin-login": login,
          "x-admin-password": password,
        },
      });

      if (!res.ok) {
        alert("Неверный логин или пароль");
        return;
      }

      sessionStorage.setItem("admin-auth", "true");
      setAuthorized(true);
    } catch (err) {
      alert("Ошибка входа");
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

  // 🔥 ПРИМЕНИТЬ ФИЛЬТР
  const applyLeaderboardFilter = async () => {
    const res = await fetch(`${API_URL}/set-filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-login": login,
        "x-admin-password": password,
      },
      body: JSON.stringify({
        from: dateFrom,
        to: dateTo,
      }),
    });

    if (!res.ok) {
      alert("Ошибка фильтра");
      return;
    }

    alert("Фильтр применён");
  };

  // 🔥 СБРОСИТЬ ФИЛЬТР
  const resetLeaderboardFilter = async () => {
    setDateFrom("");
    setDateTo("");

    const res = await fetch(`${API_URL}/set-filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-login": login,
        "x-admin-password": password,
      },
      body: JSON.stringify({
        from: "",
        to: "",
      }),
    });

    if (!res.ok) {
      alert("Ошибка сброса фильтра");
      return;
    }

    alert("Фильтр сброшен");
  };

  if (!authorized) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="admin-badge">RSN ADMIN</div>
          <h1 className="admin-title">Вход в админку</h1>

          <div className="admin-form">
            <input
              className="admin-input"
              placeholder="Логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                className="admin-input"
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

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

        <div className="admin-form">

          {/* 🔥 ФИЛЬТР */}
          <div className="admin-badge">ФИЛЬТР ГЛАВНОЙ</div>

          <div className="admin-row">
            <input
              className="admin-input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <input
              className="admin-input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <button className="admin-button" onClick={applyLeaderboardFilter}>
            Применить даты
          </button>

          <button className="admin-button danger" onClick={resetLeaderboardFilter}>
            Сбросить даты
          </button>

          {/* 👇 остальное */}
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
            onClick={() => navigate("/admin/history")}
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
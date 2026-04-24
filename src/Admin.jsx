import { useState } from "react";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

export default function Admin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [avatar, setAvatar] = useState("ava1");

  const handleLogin = () => {
    if (login === "admin" && password === "1234") {
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
        avatar,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Ошибка");
      return;
    }

    alert("Добавлено");
    setName("");
    setAmount("");
    setAvatar("ava1");
  };

  const reset = async () => {
    if (!confirm("Сбросить таблицу?")) return;

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

    alert("Сброшено");
  };

  if (!authorized) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Админ вход</h2>

        <input
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Войти</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Админ панель</h2>

      <input
        placeholder="Ник"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={avatar} onChange={(e) => setAvatar(e.target.value)}>
        <option value="ava1">ava1</option>
        <option value="ava2">ava2</option>
        <option value="ava3">ava3</option>
      </select>

      <button onClick={addUser}>Добавить</button>
      <button onClick={reset}>Сбросить всё</button>
    </div>
  );
}
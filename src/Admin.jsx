import { useState } from "react";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [avatar, setAvatar] = useState("ava1");

  const login = () => {
    if (password === "1234") {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  const addUser = async () => {
    if (!name.trim() || !amount) {
      alert("Заполни ник и сумму");
      return;
    }

    await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        amount,
        avatar,
      }),
    });

    alert("Добавлено");
    setName("");
    setAmount("");
    setAvatar("ava1");
  };

  const reset = async () => {
    if (!confirm("Сбросить таблицу?")) return;

    await fetch(`${API_URL}/reset`, {
      method: "POST",
    });

    alert("Сброшено");
  };

  if (!authorized) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Админ вход</h2>

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Войти</button>
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
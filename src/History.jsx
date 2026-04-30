import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function History() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [nickname, setNickname] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadHistory = async () => {
    let query = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (nickname.trim()) {
      query = query.ilike("nickname", `%${nickname.trim()}%`);
    }

    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00`);
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      alert("Ошибка загрузки истории");
      return;
    }

    setItems(data || []);
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin-auth");

    if (isAuth !== "true") {
      navigate("/admin");
      return;
    }

    loadHistory();
  }, [navigate]);

  return (
    <div className="history-page">
      <div className="history-card">
        <div className="admin-badge">TRANSACTIONS</div>
        <h1 className="history-title">История операций</h1>
        <p className="history-subtitle">Все начисления очков игрокам</p>

        <div className="history-filters">
          <input
            className="admin-input"
            type="text"
            placeholder="Поиск по нику"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

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

          <button className="admin-button" onClick={loadHistory}>
            Найти
          </button>

          <button
            className="admin-button danger"
            onClick={() => {
              setNickname("");
              setDateFrom("");
              setDateTo("");
              setTimeout(loadHistory, 0);
            }}
          >
            Сбросить
          </button>
        </div>

        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Ник</th>
                <th>Сумма</th>
                <th>XP</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleString("ru-RU")}</td>
                  <td className="history-name">{item.nickname}</td>
                  <td>{item.amount} тг</td>
                  <td className="history-xp">+{item.points} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="history-empty">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
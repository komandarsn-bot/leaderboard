import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function History() {
  const [items, setItems] = useState([]);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Ошибка загрузки истории");
      return;
    }

    setItems(data || []);
  };

const navigate = useNavigate();

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
          <div className="history-empty">История пока пустая</div>
        )}
      </div>
    </div>
  );
}
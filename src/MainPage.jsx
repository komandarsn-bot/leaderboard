import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function MainPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Ошибка загрузки leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Таблица лидеров</h1>

      {loading && (
        <p style={{ textAlign: "center", fontSize: "20px" }}>
          Загружаем таблицу...
        </p>
      )}

      {!loading && data.length === 0 && (
        <p style={{ textAlign: "center", fontSize: "20px" }}>
          Пока нет игроков
        </p>
      )}

      {!loading && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Место</th>
                <th>Аватар</th>
                <th>НИК</th>
                <th>Очков</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row["Место"]}</td>
                  <td>
                    <img src={`/avatars/${row["Аватар"]}.png`} width="50" />
                  </td>
                  <td>{row["НИК"]}</td>
                  <td>{row["Очков"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
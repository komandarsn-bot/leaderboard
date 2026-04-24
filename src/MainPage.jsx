import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "ТВОЙ_ПУБЛИЧНЫЙ_КЛЮЧ"
);

export default function MainPage() {
  const [data, setData] = useState([]);

  const loadData = async () => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("points", { ascending: false });

    if (!error) {
      const formatted = data.map((user, index) => ({
        Место: index + 1,
        Аватар: user.avatar,
        НИК: user.nickname,
        Очков: user.points,
      }));

      setData(formatted);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("leaderboard")
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
                <img
                  src={`/avatars/${row["Аватар"]}.png`}
                  width="50"
                />
              </td>
              <td>{row["НИК"]}</td>
              <td>{row["Очков"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
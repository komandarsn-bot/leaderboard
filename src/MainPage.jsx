import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

function getLevelInfo(xp) {
  const levels = [
    0, 100, 200, 300, 400, 500,
    650, 800, 950, 1100, 1250,
    1500, 1750, 2000, 2250
  ];

  let level = 1;

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i]) level = i + 1;
  }

  if (level >= 15) {
    return { level: 15, percent: 100, text: "MAX уровень" };
  }

  const current = xp - levels[level - 1];
  const need = levels[level] - levels[level - 1];
  const percent = (current / need) * 100;

  return {
    level,
    percent,
    text: `${current} / ${need} XP`,
  };
}

export default function MainPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const res = await fetch(`${API_URL}/leaderboard`);
      if (!res.ok) throw new Error("server error");

      const json = await res.json();
      setData(json);

      setLoading(false);
    } catch (err) {
      setLoading(true);
      setError("Сервер просыпается... пробуем ещё раз");
      setTimeout(loadData, 3000);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        loadData
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="page">


      <div className="card grid">
        {loading && (
          <div className="loading">
            {error || "Загрузка таблицы..."}
          </div>
        )}

        {!loading &&
          data.map((row, index) => {
            const xp = Number(row["Очков"]) || 0;
            const level = getLevelInfo(xp);

            return (
              <div className="row" key={index}>
                <div className={`place place-${index + 1}`}>
                  {row["Место"]}
                </div>

                <div className="player">
  <img
    src={`/avatars/1 уровень.png`}
    className="avatar"
  />

  <div className="player-info">
    <div className="name">{row["НИК"]}</div>
    <div className="level-text">Level {level.level}</div>
  </div>
</div>

                <div className="progress-block">
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${level.percent}%` }}
                    />
                  </div>

                  <div className="xp-text">{level.text}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
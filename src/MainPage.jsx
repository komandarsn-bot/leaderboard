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

  const loadData = async () => {
    const res = await fetch(`${API_URL}/leaderboard`);
    const json = await res.json();
    setData(json);
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
      <h1 className="title">Leaderboard</h1>

      <div className="card">
        {data.map((row, index) => {
          const xp = Number(row["Очков"]) || 0;
          const level = getLevelInfo(xp);

          return (
            <div className="row" key={index}>
              <div className={`place place-${index + 1}`}>
                {row["Место"]}
              </div>

              <div className="player">
                <img
                  src={`/avatars/${row["Аватар"]}.png`}
                  className="avatar"
                />
                <div className="name">{row["НИК"]}</div>
              </div>

             <div className="level-box">
              <span>LEVEL</span>
              <strong>{level.level}</strong>
            </div>

            <div className="xp">{xp} XP</div>

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
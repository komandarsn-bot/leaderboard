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
    return {
      level: 15,
      current: 100,
      need: 100,
      percent: 100,
      text: "MAX уровень",
    };
  }

  const currentLevelXp = levels[level - 1];
  const nextLevelXp = levels[level];
  const current = xp - currentLevelXp;
  const need = nextLevelXp - currentLevelXp;
  const percent = Math.min((current / need) * 100, 100);

  return {
    level,
    current,
    need,
    percent,
    text: `${current} / ${need} XP`,
  };
}

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
    <div style={{ padding: "28px", minHeight: "100vh" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "28px",
          fontSize: "36px",
          fontWeight: "800",
        }}
      >
        Таблица лидеров
      </h1>

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
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
            border: "1px solid #e5e7eb",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "17px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={thStyle}>Место</th>
                <th style={thStyle}>Игрок</th>
                <th style={thStyle}>Уровень</th>
                <th style={thStyle}>Очки</th>
                <th style={thStyle}>Прогресс</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => {
                const xp = Number(row["Очков"]) || 0;
                const levelInfo = getLevelInfo(xp);

                const colors = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
                const color = colors[index % colors.length];

                return (
                  <tr
                    key={index}
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      background: index === 0 ? "#faf5ff" : "white",
                    }}
                  >
                    <td style={tdStyle}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          fontWeight: "800",
                          color: "white",
                          background:
                            index === 0
                              ? "#facc15"
                              : index === 1
                              ? "#94a3b8"
                              : index === 2
                              ? "#c084fc"
                              : "#e5e7eb",
                        }}
                      >
                        {row["Место"]}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "18px",
                        }}
                      >
                        <img
                          src={`/avatars/${row["Аватар"]}.png`}
                          alt="avatar"
                          style={{
                            width: "90px",
                            height: "90px",
                            borderRadius: "18px",
                            objectFit: "cover",
                            boxShadow: "0 6px 16px rgba(15,23,42,0.18)",
                          }}
                        />

                        <strong style={{ fontSize: "20px" }}>
                          {row["НИК"]}
                        </strong>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "10px 16px",
                          borderRadius: "14px",
                          background: "#eef2ff",
                          color: "#4f46e5",
                          fontWeight: "800",
                        }}
                      >
                        {levelInfo.level}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <strong>{xp} XP</strong>
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          width: "240px",
                          height: "14px",
                          background: "#e5e7eb",
                          borderRadius: "999px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: `${levelInfo.percent}%`,
                            height: "100%",
                            background: color,
                            borderRadius: "999px",
                          }}
                        />
                      </div>

                      <div style={{ fontSize: "14px", color: "#64748b" }}>
                        {levelInfo.text}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "18px",
  textAlign: "left",
  color: "#475569",
  fontWeight: "700",
};

const tdStyle = {
  padding: "16px 18px",
  verticalAlign: "middle",
};
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function MainPage() {
  const [data, setData] = useState([]);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const isTvMode = new URLSearchParams(window.location.search).get("tv") === "1";

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Ошибка загрузки leaderboard:", error);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sortedData = useMemo(() => {
    if (!sortKey || isTvMode) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      const aNum = Number(aVal);
      const bNum = Number(bVal);
      const bothNumbers = !isNaN(aNum) && !isNaN(bNum);

      if (bothNumbers) {
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }

      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal), "ru")
        : String(bVal).localeCompare(String(aVal), "ru");
    });
  }, [data, sortKey, sortDir, isTvMode]);

  const handleSort = (key) => {
    if (isTvMode) return;

    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div style={{ padding: isTvMode ? "10px 20px" : "20px" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: isTvMode ? "10px" : "20px",
          marginTop: "5px",
          fontFamily: "Pacifico, cursive",
          fontSize: isTvMode ? "56px" : "44px",
          fontWeight: "400",
          opacity: 0.85,
        }}
      >
        Таблица лидеров
      </h1>

      {sortedData.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {Object.keys(sortedData[0]).map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{
                      width: key === "Место" ? "80px" : "auto",
                      cursor: isTvMode ? "default" : "pointer",
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedData.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background:
                      row["Место"] == 1
                        ? "linear-gradient(90deg, #ffd700, #fff7cc)"
                        : row["Место"] == 2
                        ? "linear-gradient(90deg, #c0c0c0, #f1f5f9)"
                        : row["Место"] == 3
                        ? "linear-gradient(90deg, #cd7f32, #fbe4d5)"
                        : "white",
                  }}
                >
                  {Object.keys(sortedData[0]).map((key, j) => (
                    <td key={j}>
                      {key.toLowerCase().includes("аватар") ? (
                        <img
                          src={`/avatars/${row[key]}.png`}
                          alt="avatar"
                          style={{
                            width: isTvMode ? "90px" : "70px",
                            height: isTvMode ? "90px" : "70px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border:
                              row["Место"] == 1
                                ? "4px solid gold"
                                : row["Место"] == 2
                                ? "4px solid silver"
                                : row["Место"] == 3
                                ? "4px solid #cd7f32"
                                : "2px solid #ccc",
                          }}
                        />
                      ) : (
                        String(row[key] ?? "")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./index.css";

const API_URL = "https://leaderboard-server-vgia.onrender.com";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function App() {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [avatar, setAvatar] = useState("ava1");
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

  const addScore = async () => {
    if (!name.trim() || !amount) {
      alert("Введи ник и сумму");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add`, {
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

      const result = await response.json();
      setData(result);

      setName("");
      setAmount("");
      setAvatar("ava1");
    } catch (error) {
      alert("Ошибка запроса к серверу");
      console.error(error);
    }
  };

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

      {!isTvMode && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "20px",
            width: "100%",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <input
            type="text"
            placeholder="НИК"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px", fontSize: "16px" }}
          />

          <input
            type="number"
            placeholder="Сумма оплаты"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "10px", fontSize: "16px" }}
          />

          <select
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            style={{ padding: "10px", fontSize: "16px" }}
          >
            <option value="ava1">ava1</option>
            <option value="ava2">ava2</option>
            <option value="ava3">ava3</option>
          </select>

          <button
            onClick={addScore}
            style={{
              padding: "10px 18px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "none",
              background: "#1e293b",
              color: "white",
            }}
          >
            Добавить
          </button>
        </div>
      )}

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


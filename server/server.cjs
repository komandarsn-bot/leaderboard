const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3001;

// 🔥 ФИЛЬТР (глобальный)
let leaderboardFilter = {
  from: null,
  to: null,
};

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const SUPABASE_URL = "https://jolawvvbcpgnrsvuolkw.supabase.co";
const SUPABASE_KEY = "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// 🔐 Проверка админа
function checkAdmin(req, res) {
  const adminLogin = req.headers["x-admin-login"];
  const adminPassword = req.headers["x-admin-password"];

  if (adminLogin !== ADMIN_LOGIN || adminPassword !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Нет доступа" });
    return false;
  }

  return true;
}

// 🔥 УСТАНОВКА ФИЛЬТРА
app.post("/set-filter", (req, res) => {
  if (!checkAdmin(req, res)) return;

  const { from, to } = req.body;

  leaderboardFilter = {
    from: from || null,
    to: to || null,
  };

  res.json({ success: true, filter: leaderboardFilter });
});

// 🔥 ОСНОВНОЙ LEADERBOARD
app.get("/leaderboard", async (req, res) => {
  try {
    // ❗ если фильтр НЕ задан → обычный leaderboard
    if (!leaderboardFilter.from && !leaderboardFilter.to) {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("points", { ascending: false });

      if (error) throw error;

      const result = (data || []).map((user, index) => ({
        Место: index + 1,
        Аватар: user.avatar || "1 уровень",
        НИК: user.nickname,
        Очков: Number(user.points) || 0,
      }));

      return res.json(result);
    }

    // 🔥 если фильтр есть → считаем по transactions
    let query = supabase.from("transactions").select("*");

    if (leaderboardFilter.from) {
      query = query.gte("created_at", `${leaderboardFilter.from}T00:00:00`);
    }

    if (leaderboardFilter.to) {
      query = query.lte("created_at", `${leaderboardFilter.to}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 🔥 группировка по никам
    const grouped = {};

    (data || []).forEach((item) => {
      const nick = item.nickname;

      if (!grouped[nick]) {
        grouped[nick] = {
          НИК: nick,
          Очков: 0,
        };
      }

      grouped[nick].Очков += Number(item.points) || 0;
    });

    const result = Object.values(grouped)
      .sort((a, b) => b["Очков"] - a["Очков"])
      .map((item, index) => ({
        Место: index + 1,
        Аватар: "1 уровень",
        НИК: item["НИК"],
        Очков: item["Очков"],
      }));

    res.json(result);
  } catch (error) {
    console.error("GET /leaderboard error:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🔐 Проверка логина
app.post("/admin-check", (req, res) => {
  if (!checkAdmin(req, res)) return;
  res.json({ ok: true });
});

// ➕ Добавление очков
app.post("/add", async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Нет имени или суммы" });
    }

    const nickname = String(name).trim();

    const rawXp = Math.floor(Number(amount) / 150);
    const pointsToAdd = Math.min(rawXp, 300);

    if (pointsToAdd <= 0) {
      return res.status(400).json({ error: "Сумма слишком маленькая" });
    }

    const { data: existing } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("nickname", nickname)
      .maybeSingle();

    let totalXp = pointsToAdd;

    if (existing) {
      totalXp = Number(existing.points || 0) + pointsToAdd;

      await supabase
        .from("leaderboard")
        .update({
          points: totalXp,
          avatar: `${Math.min(Math.floor(totalXp / 100) + 1, 15)} уровень`,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("leaderboard").insert({
        nickname,
        avatar: "1 уровень",
        points: pointsToAdd,
      });
    }

    // 🔥 запись в историю
    await supabase.from("transactions").insert({
      nickname,
      amount: Number(amount),
      points: pointsToAdd,
      avatar: "1 уровень",
      action: "add",
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("POST /add error:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🧨 Сброс
app.post("/reset", async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    await supabase
      .from("leaderboard")
      .delete()
      .gte("points", 0);

    await supabase.from("transactions").insert({
      nickname: "ADMIN",
      amount: 0,
      points: 0,
      avatar: "1 уровень",
      action: "reset",
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("POST /reset error:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
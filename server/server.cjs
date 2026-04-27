const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3001;

const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "1234";

const SUPABASE_URL = "https://jolawvvbcpgnrsvuolkw.supabase.co";
const SUPABASE_KEY = "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());

function checkAdmin(req, res) {
  const adminLogin = req.headers["x-admin-login"];
  const adminPassword = req.headers["x-admin-password"];

  if (adminLogin !== ADMIN_LOGIN || adminPassword !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Нет доступа" });
    return false;
  }

  return true;
}

function getLevel(xp) {
  if (xp < 100) return 1;
  if (xp < 200) return 2;
  if (xp < 300) return 3;
  if (xp < 400) return 4;
  if (xp < 500) return 5;

  if (xp < 650) return 6;
  if (xp < 800) return 7;
  if (xp < 950) return 8;
  if (xp < 1100) return 9;
  if (xp < 1250) return 10;

  if (xp < 1500) return 11;
  if (xp < 1750) return 12;
  if (xp < 2000) return 13;
  if (xp < 2250) return 14;

  return 15;
}

function getAvatarByXp(xp) {
  return `${getLevel(xp)} уровень`;
}

async function getLeaderboard() {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("points", { ascending: false });

  if (error) throw error;

  return data.map((user, index) => ({
    Место: index + 1,
    Аватар: user.avatar || "1 уровень",
    НИК: user.nickname,
    Очков: user.points || 0,
  }));
}

app.get("/leaderboard", async (req, res) => {
  try {
    const data = await getLeaderboard();
    res.json(data);
  } catch (error) {
    console.error("GET /leaderboard error:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

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

    const { data: existing, error: findError } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("nickname", nickname)
      .maybeSingle();

    if (findError) throw findError;

    let totalXp = pointsToAdd;

    if (existing) {
      totalXp = Number(existing.points || 0) + pointsToAdd;

      const { error } = await supabase
        .from("leaderboard")
        .update({
          points: totalXp,
          avatar: getAvatarByXp(totalXp),
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("leaderboard").insert({
        nickname,
        avatar: getAvatarByXp(pointsToAdd),
        points: pointsToAdd,
      });

      if (error) throw error;
    }

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        nickname,
        amount: Number(amount),
        points: pointsToAdd,
        avatar: getAvatarByXp(totalXp),
        action: "add",
      });

    if (transactionError) throw transactionError;

    const data = await getLeaderboard();
    res.json(data);
  } catch (error) {
    console.error("POST /add error:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/reset", async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { error } = await supabase
      .from("leaderboard")
      .delete()
      .gte("points", 0);

    if (error) throw error;

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
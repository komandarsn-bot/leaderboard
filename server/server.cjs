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

async function getLeaderboard() {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("points", { ascending: false });

  if (error) throw error;

  return data.map((user, index) => ({
    Место: index + 1,
    Аватар: user.avatar || "ava1",
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

    const { name, amount, avatar } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Нет имени или суммы" });
    }

    const nickname = String(name).trim();
    const pointsToAdd = Math.floor(Number(amount) / 10);

    const { data: existing, error: findError } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("nickname", nickname)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const { error } = await supabase
        .from("leaderboard")
        .update({
          points: Number(existing.points) + pointsToAdd,
          avatar: existing.avatar || avatar || "ava1",
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("leaderboard").insert({
        nickname,
        avatar: avatar || "ava1",
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
        avatar: avatar || "ava1",
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

    res.json({ ok: true });
  } catch (error) {
    console.error("POST /reset error:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
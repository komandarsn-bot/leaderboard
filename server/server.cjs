const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const dataFile = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

function readData() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
  }

  const raw = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(raw || "[]");
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8");
}

app.get("/leaderboard", (req, res) => {
  const data = readData();
  res.json(data);
});

app.post("/add", (req, res) => {
  const { name, amount, avatar } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ error: "Нет имени или суммы" });
  }

  const points = Math.floor(Number(amount) / 10);

  let data = readData();

  const existing = data.find(
    (user) => user["НИК"].toLowerCase() === String(name).trim().toLowerCase()
  );

  if (existing) {
    existing["Очков"] = Number(existing["Очков"]) + points;
    if (!existing["Аватар"]) {
      existing["Аватар"] = avatar || "ava1";
    }
  } else {
    data.push({
      Место: 0,
      Аватар: avatar || "ava1",
      НИК: String(name).trim(),
      Очков: points
    });
  }

  data.sort((a, b) => Number(b["Очков"]) - Number(a["Очков"]));

  data = data.map((user, index) => ({
    ...user,
    Место: index + 1
  }));

  writeData(data);

  res.json(data);
});

app.post("/reset", (req, res) => {
  writeData([]);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});

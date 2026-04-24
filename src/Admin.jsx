import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "ТВОЙ_sb_publishable_КЛЮЧ"
);

export default function Admin() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [avatar, setAvatar] = useState("ava1");

  const addUser = async () => {
    if (!name.trim() || !amount) {
      alert("Заполни ник и сумму");
      return;
    }

    const nickname = name.trim();
    const points = Math.floor(Number(amount) / 10);

    const { data: existing, error: findError } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("nickname", nickname)
      .maybeSingle();

    if (findError) {
      alert("Ошибка поиска игрока");
      console.error(findError);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from("leaderboard")
        .update({
          points: Number(existing.points) + points,
          avatar: existing.avatar || avatar,
        })
        .eq("id", existing.id);

      if (error) {
        alert("Ошибка обновления");
        console.error(error);
        return;
      }
    } else {
      const { error } = await supabase.from("leaderboard").insert({
        nickname,
        points,
        avatar,
      });

      if (error) {
        alert("Ошибка добавления");
        console.error(error);
        return;
      }
    }

    alert("Добавлено");
    setName("");
    setAmount("");
    setAvatar("ava1");
  };

  const reset = async () => {
    if (!confirm("Сбросить таблицу?")) return;

    const { error } = await supabase
      .from("leaderboard")
      .delete()
      .neq("nickname", "");

    if (error) {
      alert("Ошибка сброса");
      console.error(error);
      return;
    }

    alert("Сброшено");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Админ панель</h2>

      <input
        placeholder="Ник"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={avatar} onChange={(e) => setAvatar(e.target.value)}>
        <option value="ava1">ava1</option>
        <option value="ava2">ava2</option>
        <option value="ava3">ava3</option>
      </select>

      <button onClick={addUser}>Добавить</button>
      <button onClick={reset}>Сбросить всё</button>
    </div>
  );
}
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function Admin() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [avatar, setAvatar] = useState("ava1");

  const addUser = async () => {
    const points = Math.floor(Number(amount) / 10);

    const { data: existing } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("nickname", name)
      .single();

    if (existing) {
      await supabase
        .from("leaderboard")
        .update({ points: existing.points + points })
        .eq("id", existing.id);
    } else {
      await supabase.from("leaderboard").insert({
        nickname: name,
        points: points,
        avatar: avatar,
      });
    }

    setName("");
    setAmount("");
  };

  const reset = async () => {
    await supabase.from("leaderboard").delete().neq("id", 0);
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
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select onChange={(e) => setAvatar(e.target.value)}>
        <option value="ava1">ava1</option>
        <option value="ava2">ava2</option>
      </select>

      <button onClick={addUser}>Добавить</button>
      <button onClick={reset}>Сбросить всё</button>
    </div>
  );
}
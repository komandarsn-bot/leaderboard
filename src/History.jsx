import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jolawvvbcpgnrsvuolkw.supabase.co",
  "sb_publishable_FCi8HaHs5fWnX6WA3InGPA_fprHBdNQ"
);

export default function History() {
  const [items, setItems] = useState([]);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Ошибка загрузки истории");
      return;
    }

    setItems(data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>История операций</h2>

      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>НИК</th>
            <th>Сумма</th>
            <th>Очки</th>
            <th>Аватар</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.created_at).toLocaleString("ru-RU")}</td>
              <td>{item.nickname}</td>
              <td>{item.amount}</td>
              <td>{item.points}</td>
              <td>{item.avatar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
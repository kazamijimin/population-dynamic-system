import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {

  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/health/")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Population Dynamic System</h2>

      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

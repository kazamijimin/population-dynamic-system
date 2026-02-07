import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/health/")
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError(err.message || "Failed to connect");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh" }}>
      <h2 style={{ color: "#1f2937" }}>Manager Dashboard</h2>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: "red", padding: 16, background: "#fee2e2", borderRadius: 8 }}>
          <p><strong>Error:</strong> {error}</p>
          <p>Make sure the backend is running on http://127.0.0.1:8000</p>
        </div>
      )}

      {data && (
        <div style={{ padding: 16, background: "#fff", borderRadius: 8 }}>
          <p style={{ color: "green" }}>✓ Connected to backend!</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
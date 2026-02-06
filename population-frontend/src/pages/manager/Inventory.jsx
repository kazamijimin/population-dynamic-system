import { useEffect, useState } from "react";
import { getItems, getIngredients } from "../../api/inventory.api";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, ingredientsData] = await Promise.all([
        getItems(),
        getIngredients(),
      ]);
      setItems(itemsData);
      setIngredients(ingredientsData);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    beverage: "bg-blue-100 text-blue-700",
    food: "bg-orange-100 text-orange-700",
    dessert: "bg-pink-100 text-pink-700",
    other: "bg-gray-100 text-gray-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
        <p className="text-gray-500 mt-1">View items and ingredients</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "items"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("ingredients")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "ingredients"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Ingredients ({ingredients.length})
        </button>
      </div>

      {/* Items Table */}
      {activeTab === "items" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">₱{item.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ingredients Table */}
      {activeTab === "ingredients" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ingredients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No ingredients found.
                  </td>
                </tr>
              ) : (
                ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{ingredient.name}</div>
                      <div className="text-sm text-gray-500">{ingredient.description}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {ingredient.quantity} {ingredient.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {ingredient.min_stock_level} {ingredient.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ingredient.is_low_stock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {ingredient.is_low_stock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
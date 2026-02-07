import { useEffect, useState } from "react";
import {
  getItems,
  getIngredients,
  createItem,
  createIngredient,
  deleteItem,
  deleteIngredient,
} from "../../api/inventory.api";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    category: "beverage",
    price: "",
    is_available: true,
  });

  const [ingredientForm, setIngredientForm] = useState({
    name: "",
    description: "",
    quantity: "",
    unit: "pcs",
    min_stock_level: "",
    cost_per_unit: "",
  });

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

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await createItem({ ...itemForm, price: parseFloat(itemForm.price) });
      setItemForm({ name: "", description: "", category: "beverage", price: "", is_available: true });
      setShowModal(false);
      fetchData();
    } catch {
      setError("Failed to create item");
    }
  };

  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    try {
      await createIngredient({
        ...ingredientForm,
        quantity: parseFloat(ingredientForm.quantity),
        min_stock_level: parseFloat(ingredientForm.min_stock_level),
        cost_per_unit: parseFloat(ingredientForm.cost_per_unit),
      });
      setIngredientForm({ name: "", description: "", quantity: "", unit: "pcs", min_stock_level: "", cost_per_unit: "" });
      setShowModal(false);
      fetchData();
    } catch {
      setError("Failed to create ingredient");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        fetchData();
      } catch {
        setError("Failed to delete item");
      }
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await deleteIngredient(id);
        fetchData();
      } catch {
        setError("Failed to delete ingredient");
      }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage your items and ingredients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Add {activeTab === "items" ? "Item" : "Ingredient"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-4 font-bold">×</button>
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
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No items found. Add your first item!
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cost/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ingredients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No ingredients found. Add your first ingredient!
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
                    <td className="px-6 py-4 text-gray-600">₱{ingredient.cost_per_unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ingredient.is_low_stock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {ingredient.is_low_stock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Add {activeTab === "items" ? "Item" : "Ingredient"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            {activeTab === "items" ? (
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beverage">Beverage</option>
                    <option value="food">Food</option>
                    <option value="dessert">Dessert</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <label htmlFor="is_available" className="text-sm text-gray-700">Available</label>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Item
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateIngredient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={ingredientForm.name}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={ingredientForm.description}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredientForm.quantity}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={ingredientForm.unit}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="kg">Kilograms</option>
                      <option value="g">Grams</option>
                      <option value="l">Liters</option>
                      <option value="ml">Milliliters</option>
                      <option value="pcs">Pieces</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredientForm.min_stock_level}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, min_stock_level: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Unit (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredientForm.cost_per_unit}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, cost_per_unit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Ingredient
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
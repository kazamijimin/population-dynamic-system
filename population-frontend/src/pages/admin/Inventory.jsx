import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as inventoryApi from '../../api/inventory.api';
import { analyticsApi } from '../../api/analytics.api';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredients, setIngredients] = useState([]);
  const [items, setItems] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    min_stock_level: '',
    cost_per_unit: '',
    is_restock_suggestion_active: false,
    restock_override_amount: ''
  });

  const categoryColors = {
    hot_drinks: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cold_drinks: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pastries: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    desserts: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    add_ons: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 'ingredients') {
        const data = await inventoryApi.getIngredients();
        setIngredients(data);
      } else {
        const data = await inventoryApi.getItems();
        setItems(data);
      }
      const history = await analyticsApi.getHistoricalData();
      setHistoricalData(Array.isArray(history.data) ? history.data : (history.data?.results || []));
    } catch {
      setError('System communication failure. Inventory registry unreachable.');
    }
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchData]);

  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.createIngredient(ingredientForm);
      setShowModal(false);
      setIngredientForm({ name: '', quantity: '', unit: 'kg', min_stock_level: '', cost_per_unit: '', is_restock_suggestion_active: false, restock_override_amount: '' });
      await fetchData();
    } catch {
      setError('Security violation or validation error during stock write.');
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('IRREVERSIBLE ACTION: Purge ingredient from global registry?')) {
      try {
        await inventoryApi.deleteIngredient(id);
        await fetchData();
      } catch {
        setError('Authorization failure: Purge request denied.');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('IRREVERSIBLE ACTION: Archive menu item?')) {
      try {
        await inventoryApi.deleteItem(id);
        await fetchData();
      } catch {
        setError('Authorization failure: Archive request denied.');
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await analyticsApi.uploadHistoricalData(formData);
      await fetchData();
      alert('TRAINING DATA INGESTED SUCCESSFULLY');
    } catch {
      setError('Data corruption or invalid format detected in upload.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-linear-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-100 transition-opacity">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20 opacity-10 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20 opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-fuchsia-700 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20 opacity-10 animate-blob animation-delay-4000"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
          <div className="space-y-3">
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic drop-shadow-sm">
              Supply Chain <span className="text-violet-600 dark:text-violet-300">Hub</span>
            </h1>
            <div className="flex items-center gap-3 bg-white dark:bg-linear-to-r dark:from-violet-500/10 dark:to-fuchsia-600/10 backdrop-blur-md border border-slate-200 dark:border-violet-500/20 rounded-full px-4 py-2 w-fit shadow-sm dark:shadow-none">
              <div className="w-2 h-2 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse shadow-lg" />
              <p className="text-slate-500 dark:text-violet-300 font-black font-mono text-xs tracking-[0.3em] uppercase">MODULE_STOCK_V2 // SECURITY_LVL: ADMIN</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="group relative px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest overflow-hidden bg-white dark:bg-linear-to-br dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600/50 hover:border-violet-500 transition-all hover:shadow-xl shadow-sm"
            >
              <div className="relative flex items-center gap-3">
                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                TRAINING DATA
              </div>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="group relative px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest overflow-hidden bg-violet-600 dark:bg-linear-to-br dark:from-violet-500 dark:via-violet-600 dark:to-fuchsia-700 text-white border border-violet-400/50 hover:border-white transition-all hover:shadow-2xl hover:shadow-violet-500/50 active:scale-95"
            >
              <div className="relative flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg leading-none">+</span>
                </div>
                RESTOCK SUPPLIES
              </div>
            </button>
          </div>
        </div>

        {/* Messaging */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 backdrop-blur-md border border-rose-200 dark:border-rose-500/30 p-6 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">!</div>
              <p className="text-rose-600 dark:text-rose-300 font-bold text-sm tracking-tight">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Tabs Control */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab("ingredients")}
            className={`group relative px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all overflow-hidden border ${
              activeTab === "ingredients"
                ? "bg-white dark:bg-slate-700 dark:border-violet-500/50 text-violet-600 dark:text-violet-200 shadow-xl dark:shadow-violet-500/20 -translate-y-1"
                : "bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-400 border-slate-200 hover:border-violet-500 dark:hover:border-violet-600 shadow-sm"
            }`}
          >
            <div className="relative flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${activeTab === "ingredients" ? "bg-violet-500 shadow-lg animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
              STOCKS
              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTab === "ingredients" ? "bg-violet-100 dark:bg-violet-500/30 text-violet-600 dark:text-violet-200" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}>
                {ingredients.length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab("items")}
            className={`group relative px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all overflow-hidden border ${
              activeTab === "items"
                ? "bg-amber-500 dark:bg-amber-600 border-amber-400 dark:border-amber-500/50 text-white dark:text-amber-100 shadow-xl dark:shadow-amber-600/20 -translate-y-1"
                : "bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-400 border-slate-200 hover:border-amber-500 dark:hover:border-amber-600 shadow-sm"
            }`}
          >
            <div className="relative flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${activeTab === "items" ? "bg-white shadow-lg animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
              MENU
              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTab === "items" ? "bg-amber-100/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}>
                {items.length}
              </span>
            </div>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden hover:border-violet-500/30 transition-all">
          {activeTab === "items" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/30">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Product Details</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Category</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Priced At</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Availability</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <p className="font-bold text-slate-400 dark:text-slate-500 italic text-lg uppercase tracking-widest">No products registered in menu database.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-violet-500/5 transition-all">
                        <td className="px-8 py-8">
                          <div className="font-black text-slate-900 dark:text-slate-100 text-xl uppercase tracking-tighter italic">{item.name}</div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-1 max-w-[30ch] truncate">{item.description || 'No description provided.'}</div>
                        </td>
                        <td className="px-8 py-8">
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border backdrop-blur-sm ${categoryColors[item.category] || "bg-slate-100 text-slate-400"}`}>
                            {item.category?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-8 font-mono font-black text-violet-600 dark:text-violet-300 text-2xl tracking-tighter">₱{parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.is_available ? "bg-violet-500 shadow-lg" : "bg-rose-500 shadow-lg animate-pulse"}`} />
                            <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${item.is_available ? "text-violet-600 dark:text-violet-400" : "text-rose-500 dark:text-rose-400"}`}>
                              {item.is_available ? "Active In Menu" : "Temporarily Sold Out"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                          >
                            ARCHIVE
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/30">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Ingredient</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Stock Count</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Threshold</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Unit Cost</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Health</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-[0.2em]">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {ingredients.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-32 text-center font-bold text-slate-400 italic opacity-40 uppercase tracking-widest text-lg">Global inventory currently empty.</td>
                    </tr>
                  ) : (
                    ingredients.map((ing) => (
                      <tr key={ing.id} className="group hover:bg-slate-50 dark:hover:bg-violet-500/5 transition-all">
                        <td className="px-8 py-8">
                          <div className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter text-lg">{ing.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-1 italic tracking-widest">ID: {ing.id.toString().padStart(4, '0')}</div>
                        </td>
                        <td className="px-8 py-8 font-mono font-black text-violet-600 dark:text-violet-300 text-xl">
                          {ing.quantity} <span className="text-slate-400 text-xs">{ing.unit}</span>
                        </td>
                        <td className="px-8 py-8 font-mono font-bold text-slate-400">
                          {ing.min_stock_level} <span className="text-[10px]">{ing.unit}</span>
                        </td>
                        <td className="px-8 py-8 font-mono font-bold text-violet-600 dark:text-violet-300 text-lg">₱{parseFloat(ing.cost_per_unit).toFixed(2)}</td>
                        <td className="px-8 py-8">
                          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${
                            ing.is_low_stock 
                            ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-600 dark:text-rose-300" 
                            : "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30 text-violet-600 dark:text-violet-300"
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${ing.is_low_stock ? "bg-rose-500 animate-bounce" : "bg-violet-500"}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                              {ing.is_low_stock ? "CRITICAL" : "NOMINAL"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button
                            onClick={() => handleDeleteIngredient(ing.id)}
                            className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                          >
                            PURGE
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Modern Modal Overlays */}
  {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 transition-colors">
            {/* Modal Header */}
            <div className="px-10 py-12 bg-violet-600 text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Restock</h2>
                <p className="text-violet-100 text-[10px] font-bold mt-2 opacity-80 uppercase tracking-[0.3em]">SECURE_WRITE: STOCKS</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all group active:scale-90"
              >
                <span className="text-3xl font-light">×</span>
              </button>
            </div>

            <div className="p-10">
              <form onSubmit={handleCreateIngredient} className="space-y-6">
                <FormInput label="Ingredient Identity" placeholder="e.g. Whole Milk" value={ingredientForm.name} onChange={(v) => setIngredientForm({ ...ingredientForm, name: v })} />
                
                <div className="grid grid-cols-2 gap-6">
                  <FormInput type="number" label="Qty" value={ingredientForm.quantity} onChange={(v) => setIngredientForm({ ...ingredientForm, quantity: v })} />
                  <FormSelect 
                    label="Unit" 
                    value={ingredientForm.unit} 
                    onChange={(v) => setIngredientForm({ ...ingredientForm, unit: v })}
                    options={[
                      { label: 'kg', value: 'kg' },
                      { label: 'g', value: 'g' },
                      { label: 'l', value: 'l' },
                      { label: 'ml', value: 'ml' },
                      { label: 'pcs', value: 'pcs' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormInput type="number" label="Trigger" value={ingredientForm.min_stock_level} onChange={(v) => setIngredientForm({ ...ingredientForm, min_stock_level: v })} />
                  <FormInput type="number" label="Cost (₱)" value={ingredientForm.cost_per_unit} onChange={(v) => setIngredientForm({ ...ingredientForm, cost_per_unit: v })} />
                </div>

                <button type="submit" className="w-full py-6 bg-violet-600 dark:bg-linear-to-r dark:from-violet-600 dark:to-indigo-700 text-white rounded-4xl font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-500/30 hover:shadow-2xl transition-all active:scale-95">
                   INITIATE_SUPPLY
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Data Portal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center z-101 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="px-10 py-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Data Portal</h2>
                <p className="text-slate-400 text-[10px] font-mono mt-2 uppercase tracking-widest">SUB_MODULE: HISTORICAL_CALIBRATION</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="w-12 h-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-2xl font-light">×</button>
            </div>

            <div className="p-10 space-y-8">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center space-y-4 hover:border-violet-500 transition-all group relative cursor-pointer">
                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <div>
                  <p className="font-extrabold text-slate-700 dark:text-slate-200 text-lg">Drop Historical CSV</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">REQUIRED: DATE, SALES_VOLUME</p>
                </div>
              </div>

              <div className="space-y-3 max-h-75 overflow-y-auto">
                {historicalData.map(data => (
                  <div key={data.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-violet-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">CSV</div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-slate-100 text-sm italic">{data.filename}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">{data.row_count} POINTS // {new Date(data.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => analyticsApi.deleteHistoricalData(data.id).then(fetchData)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

// ============ DESIGN HELPER COMPONENTS ============
function FormInput({ label, type = "text", value, onChange, ...props }) {
  return (
    <div className="space-y-2 w-full">
      <label className="block text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-widest leading-none pl-1">{label}</label>
      <input 
        type={type}
        value={value}
        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-violet-500 font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        onChange={(e) => onChange && onChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

function FormSelect({ label, options, ...props }) {
  return (
    <div className="space-y-2 w-full">
      <label className="block text-[10px] font-black text-slate-400 dark:text-violet-400 uppercase tracking-widest leading-none pl-1">{label}</label>
      <select 
        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-violet-500 font-black text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100 appearance-none cursor-pointer shadow-sm"
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

export default Inventory;
 

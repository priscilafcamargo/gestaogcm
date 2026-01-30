
import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  X,
  Save,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Tag,
  Boxes,
  Loader2,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Fingerprint,
  ClipboardList,
  Printer
} from 'lucide-react';
import { EstoqueItem } from '../types';
import { BRASAO_GCM } from '../config/constants';

const STAFF_NAMES = ["SANTOS", "SILVA", "MELO", "FERREIRA", "OLIVEIRA", "COSTA", "FERRAZ", "RICARDO", "SOUZA", "PEDRO"];

const Estoque: React.FC = () => {
  const [items, setItems] = useState<EstoqueItem[]>([
    { id: '1', nome: 'Uniforme Completo Azul Marinho', categoria: 'Uniforme', quantidade: 45, unidade: 'UN', estoqueMinimo: 10 },
    { id: '2', nome: 'Algema de Aço Niquelado', categoria: 'Equipamento', quantidade: 8, unidade: 'UN', estoqueMinimo: 15 },
    { id: '3', nome: 'Papel A4 Sulfite', categoria: 'Outros', quantidade: 120, unidade: 'CX', estoqueMinimo: 20 },
    { id: '4', nome: 'Munição .380 SPL', categoria: 'Armamento', quantidade: 1200, unidade: 'UN', estoqueMinimo: 500 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<EstoqueItem | null>(null);
  const [adjustType, setAdjustType] = useState<'entrada' | 'saida'>('entrada');
  const [adjustValue, setAdjustValue] = useState('');
  const [deliveryGcm, setDeliveryGcm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [newItem, setNewItem] = useState<Partial<EstoqueItem>>({
    nome: '',
    categoria: 'Equipamento',
    quantidade: 0,
    unidade: 'UN',
    estoqueMinimo: 5,
    observacao: '',
    nPatrimonio: ''
  });

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const item: EstoqueItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...(newItem as EstoqueItem),
      ultimaMovimentacao: new Date().toLocaleDateString('pt-BR')
    };

    setItems([item, ...items]);
    setIsModalOpen(false);
    setIsSaving(false);
    setNewItem({ nome: '', categoria: 'Equipamento', quantidade: 0, unidade: 'UN', estoqueMinimo: 5, observacao: '', nPatrimonio: '' });
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustValue) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const val = parseInt(adjustValue);
    setItems(items.map(i => {
      if (i.id === selectedItem.id) {
        const newQty = adjustType === 'entrada' ? i.quantidade + val : i.quantidade - val;
        return { ...i, quantidade: Math.max(0, newQty), ultimaMovimentacao: new Date().toLocaleDateString('pt-BR') };
      }
      return i;
    }));

    setIsAdjustModalOpen(false);
    setIsSaving(false);
    setAdjustValue('');
  };

  const handleDeliveryToGcm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustValue || !deliveryGcm) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const val = parseInt(adjustValue);
    setItems(items.map(i => {
      if (i.id === selectedItem.id) {
        return {
          ...i,
          quantidade: Math.max(0, i.quantidade - val),
          ultimaMovimentacao: `ENTREGA GCM ${deliveryGcm} EM ${new Date().toLocaleDateString('pt-BR')}`
        };
      }
      return i;
    }));

    setIsDeliveryModalOpen(false);
    setIsSaving(false);
    setAdjustValue('');
    setDeliveryGcm('');
    alert(`Entrega de ${val} ${selectedItem.unidade} de ${selectedItem.nome} para GCM ${deliveryGcm} registrada com sucesso.`);
  };

  const handlePrintInventory = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.quantidade <= i.estoqueMinimo).length;
    const categorias = [...new Set(items.map(i => i.categoria))];

    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Estoque - GCM Capão Bonito</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 11px; }
            .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px; display: flex; align-items: center; gap: 20px; }
            .logo { width: 70px; height: auto; }
            .header-info h1 { margin: 0; font-size: 20px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.5px; }
            .header-info p { margin: 2px 0 0 0; font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
            .summary-card { border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
            .summary-label { font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
            .summary-value { font-size: 24px; font-weight: 900; color: #1e293b; }
            .summary-card.alert { border-color: #ef4444; background: #fef2f2; }
            .summary-card.alert .summary-value { color: #dc2626; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead { background: #f8fafc; }
            th { padding: 10px; text-align: left; font-size: 8px; font-weight: 900; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            td { padding: 10px; font-size: 10px; border-bottom: 1px solid #f1f5f9; }
            .item-name { font-weight: 700; color: #1e293b; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 7px; font-weight: 900; text-transform: uppercase; }
            .badge-category { background: #f1f5f9; color: #64748b; }
            .badge-alert { background: #fef2f2; color: #dc2626; }
            .badge-ok { background: #ecfdf5; color: #059669; }
            .qty { font-weight: 900; font-size: 12px; }
            .qty.low { color: #dc2626; }
            .qty.ok { color: #1e3a8a; }
            
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8px; color: #94a3b8; }
            
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${BRASAO_GCM}" class="logo" />
            <div class="header-info">
              <h1>Relatório de Controle de Estoque</h1>
              <p>Guarda Civil Municipal de Capão Bonito - SP</p>
              <p>Divisão de Logística e Patrimônio</p>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Total de Itens</div>
              <div class="summary-value">${totalItems}</div>
            </div>
            <div class="summary-card alert">
              <div class="summary-label">Itens em Alerta</div>
              <div class="summary-value">${lowStockItems}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Categorias</div>
              <div class="summary-value">${categorias.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Material / Descrição</th>
                <th>Categoria</th>
                <th style="text-align: center;">Saldo Atual</th>
                <th style="text-align: center;">Estoque Mín.</th>
                <th>Status</th>
                <th>Última Movimentação</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
      const isLow = item.quantidade <= item.estoqueMinimo;
      return `
                  <tr>
                    <td class="item-name">${item.nome}</td>
                    <td><span class="badge badge-category">${item.categoria}</span></td>
                    <td style="text-align: center;"><span class="qty ${isLow ? 'low' : 'ok'}">${item.quantidade} ${item.unidade}</span></td>
                    <td style="text-align: center;">${item.estoqueMinimo} ${item.unidade}</td>
                    <td><span class="badge ${isLow ? 'badge-alert' : 'badge-ok'}">${isLow ? 'ESTOQUE BAIXO' : 'NORMAL'}</span></td>
                    <td style="font-size: 9px; color: #64748b;">${item.ultimaMovimentacao || 'SEM MOVIMENTAÇÃO'}</td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>Guarda Civil Municipal de Capão Bonito - Sistema de Gestão Operacional</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Deseja realmente remover este item do estoque?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const filteredItems = items.filter(i =>
    i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Controle de Estoque</h2>
          <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-1">
            <Boxes className="w-3.5 h-3.5 text-blue-800" /> Logística e Gestão de Materiais GCM
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrintInventory}
            className="flex items-center gap-2 bg-slate-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl border-b-4 border-slate-900 active:scale-95"
          >
            <Printer className="w-4 h-4" /> Imprimir Relatório
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-900 transition-all shadow-xl border-b-4 border-blue-950 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Itens</p>
          <p className="text-3xl font-black text-slate-800">{items.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens em Alerta</p>
          <p className="text-3xl font-black text-red-600">
            {items.filter(i => i.quantidade <= i.estoqueMinimo).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm md:col-span-2 flex items-center">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Material / Descrição</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5 text-center">Saldo Atual</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => {
                const isLow = item.quantidade <= item.estoqueMinimo;
                return (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border-2 border-white shadow-sm ${isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight uppercase text-sm">{item.nome}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{item.ultimaMovimentacao || 'SEM MOVIMENTAÇÃO'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <p className={`text-lg font-black ${isLow ? 'text-red-600' : 'text-blue-900'}`}>
                        {item.quantidade} <span className="text-[10px] text-slate-400">{item.unidade}</span>
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      {isLow ? (
                        <span className="flex items-center gap-1.5 text-red-600 font-black text-[9px] uppercase tracking-widest animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedItem(item); setIsDeliveryModalOpen(true); }}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Entregar para GCM"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setAdjustType('entrada'); setIsAdjustModalOpen(true); }}
                          className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Entrada de Material"
                        >
                          <ArrowUpCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setSelectedItem(item); setAdjustType('saida'); setIsAdjustModalOpen(true); }}
                          className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                          title="Saída de Material"
                        >
                          <ArrowDownCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2.5 text-slate-300 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastro de Novo Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-slate-900/30 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-blue-800 p-8 text-white flex justify-between items-center border-b-4 border-blue-950 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Package className="w-6 h-6 text-blue-100" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Novo Material</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSaveItem} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Item</label>
                <input
                  required
                  type="text"
                  value={newItem.nome}
                  onChange={e => setNewItem({ ...newItem, nome: e.target.value.toUpperCase() })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="EX: COLETE BALÍSTICO NIII"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <div className="relative group">
                    <select
                      value={newItem.categoria}
                      onChange={e => setNewItem({ ...newItem, categoria: e.target.value as any })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 appearance-none"
                    >
                      <option>Uniforme</option>
                      <option>Equipamento</option>
                      <option>Armamento</option>
                      <option>Informática</option>
                      <option>Limpeza</option>
                      <option>Outros</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidade</label>
                  <select
                    value={newItem.unidade}
                    onChange={e => setNewItem({ ...newItem, unidade: e.target.value as any })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                  >
                    <option>UN</option>
                    <option>CX</option>
                    <option>PT</option>
                    <option>L</option>
                    <option>KG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd. Inicial</label>
                  <input
                    required
                    type="number"
                    value={newItem.quantidade}
                    onChange={e => setNewItem({ ...newItem, quantidade: parseInt(e.target.value) })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estoque Mín.</label>
                  <input
                    required
                    type="number"
                    value={newItem.estoqueMinimo}
                    onChange={e => setNewItem({ ...newItem, estoqueMinimo: parseInt(e.target.value) })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">N.º Patrimônio (Opcional)</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={newItem.nPatrimonio}
                    onChange={e => setNewItem({ ...newItem, nPatrimonio: e.target.value.toUpperCase() })}
                    className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="EX: 123456"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
                <div className="relative">
                  <ClipboardList className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                  <textarea
                    rows={3}
                    value={newItem.observacao}
                    onChange={e => setNewItem({ ...newItem, observacao: e.target.value.toUpperCase() })}
                    className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                    placeholder="NOTAS ADICIONAIS SOBRE O MATERIAL..."
                  />
                </div>
              </div>

              <button
                disabled={isSaving}
                type="submit"
                className="w-full py-5 bg-blue-800 text-white font-black rounded-3xl shadow-xl hover:bg-blue-900 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-blue-950 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Cadastrar Material</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste de Saldo (Entrada/Saída Geral) */}
      {isAdjustModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl shadow-slate-900/30 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className={`${adjustType === 'entrada' ? 'bg-emerald-600 border-emerald-800' : 'bg-amber-600 border-amber-800'} p-8 text-white flex justify-between items-center border-b-4`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  {adjustType === 'entrada' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">
                  {adjustType === 'entrada' ? 'Entrada de Saldo' : 'Saída de Saldo'}
                </h3>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Item Selecionado</p>
                <p className="font-black text-slate-800 uppercase tracking-tight">{selectedItem.nome}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Saldo Atual: {selectedItem.quantidade} {selectedItem.unidade}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade do Ajuste</label>
                <input
                  required
                  autoFocus
                  type="number"
                  value={adjustValue}
                  onChange={e => setAdjustValue(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-3xl font-black text-slate-800 outline-none focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>

              <button
                disabled={isSaving || !adjustValue}
                type="submit"
                className={`w-full py-5 ${adjustType === 'entrada' ? 'bg-emerald-600 border-emerald-800' : 'bg-amber-600 border-amber-800'} text-white font-black rounded-3xl shadow-xl transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 active:scale-95 disabled:opacity-50`}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirmar Ajuste</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Entrega para GCM (Baixa Nominal) */}
      {isDeliveryModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-slate-900/30 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="bg-blue-600 border-blue-800 p-8 text-white flex justify-between items-center border-b-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Entrega para GCM</h3>
              </div>
              <button onClick={() => setIsDeliveryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleDeliveryToGcm} className="p-8 space-y-6">
              <div className="text-center bg-blue-50 p-4 rounded-3xl border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Item em Processo de Entrega</p>
                <p className="font-black text-blue-900 uppercase tracking-tight">{selectedItem.nome}</p>
                <p className="text-[10px] font-bold text-blue-600 mt-1">Disponível em Estoque: {selectedItem.quantidade} {selectedItem.unidade}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinatário (Selecione o GCM)</label>
                <div className="relative group">
                  <select
                    required
                    value={deliveryGcm}
                    onChange={e => setDeliveryGcm(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 appearance-none focus:ring-4 focus:ring-blue-500/10 outline-none"
                  >
                    <option value="">Selecione um integrante...</option>
                    {STAFF_NAMES.map(name => <option key={name} value={name}>GCM {name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade Entregue</label>
                <input
                  required
                  type="number"
                  value={adjustValue}
                  onChange={e => setAdjustValue(e.target.value)}
                  max={selectedItem.quantidade}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-black text-slate-800 outline-none focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-center">
                <Fingerprint className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[9px] text-amber-800 font-bold uppercase italic leading-tight">
                  Esta ação gera uma baixa nominal automática. O integrante selecionado constará no histórico do material.
                </p>
              </div>

              <button
                disabled={isSaving || !adjustValue || !deliveryGcm}
                type="submit"
                className="w-full py-5 bg-blue-800 border-blue-950 text-white font-black rounded-3xl shadow-xl transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirmar Entrega Digital</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-t-8 border-blue-600">
        <div className="absolute top-0 right-0 p-12 opacity-5"><Boxes className="w-48 h-48" /></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white/10 rounded-[2.5rem] border border-white/20">
            <Package className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-white">GESTÃO PATRIMONIAL E LOGÍSTICA</h4>
            <p className="text-slate-400 font-medium text-sm max-w-xl leading-relaxed">
              O controle de estoque permite a monitoração em tempo real de materiais críticos, garantindo que o efetivo da <span className="text-blue-400 font-bold">GCM Capão Bonito</span> nunca fique sem os recursos necessários para o serviço operacional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estoque;


import React, { useState } from 'react';
import {
  SearchCheck,
  Printer,
  Plus,
  Trash2,
  User,
  Car,
  MapPin,
  X,
  Save,
  CheckCircle2,
  Shield,
  Calendar as CalendarIcon,
  ChevronDown,
  Edit3,
  AlertCircle
} from 'lucide-react';
import { OperacaoVeicularData, AbordagemVeicular } from '../types';

const BRASAO_PADRAO = "https://raw.githubusercontent.com/pmcb/gcm-assets/main/brasao.png";

// Usuário logado (Consistente com o resto do app)
const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

// Pool de Efetivo (Consistente com outros módulos para seleção)
const GCM_POOL = [
  { id: '1', nome: 'Antônio Santos', cargo: 'Inspetor' },
  { id: '2', nome: 'Carlos Silva', cargo: 'Guarda 1ª Classe' },
  { id: '3', nome: 'Ricardo Melo', cargo: 'Guarda 1ª Classe' },
  { id: '4', nome: 'Mariana Ferreira', cargo: 'Guarda 2ª Classe' },
  { id: '5', nome: 'José Oliveira', cargo: 'Guarda Especial' },
  { id: '6', nome: 'Priscila Ferraz', cargo: 'Administrador' },
  { id: '7', nome: 'Victor de Carvalho Siqueira Terra', cargo: '3ª Classe' },
];

interface OperacaoVeicularProps {
  systemLogo: string | null;
}

const OperacaoVeicular: React.FC<OperacaoVeicularProps> = ({ systemLogo }) => {
  const [operacoes, setOperacoes] = useState<OperacaoVeicularData[]>([
    {
      id: '1',
      data: '2024-10-29',
      local: 'Praça João XXIII',
      equipe: 'BRAVO',
      encarregado: 'Victor de Carvalho Siqueira Terra - 3ª Classe',
      abordagens: [
        { id: 'a1', condutor: 'RICARDO OLIVEIRA', rgCpf: '12.345.678-9', cnh: '987654321', placa: 'GCM-2024', modelo: 'Corolla', ano: '2022', cor: 'Prata', status: 'Regular' },
        { id: 'a2', condutor: 'MARCOS SANTOS', rgCpf: '98.765.432-1', cnh: '123456789', placa: 'ABC-1234', modelo: 'Civic', ano: '2020', cor: 'Preto', status: 'Irregular' },
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<OperacaoVeicularData>({
    id: '',
    data: new Date().toISOString().split('T')[0],
    local: '',
    equipe: 'ALFA',
    encarregado: 'Priscila Ferraz - Administrador',
    abordagens: []
  });

  const [tempAbordagem, setTempAbordagem] = useState<Partial<AbordagemVeicular>>({
    status: 'Regular'
  });

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  const addAbordagem = () => {
    if (!tempAbordagem.condutor || !tempAbordagem.placa) return;
    const novaAbordagem: AbordagemVeicular = {
      id: Math.random().toString(36).substr(2, 9),
      condutor: tempAbordagem.condutor!,
      rgCpf: tempAbordagem.rgCpf || '',
      cnh: tempAbordagem.cnh || '',
      placa: tempAbordagem.placa!.toUpperCase(),
      modelo: tempAbordagem.modelo || '',
      ano: tempAbordagem.ano || '',
      cor: tempAbordagem.cor || '',
      status: tempAbordagem.status as any || 'Regular'
    };
    setFormData({ ...formData, abordagens: [...formData.abordagens, novaAbordagem] });
    setTempAbordagem({ status: 'Regular' });
  };

  const removeAbordagem = (id: string) => {
    setFormData({ ...formData, abordagens: formData.abordagens.filter(a => a.id !== id) });
  };

  const handleEditOperacao = (op: OperacaoVeicularData) => {
    setFormData(op);
    setEditingId(op.id);
    setIsModalOpen(true);
  };

  const handleSaveOperacao = () => {
    if (!formData.local || formData.abordagens.length === 0) return;

    if (editingId) {
      setOperacoes(operacoes.map(op => op.id === editingId ? { ...formData } : op));
    } else {
      const novaOperacao = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      setOperacoes([novaOperacao, ...operacoes]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDeleteOperacao = () => {
    if (deleteConfirmId && isAdmin) {
      setOperacoes(operacoes.filter(op => op.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handlePrint = (op: OperacaoVeicularData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Operação Veicular - GCM Capão Bonito</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; font-size: 11px; }
            .header-container { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
            .header-text { text-align: center; }
            .header-text h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 0.9; }
            .header-text p { margin: 0; font-size: 14px; font-weight: 700; font-style: italic; color: #333; }
            
            .title-block { text-align: center; margin: 20px 0; }
            .title-block h2 { font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase; }
            .title-block p { font-size: 14px; font-weight: 700; margin: 5px 0; }
            
            .info-grid { margin-bottom: 20px; font-size: 12px; line-height: 1.6; }
            .info-item { margin-bottom: 2px; }
            .label { font-weight: 800; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            th { background: #f1f5f9; border: 1px solid #000; padding: 4px; font-size: 8px; font-weight: 900; text-transform: uppercase; }
            td { border: 1px solid #000; padding: 4px; text-align: center; font-weight: 600; font-size: 7.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            
            .system-logo { width: 70px; height: 70px; object-fit: contain; }

            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
             <div style="display: flex; flex-direction: column; align-items: center;">
                <img src="${systemLogo || BRASAO_PADRAO}" class="system-logo" />
             </div>
             <div class="header-text">
                <h1>GUARDA CIVIL MUNICIPAL</h1>
                <p>DE CAPÃO BONITO - SP</p>
             </div>
          </div>

          <div class="title-block">
             <h2>Relatório de Operação Veicular</h2>
             <p>Data: ${new Date(op.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="info-grid">
             <div class="info-item"><span class="label">Local do Bloqueio:</span> ${op.local}</div>
             <div class="info-item">
                <span class="label">Equipe:</span> ${op.equipe} &nbsp;&nbsp;&nbsp; 
                <span class="label">Encarregado:</span> ${op.encarregado}
             </div>
          </div>

          <table>
             <thead>
                <tr>
                   <th style="width: 25%;">Condutor</th>
                   <th style="width: 15%;">RG/CPF</th>
                   <th style="width: 12%;">Placa</th>
                   <th style="width: 20%;">Modelo</th>
                   <th style="width: 13%;">Cor</th>
                   <th style="width: 15%;">Status</th>
                </tr>
             </thead>
             <tbody>
                ${op.abordagens.map(a => `
                  <tr>
                    <td style="text-align: left;">${a.condutor}</td>
                    <td>${a.rgCpf}</td>
                    <td>${a.placa}</td>
                    <td>${a.modelo}</td>
                    <td>${a.cor}</td>
                    <td>${a.status}</td>
                  </tr>
                `).join('')}
             </tbody>
          </table>

          <div style="margin-top: 60px; display: flex; justify-content: space-around; padding: 0 20px;">
             <div style="text-align: center; border-top: 1px solid #000; width: 200px; padding-top: 5px;">
                <p style="margin: 0; font-weight: 800; font-size: 9px;">${op.encarregado}</p>
                <p style="margin: 0; font-size: 8px;">Encarregado da Equipe</p>
             </div>
             <div style="text-align: center; border-top: 1px solid #000; width: 200px; padding-top: 5px;">
                <p style="margin: 0; font-weight: 800; font-size: 9px;">Supervisor de Turno</p>
                <p style="margin: 0; font-size: 8px;">GCM Capão Bonito</p>
             </div>
          </div>

          <script>
            window.onload = () => { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Operação Veicular</h2>
          <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-1">
            <SearchCheck className="w-4 h-4 text-blue-800" /> Registro de Bloqueios e Abordagens
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              id: '',
              data: new Date().toISOString().split('T')[0],
              local: '',
              equipe: 'ALFA',
              encarregado: 'Priscila Ferraz - Administrador',
              abordagens: []
            });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-900 transition-all shadow-xl shadow-blue-200 active:scale-95 border-b-4 border-blue-950"
        >
          <Plus className="w-4 h-4" /> Novo Registro de Blitz
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {operacoes.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <SearchCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma operação registrada recentemente.</p>
          </div>
        )}
        {operacoes.map((op) => (
          <div key={op.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl"><SearchCheck /></div>
              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{op.local}</h4>
                <p className="text-[10px] text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" /> {new Date(op.data + 'T12:00:00').toLocaleDateString('pt-BR')} •
                  <User className="w-3 h-3" /> Equipe {op.equipe}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block mr-4">
                <p className="text-[9px] font-black text-slate-400 uppercase">Abordagens</p>
                <p className="text-base font-black text-blue-800">{op.abordagens.length}</p>
              </div>

              <button
                onClick={() => handlePrint(op)}
                className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-800 rounded-xl transition-all border border-transparent hover:border-blue-100"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleEditOperacao(op)}
                className="p-3 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100"
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {isAdmin && (
                <button
                  onClick={() => setDeleteConfirmId(op.id)}
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Excluir (Admin)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#f1f5f9] z-[100] flex flex-col animate-in fade-in duration-300">
          <div className="w-full h-full flex flex-col overflow-hidden">

            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <SearchCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                    {editingId ? 'Editar Operação Veicular' : 'Lançamento de Operação Veicular'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">GCM Capão Bonito - Sistema Oficial</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1">

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data da Operação</label>
                    <input type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Local do Bloqueio</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input type="text" value={formData.local} onChange={e => setFormData({ ...formData, local: e.target.value })} className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" placeholder="Ex: Praça João XXIII" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Equipe</label>
                    <select value={formData.equipe} onChange={e => setFormData({ ...formData, equipe: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none">
                      <option>ALFA</option>
                      <option>BRAVO</option>
                      <option>CHARLIE</option>
                      <option>DELTA</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Encarregado (Nome e Classe)</label>
                    <div className="relative group">
                      <select
                        value={formData.encarregado}
                        onChange={e => setFormData({ ...formData, encarregado: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                      >
                        <option value="">Selecione o Encarregado...</option>
                        {GCM_POOL.map(g => (
                          <option key={g.id} value={`${g.nome} - ${g.cargo}`}>
                            {g.nome} - {g.cargo}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <h4 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <User className="w-4 h-4" /> Adicionar Abordagem
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="md:col-span-2"><input type="text" placeholder="Condutor" value={tempAbordagem.condutor || ''} onChange={e => setTempAbordagem({ ...tempAbordagem, condutor: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" /></div>
                  <div><input type="text" placeholder="RG/CPF" value={tempAbordagem.rgCpf || ''} onChange={e => setTempAbordagem({ ...tempAbordagem, rgCpf: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" /></div>
                  <div><input type="text" placeholder="CNH" value={tempAbordagem.cnh || ''} onChange={e => setTempAbordagem({ ...tempAbordagem, cnh: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" /></div>
                  <div><input type="text" placeholder="Placa" value={tempAbordagem.placa || ''} onChange={e => setTempAbordagem({ ...tempAbordagem, placa: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" /></div>
                  <div><input type="text" placeholder="Modelo" value={tempAbordagem.modelo || ''} onChange={e => setTempAbordagem({ ...tempAbordagem, modelo: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" /></div>
                  <div><input type="text" placeholder="Ano" value={tempAbordagem.ano || ''} onChange={e => setTempAbordagem({ ...tempAbordagem, ano: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" /></div>
                  <div>
                    <select value={tempAbordagem.status} onChange={e => setTempAbordagem({ ...tempAbordagem, status: e.target.value as any })} className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-800">
                      <option>Regular</option>
                      <option>Irregular</option>
                      <option>Autuado</option>
                      <option>Apreendido</option>
                    </select>
                  </div>
                  <button type="button" onClick={addAbordagem} className="md:col-span-4 bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                    + Vincular Abordagem à Lista
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-[2rem]">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-left border-b">Condutor</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center border-b">Placa</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center border-b">Modelo/Cor</th>
                        <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center border-b">Status</th>
                        <th className="p-4 border-b"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {formData.abordagens.map((a) => (
                        <tr key={a.id}>
                          <td className="p-4 text-[10px] font-bold uppercase text-slate-900">{a.condutor}</td>
                          <td className="p-4 text-[10px] font-black text-blue-900 text-center">{a.placa}</td>
                          <td className="p-4 text-[10px] font-bold text-slate-900 text-center">{a.modelo} ({a.cor})</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${a.status === 'Regular' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                              }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => removeAbordagem(a.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                      {formData.abordagens.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-300 italic font-medium uppercase text-[10px]">Nenhuma abordagem na lista.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t-4 border-slate-100 flex gap-4 shrink-0">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-[11px]">Cancelar</button>
              <button
                type="button"
                onClick={handleSaveOperacao}
                disabled={formData.abordagens.length === 0 || !formData.local}
                className="flex-1 py-5 bg-blue-800 text-white font-black rounded-3xl shadow-2xl shadow-blue-100 hover:bg-blue-900 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" /> {editingId ? 'Salvar Alterações' : 'Finalizar e Arquivar Operação'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-red-100 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-100 mb-2">
                <Trash2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirmar Exclusão?</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                Você está prestes a remover permanentemente este registro de operação veicular. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex border-t border-slate-50 p-6 gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
              >
                Abortar
              </button>
              <button
                onClick={handleDeleteOperacao}
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-xs uppercase tracking-widest"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-t-8 border-blue-600">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20">
            <Car className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">Controle Logístico de Bloqueios</h4>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
              Este registro consolida a produtividade da guarnição em operações de blitz, permitindo a geração de relatórios oficiais para a Secretaria de Defesa Social.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperacaoVeicular;

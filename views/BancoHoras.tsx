
import React, { useState } from 'react';
import {
  Clock,
  Plus,
  X,
  Save,
  Trash2,
  History,
  ChevronRight,
  User,
  Printer,
  FileSearch,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { HoraLog, Funcionario } from '../types';
import { BRASAO_GCM } from '../config/constants';

const STAFF_MOCK: Partial<Funcionario>[] = [
  { id: '1', nomeGuerra: 'SANTOS', cargo: 'Inspetor' },
  { id: '2', nomeGuerra: 'MELO', cargo: 'Guarda 1ª Classe' },
  { id: '3', nomeGuerra: 'FERREIRA', cargo: 'Guarda 2ª Classe' },
  { id: '4', nomeGuerra: 'OLIVEIRA', cargo: 'Guarda Especial' },
];

interface BancoHorasProps {
  systemLogo: string | null;
}

const BancoHoras: React.FC<BancoHorasProps> = ({ systemLogo }) => {
  const [logs, setLogs] = useState<HoraLog[]>([
    { id: '1', gcmNome: 'SANTOS', tipo: 'Adicional', horas: 8, data: '2024-10-20', descricao: 'Operação Saturação Noturna' },
    { id: '2', gcmNome: 'MELO', tipo: 'Compensação', horas: 4, data: '2024-10-18', descricao: 'Retirada Particular' },
    { id: '3', gcmNome: 'FERREIRA', tipo: 'Adicional', horas: 12, data: '2024-10-15', descricao: 'Apoio Evento Municipal' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<HoraLog | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formLog, setFormLog] = useState({
    gcmNome: STAFF_MOCK[0].nomeGuerra || '',
    tipo: 'Adicional' as 'Adicional' | 'Compensação',
    horas: 1,
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });

  const totalAdicional = logs.filter(l => l.tipo === 'Adicional').reduce((acc, curr) => acc + curr.horas, 0);
  const totalCompensacao = logs.filter(l => l.tipo === 'Compensação').reduce((acc, curr) => acc + curr.horas, 0);
  const saldoAtual = totalAdicional - totalCompensacao;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLog) {
      setLogs(logs.map(l => l.id === editingLog.id ? { ...l, ...formLog } : l));
    } else {
      const newLog: HoraLog = { id: Math.random().toString(36).substr(2, 9), ...formLog };
      setLogs([newLog, ...logs]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setLogs(logs.filter(l => l.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = `
      <html>
        <head>
          <title>Extrato Banco de Horas</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 25px; color: #1e293b; line-height: 1.2; font-size: 7.5px; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px; }
            .logo { width: 45px; height: 45px; object-fit: contain; }
            .header-info h1 { margin: 0; font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.2px; }
            .header-info p { margin: 1px 0 0 0; font-size: 6.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid #cbd5e1;padding:4px;text-align:left}
            th{background:#f8fafc; font-weight: 800; font-size: 6.5px; text-transform: uppercase;}
            td{font-size: 7.5px; font-weight: 600;}
            .saldo { margin-top: 15px; text-align: right; font-size: 10px; font-weight: 900; border-top: 1.5px solid #1e3a8a; padding-top: 6px; }
            .footer { margin-top: 30px; text-align: center; font-size: 6px; color: #94a3b8; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${systemLogo || BRASAO_GCM}" class="logo" />
            <div class="header-info">
              <h1>Banco de Horas - Relatório Analítico</h1>
              <p>Guarda Civil Municipal de Capão Bonito SP</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Integrante GCM</th>
                <th>Descrição do Empenho</th>
                <th>Tipo</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td>${new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td>GCM ${l.gcmNome}</td>
                  <td>${l.descricao}</td>
                  <td>${l.tipo.toUpperCase()}</td>
                  <td style="font-weight: 800; color: ${l.tipo === 'Adicional' ? '#059669' : '#dc2626'}">
                    ${l.tipo === 'Adicional' ? '+' : '-'}${l.horas}h
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="saldo">
            SALDO CONSOLIDADO: ${saldoAtual}h
          </div>
          <div class="footer">
            Sistema Digital de Gestão Operacional - GCM de Capão Bonito SP<br>
            Impresso em ${new Date().toLocaleString('pt-BR')}
          </div>
          <script>window.onload = () => window.print();</script>
        </body></html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Minimalista */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Banco de Horas
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Controle de Efetivo e Jornada</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrintReport} className="p-2.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl transition-all"><Printer className="w-4 h-4" /></button>
          <button onClick={() => { setEditingLog(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Cards de Resumo Ultra-Limpos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Atual</p>
            <p className={`text-2xl font-black ${saldoAtual >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{saldoAtual}h</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FileSearch className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Créditos</p>
            <p className="text-2xl font-black text-emerald-600">+{totalAdicional}h</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><ArrowUpRight className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Débitos</p>
            <p className="text-2xl font-black text-red-500">-{totalCompensacao}h</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-500"><ArrowDownRight className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Lista de Histórico Limpa */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History className="w-3.5 h-3.5" /> Últimas Movimentações</h3>
        </div>

        <div className="divide-y divide-slate-50">
          {logs.length === 0 ? (
            <div className="py-10 text-center text-slate-300 text-xs font-bold uppercase">Nenhum registro encontrado</div>
          ) : (
            [...logs].reverse().map((log) => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${log.tipo === 'Adicional' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {log.tipo === 'Adicional' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 uppercase">GCM {log.gcmNome}</p>
                      <span className="text-[8px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-tighter">{log.tipo}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {log.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-black ${log.tipo === 'Adicional' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {log.tipo === 'Adicional' ? '+' : '-'}{log.horas}h
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingLog(log); setFormLog({ ...log }); setIsModalOpen(true); }} className="p-1.5 text-slate-300 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(log.id); }} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Minimalista */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest">{editingLog ? 'Editar Registro' : 'Novo Lançamento'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Integrante GCM</label>
                <select value={formLog.gcmNome} onChange={(e) => setFormLog({ ...formLog, gcmNome: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500">
                  {STAFF_MOCK.map(s => <option key={s.id} value={s.nomeGuerra}>GCM {s.nomeGuerra}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select value={formLog.tipo} onChange={(e) => setFormLog({ ...formLog, tipo: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none">
                    <option value="Adicional">Crédito (+)</option>
                    <option value="Compensação">Débito (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Horas</label>
                  <input type="number" required value={formLog.horas} onChange={(e) => setFormLog({ ...formLog, horas: parseInt(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                <input type="date" required value={formLog.data} onChange={(e) => setFormLog({ ...formLog, data: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Justificativa</label>
                <textarea required rows={2} value={formLog.descricao} onChange={(e) => setFormLog({ ...formLog, descricao: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500 resize-none" placeholder="Ex: Plantão extraordinário..."></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 shadow-md">Salvar Registro</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-100 mb-2">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirmar Exclusão?</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                O registro selecionado será removido permanentemente do banco de horas.
              </p>
            </div>
            <div className="flex border-t border-slate-50 p-6 gap-3 bg-slate-50/50">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">Abortar</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-[10px] uppercase tracking-widest border-b-4 border-red-800">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Edit3 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);

export default BancoHoras;

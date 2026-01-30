
import React, { useState, useMemo } from 'react';
import {
  Palmtree,
  Plus,
  Search,
  Trash2,
  Edit3,
  X,
  Save,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Shield,
  ChevronRight,
  Filter,
  ArrowRight,
  History,
  Plane,
  FileText,
  AlertTriangle,
  Printer,
  FileBarChart
} from 'lucide-react';
import { VacationEntry, Funcionario } from '../types';

// Usuário logado
const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };
const BRASAO_URL = "https://raw.githubusercontent.com/pmcb/gcm-assets/main/brasao.png";

const GCM_POOL: Partial<Funcionario>[] = [
  { id: '1', nomeGuerra: 'SANTOS', matricula: 'GCM-001' },
  { id: '2', nomeGuerra: 'MELO', matricula: 'GCM-042' },
  { id: '3', nomeGuerra: 'FERREIRA', matricula: 'GCM-015' },
  { id: '4', nomeGuerra: 'OLIVEIRA', matricula: 'GCM-088' },
  { id: '5', nomeGuerra: 'COSTA', matricula: 'GCM-099' },
  { id: '7', nomeGuerra: 'FERRAZ', matricula: 'GCM-MASTER' },
];

interface ControleFeriasProps {
  systemLogo: string | null;
}

const ControleFerias: React.FC<ControleFeriasProps> = ({ systemLogo }) => {
  const [vacations, setVacations] = useState<VacationEntry[]>([
    { id: '1', gcmId: '2', nomeGuerra: 'MELO', dataInicio: '2024-11-01', dataFim: '2024-12-01', dataAdmissao: '2010-05-15', diasPecunia: 10, status: 'Agendado', observacoes: 'Referente ao período aquisitivo 2023/2024' },
    { id: '2', gcmId: '1', nomeGuerra: 'SANTOS', dataInicio: '2024-10-10', dataFim: '2024-11-10', dataAdmissao: '2012-08-20', diasPecunia: 0, status: 'Em Fruição', observacoes: 'Férias regulamentares' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingVacation, setEditingVacation] = useState<VacationEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [reportFilter, setReportFilter] = useState({
    start: '',
    end: ''
  });

  const [formData, setFormData] = useState<Partial<VacationEntry>>({
    gcmId: '',
    dataInicio: '',
    dataFim: '',
    dataAdmissao: '',
    diasPecunia: 0,
    status: 'Agendado',
    observacoes: ''
  });

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  const handleOpenCreate = () => {
    setEditingVacation(null);
    setFormData({ gcmId: '', dataInicio: '', dataFim: '', dataAdmissao: '', diasPecunia: 0, status: 'Agendado', observacoes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VacationEntry) => {
    setEditingVacation(v);
    setFormData({ ...v });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const gcm = GCM_POOL.find(g => g.id === formData.gcmId);

    if (editingVacation) {
      setVacations(prev => prev.map(v => v.id === editingVacation.id ? {
        ...(formData as VacationEntry),
        nomeGuerra: gcm?.nomeGuerra || 'N/A'
      } : v));
    } else {
      const newVacation: VacationEntry = {
        id: Math.random().toString(36).substr(2, 9),
        ...(formData as Omit<VacationEntry, 'id' | 'nomeGuerra'>),
        nomeGuerra: gcm?.nomeGuerra || 'N/A'
      };
      setVacations(prev => [newVacation, ...prev]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setVacations(prev => prev.filter(v => v.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handlePrintReport = () => {
    const filteredForReport = vacations.filter(v => {
      if (!reportFilter.start || !reportFilter.end) return true;
      return v.dataInicio >= reportFilter.start && v.dataInicio <= reportFilter.end;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Férias por Período</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; font-size: 10px; }
            .header { border-bottom: 2px solid #1e3a8a; margin-bottom: 20px; padding-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
            .header img { height: 50px; }
            .title { font-size: 16px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; border: 1px solid #000; padding: 8px; font-size: 9px; font-weight: 900; text-transform: uppercase; text-align: left; }
            td { border: 1px solid #000; padding: 8px; font-weight: 600; font-size: 9px; }
            .footer { margin-top: 30px; text-align: center; font-size: 8px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
             <img src="${systemLogo || BRASAO_URL}" />
             <div class="title">Relatório de Férias e Pecúnia</div>
             <div style="font-size: 8px; text-align: right;">GCM Capão Bonito SP</div>
          </div>
          <p><strong>Período:</strong> ${reportFilter.start ? new Date(reportFilter.start + 'T12:00:00').toLocaleDateString('pt-BR') : 'Geral'} até ${reportFilter.end ? new Date(reportFilter.end + 'T12:00:00').toLocaleDateString('pt-BR') : 'Geral'}</p>
          <table>
            <thead>
              <tr>
                <th>GCM</th>
                <th>Admissão</th>
                <th>Período de Férias</th>
                <th>Pecúnia</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredForReport.map(v => `
                <tr>
                  <td>GCM ${v.nomeGuerra}</td>
                  <td>${v.dataAdmissao ? new Date(v.dataAdmissao + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</td>
                  <td>${new Date(v.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(v.dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td>${v.diasPecunia || 0} Dias</td>
                  <td>${v.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} por ${CURRENT_USER.name}</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsReportModalOpen(false);
  };

  const filteredVacations = vacations.filter(v =>
    v.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: VacationEntry['status']) => {
    switch (status) {
      case 'Em Fruição': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Agendado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Concluído': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Controle de Férias</h2>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wide mt-0.5 flex items-center gap-1.5">
            <Palmtree className="w-2.5 h-2.5 text-amber-600" /> Gestão de Afastamentos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wide hover:bg-slate-200 transition-all shadow-sm"
          >
            <FileBarChart className="w-3.5 h-3.5" /> Relatório
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wide hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Lançar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Em Fruição</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {vacations.filter(v => v.status === 'Em Fruição').length.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Agendados</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {vacations.filter(v => v.status === 'Agendado').length.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-400">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Disponível</p>
            <p className="text-2xl font-black tracking-tight text-amber-400">92%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar GCM ou Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-xs shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-4 py-3 text-left">GCM</th>
                <th className="px-4 py-3 text-left">Admissão</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Pecúnia</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVacations.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">Nenhum registro de férias encontrado.</td>
                </tr>
              )}
              {filteredVacations.map((v) => {
                const start = new Date(v.dataInicio);
                const end = new Date(v.dataFim);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-200 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                          {v.nomeGuerra.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 uppercase text-xs tracking-tight">GCM {v.nomeGuerra}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{GCM_POOL.find(g => g.id === v.gcmId)?.matricula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-bold text-slate-600">
                      {v.dataAdmissao ? new Date(v.dataAdmissao + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase">Início</p>
                          <p className="text-[10px] font-bold text-slate-700">{new Date(v.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                        <div className="text-center">
                          <p className="text-[7px] font-black text-slate-400 uppercase">Término</p>
                          <p className="text-[10px] font-bold text-slate-700">{new Date(v.dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-md text-[9px] font-black text-amber-700 uppercase">
                        {v.diasPecunia || 0}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-wide shadow-sm ${getStatusStyle(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(v.id); }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal de Relatório por Período */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-900">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <Printer className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Relatório de Férias</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1">Configuração de Período</p>
                </div>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Início</label>
                <input type="date" value={reportFilter.start} onChange={e => setReportFilter({ ...reportFilter, start: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Término</label>
                <input type="date" value={reportFilter.end} onChange={e => setReportFilter({ ...reportFilter, end: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
              </div>
              <button
                onClick={handlePrintReport}
                className="w-full py-5 bg-blue-800 text-white font-black rounded-[2rem] text-xs uppercase tracking-widest hover:bg-blue-900 shadow-xl border-b-4 border-blue-950 flex items-center justify-center gap-3"
              >
                <Printer className="w-4 h-4" /> Gerar Relatório PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-amber-600 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-amber-800">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-3xl">
                  <Palmtree className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                    {editingVacation ? 'Ajustar Período' : 'Novo Agendamento'}
                  </h3>
                  <p className="text-[10px] text-amber-100 font-bold uppercase tracking-[0.4em] mt-1">Controle de Fruição 2024/2025</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Integrante da Guarnição</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />
                  <select
                    required
                    value={formData.gcmId}
                    onChange={e => setFormData({ ...formData, gcmId: e.target.value })}
                    className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black outline-none focus:ring-4 focus:ring-amber-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecione o GCM...</option>
                    {GCM_POOL.map(g => <option key={g.id} value={g.id}>GCM {g.nomeGuerra} ({g.matricula})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Admissão</label>
                  <input
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={e => setFormData({ ...formData, dataAdmissao: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dias de Pecúnia</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.diasPecunia}
                    onChange={e => setFormData({ ...formData, diasPecunia: parseInt(e.target.value) || 0 })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Início da Fruição</label>
                  <input
                    required
                    type="date"
                    value={formData.dataInicio}
                    onChange={e => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Término da Fruição</label>
                  <input
                    required
                    type="date"
                    value={formData.dataFim}
                    onChange={e => setFormData({ ...formData, dataFim: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status do Registro</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black outline-none appearance-none"
                  >
                    <option>Agendado</option>
                    <option>Em Fruição</option>
                    <option>Concluído</option>
                    <option>Cancelado</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações / Motivo</label>
                  <input
                    type="text"
                    value={formData.observacoes}
                    onChange={e => setFormData({ ...formData, observacoes: e.target.value.toUpperCase() })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none text-sm"
                    placeholder="Ex: Período Aquisitivo..."
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-6 bg-amber-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-amber-700 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-95 border-b-4 border-amber-800">
                <Save className="w-6 h-6" /> {editingVacation ? 'Confirmar Alterações' : 'Efetivar Lançamento'}
              </button>
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
                O registro de férias do GCM {vacations.find(v => v.id === deleteConfirmId)?.nomeGuerra} será removido permanentemente do sistema.
              </p>
            </div>
            <div className="flex border-t border-slate-50 p-6 gap-3 bg-slate-50/50">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm"
              >
                Abortar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-[10px] uppercase tracking-widest border-b-4 border-blue-800"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-t-8 border-amber-500">
        <div className="absolute top-0 right-0 p-12 opacity-5"><History className="w-48 h-48" /></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20">
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">Monitoramento de Capacidade Operacional</h4>
            <p className="text-slate-400 font-medium text-sm max-w-xl leading-relaxed">
              O controle de férias é integrado ao sistema de escalas. Afastamentos em fruição reduzem automaticamente o efetivo disponível para despacho no módulo <span className="text-amber-400 font-bold">Atendimento (153)</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControleFerias;

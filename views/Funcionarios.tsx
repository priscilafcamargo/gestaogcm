
import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  X,
  Save,
  UserPlus,
  Camera,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  Trash2,
  AlertCircle,
  Tag,
  Eye,
  Edit2,
  ChevronDown,
  RotateCcw,
  Check,
  Clock,
  Printer,
  FileText,
  TrendingUp,
  Heart,
  Baby,
  Users2,
  Fingerprint,
  Key,
  AlertTriangle
} from 'lucide-react';
import { Funcionario, HoraLog } from '../types';

const BRASAO_URL = "https://raw.githubusercontent.com/pmcb/gcm-assets/main/brasao.png";
const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

const MOCK_HORA_LOGS: HoraLog[] = [
  { id: 'h1', gcmNome: 'Santos', tipo: 'Adicional', horas: 12, data: '2024-10-15', descricao: 'Operação Saturação' },
  { id: 'h2', gcmNome: 'Santos', tipo: 'Compensação', horas: 4, data: '2024-10-18', descricao: 'Retirada Particular' },
  { id: 'h3', gcmNome: 'Melo', tipo: 'Adicional', horas: 8, data: '2024-10-20', descricao: 'Plantão Extra' },
];

interface FuncionariosProps {
  staff: Funcionario[];
  setStaff: React.Dispatch<React.SetStateAction<Funcionario[]>>;
}

const Funcionarios: React.FC<FuncionariosProps> = ({ staff, setStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedGCM, setSelectedGCM] = useState<Funcionario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ cargo: 'Todos', status: 'Todos' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  const initialFormState = {
    nome: '', nomeGuerra: '', matricula: '', cargo: 'Guarda 3ª Classe',
    status: 'ativo' as Funcionario['status'],
    dataNascimento: '', cpf: '', rg: '', endereco: '',
    mae: '', pai: '', conjuge: '', filhos: '', estadoCivil: 'Solteiro(a)',
    nivelAcesso: 'Operador' as Funcionario['nivelAcesso'], foto: ''
  };

  const [formGCM, setFormGCM] = useState(initialFormState);

  const formatCPF = (value: string) => {
    const raw = value.replace(/\D/g, '');
    return raw.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
  };

  const formatRG = (value: string) => {
    const raw = value.replace(/\D/g, '').toUpperCase();
    return raw.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 12);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormGCM({ ...formGCM, foto: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormGCM(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenView = (gcm: Funcionario) => {
    setSelectedGCM(gcm);
    setFormGCM({ ...initialFormState, ...gcm });
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleOpenIndividualReport = (gcm: Funcionario) => {
    setSelectedGCM(gcm);
    setIsReportModalOpen(true);
  };

  const handlePrintIndividualReport = () => {
    if (!selectedGCM) return;
    const gcmLogs = MOCK_HORA_LOGS.filter(l => l.gcmNome.toLowerCase() === selectedGCM.nomeGuerra?.toLowerCase());

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Extrato de Horas - GCM ${selectedGCM.nomeGuerra}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
            .header { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 70px; margin-right: 20px; }
            .header-text h1 { margin: 0; font-size: 20px; font-weight: 900; }
            .header-text p { margin: 0; font-size: 11px; font-weight: 700; color: #444; }
            .report-title { text-align: center; margin-bottom: 30px; }
            .report-title h2 { font-size: 24px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 5px; }
            .gcm-info { background: #f8fafc; padding: 15px; border: 1px solid #000; border-radius: 5px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #64748b; }
            .info-value { font-size: 14px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #e2e8f0; border: 1px solid #000; padding: 8px; font-size: 9px; text-transform: uppercase; font-weight: 900; }
            td { border: 1px solid #000; padding: 8px; font-size: 10px; font-weight: 700; text-align: center; }
            .saldo-final { margin-top: 20px; text-align: right; font-size: 18px; font-weight: 900; border-top: 2px solid #000; padding-top: 10px; }
            .footer { margin-top: 50px; text-align: center; font-size: 9px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${BRASAO_URL}" class="logo" />
            <div class="header-text">
              <h1>GUARDA CIVIL MUNICIPAL</h1>
              <p>DE CAPÃO BONITO - DIVISÃO DE RECURSOS HUMANOS</p>
            </div>
          </div>
          <div class="report-title">
            <h2>Extrato Individual de Banco de Horas</h2>
          </div>
          <div class="gcm-info">
            <div><span class="info-label">Nome de Guerra:</span><br><span class="info-value">GCM ${selectedGCM.nomeGuerra}</span></div>
            <div><span class="info-label">Matrícula:</span><br><span class="info-value">${selectedGCM.matricula}</span></div>
            <div><span class="info-label">Cargo:</span><br><span class="info-value">${selectedGCM.cargo}</span></div>
            <div><span class="info-label">Data da Emissão:</span><br><span class="info-value">${new Date().toLocaleDateString('pt-BR')}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição do Empenho</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${gcmLogs.map(l => `
                <tr>
                  <td>${new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td style="text-align: left;">${l.descricao}</td>
                  <td>${l.tipo.toUpperCase()}</td>
                  <td style="color: ${l.tipo === 'Adicional' ? '#059669' : '#dc2626'}">${l.tipo === 'Adicional' ? '+' : '-'}${l.horas}h</td>
                </tr>
              `).join('')}
              ${gcmLogs.length === 0 ? '<tr><td colspan="4">Nenhum registro encontrado no período.</td></tr>' : ''}
            </tbody>
          </table>
          <div class="saldo-final">
            SALDO LÍQUIDO ATUAL: ${selectedGCM.bancoHoras}h
          </div>
          <div class="footer">
            Este documento é um extrato informativo gerado pelo Sistema de Gestão GCM.<br>
            Autenticado digitalmente por ${CURRENT_USER.name} em ${new Date().toLocaleString('pt-BR')}
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setStaff(staff.filter(s => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleSaveGCM = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const gcm: Funcionario = { id: Math.random().toString(36).substr(2, 9), ...formGCM, bancoHoras: 0 };
      setStaff([gcm, ...staff]);
    } else {
      setStaff(staff.map(s => s.id === selectedGCM?.id ? { ...s, ...formGCM } : s));
    }
    setIsModalOpen(false);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.nomeGuerra && member.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCargo = activeFilters.cargo === 'Todos' || member.cargo.includes(activeFilters.cargo);
    const matchesStatus = activeFilters.status === 'Todos' || member.status === activeFilters.status;
    return matchesSearch && matchesCargo && matchesStatus;
  });

  const isReadOnly = modalMode === 'view';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Efetivo GCM</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Gestão de Prontuários e Recursos Humanos</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-widest border-b-4 border-blue-800">
          <Plus className="w-4 h-4" /> Novo Integrante
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Filtrar por nome ou matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm shadow-sm" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`px-5 py-3 rounded-xl border transition-all shadow-sm flex items-center gap-3 ${showFilters ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest'}`}>
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Integrante</th>
                <th className="px-8 py-5">Patente</th>
                <th className="px-8 py-5 text-center">Horas</th>
                <th className="px-8 py-5">Estado Funcional</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition-all group animate-in fade-in duration-300">
                  <td className="px-8 py-5" onClick={() => handleOpenView(p)}>
                    <div className="flex items-center gap-4 cursor-pointer">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                        {p.foto ? <img src={p.foto} className="w-full h-full object-cover" /> : p.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tighter uppercase italic">GCM {p.nomeGuerra || p.nome}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.matricula}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{p.cargo}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenIndividualReport(p); }}
                      className={`font-mono font-black text-sm px-3 py-1 rounded-lg transition-all flex items-center gap-2 mx-auto ${p.bancoHoras >= 0 ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                    >
                      {p.bancoHoras > 0 ? `+${p.bancoHoras}` : p.bancoHoras}h
                      <TrendingUp className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${p.status === 'ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      p.status === 'afastado' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        p.status === 'exonerado' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenIndividualReport(p); }} className="p-2.5 text-slate-300 hover:text-blue-600 transition-all" title="Extrato de Horas"><Clock className="w-5 h-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenView(p); }} className="p-2.5 text-slate-300 hover:text-blue-600 transition-all"><Eye className="w-5 h-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedGCM(p); setFormGCM({ ...initialFormState, ...p }); setModalMode('edit'); setIsModalOpen(true); }} className="p-2.5 text-slate-300 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                      {isAdmin && (
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }} className="p-2.5 text-slate-300 hover:text-red-500 transition-all" title="Remover"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-100 mb-2">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Excluir Integrante?</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                O prontuário do GCM {staff.find(s => s.id === deleteConfirmId)?.nomeGuerra} será removido permanentemente.
              </p>
            </div>
            <div className="flex border-t border-slate-50 p-6 gap-3 bg-slate-50/50">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">Abortar</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-[10px] uppercase tracking-widest border-b-4 border-red-800">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && selectedGCM && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[150] flex items-center justify-center p-8 animate-in fade-in duration-1000">
          <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col border border-slate-200/50 animate-in zoom-in-95 duration-1000 ease-in-out">
            <div className="bg-[#1e3a8a] p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-900">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-3xl">
                  <Clock className="w-10 h-10 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Extrato Individual GCM</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.4em] mt-1">GCM {selectedGCM.nomeGuerra} • {selectedGCM.matricula}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handlePrintIndividualReport} className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button onClick={() => setIsReportModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
              </div>
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] flex flex-col justify-center">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Check className="w-4 h-4" /> Saldo Atual</p>
                  <p className={`text-6xl font-black tracking-tighter ${selectedGCM.bancoHoras >= 0 ? 'text-blue-900' : 'text-red-600'}`}>{selectedGCM.bancoHoras}h</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-4 italic leading-relaxed">Horas líquidas disponíveis para fruição.</p>
                </div>
                <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-inner">
                  <table className="w-full border-collapse">
                    <thead className="bg-white/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="p-6 text-left">Data</th>
                        <th className="p-6 text-left">Descrição</th>
                        <th className="p-6">Tipo</th>
                        <th className="p-6">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_HORA_LOGS.filter(l => l.gcmNome.toLowerCase() === selectedGCM.nomeGuerra?.toLowerCase()).map(log => (
                        <tr key={log.id} className="text-[11px] font-bold text-slate-700 uppercase hover:bg-white transition-colors">
                          <td className="p-5 font-mono">{new Date(log.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="p-5 text-left italic text-slate-500">"{log.descricao}"</td>
                          <td className="p-5 text-center">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${log.tipo === 'Adicional' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{log.tipo}</span>
                          </td>
                          <td className={`p-5 font-black text-base tracking-tighter text-center ${log.tipo === 'Adicional' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {log.tipo === 'Adicional' ? '+' : '-'}{log.horas}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">GCM-RH • DOCUMENTO DE USO INTERNO • CAPÃO BONITO SP</p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-1000">
          <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden animate-in zoom-in-95 duration-1000 ease-in-out flex flex-col border border-slate-200/50">
            <div className="bg-blue-800 p-8 text-white flex justify-between items-center shadow-lg relative shrink-0 border-b-4 border-blue-950">
              <div className="flex items-center gap-5">
                <div onClick={() => !isReadOnly && photoInputRef.current?.click()} className={`w-20 h-20 bg-blue-700/40 border-2 border-white/20 rounded-3xl flex items-center justify-center ${!isReadOnly ? 'cursor-pointer hover:bg-blue-700/60' : ''} transition-all overflow-hidden relative group`}>
                  {formGCM.foto ? <img src={formGCM.foto} className="w-full h-full object-cover" /> : <UserPlus className="w-10 h-10 text-white/50" />}
                  {!isReadOnly && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-6 h-6" /></div>}
                  <input ref={photoInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isReadOnly} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase">{modalMode === 'create' ? 'Inclusão de Efetivo' : modalMode === 'view' ? 'Prontuário do Integrante' : 'Editar Registro'}</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.4em] mt-1">{modalMode === 'create' ? 'Novo Cadastro Digital GCM' : `Matrícula: ${formGCM.matricula}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {modalMode === 'view' && <button onClick={() => setModalMode('edit')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/10"><Edit2 className="w-3.5 h-3.5" /> Alterar</button>}
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-7 h-7" /></button>
              </div>
            </div>

            <form onSubmit={handleSaveGCM} className="p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h4 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em]">01. Dados de Identificação</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label><input disabled={isReadOnly} required type="text" value={formGCM.nome} onChange={(e) => setFormGCM({ ...formGCM, nome: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm" placeholder="NOME CIVIL" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome de Guerra</label><div className="relative"><Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input disabled={isReadOnly} required type="text" value={formGCM.nomeGuerra} onChange={(e) => setFormGCM({ ...formGCM, nomeGuerra: e.target.value.toUpperCase() })} className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500/30 transition-all text-sm" placeholder="EX: SANTOS" /></div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center pr-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Nascimento</label>
                      {formGCM.dataNascimento && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{calculateAge(formGCM.dataNascimento)} ANOS</span>}
                    </div>
                    <input disabled={isReadOnly} required type="date" value={formGCM.dataNascimento} onChange={(e) => setFormGCM({ ...formGCM, dataNascimento: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" />
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF (Automático)</label><div className="relative"><Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input disabled={isReadOnly} required type="text" value={formGCM.cpf} onChange={(e) => setFormGCM({ ...formGCM, cpf: formatCPF(e.target.value) })} className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" placeholder="000.000.000-00" maxLength={14} /></div></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RG (Automático)</label><div className="relative"><CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input disabled={isReadOnly} required type="text" value={formGCM.rg} onChange={(e) => setFormGCM({ ...formGCM, rg: formatRG(e.target.value) })} className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" placeholder="000.000.000-0" maxLength={12} /></div></div>
                </div>

                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Residencial Completo</label><div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input disabled={isReadOnly} type="text" value={formGCM.endereco} onChange={(e) => setFormGCM({ ...formGCM, endereco: e.target.value.toUpperCase() })} className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500/30 transition-all text-sm" placeholder="RUA, NÚMERO, BAIRRO, CIDADE" /></div></div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h4 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em]">02. Vínculos Familiares e Sociais</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Mãe</label><input disabled={isReadOnly} type="text" value={formGCM.mae} onChange={(e) => setFormGCM({ ...formGCM, mae: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Pai</label><input disabled={isReadOnly} type="text" value={formGCM.pai} onChange={(e) => setFormGCM({ ...formGCM, pai: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Civil</label><select disabled={isReadOnly} value={formGCM.estadoCivil} onChange={(e) => setFormGCM({ ...formGCM, estadoCivil: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none">{['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'].map(opt => <option key={opt}>{opt}</option>)}</select></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cônjuge</label><input disabled={isReadOnly} type="text" value={formGCM.conjuge} onChange={(e) => setFormGCM({ ...formGCM, conjuge: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filhos</label><input disabled={isReadOnly} type="text" value={formGCM.filhos} onChange={(e) => setFormGCM({ ...formGCM, filhos: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" /></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h4 className="text-xs font-black text-blue-800 uppercase tracking-[0.2em]">03. Dados Funcionais</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matrícula</label><input disabled={isReadOnly} required type="text" value={formGCM.matricula} onChange={(e) => setFormGCM({ ...formGCM, matricula: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Patente</label><input disabled={isReadOnly} required type="text" value={formGCM.cargo} onChange={(e) => setFormGCM({ ...formGCM, cargo: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none transition-all text-sm" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Funcional</label><select disabled={isReadOnly} value={formGCM.status} onChange={(e) => setFormGCM({ ...formGCM, status: e.target.value as any })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"><option value="ativo">ATIVO</option><option value="afastado">AFASTADO</option><option value="exonerado">EXONERADO</option><option value="aposentado">APOSENTADO</option></select></div>
                </div>
              </div>

              {!isReadOnly && (
                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-blue-900">
                  <Save className="w-5 h-5" /> {modalMode === 'create' ? 'Cadastrar Oficial' : 'Salvar Alterações'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funcionarios;

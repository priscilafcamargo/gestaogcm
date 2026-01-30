
import React, { useState, useMemo } from 'react';
import {
  Car,
  Fuel,
  Gauge,
  Settings,
  AlertCircle,
  Activity,
  User,
  ShieldAlert,
  ChevronRight,
  Plus,
  Radio,
  X,
  CheckCircle2,
  Users,
  MapPin,
  Shield,
  Zap,
  Trash2,
  Edit3,
  Save,
  Lock,
  Calendar as CalendarIcon,
  ChevronLeft,
  Wrench,
  ClipboardList,
  Check,
  AlertOctagon,
  Info,
  Search,
  Printer,
  History,
  FileText,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { VTR, Team, VTRLog } from '../types';
import { BRASAO_GCM } from '../config/constants';

const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

// Pool de Efetivo para seleção de motorista (Sincronizado com outros módulos)
const GCM_POOL = [
  { id: '1', nomeGuerra: 'SANTOS' },
  { id: '2', nomeGuerra: 'SILVA' },
  { id: '3', nomeGuerra: 'MELO' },
  { id: '4', nomeGuerra: 'FERREIRA' },
  { id: '5', nomeGuerra: 'OLIVEIRA' },
  { id: '6', nomeGuerra: 'COSTA' },
  { id: '7', nomeGuerra: 'FERRAZ' },
  { id: '8', nomeGuerra: 'RICARDO' },
  { id: '9', nomeGuerra: 'SOUZA' },
  { id: '10', nomeGuerra: 'PEDRO' },
];

const CHECKLIST_ITEMS = [
  { id: 'high_light', label: 'High Light' },
  { id: 'extintor', label: 'Extintor' },
  { id: 'radio', label: 'Rádio' },
  { id: 'chave_roda', label: 'Chave de Roda' },
  { id: 'sirene', label: 'Sirene' },
  { id: 'macaco', label: 'Macaco' },
  { id: 'lanternas', label: 'Lanternas' },
  { id: 'parabrisa', label: 'Parabrisa' },
  { id: 'farol', label: 'Faról' },
  { id: 'radiador', label: 'Radiador' },
  { id: 'pneu', label: 'Pneu' },
  { id: 'oleo', label: 'Óleo' },
  { id: 'suspensao', label: 'Suspensão' },
];

const ControleVTR: React.FC = () => {
  const [vtrs, setVtrs] = useState<VTR[]>([
    { id: '1', prefixo: 'ROMU-01', placa: 'GCM-2021', modelo: 'Hilux 4x4 SW4', status: 'em_patrulha', equipe: ['Santos', 'Silva'], km: 45280, logs: [] },
    { id: '2', prefixo: 'VTR-12', placa: 'GCM-2025', modelo: 'Spin Premier', status: 'disponivel', equipe: [], km: 12500, logs: [] },
    { id: '3', prefixo: 'MOTO-04', placa: 'GCM-2030', modelo: 'Tiger 900 Raly', status: 'em_ocorrencia', equipe: ['Ricardo'], km: 8900, logs: [] },
    { id: '4', prefixo: 'VTR-09', placa: 'GCM-2018', modelo: 'Duster Oroch', status: 'manutencao', equipe: [], km: 78400, logs: [] },
  ]);

  const [selectedVtrId, setSelectedVtrId] = useState<string | null>(null);
  const [isVtrModalOpen, setIsVtrModalOpen] = useState(false);
  const [vtrModalMode, setVtrModalMode] = useState<'create' | 'edit'>('create');
  const [activeVtrForEdit, setActiveVtrForEdit] = useState<VTR | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Estados para Logs de Uso
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeVtrForLogs, setActiveVtrForLogs] = useState<VTR | null>(null);
  const [newLog, setNewLog] = useState<Partial<VTRLog>>({
    data: new Date().toISOString().split('T')[0],
    motorista: '',
    saida: '',
    chegada: '',
    kmInicial: 0,
    kmFinal: 0,
    combustivel: '',
    destino: 'Patrulhamento'
  });

  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isVtrPickerOpen, setIsVtrPickerOpen] = useState(false);
  const [activeVtrForChecklist, setActiveVtrForChecklist] = useState<VTR | null>(null);
  const [checklistValues, setChecklistValues] = useState<Record<string, boolean>>({});

  // Estados para Manutenção
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [activeVtrForMaintenance, setActiveVtrForMaintenance] = useState<VTR | null>(null);
  const [newMaintenance, setNewMaintenance] = useState({
    tipo: 'Revisão Programada',
    dataRealizada: new Date().toISOString().split('T')[0],
    kmRealizada: 0,
    proximaRevisaoKm: 0,
    proximaRevisaoData: '',
    observacoes: ''
  });

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  const handleOpenLogModal = (vtr: VTR) => {
    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);

    setActiveVtrForLogs(vtr);
    setNewLog({
      data: now.toISOString().split('T')[0],
      motorista: '',
      saida: timeString,
      chegada: timeString,
      kmInicial: vtr.km,
      kmFinal: undefined as any,
      combustivel: '',
      destino: 'Patrulhamento'
    });
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVtrForLogs || !newLog.motorista || !newLog.kmFinal) return;

    const logEntry: VTRLog = {
      id: Math.random().toString(36).substr(2, 9),
      data: newLog.data!,
      motorista: newLog.motorista!,
      saida: newLog.saida!,
      chegada: newLog.chegada!,
      kmInicial: Number(newLog.kmInicial!),
      kmFinal: Number(newLog.kmFinal!),
      combustivel: newLog.combustivel!,
      destino: newLog.destino!
    };

    const updatedVtrs = vtrs.map(v => v.id === activeVtrForLogs.id ? {
      ...v,
      logs: [...(v.logs || []), logEntry],
      km: logEntry.kmFinal
    } : v);

    setVtrs(updatedVtrs);

    const updatedVtr = updatedVtrs.find(v => v.id === activeVtrForLogs.id);
    if (updatedVtr) setActiveVtrForLogs(updatedVtr);

    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);

    setNewLog({
      ...newLog,
      saida: timeString,
      chegada: timeString,
      kmInicial: logEntry.kmFinal,
      kmFinal: undefined as any,
      combustivel: '',
      destino: 'Patrulhamento'
    });
  };

  const handleUpdateStatus = (vtrId: string, newStatus: VTR['status']) => {
    setVtrs(vtrs.map(v => v.id === vtrId ? { ...v, status: newStatus } : v));
  };

  const handlePrintVTRReport = (vtr: VTR) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

    const htmlContent = `
      <html>
        <head>
          <title>Controle da VTR - ${vtr.prefixo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; }
            .header { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .logo { width: 100px; height: auto; margin-right: 20px; }
            .header-text { text-align: center; }
            .header-text h1 { margin: 0; font-size: 28px; font-weight: 900; }
            .header-text h2 { margin: 0; font-size: 14px; font-weight: 700; color: #444; }
            
            .report-title { text-align: center; margin: 20px 0; }
            .report-title h3 { font-size: 36px; font-weight: 900; margin: 0; text-transform: uppercase; color: #333; }
            .report-info { font-size: 20px; font-weight: 900; text-align: center; margin: 10px 0; color: #000; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #e2e8f0; border: 2px solid #000; padding: 6px; font-size: 11px; font-weight: 900; text-transform: uppercase; }
            td { border: 2px solid #000; padding: 6px; text-align: center; font-size: 10px; font-weight: 700; }
            
            .footer { margin-top: 50px; text-align: center; font-size: 10px; font-weight: 700; }
            
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
             <img src="${BRASAO_GCM}" class="logo" onerror="this.src='https://via.placeholder.com/100?text=GCM'"/>
             <div class="header-text">
                <h1>GUARDA CIVIL MUNICIPAL</h1>
                <h2>DE CAPÃO BONITO</h2>
             </div>
          </div>

          <div class="report-title">
             <h3>Controle da VTR</h3>
          </div>

          <div class="report-info">
             PLACA ${vtr.placa} &nbsp;&nbsp; - &nbsp;&nbsp; ${vtr.prefixo} &nbsp;&nbsp; - &nbsp;&nbsp; ${monthName}
          </div>

          <table>
             <thead>
                <tr>
                   <th style="width: 12%;">Data</th>
                   <th style="width: 15%;">Motorista</th>
                   <th style="width: 10%;">Saída</th>
                   <th style="width: 10%;">Chegada</th>
                   <th style="width: 10%;">KM Inicial</th>
                   <th style="width: 10%;">KM Final</th>
                   <th style="width: 12%;">Combustível</th>
                   <th style="width: 21%;">Destino</th>
                </tr>
             </thead>
             <tbody>
                ${(vtr.logs || []).map(log => `
                  <tr>
                    <td>${new Date(log.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style="text-align: left;">${log.motorista}</td>
                    <td>${log.saida}</td>
                    <td>${log.chegada}</td>
                    <td>${log.kmInicial}</td>
                    <td>${log.kmFinal}</td>
                    <td>${log.combustivel || ''}</td>
                    <td style="text-align: left;">${log.destino}</td>
                  </tr>
                `).join('')}
                ${Array.from({ length: Math.max(0, 15 - (vtr.logs?.length || 0)) }).map(() => `
                  <tr>
                    <td height="22"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                `).join('')}
             </tbody>
          </table>

          <div class="footer">
             Documento de controle interno - GCM Capão Bonito SP - Gerado em ${new Date().toLocaleString('pt-BR')}
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

  const handleOpenEditVtr = (vtr: VTR) => {
    if (!isAdmin) return;
    setVtrModalMode('edit');
    setActiveVtrForEdit(vtr);
    setFormVtr({ prefixo: vtr.prefixo, placa: vtr.placa, modelo: vtr.modelo, km: vtr.km });
    setIsVtrModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setVtrs(vtrs.filter(v => v.id !== deleteConfirmId));
      if (selectedVtrId === deleteConfirmId) setSelectedVtrId(null);
      setDeleteConfirmId(null);
    }
  };

  const [formVtr, setFormVtr] = useState({
    prefixo: '',
    placa: '',
    modelo: '',
    km: 0
  });

  const handleSaveVtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (vtrModalMode === 'create') {
      const newVtr: VTR = {
        id: Math.random().toString(36).substr(2, 9),
        ...formVtr,
        status: 'disponivel',
        equipe: [],
        logs: []
      };
      setVtrs([...vtrs, newVtr]);
    } else if (activeVtrForEdit) {
      setVtrs(vtrs.map(v => v.id === activeVtrForEdit.id ? { ...v, ...formVtr } : v));
    }
    setIsVtrModalOpen(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'disponivel': return { color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Disponível' };
      case 'em_patrulha': return { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', label: 'Em Patrulha' };
      case 'em_ocorrencia': return { color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', label: 'Em Ocorrência' };
      case 'manutencao': return { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Manutenção' };
      default: return { color: 'bg-slate-500', text: 'text-slate-600', bg: 'bg-slate-50', label: 'Indefinido' };
    }
  };

  const handleOpenChecklist = (vtr: VTR) => {
    setActiveVtrForChecklist(vtr);
    const initial = vtr.lastChecklist?.items || CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
    setChecklistValues(initial);
    setIsChecklistModalOpen(true);
    setIsVtrPickerOpen(false);
  };

  const handleSaveChecklist = () => {
    if (!activeVtrForChecklist) return;
    const now = new Date().toISOString();
    setVtrs(vtrs.map(v => v.id === activeVtrForChecklist.id ? {
      ...v,
      lastChecklist: {
        date: now,
        items: checklistValues
      }
    } : v));
    setIsChecklistModalOpen(false);
  };

  const handleOpenMaintenance = (vtr: VTR) => {
    setActiveVtrForMaintenance(vtr);

    // Calcula próxima revisão baseada em 10.000 KM
    const proximaKm = Math.ceil(vtr.km / 10000) * 10000 + 10000;

    setNewMaintenance({
      tipo: 'Revisão Programada',
      dataRealizada: new Date().toISOString().split('T')[0],
      kmRealizada: vtr.km,
      proximaRevisaoKm: proximaKm,
      proximaRevisaoData: '',
      observacoes: ''
    });
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVtrForMaintenance) return;

    const maintenanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      ...newMaintenance
    };

    const updatedVtrs = vtrs.map(v => v.id === activeVtrForMaintenance.id ? {
      ...v,
      manutencoes: [...(v.manutencoes || []), maintenanceRecord]
    } : v);

    setVtrs(updatedVtrs);

    const updatedVtr = updatedVtrs.find(v => v.id === activeVtrForMaintenance.id);
    if (updatedVtr) setActiveVtrForMaintenance(updatedVtr);

    // Reset form
    const proximaKm = newMaintenance.proximaRevisaoKm + 10000;
    setNewMaintenance({
      tipo: 'Revisão Programada',
      dataRealizada: new Date().toISOString().split('T')[0],
      kmRealizada: activeVtrForMaintenance.km,
      proximaRevisaoKm: proximaKm,
      proximaRevisaoData: '',
      observacoes: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a8a] tracking-tight uppercase italic italic-extra">FROTA OPERACIONAL</h2>
          <p className="text-slate-400 font-medium text-xs flex items-center gap-2 mt-1">
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            Monitoramento e Controle de Viaturas
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsVtrPickerOpen(true)}
            className="flex items-center gap-2 bg-[#f1f5f9] border border-slate-200 text-[#1e3a8a] px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm active:scale-95"
          >
            <ClipboardList className="w-4 h-4" /> Checklist
          </button>
          {isAdmin && (
            <button
              onClick={() => { setVtrModalMode('create'); setIsVtrModalOpen(true); }}
              className="flex items-center gap-2 bg-[#3b82f6] text-white px-5 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 border-b-2 border-blue-800"
            >
              <Plus className="w-4 h-4" /> Nova Viatura
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {vtrs.map((vtr) => {
          const config = getStatusConfig(vtr.status);
          const isSelected = selectedVtrId === vtr.id;

          return (
            <div
              key={vtr.id}
              onClick={() => setSelectedVtrId(isSelected ? null : vtr.id)}
              className={`bg-white rounded-[2.5rem] border transition-all relative overflow-hidden group cursor-pointer ${isSelected ? 'ring-4 ring-blue-500/10 border-blue-200 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:border-blue-100 hover:shadow-lg'
                }`}
            >
              <div className={`h-1.5 w-full ${config.color} ${vtr.status === 'em_patrulha' || vtr.status === 'em_ocorrencia' ? 'animate-pulse' : ''}`}></div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${config.bg} transition-colors border border-slate-50 relative`}>
                    <Car className={`w-7 h-7 ${config.text}`} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${config.bg} ${config.text} border-white shadow-sm`}>
                      {config.label}
                    </span>
                    {isSelected && (
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        {(['disponivel', 'em_patrulha', 'em_ocorrencia', 'manutencao'] as const).map(st => (
                          <button
                            key={st}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(vtr.id, st); }}
                            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${vtr.status === st ? getStatusConfig(st).bg + ' shadow-sm' : 'hover:bg-white'}`}
                            title={getStatusConfig(st).label}
                          >
                            <div className={`w-2 h-2 rounded-full ${getStatusConfig(st).color}`}></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-1">{vtr.prefixo}</h3>
                <p className="text-[11px] font-medium text-slate-400 mb-6">{vtr.modelo} • <span className="font-bold text-slate-500">{vtr.placa}</span></p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-slate-400 font-semibold">
                      <Gauge className="w-4 h-4 text-slate-300" /> Quilometragem
                    </div>
                    <span className="font-bold text-slate-700">{vtr.km.toLocaleString()} KM</span>
                  </div>
                  <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full rounded-full bg-blue-500/20 w-full"></div>
                  </div>

                  {/* Alerta de Manutenção */}
                  {(() => {
                    const manutencoes = vtr.manutencoes || [];
                    const ultimaManutencao = manutencoes[manutencoes.length - 1];
                    const proximaRevisaoKm = ultimaManutencao?.proximaRevisaoKm || (Math.ceil(vtr.km / 10000) * 10000 + 10000);
                    const kmRestantes = proximaRevisaoKm - vtr.km;

                    if (kmRestantes <= 1000 && kmRestantes > 0) {
                      return (
                        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2">
                          <Wrench className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[9px] font-black text-amber-700 uppercase">
                            Revisão em {kmRestantes.toLocaleString()} KM
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {!isSelected && (
                  <div className="flex justify-between items-center pt-5 border-t border-slate-50 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Opções de VTR</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 transition-all" />
                  </div>
                )}

                {isSelected && (
                  <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenLogModal(vtr); }}
                      className="w-full py-3 bg-emerald-600 text-white text-[11px] font-black rounded-2xl hover:bg-emerald-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <History className="w-4 h-4" /> Lançar Uso Diário
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrintVTRReport(vtr); }}
                      className="w-full py-3 bg-blue-600 text-white text-[11px] font-black rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> Gerar Relatório PDF
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenMaintenance(vtr); }}
                      className="w-full py-3 bg-amber-600 text-white text-[11px] font-black rounded-2xl hover:bg-amber-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Wrench className="w-4 h-4" /> Manutenção
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditVtr(vtr); }}
                          className="w-full py-3 bg-slate-100 text-slate-800 text-[11px] font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" /> Editar Cadastro
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(vtr.id); }}
                          className="w-full py-3 bg-red-50 text-red-600 text-[11px] font-black rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir Viatura
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão Customizado */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-100 mb-2">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirmar Exclusão?</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                A viatura {vtrs.find(v => v.id === deleteConfirmId)?.prefixo} será removida permanentemente do sistema operacional.
              </p>
            </div>
            <div className="flex border-t border-slate-50 p-6 gap-3 bg-slate-50/50">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">Abortar</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-[10px] uppercase tracking-widest border-b-4 border-red-800">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Logs de Uso */}
      {isLogModalOpen && activeVtrForLogs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-[#1e3a8a] p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <History className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Histórico de Uso da VTR</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.4em] mt-1">{activeVtrForLogs.prefixo} • {activeVtrForLogs.placa}</p>
                </div>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-8">
              {/* Formulário de Novo Log */}
              <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
                <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Novo Lançamento Operacional
                </h4>
                <form onSubmit={handleSaveLog} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Data</label>
                    <input type="date" value={newLog.data} onChange={e => setNewLog({ ...newLog, data: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Motorista</label>
                    <div className="relative group">
                      <select
                        required
                        value={newLog.motorista}
                        onChange={e => setNewLog({ ...newLog, motorista: e.target.value })}
                        className="w-full p-4 bg-white border border-blue-200 rounded-2xl text-sm font-bold shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">SELECIONAR GCM...</option>
                        {GCM_POOL.map(gcm => <option key={gcm.id} value={gcm.nomeGuerra}>{gcm.nomeGuerra}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none group-focus:rotate-180 transition-transform" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Saída (Hora)</label>
                    <input type="time" value={newLog.saida} onChange={e => setNewLog({ ...newLog, saida: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Chegada (Hora)</label>
                    <input type="time" value={newLog.chegada} onChange={e => setNewLog({ ...newLog, chegada: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">KM Inicial</label>
                    <input
                      type="number"
                      value={newLog.kmInicial === undefined ? '' : newLog.kmInicial}
                      onChange={e => setNewLog({ ...newLog, kmInicial: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">KM Final</label>
                    <input
                      type="number"
                      value={newLog.kmFinal === undefined ? '' : newLog.kmFinal}
                      onChange={e => setNewLog({ ...newLog, kmFinal: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Combustível (L)</label>
                    <input type="text" placeholder="Ex: 38 L" value={newLog.combustivel} onChange={e => setNewLog({ ...newLog, combustivel: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Destino Principal</label>
                    <input
                      type="text"
                      value={newLog.destino}
                      onChange={e => setNewLog({ ...newLog, destino: e.target.value })}
                      className="w-full p-4 bg-white border border-blue-200 rounded-2xl text-sm font-bold shadow-sm placeholder:italic"
                      required
                    />
                  </div>
                  <div className="md:col-span-4 mt-2">
                    <button type="submit" className="w-full py-5 bg-blue-800 text-white font-black rounded-3xl text-[12px] uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 border-b-4 border-blue-950">
                      <Save className="w-5 h-5" /> Salvar Registro de Uso
                    </button>
                  </div>
                </form>
              </div>

              {/* Tabela de Histórico */}
              <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-inner">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-5 text-left">Data</th>
                      <th className="p-5 text-left">Motorista</th>
                      <th className="p-5">Saída</th>
                      <th className="p-5">Chegada</th>
                      <th className="p-5">KM Inicial</th>
                      <th className="p-5">KM Final</th>
                      <th className="p-5 text-left">Destino</th>
                      <th className="p-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(!activeVtrForLogs.logs || activeVtrForLogs.logs.length === 0) && (
                      <tr>
                        <td colSpan={8} className="p-16 text-center text-[11px] font-black text-slate-300 uppercase italic tracking-widest">Nenhum histórico registrado para esta unidade.</td>
                      </tr>
                    )}
                    {[...(activeVtrForLogs.logs || [])].reverse().map(log => (
                      <tr key={log.id} className="hover:bg-blue-50/20 transition-colors text-xs font-bold text-slate-700 uppercase">
                        <td className="p-5">{new Date(log.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="p-5">{log.motorista}</td>
                        <td className="p-5 text-center font-mono">{log.saida}</td>
                        <td className="p-5 text-center font-mono">{log.chegada}</td>
                        <td className="p-5 text-center text-slate-400 font-medium">{log.kmInicial.toLocaleString()}</td>
                        <td className="p-5 text-center font-black text-blue-800">{log.kmFinal.toLocaleString()}</td>
                        <td className="p-5 truncate max-w-[200px]">{log.destino}</td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => {
                              const filteredLogs = activeVtrForLogs.logs?.filter(l => l.id !== log.id);
                              const updatedVtrs = vtrs.map(v => v.id === activeVtrForLogs.id ? { ...v, logs: filteredLogs } : v);
                              setVtrs(updatedVtrs);
                              const vtrRefreshed = updatedVtrs.find(v => v.id === activeVtrForLogs.id);
                              if (vtrRefreshed) setActiveVtrForLogs(vtrRefreshed);
                            }}
                            className="p-2 text-red-200 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => handlePrintVTRReport(activeVtrForLogs)}
                className="flex-1 py-5 bg-blue-800 text-white font-black rounded-[2.5rem] text-[12px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl flex items-center justify-center gap-3 border-b-4 border-blue-950"
              >
                <Printer className="w-5 h-5" /> Imprimir Relatório Operacional PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modals */}
      {isVtrPickerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="bg-[#1e3a8a] p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Habilitar Checklist</h3>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em] mt-1">Selecione a unidade para inspeção</p>
              </div>
              <button onClick={() => setIsVtrPickerOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {vtrs.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleOpenChecklist(v)}
                    className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50 transition-all group shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl ${getStatusConfig(v.status).bg} group-hover:scale-110 transition-transform`}>
                        <Car className={`w-6 h-6 ${getStatusConfig(v.status).text}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-800 uppercase tracking-tighter">{v.prefixo}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{v.placa} • {v.modelo}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Realização */}
      {isChecklistModalOpen && activeVtrForChecklist && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[160] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-[#1e3a8a] p-8 text-white flex justify-between items-center border-b-4 border-blue-900">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <ClipboardList className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Inspeção de Viatura</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.4em] mt-1">{activeVtrForChecklist.prefixo} • {activeVtrForChecklist.placa}</p>
                </div>
              </div>
              <button onClick={() => setIsChecklistModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-blue-50/30 transition-all">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                      <button
                        onClick={() => setChecklistValues({ ...checklistValues, [item.id]: true })}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${checklistValues[item.id] ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-50'}`}
                      >
                        <Check className="w-3 h-3" /> OK
                      </button>
                      <button
                        onClick={() => setChecklistValues({ ...checklistValues, [item.id]: false })}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${!checklistValues[item.id] ? 'bg-red-500 text-white' : 'text-slate-300 hover:bg-slate-50'}`}
                      >
                        <AlertOctagon className="w-3 h-3" /> RUIM
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleSaveChecklist}
                className="w-full py-5 bg-[#1e3a8a] text-white font-black rounded-[2.5rem] shadow-xl hover:bg-blue-900 transition-all uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 border-b-4 border-blue-950"
              >
                <CheckCircle2 className="w-5 h-5" /> Finalizar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cadastro/Edição de Viatura (ADMIN) */}
      {isVtrModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">
                  {vtrModalMode === 'create' ? 'Incluir Viatura' : 'Editar Viatura'}
                </h3>
              </div>
              <button onClick={() => setIsVtrModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveVtr} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prefixo</label>
                <input required type="text" value={formVtr.prefixo} onChange={(e) => setFormVtr({ ...formVtr, prefixo: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500 transition-all text-sm uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Placa</label>
                <input required type="text" value={formVtr.placa} onChange={(e) => setFormVtr({ ...formVtr, placa: e.target.value.toUpperCase() })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500 transition-all text-sm uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
                <input required type="text" value={formVtr.modelo} onChange={(e) => setFormVtr({ ...formVtr, modelo: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quilometragem Inicial (KM)</label>
                <input required type="number" value={formVtr.km} onChange={(e) => setFormVtr({ ...formVtr, km: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500 transition-all text-sm" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-blue-900"><Save className="w-5 h-5" /> {vtrModalMode === 'create' ? 'Cadastrar' : 'Salvar'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manutenção */}
      {isMaintenanceModalOpen && activeVtrForMaintenance && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col my-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 px-6 sm:px-8 py-5 sm:py-6 text-white flex justify-between items-center shrink-0 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
                  <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Controle de Manutenção</h3>
                  <p className="text-[9px] sm:text-[10px] text-amber-50 font-bold uppercase tracking-wider mt-0.5 opacity-90">
                    {activeVtrForMaintenance.prefixo} • {activeVtrForMaintenance.placa}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto space-y-5 sm:space-y-6" style={{ scrollbarWidth: 'thin' }}>
              {/* Alerta de Próxima Revisão */}
              {(() => {
                const manutencoes = activeVtrForMaintenance.manutencoes || [];
                const ultimaManutencao = manutencoes[manutencoes.length - 1];
                const kmAtual = activeVtrForMaintenance.km;
                const proximaRevisaoKm = ultimaManutencao?.proximaRevisaoKm || (Math.ceil(kmAtual / 10000) * 10000 + 10000);
                const kmRestantes = proximaRevisaoKm - kmAtual;
                const percentualUso = ((kmAtual % 10000) / 10000) * 100;

                return kmRestantes <= 1000 ? (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-sm">
                    <div className="p-2.5 sm:p-3 bg-red-100/80 rounded-xl shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-red-800 uppercase tracking-tight">Atenção: Revisão Próxima!</h4>
                      <p className="text-xs sm:text-sm text-red-700 font-semibold mt-1 leading-relaxed">
                        Faltam apenas <span className="font-black">{kmRestantes.toLocaleString()} KM</span> para a próxima revisão programada em <span className="font-black">{proximaRevisaoKm.toLocaleString()} KM</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-tight">Próxima Revisão Programada</h4>
                      <span className="text-blue-700 font-black text-base sm:text-lg">{proximaRevisaoKm.toLocaleString()} KM</span>
                    </div>
                    <div className="w-full bg-blue-100/70 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${Math.min(percentualUso, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-blue-700 font-bold mt-2.5 flex items-center justify-between">
                      <span>{kmRestantes.toLocaleString()} KM restantes</span>
                      <span className="opacity-75">{percentualUso.toFixed(1)}% do intervalo</span>
                    </p>
                  </div>
                );
              })()}

              {/* Formulário de Nova Manutenção */}
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/50 p-4 sm:p-6 rounded-2xl shadow-sm">
                <h4 className="text-[10px] sm:text-[11px] font-black text-amber-800 uppercase tracking-widest mb-4 sm:mb-5 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Registrar Nova Manutenção
                </h4>
                <form onSubmit={handleSaveMaintenance} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase ml-1 tracking-wide">Tipo de Manutenção</label>
                      <select
                        required
                        value={newMaintenance.tipo}
                        onChange={e => setNewMaintenance({ ...newMaintenance, tipo: e.target.value })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-amber-200/70 rounded-xl text-xs sm:text-sm font-semibold shadow-sm appearance-none outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                      >
                        <option value="Revisão Programada">Revisão Programada</option>
                        <option value="Troca de Óleo">Troca de Óleo</option>
                        <option value="Troca de Filtros">Troca de Filtros</option>
                        <option value="Alinhamento e Balanceamento">Alinhamento e Balanceamento</option>
                        <option value="Troca de Pneus">Troca de Pneus</option>
                        <option value="Revisão de Freios">Revisão de Freios</option>
                        <option value="Revisão Elétrica">Revisão Elétrica</option>
                        <option value="Manutenção Corretiva">Manutenção Corretiva</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase ml-1 tracking-wide">Data Realizada</label>
                      <input
                        type="date"
                        required
                        value={newMaintenance.dataRealizada}
                        onChange={e => setNewMaintenance({ ...newMaintenance, dataRealizada: e.target.value })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-sm focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase ml-1 tracking-wide">KM na Manutenção</label>
                      <input
                        type="number"
                        required
                        value={newMaintenance.kmRealizada}
                        onChange={e => setNewMaintenance({ ...newMaintenance, kmRealizada: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase ml-1 tracking-wide">Próxima Revisão (KM)</label>
                      <input
                        type="number"
                        required
                        value={newMaintenance.proximaRevisaoKm}
                        onChange={e => setNewMaintenance({ ...newMaintenance, proximaRevisaoKm: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-amber-50/70 border border-amber-300/70 rounded-xl text-xs sm:text-sm font-black text-amber-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all shadow-sm"
                      />
                      <p className="text-[8px] text-amber-700 font-bold ml-1 mt-1 flex items-center gap-1">
                        <span className="opacity-60">⚙️</span> Intervalo padrão: 10.000 KM
                      </p>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase ml-1 tracking-wide">Próxima Revisão (Data Estimada)</label>
                      <input
                        type="date"
                        value={newMaintenance.proximaRevisaoData}
                        onChange={e => setNewMaintenance({ ...newMaintenance, proximaRevisaoData: e.target.value })}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-sm focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[8px] sm:text-[9px] font-black text-amber-800 uppercase ml-1 tracking-wide">Observações</label>
                      <textarea
                        value={newMaintenance.observacoes}
                        onChange={e => setNewMaintenance({ ...newMaintenance, observacoes: e.target.value })}
                        rows={3}
                        placeholder="Detalhes da manutenção realizada..."
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium shadow-sm resize-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all placeholder:text-slate-400 placeholder:italic"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black rounded-xl text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-amber-200/50 active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" /> Salvar Registro de Manutenção
                  </button>
                </form>
              </div>

              {/* Histórico de Manutenções */}
              <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200/60">
                  <h4 className="text-[10px] sm:text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" /> Histórico de Manutenções
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead className="bg-slate-50/80 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left">Data</th>
                        <th className="px-3 sm:px-4 py-3 text-left">Tipo</th>
                        <th className="px-3 sm:px-4 py-3 text-center">KM Realizada</th>
                        <th className="px-3 sm:px-4 py-3 text-center">Próxima Revisão</th>
                        <th className="px-3 sm:px-4 py-3 text-left">Observações</th>
                        <th className="px-3 sm:px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!activeVtrForMaintenance.manutencoes || activeVtrForMaintenance.manutencoes.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 sm:py-16 text-center text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase italic tracking-wide">
                            Nenhuma manutenção registrada para esta viatura.
                          </td>
                        </tr>
                      )}
                      {[...(activeVtrForMaintenance.manutencoes || [])].reverse().map(manutencao => (
                        <tr key={manutencao.id} className="hover:bg-amber-50/30 transition-colors text-[10px] sm:text-xs font-semibold text-slate-700">
                          <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">{new Date(manutencao.dataRealizada + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 uppercase text-amber-700 font-black">{manutencao.tipo}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center font-mono text-slate-600">{manutencao.kmRealizada.toLocaleString()} KM</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                            <div className="font-black text-blue-700">{manutencao.proximaRevisaoKm.toLocaleString()} KM</div>
                            {manutencao.proximaRevisaoData && (
                              <div className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">
                                {new Date(manutencao.proximaRevisaoData + 'T12:00:00').toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 max-w-[200px] truncate">{manutencao.observacoes || '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                            <button
                              onClick={() => {
                                const filteredManutencoes = activeVtrForMaintenance.manutencoes?.filter(m => m.id !== manutencao.id);
                                const updatedVtrs = vtrs.map(v => v.id === activeVtrForMaintenance.id ? { ...v, manutencoes: filteredManutencoes } : v);
                                setVtrs(updatedVtrs);
                                const vtrRefreshed = updatedVtrs.find(v => v.id === activeVtrForMaintenance.id);
                                if (vtrRefreshed) setActiveVtrForMaintenance(vtrRefreshed);
                              }}
                              className="p-1.5 sm:p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                              title="Excluir registro"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Footer Info */}
      <div className="bg-[#1e3a8a] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border-t-4 border-blue-400">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldAlert className="w-48 h-48" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="p-7 bg-white/10 rounded-[2.5rem] border border-white/20 backdrop-blur-md shadow-inner">
            <Activity className="w-12 h-12 text-blue-300" />
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tighter uppercase italic italic-extra mb-3">GESTÃO TÁTICA DE FROTA</h4>
            <p className="text-blue-200 font-medium max-w-2xl leading-relaxed text-sm">
              Mantenha o histórico de quilometragem atualizado para garantir a manutenção preventiva. O <span className="text-white font-bold">Controle da VTR</span> é essencial para a transparência e logística da Guarda Civil Municipal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControleVTR;

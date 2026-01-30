import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  X, 
  User, 
  MapPin, 
  History, 
  Activity, 
  Trash2, 
  Clock, 
  ChevronRight, 
  Check, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  ArrowLeftRight, 
  ChevronLeft, 
  LayoutList, 
  Edit3, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { JornadaEntry, Funcionario } from '../types';

const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

const STAFF_MOCK: Partial<Funcionario>[] = [
  { id: '1', nomeGuerra: 'Santos', cargo: 'Inspetor' },
  { id: '2', nomeGuerra: 'Melo', cargo: 'Guarda 1ª Classe' },
  { id: '3', nomeGuerra: 'Ferreira', cargo: 'Guarda 2ª Classe' },
  { id: '4', nomeGuerra: 'Oliveira', cargo: 'Guarda Especial' },
];

const GestaoJornada: React.FC = () => {
  const [entries, setEntries] = useState<JornadaEntry[]>([
    { id: '1', gcmNome: 'Melo', tipo: 'Troca de Escala', dataInicio: '2026-01-20', dataFim: '2026-01-21', detalhes: 'Solicitação via memorando interno para ajuste de escala festiva.', gcmTroca: 'Santos', local: 'BASE CENTRAL' },
    { id: '2', gcmNome: 'Santos', tipo: 'Folga', dataInicio: '2024-10-26', detalhes: 'Compensação de banco de horas (Operação Verão)', local: 'BASE CENTRAL' },
    { id: '3', gcmNome: 'Ferreira', tipo: 'Troca de Escala', dataInicio: '2024-10-25', detalhes: 'Troca com GCM Oliveira (Particular)', gcmTroca: 'Oliveira', local: 'BASE CENTRAL' },
    { id: '4', gcmNome: 'Melo', tipo: 'Atestado', dataInicio: '2024-10-24', dataFim: '2024-10-26', detalhes: 'Gripe Forte - CID J11', local: 'UPA CENTRO' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>('1');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const initialFormState = {
    gcmNome: STAFF_MOCK[0].nomeGuerra || '',
    tipo: 'Folga' as JornadaEntry['tipo'],
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    detalhes: '',
    gcmTroca: ''
  };

  const [formEntry, setFormEntry] = useState(initialFormState);

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const selectedEntry = useMemo(() => {
    return entries.find(e => e.id === selectedEntryId) || null;
  }, [entries, selectedEntryId]);

  const filteredEntries = entries.filter(e => 
    e.gcmNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedEntryId) {
      setEntries(entries.map(ent => ent.id === selectedEntryId ? { ...ent, ...formEntry } : ent));
    } else {
      const newEntry: JornadaEntry = {
        id: Math.random().toString(36).substr(2, 9),
        ...formEntry,
        local: 'BASE CENTRAL'
      };
      setEntries([newEntry, ...entries]);
    }
    setFormEntry(initialFormState);
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleOpenEdit = (entry: JornadaEntry) => {
    setFormEntry({
      gcmNome: entry.gcmNome,
      tipo: entry.tipo,
      dataInicio: entry.dataInicio,
      dataFim: entry.dataFim || '',
      detalhes: entry.detalhes,
      gcmTroca: entry.gcmTroca || ''
    });
    setSelectedEntryId(entry.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setEntries(entries.filter(e => e.id !== deleteConfirmId));
      if (selectedEntryId === deleteConfirmId) setSelectedEntryId(null);
      setDeleteConfirmId(null);
    }
  };

  const getTypeStyle = (tipo: string) => {
    switch(tipo) {
      case 'Folga': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Troca de Escala': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Falta': return 'bg-red-100 text-red-700 border-red-200';
      case 'Atestado': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Afastamento': return 'bg-slate-800 text-white border-slate-700';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push({ day: null, dateStr: null, entries: [] });
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEntries = entries.filter(e => e.dataInicio === dateStr);
      days.push({ day: i, dateStr, entries: dayEntries });
    }
    return days;
  }, [currentDate, entries]);

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-7xl mx-auto px-2">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" /> Gestão de Jornada
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Escalas e movimentações operacionais</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setFormEntry(initialFormState); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Detail Panel */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" /> Detalhes do Registro
            </h3>

            {selectedEntry ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                   <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getTypeStyle(selectedEntry.tipo)}`}>
                        {selectedEntry.tipo}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-slate-300" />
                   </div>
                   <p className="text-xl font-bold text-slate-800">GCM {selectedEntry.gcmNome}</p>
                   {selectedEntry.tipo === 'Troca de Escala' && (
                     <p className="text-[10px] font-bold text-blue-600 mt-1 flex items-center gap-1.5 uppercase">
                        <ArrowLeftRight className="w-3 h-3" /> Troca com {selectedEntry.gcmTroca}
                     </p>
                   )}
                   <p className="text-[11px] font-medium text-slate-500 mt-2">
                     {new Date(selectedEntry.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                   </p>
                </div>
                
                <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-inner">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Narrativa/Observações</p>
                   <p className="text-sm text-slate-600 italic leading-relaxed">"{selectedEntry.detalhes}"</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                 <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Nenhum registro selecionado</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-20 h-20" /></div>
             <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Métricas do Turno</p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[8px] font-medium text-slate-400 uppercase">Afastados</p>
                   <p className="text-xl font-bold text-red-400">02</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                   <p className="text-[8px] font-medium text-slate-400 uppercase">Trocas</p>
                   <p className="text-xl font-bold text-blue-400">01</p>
                </div>
             </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutList className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><CalendarIcon className="w-4 h-4" /></button>
            </div>

            {viewMode === 'list' ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" placeholder="Filtrar integrantes..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-blue-500 w-48"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => changeMonth(-1)} className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs font-bold text-slate-700 capitalize">{currentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredEntries.map((item) => (
                  <div 
                    key={item.id} onClick={() => setSelectedEntryId(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between ${
                      selectedEntryId === item.id 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getTypeStyle(item.tipo)}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-sm tracking-tight">GCM {item.gcmNome}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase border ${getTypeStyle(item.tipo)}`}>{item.tipo}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')} • {item.local || 'BASE'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className={`flex items-center gap-1 transition-all ${selectedEntryId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                            title="Entrar para Alterar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id); }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                            title="Entrar para Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                       <ChevronRight className={`w-4 h-4 transition-all ${selectedEntryId === item.id ? 'text-blue-500 translate-x-1' : 'text-slate-200 group-hover:text-slate-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <div key={d} className="bg-slate-50 p-3 text-center text-[10px] font-bold text-slate-400">{d}</div>
                ))}
                {calendarDays.map((d, i) => (
                  <div key={i} className={`bg-white min-h-[80px] p-2 relative transition-all ${!d.day ? 'bg-slate-50/50 opacity-40' : 'hover:bg-blue-50/30 cursor-pointer'}`} onClick={() => d.dateStr && setSelectedEntryId(d.entries?.[0]?.id || null)}>
                    {d.day && (
                      <>
                        <span className={`text-[10px] font-bold ${d.entries?.length ? 'text-blue-600' : 'text-slate-300'}`}>{d.day}</span>
                        <div className="mt-1 space-y-1">
                          {d.entries?.slice(0, 2).map((e: any) => (
                            <div key={e.id} className="text-[7px] font-bold px-1 py-0.5 rounded bg-blue-100 text-blue-700 truncate uppercase">{e.gcmNome}</div>
                          ))}
                          {d.entries && d.entries.length > 2 && <div className="text-[7px] text-slate-400 text-center font-bold">+{d.entries.length - 2}</div>}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-blue-700 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">{isEditing ? 'Editar Registro' : 'Novo Registro'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Integrante</label>
                <select 
                  value={formEntry.gcmNome} onChange={(e) => setFormEntry({...formEntry, gcmNome: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none focus:border-blue-500 text-sm cursor-pointer"
                >
                  {STAFF_MOCK.map(staff => <option key={staff.id} value={staff.nomeGuerra}>GCM {staff.nomeGuerra}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tipo</label>
                <div className="flex flex-wrap gap-2">
                   {['Folga', 'Troca de Escala', 'Falta', 'Atestado'].map(tipo => (
                     <button
                       key={tipo} type="button" onClick={() => setFormEntry({...formEntry, tipo: tipo as any})}
                       className={`px-3 py-1.5 rounded-lg border-2 text-[10px] font-bold uppercase transition-all ${formEntry.tipo === tipo ? 'bg-blue-600 border-blue-700 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                     >{tipo}</button>
                   ))}
                </div>
              </div>

              {formEntry.tipo === 'Troca de Escala' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Substituto</label>
                  <select 
                    value={formEntry.gcmTroca} onChange={(e) => setFormEntry({...formEntry, gcmTroca: e.target.value})}
                    className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 font-bold outline-none text-sm"
                  >
                    <option value="">Selecionar...</option>
                    {STAFF_MOCK.filter(s => s.nomeGuerra !== formEntry.gcmNome).map(staff => <option key={staff.id} value={staff.nomeGuerra}>GCM {staff.nomeGuerra}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Data</label>
                  <input required type="date" value={formEntry.dataInicio} onChange={(e) => setFormEntry({...formEntry, dataInicio: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none focus:border-blue-500 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fim (Opcional)</label>
                  <input type="date" value={formEntry.dataFim} onChange={(e) => setFormEntry({...formEntry, dataFim: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none focus:border-blue-500 text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Justificativa</label>
                <textarea 
                  required rows={2} value={formEntry.detalhes} onChange={(e) => setFormEntry({...formEntry, detalhes: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:border-blue-500 text-xs resize-none" placeholder="Motivo da alteração..."
                ></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest text-[11px] mt-2">Salvar Registro</button>
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
                O registro de jornada do GCM {entries.find(e => e.id === deleteConfirmId)?.gcmNome} será removido permanentemente.
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

export default GestaoJornada;

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Clock,
  Users,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  LayoutGrid,
  CalendarDays,
  Plus,
  X,
  UserCheck,
  ChevronDown,
  Trash2,
  Settings2,
  Check
} from 'lucide-react';
import { Team, Funcionario, TeamMember, DailySchedule } from '../types';

const GCM_POOL: Funcionario[] = [
  { id: '1', matricula: 'GCM-01', nome: 'Antônio Santos', nomeGuerra: 'Santos', cargo: 'Inspetor', status: 'ativo', bancoHoras: 0, foto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
  { id: '2', matricula: 'GCM-02', nome: 'Carlos Silva', nomeGuerra: 'Silva', cargo: 'Guarda 1ª Classe', status: 'ativo', bancoHoras: 0, foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
  { id: '3', matricula: 'GCM-03', nome: 'Ricardo Melo', nomeGuerra: 'Melo', cargo: 'Guarda 1ª Classe', status: 'ativo', bancoHoras: 0, foto: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
  { id: '4', matricula: 'GCM-04', nome: 'Mariana Ferreira', nomeGuerra: 'Ferreira', cargo: 'Guarda 2ª Classe', status: 'ativo', bancoHoras: 0, foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' },
  { id: '5', matricula: 'GCM-05', nome: 'José Oliveira', nomeGuerra: 'Oliveira', cargo: 'Guarda Especial', status: 'ativo', bancoHoras: 0, foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'alfa',
    name: 'Alfa',
    supervisor: 'Insp. Santos',
    shift: '06h - 18h',
    status: 'Em Turno',
    members: [
      { id: '1', nomeGuerra: 'Santos', cargo: 'Inspetor', status: 'base', foto: GCM_POOL[0].foto },
      { id: '2', nomeGuerra: 'Silva', cargo: 'Guarda 1ª Classe', status: 'em_vtr', foto: GCM_POOL[1].foto },
    ]
  },
  {
    id: 'bravo',
    name: 'Bravo',
    supervisor: 'Insp. Silva',
    shift: '18h - 06h',
    status: 'Próximo',
    members: [
      { id: '3', nomeGuerra: 'Melo', cargo: 'Inspetor', status: 'disponivel', foto: GCM_POOL[2].foto },
    ]
  }
];

interface EscalaTrabalhoProps {
  schedules: DailySchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<DailySchedule[]>>;
}

const EscalaTrabalho: React.FC<EscalaTrabalhoProps> = ({ schedules, setSchedules }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'monthly'>('overview');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [selectedTeamCardId, setSelectedTeamCardId] = useState<string | null>(null);

  // Modais de Gestão
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Modal de Agendamento (Calendário)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDayToSchedule, setSelectedDayToSchedule] = useState<string | null>(null);
  const [expandedTeamIdInModal, setExpandedTeamIdInModal] = useState<string | null>(null);

  // Estados temporários para o Modal de Agendamento
  const [tempShifts, setTempShifts] = useState<Record<string, string>>({});
  const [tempSelectedMembers, setTempSelectedMembers] = useState<Record<string, string[]>>({});

  const [newTeamData, setNewTeamData] = useState({ name: '', supervisor: '', shift: '06h - 18h' });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push({ day: null, dateStr: null });
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const daySchedule = schedules.find(s => s.date === dateStr);
      days.push({ day: i, dateStr, schedule: daySchedule });
    }
    return days;
  }, [currentDate, schedules]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Funções de Gestão de Equipes
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeamData.name,
      supervisor: newTeamData.supervisor,
      shift: newTeamData.shift as any,
      status: 'Folga',
      members: []
    };
    setTeams([...teams, newTeam]);
    setIsNewTeamModalOpen(false);
    setNewTeamData({ name: '', supervisor: '', shift: '06h - 18h' });
  };

  const toggleMemberInTeam = (memberId: string) => {
    if (!editingTeam) return;
    const isMember = editingTeam.members.some(m => m.id === memberId);
    let updatedMembers;
    if (isMember) {
      updatedMembers = editingTeam.members.filter(m => m.id !== memberId);
    } else {
      const gcm = GCM_POOL.find(g => g.id === memberId);
      if (gcm) {
        updatedMembers = [...editingTeam.members, {
          id: gcm.id,
          nomeGuerra: gcm.nomeGuerra || gcm.nome,
          cargo: gcm.cargo,
          status: 'base',
          foto: gcm.foto
        } as TeamMember];
      } else return;
    }
    const updatedTeam = { ...editingTeam, members: updatedMembers };
    setEditingTeam(updatedTeam);
    setTeams(teams.map(t => t.id === editingTeam.id ? updatedTeam : t));
  };

  // Funções de Agendamento Diário (Calendário)
  const openScheduleModal = (dateStr: string) => {
    setSelectedDayToSchedule(dateStr);
    const existing = schedules.find(s => s.date === dateStr);

    const initialShifts: Record<string, string> = {};
    const initialMembers: Record<string, string[]> = {};

    // Inicializa com os dados das equipes base
    teams.forEach(t => {
      initialShifts[t.id] = t.shift;
      initialMembers[t.id] = t.members.map(m => m.id);
    });

    // Se já houver escala salva, sobrepõe
    if (existing) {
      existing.teams.forEach(t => {
        // Encontrar o ID da equipe original pelo nome
        const originalTeam = teams.find(orig => orig.name === t.teamId);
        if (originalTeam) {
          initialShifts[originalTeam.id] = t.shift;
          initialMembers[originalTeam.id] = t.members.map(m => m.id);
        }
      });
    }

    setTempShifts(initialShifts);
    setTempSelectedMembers(initialMembers);
    setIsScheduleModalOpen(true);
  };

  const toggleMemberSelectionInSchedule = (teamId: string, memberId: string) => {
    setTempSelectedMembers(prev => {
      const current = prev[teamId] || [];
      const updated = current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId];
      return { ...prev, [teamId]: updated };
    });
  };

  const saveDailySchedule = () => {
    if (!selectedDayToSchedule) return;

    const dayTeams = Object.keys(tempSelectedMembers).map(teamId => {
      const selectedGCMs = GCM_POOL.filter(g => tempSelectedMembers[teamId].includes(g.id))
        .map(g => ({
          id: g.id,
          nomeGuerra: g.nomeGuerra || g.nome,
          cargo: g.cargo,
          status: 'disponivel' as const,
          foto: g.foto
        }));
      return {
        teamId: teams.find(t => t.id === teamId)?.name || teamId,
        shift: tempShifts[teamId] || '06h - 18h',
        members: selectedGCMs
      };
    }).filter(t => t.members.length > 0);

    setSchedules(prev => {
      const filtered = prev.filter(s => s.date !== selectedDayToSchedule);
      return [...filtered, { date: selectedDayToSchedule, teams: dayTeams }];
    });

    setIsScheduleModalOpen(false);
  };

  const getTeamColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('alfa')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (n.includes('bravo')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (n.includes('charlie')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (n.includes('delta')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-blue-800 tracking-tight uppercase">Escala Operacional</h2>
          <p className="text-slate-400 font-bold text-[9px] flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-blue-500" />
            {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendário
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ${viewMode === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Equipes
            </button>
          </div>
          {viewMode === 'overview' && (
            <button
              onClick={() => setIsNewTeamModalOpen(true)}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {viewMode === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => setSelectedTeamCardId(team.id === selectedTeamCardId ? null : team.id)}
              className={`p-5 rounded-2xl border transition-all relative group text-left cursor-pointer ${selectedTeamCardId === team.id
                  ? 'bg-blue-600 text-white border-blue-700 shadow-2xl scale-[1.02]'
                  : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${selectedTeamCardId === team.id ? 'bg-white/10' : 'bg-blue-50'}`}>
                  <Shield className={`w-5 h-5 ${selectedTeamCardId === team.id ? 'text-blue-100' : 'text-blue-600'}`} />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide ${selectedTeamCardId === team.id ? 'bg-white/20 text-white border border-white/10' : 'bg-slate-50 text-slate-400'
                  }`}>
                  {team.status}
                </span>
              </div>

              <h3 className={`text-xl font-black tracking-tight uppercase mb-1 ${selectedTeamCardId === team.id ? 'text-white' : 'text-slate-800'}`}>
                Equipe {team.name}
              </h3>
              <p className={`text-[10px] font-bold mb-4 flex items-center gap-1.5 ${selectedTeamCardId === team.id ? 'text-blue-100' : 'text-slate-400'}`}>
                Sup: {team.supervisor}
              </p>

              <div className="space-y-4">
                <div className="flex items-center -space-x-3 mb-2">
                  {team.members.map((m, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 overflow-hidden shadow-sm transition-transform ${selectedTeamCardId === team.id ? 'border-blue-400' : 'border-white'}`}>
                      <img src={m.foto} alt={m.nomeGuerra} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {team.members.length === 0 && (
                    <div className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] ${selectedTeamCardId === team.id ? 'border-blue-400 text-blue-200' : 'border-slate-200 text-slate-300'}`}>
                      <Users className="w-4 h-4 opacity-30" />
                    </div>
                  )}
                </div>

                {selectedTeamCardId === team.id && (
                  <div className="animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-white/10 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-200">Integrantes Base</p>
                      <div className="space-y-1">
                        {team.members.map((m, i) => (
                          <p key={i} className="text-xs font-normal text-white flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-300"></div> GCM {m.nomeGuerra}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingTeam(team); setIsManageMembersModalOpen(true); }}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Gerenciar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`mt-6 pt-4 border-t flex justify-between items-center ${selectedTeamCardId === team.id ? 'border-white/10' : 'border-slate-50'}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${selectedTeamCardId === team.id ? 'text-blue-100' : 'text-blue-600'}`}>{team.shift}</span>
                <ChevronRight className={`w-4 h-4 ${selectedTeamCardId === team.id ? 'text-white' : 'text-slate-200'}`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendário Mensal */
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight capitalize italic">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-3">
              <button onClick={() => changeMonth(-1)} className="p-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => changeMonth(1)} className="p-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-inner">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="bg-slate-50 p-5 text-center text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">{d}</div>
            ))}
            {calendarDays.map((d, i) => {
              const hasSchedule = d.schedule && d.schedule.teams.length > 0;
              return (
                <div
                  key={i}
                  className={`bg-white min-h-[170px] p-4 relative group transition-all ${!d.day ? 'opacity-30' : 'hover:bg-blue-50/20 cursor-pointer'}`}
                  onClick={() => d.dateStr && openScheduleModal(d.dateStr)}
                >
                  {d.day && (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-sm font-bold ${hasSchedule ? 'text-blue-700' : 'text-slate-200'}`}>{d.day}</span>
                        {!hasSchedule && <Plus className="w-4 h-4 text-slate-100 group-hover:text-blue-200" />}
                      </div>
                      <div className="space-y-3">
                        {d.schedule?.teams.map((t, idx) => (
                          <div key={idx} className={`p-2.5 rounded-2xl border flex flex-col gap-2 shadow-sm transition-all hover:scale-105 ${getTeamColor(t.teamId)}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-widest">{t.teamId}</span>
                              <span className="text-[8px] font-light opacity-70 italic">{t.shift}</span>
                            </div>
                            <div className="flex -space-x-2">
                              {t.members.map((m, mi) => (
                                <div key={mi} className="w-6 h-6 rounded-full border border-white overflow-hidden">
                                  <img src={m.foto} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Escalar Efetivo Diário (Calendário) - TELA CHEIA */}
      {isScheduleModalOpen && selectedDayToSchedule && (
        <div className="fixed inset-0 bg-[#f1f5f9] z-[100] flex flex-col animate-in fade-in duration-300">
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="bg-blue-700 p-10 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-800">
              <div>
                <h3 className="text-2xl font-bold italic uppercase tracking-tighter">Escalar Efetivo</h3>
                <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5" /> {new Date(selectedDayToSchedule + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><X className="w-7 h-7" /></button>
            </div>

            <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Gestão de Turno Diário</p>
              <div className="space-y-4">
                {teams.map(team => {
                  const isExpanded = expandedTeamIdInModal === team.id;
                  const selectedCount = tempSelectedMembers[team.id]?.length || 0;
                  return (
                    <div key={team.id} className={`rounded-[2.5rem] border-2 transition-all overflow-hidden ${selectedCount > 0 ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50 bg-white'}`}>
                      <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setExpandedTeamIdInModal(isExpanded ? null : team.id)}>
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl ${getTeamColor(team.name)}`}><Shield className="w-6 h-6" /></div>
                          <div>
                            <p className="font-bold text-slate-800 uppercase">Equipe {team.name}</p>
                            <p className="text-[10px] font-light text-slate-400">{selectedCount} GCMs Escalados</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                      </div>
                      {isExpanded && (
                        <div className="p-8 pt-2 border-t border-slate-100 space-y-6">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Horário do Turno</label>
                            <input type="text" value={tempShifts[team.id] || ''} onChange={(e) => setTempShifts(prev => ({ ...prev, [team.id]: e.target.value }))} className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none" placeholder="Ex: 06h - 18h" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Selecionar do Efetivo</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {GCM_POOL.map(gcm => (
                                <button key={gcm.id} onClick={() => toggleMemberSelectionInSchedule(team.id, gcm.id)} className={`w-full p-3 rounded-2xl flex items-center justify-between border-2 transition-all ${tempSelectedMembers[team.id]?.includes(gcm.id) ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-50 text-slate-500'}`}>
                                  <div className="flex items-center gap-3">
                                    {gcm.foto ? <img src={gcm.foto} className="w-8 h-8 rounded-full border border-white/20" /> : <div className="w-8 h-8 rounded-full bg-slate-200" />}
                                    <div className="text-left">
                                      <span className="text-[11px] font-bold block">GCM {gcm.nomeGuerra}</span>
                                      <span className="text-[8px] opacity-70 uppercase">{gcm.cargo}</span>
                                    </div>
                                  </div>
                                  {tempSelectedMembers[team.id]?.includes(gcm.id) ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5 opacity-30" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-white border-t-4 border-slate-100 flex gap-6 shrink-0">
              <button onClick={() => setIsScheduleModalOpen(false)} className="flex-1 py-6 bg-white border border-slate-200 text-slate-500 font-black rounded-[2rem] hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-[11px]">Cancelar</button>
              <button onClick={saveDailySchedule} className="flex-1 py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-3 border-b-4 border-blue-800">
                <CheckCircle2 className="w-6 h-6" /> Efetivar Escala do Dia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Equipe (Geral) */}
      {isNewTeamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-blue-700 p-8 text-white flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-2xl font-bold italic uppercase tracking-tighter">Nova Equipe</h3>
                <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-[0.4em] mt-2">Cadastro de Unidade Base</p>
              </div>
              <button onClick={() => setIsNewTeamModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-7 h-7" /></button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-8 space-y-6">
              <input required type="text" value={newTeamData.name} onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm" placeholder="Nome da Equipe (ex: Delta)" />
              <input required type="text" value={newTeamData.supervisor} onChange={(e) => setNewTeamData({ ...newTeamData, supervisor: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm" placeholder="Supervisor" />
              <select value={newTeamData.shift} onChange={(e) => setNewTeamData({ ...newTeamData, shift: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none text-sm">
                <option>06h - 18h</option><option>18h - 06h</option><option>24h x 72h</option>
              </select>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3"><CheckCircle2 className="w-5 h-5" /> Criar Equipe</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Integrantes (Geral) */}
      {isManageMembersModalOpen && editingTeam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
              <div><h3 className="text-xl font-bold uppercase tracking-tighter">Membros Base: {editingTeam.name}</h3></div>
              <button onClick={() => setIsManageMembersModalOpen(false)} className="p-3"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integrantes Vinculados</p>
              {editingTeam.members.map(m => (
                <div key={m.id} className="p-3 bg-blue-50/50 rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.foto ? <img src={m.foto} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-slate-200" />}
                    <span className="text-xs font-bold">GCM {m.nomeGuerra}</span>
                  </div>
                  <button onClick={() => toggleMemberInTeam(m.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">Adicionar ao Efetivo</p>
              {GCM_POOL.filter(g => !editingTeam.members.some(m => m.id === g.id)).map(gcm => (
                <button key={gcm.id} onClick={() => toggleMemberInTeam(gcm.id)} className="w-full p-3 border rounded-2xl hover:bg-blue-50 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {gcm.foto ? <img src={gcm.foto} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-slate-200" />}
                    <span className="text-xs font-bold">GCM {gcm.nomeGuerra}</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalaTrabalho;

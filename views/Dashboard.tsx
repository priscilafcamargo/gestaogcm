
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Users,
  Car,
  FileWarning,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Target,
  Calendar,
  Palmtree,
  ArrowLeftRight,
  BellRing,
  ChevronRight,
  UserCheck,
  Edit3,
  X,
  Save,
  Upload,
  FileText,
  Cake,
  Maximize2,
  Navigation,
  ChevronLeft,
  Shield,
  CalendarDays,
  UserCircle,
  RefreshCcw
} from 'lucide-react';
import { Module, DailySchedule, Funcionario, Audiencia } from '../types';
import OperatorMap from '../components/OperatorMap';

const CURRENT_USER = { name: "GCM Priscila Ferraz", role: "ADMIN" };

const MOTIVATIONAL_PHRASES = [
  "A força da cidade está na coragem de seus guardiões",
  "Servir e proteger é a nossa missão suprema",
  "Sua vigilância garante a paz de muitas famílias",
  "Honra, disciplina e coragem em cada patrulha",
  "A segurança pública é construída com o seu empenho",
  "Nossa missão é a paz social, nossa arma é a prevenção",
  "A ordem e o respeito começam com a sua presença",
  "Proteja com honra, sirva com dedicação absoluta",
  "Pequenas ações geram grandes transformações na comunidade",
  "Sua dedicação é o escudo da nossa sociedade"
];

interface DashboardProps {
  onNavigate: (module: Module) => void;
  schedules: DailySchedule[];
  staff: Funcionario[];
  audiencias: Audiencia[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, schedules, staff, audiencias }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados do Calendário e Modal de Escala
  const [selectedDateScale, setSelectedDateScale] = useState<string | null>(null);
  const [isScaleDetailOpen, setIsScaleDetailOpen] = useState(false);

  const fullText = useMemo(() => {
    return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
  }, []);

  const [noticeTitle, setNoticeTitle] = useState('Atualização de Protocolo');
  const [noticeText, setNoticeText] = useState('Novas diretrizes para abordagem em eventos públicos foram anexadas ao seu perfil. Favor revisar antes do turno.');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [tempTitle, setTempTitle] = useState(noticeTitle);
  const [tempText, setTempText] = useState(noticeText);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para localização de operadores
  const [selectedOperator, setSelectedOperator] = useState<Funcionario | null>(null);
  const [isOperatorMapOpen, setIsOperatorMapOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [operatorLocation, setOperatorLocation] = useState({
    lat: -23.9975,
    lng: -48.3458,
    timestamp: new Date().toISOString(),
    accuracy: 10
  });

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setGreeting(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [fullText]);

  const stats = [
    { label: 'Viaturas Ativas', value: '14', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ocorrências/24h', value: '42', icon: FileWarning, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Efetivo em Turno', value: '38', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Metas Atingidas', value: '94%', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  // Calcular próxima audiência dinamicamente
  const nextHearing = useMemo(() => {
    const today = new Date();
    const upcomingHearings = audiencias
      .filter(a => new Date(a.dataAudiencia) >= today)
      .sort((a, b) => new Date(a.dataAudiencia).getTime() - new Date(b.dataAudiencia).getTime());

    if (upcomingHearings.length > 0) {
      const hearing = upcomingHearings[0];
      const hearingDate = new Date(hearing.dataAudiencia);
      return {
        gcmNome: hearing.gcmNome,
        formatted: hearingDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
        id: hearing.id
      };
    }
    return { gcmNome: 'Nenhuma agendada', formatted: 'Sem dados', id: null };
  }, [audiencias]);

  // Calcular próximo aniversário dinamicamente
  const nextBirthday = useMemo(() => {
    const today = new Date();
    const staffWithBirthdays = staff
      .filter(s => s.dataNascimento)
      .map(s => {
        const birthDate = new Date(s.dataNascimento + 'T00:00:00');
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());

        const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          name: s.nomeGuerra || s.nome.split(' ')[0],
          date: nextBirthday,
          daysUntil,
          formatted: nextBirthday.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return staffWithBirthdays[0] || { name: 'Não definido', formatted: 'Sem dados', daysUntil: 0 };
  }, [staff]);

  // Calcular próximo ausente da gestão de jornada
  const nextAbsent = useMemo(() => {
    const today = new Date();
    const futureSchedules = schedules
      .filter(s => new Date(s.date + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Procurar por ausências nas escalas futuras
    for (const schedule of futureSchedules) {
      const allScheduledMembers = schedule.teams.flatMap(t => t.members.map(m => m.nomeGuerra));
      const absentStaff = staff.filter(s =>
        s.status === 'ativo' &&
        !allScheduledMembers.includes(s.nomeGuerra || s.nome.split(' ')[0])
      );

      if (absentStaff.length > 0) {
        const scheduleDate = new Date(schedule.date + 'T00:00:00');
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let dateStr = scheduleDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        if (scheduleDate.toDateString() === tomorrow.toDateString()) {
          dateStr = 'Amanhã, ' + dateStr;
        } else if (scheduleDate.toDateString() === today.toDateString()) {
          dateStr = 'Hoje';
        }

        return {
          name: absentStaff[0].nomeGuerra || absentStaff[0].nome.split(' ')[0],
          date: dateStr
        };
      }
    }

    return { name: 'Todos escalados', date: 'Sem ausências' };
  }, [schedules, staff]);

  const personalSchedule = [
    { label: 'Próxima Folga', value: `GCM ${nextAbsent.name}`, sub: nextAbsent.date, icon: Calendar, color: 'bg-emerald-500', onClick: undefined },
    { label: 'Próxima Audiência', value: `GCM ${nextHearing.gcmNome}`, sub: nextHearing.formatted, icon: CalendarDays, color: 'bg-purple-500', onClick: () => onNavigate('audiencias') },
    { label: 'Férias Agendadas', value: 'GCM Melo', sub: '15 Nov a 15 Dez', icon: Palmtree, color: 'bg-amber-500', onClick: undefined },
    { label: 'Próximo Aniversário', value: `GCM ${nextBirthday.name}`, sub: `Dia ${nextBirthday.formatted}`, icon: Cake, color: 'bg-pink-500', onClick: undefined },
  ];

  // Lógica do Grid do Calendário
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push({ day: null, dateStr: null });
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleDayClick = (dateStr: string) => {
    const hasSchedule = schedules.some(s => s.date === dateStr);
    if (hasSchedule) {
      setSelectedDateScale(dateStr);
      setIsScaleDetailOpen(true);
    }
  };

  const handleSaveNotice = () => {
    setNoticeTitle(tempTitle);
    setNoticeText(tempText);
    setIsEditingNotice(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  const handleDocumentAction = () => {
    if (isAdmin && !attachedFileName) {
      fileInputRef.current?.click();
    } else if (attachedFileName) {
      alert(`Abrindo documento: ${attachedFileName}`);
    } else {
      alert("Nenhum documento anexado a este comunicado.");
    }
  };

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  // Usuários considerados "online" (simulação baseada em status ativo no sistema)
  const onlineUsers = useMemo(() => {
    return staff.filter(u => u.status === 'ativo');
  }, [staff]);

  const handleLocateOperator = (operator: Funcionario) => {
    setSelectedOperator(operator);
    setIsOperatorMapOpen(true);

    // Tentar obter localização real do navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Sucesso - usar localização real
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy
          };
          setOperatorLocation(newLocation);
        },
        (error) => {
          console.error('Erro ao obter geolocalização:', error);
          // Fallback - usar localização simulada próxima a Capão Bonito
          const fallbackLocation = {
            lat: -23.9975 + (Math.random() - 0.5) * 0.01,
            lng: -48.3458 + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString(),
            accuracy: Math.floor(Math.random() * 20) + 5
          };
          setOperatorLocation(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Navegador não suporta geolocalização - usar localização simulada
      const fallbackLocation = {
        lat: -23.9975 + (Math.random() - 0.5) * 0.01,
        lng: -48.3458 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date().toISOString(),
        accuracy: Math.floor(Math.random() * 20) + 5
      };
      setOperatorLocation(fallbackLocation);
    }
  };

  const handleRefreshLocation = () => {
    // Atualizar localização com geolocalização real
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy
          };
          setOperatorLocation(newLocation);
        },
        (error) => {
          console.error('Erro ao atualizar geolocalização:', error);
          // Fallback
          const fallbackLocation = {
            lat: -23.9975 + (Math.random() - 0.5) * 0.01,
            lng: -48.3458 + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString(),
            accuracy: Math.floor(Math.random() * 20) + 5
          };
          setOperatorLocation(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">

      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="w-full md:w-3/4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizado com Central 153</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight min-h-[3rem] md:min-h-[5rem]">
            {greeting}
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium">O status operacional de hoje está dentro dos padrões esperados.</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('atendimento')}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 whitespace-nowrap"
          >
            Acessar 153 <Radio className="w-4 h-4 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Grid Principal: Calendário (Left) e Stats/Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Widget Calendário Operacional (Apenas Leitura) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight italic">Escala Mensal</h3>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Consulta de Efetivo</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft className="w-3.5 h-3.5 text-slate-400" /></button>
                <span className="text-[10px] font-black text-slate-700 uppercase min-w-[80px] text-center">{currentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-0.5">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                <div key={d} className="text-center py-1 text-[8px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
              ))}
              {calendarDays.map((d, idx) => (
                <div
                  key={idx}
                  onClick={() => d.dateStr && handleDayClick(d.dateStr)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer border ${!d.day ? 'opacity-0 pointer-events-none' :
                    'hover:bg-blue-50 border-transparent hover:border-blue-100 group'
                    }`}
                >
                  {d.day && (
                    <>
                      <span className={`text-[11px] font-bold ${schedules.some(s => s.date === d.dateStr) ? 'text-blue-600' : 'text-slate-700'} group-hover:text-blue-600`}>{d.day}</span>
                      {schedules.some(s => s.date === d.dateStr) && (
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Modo de Leitura
            </p>
          </div>
        </div>

        {/* Coluna Direita (Stats e Usuários Online) */}
        <div className="space-y-4 flex flex-col h-full">
          {/* Stats em Grid Compacto */}
          <div className="grid grid-cols-2 gap-3">
            {stats.slice(0, 2).map((stat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                <div className={`${stat.bg} ${stat.color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <span className="text-xl font-black text-slate-800 tracking-tighter italic">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Usuários Online */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic">Oficiais em Rede</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase">{onlineUsers.length} Online</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {onlineUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleLocateOperator(u)}
                  className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden relative">
                      {u.foto ? (
                        <img src={u.foto} className="w-full h-full object-cover" alt={u.nome} />
                      ) : (
                        <UserCircle className="w-4 h-4 text-blue-300" />
                      )}
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-800 uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">GCM {u.nomeGuerra || u.nome.split(' ')[0]}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase truncate">{u.cargo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase italic py-4">Nenhum oficial em rede</p>
              )}
            </div>
          </div>
        </div>

        {/* Grid com Alerta/Status à esquerda e Cards de Jornada à direita */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Coluna Esquerda: Alerta de Comando e Status Alfa */}
          <div className="space-y-4">
            {/* Alerta de Comando */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap className="w-12 h-12" />
              </div>

              {isAdmin && (
                <button
                  onClick={() => { setTempTitle(noticeTitle); setTempText(noticeText); setIsEditingNotice(true); }}
                  className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                  title="Editar Aviso"
                >
                  <Edit3 className="w-3 h-3 text-blue-400" />
                </button>
              )}

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full mb-3 border border-blue-500/20">
                  <BellRing className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Alerta de Comando</span>
                </div>
                <h4 className="text-sm font-bold tracking-tight mb-2 uppercase italic tracking-tighter">{noticeTitle}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-3 font-medium">
                  {noticeText}
                </p>

                <button
                  onClick={handleDocumentAction}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn w-full"
                >
                  {attachedFileName ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    isAdmin ? <Upload className="w-3.5 h-3.5 text-blue-400 group-hover/btn:scale-110 transition-transform" /> : <FileText className="w-3.5 h-3.5" />
                  )}
                  {attachedFileName ? `Ver: ${attachedFileName}` : 'Ler Documento'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            {/* Status Alfa */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <ShieldCheck className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-black italic uppercase tracking-tighter text-slate-800">Status Alfa</p>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em]">Equipe Destaque</p>
                </div>
              </div>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed relative z-10">
                A guarnição <span className="text-emerald-600 font-black">ALFA</span> atingiu <span className="text-emerald-600 font-black">98.4%</span> de resolutividade, consolidando-se como a melhor performance operacional deste ciclo.
              </p>
              <div className="mt-3 flex justify-end relative z-10">
                <div className="h-1 w-1/2 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98.4%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Cards de Jornada em Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {personalSchedule.map((item, idx) => (
              <div
                key={idx}
                onClick={item.onClick}
                className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-3 group ${item.onClick ? 'cursor-pointer hover:scale-105' : ''}`}
              >
                <div className={`${item.color} p-2.5 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 leading-tight">{item.label}</p>
                  <p className="text-xs font-bold text-slate-800 tracking-tight leading-tight mb-1">{item.value}</p>
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Modais de Detalhes da Escala */}
      {isScaleDetailOpen && selectedDateScale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-4 border-blue-600">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-600 rounded-2xl">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Escala do Dia</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1">{new Date(selectedDateScale + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <button onClick={() => setIsScaleDetailOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="p-10 space-y-6">
              {schedules.find(s => s.date === selectedDateScale) ? (
                schedules.find(s => s.date === selectedDateScale)?.teams.map((team, tIdx) => (
                  <div key={tIdx} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">Equipe {team.teamId}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">{team.shift}</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efetivo Escalado:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {team.members.map((member, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] uppercase">
                              {member.foto ? <img src={member.foto} className="w-full h-full object-cover rounded-full" /> : member.nomeGuerra.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase">GCM {member.nomeGuerra}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                  <Users className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhuma escala cadastrada para esta data.</p>
                </div>
              )}
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={() => setIsScaleDetailOpen(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Fechar Detalhes</button>
            </div>
          </div>
        </div>
      )}

      {isMapModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-4 border-blue-600">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <Navigation className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Geomonitoramento Tático</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1">Sincronização COI • Tempo Real</p>
                </div>
              </div>
              <button onClick={() => setIsMapModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative group overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-48.337,-24.013,13,0/1200x800?access_token=pk.eyJ1IjoiYmFycmV0byIsImEiOiJjazlzZnh4ajQwMWRnM2R0N2t4eGR1M2F5In0.Lp2J4Tf_G5p-E_m7u-zR9A')] bg-cover bg-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-ping"></div>
                    <div className="relative p-2 bg-blue-600 rounded-full border-2 border-white shadow-xl">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg border border-white/20 whitespace-nowrap">ROMU-01</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 right-8 space-y-3">
                <button className="p-4 bg-white rounded-2xl shadow-xl hover:bg-slate-50 text-slate-800 border border-slate-100 transition-all"><Maximize2 className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-8 bg-white border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Monitoramento Tático Centralizado • GCM Capão Bonito</p>
            </div>
          </div>
        </div>
      )}

      {isEditingNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b-4 border-blue-900">
              <div className="flex items-center gap-4">
                <Edit3 className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Editar Aviso</h3>
              </div>
              <button onClick={() => setIsEditingNotice(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Alerta</label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo do Aviso</label>
                <textarea
                  rows={4}
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none"
                />
              </div>
              <button
                onClick={handleSaveNotice}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-blue-900 active:scale-95"
              >
                <Save className="w-5 h-5" /> Atualizar Comunicado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Localização do Operador */}
      {isOperatorMapOpen && selectedOperator && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-start justify-center p-0 sm:p-4 sm:pt-8 animate-in fade-in duration-200" onClick={() => { setIsOperatorMapOpen(false); setSelectedOperator(null); }}>
          <div className="bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300 max-h-screen sm:max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5 text-white flex justify-between items-center sticky top-0 z-10 shadow-lg">
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" /> Localização
                </h3>
                <p className="text-[9px] sm:text-[10px] text-blue-300 font-bold uppercase tracking-wide mt-0.5">
                  {selectedOperator.nomeGuerra || selectedOperator.nome.split(' ')[0]} • {selectedOperator.cargo}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshLocation}
                  disabled={isLoadingLocation}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
                  title="Atualizar"
                >
                  <RefreshCcw className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setIsOperatorMapOpen(false);
                    setSelectedOperator(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-md">
                    {selectedOperator.foto ? (
                      <img src={selectedOperator.foto} className="w-full h-full object-cover" alt={selectedOperator.nome} />
                    ) : (
                      <UserCircle className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate">
                      {selectedOperator.nome}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                      {selectedOperator.cargo} • Mat: {selectedOperator.matricula}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa de Localização */}
              <div className="h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${operatorLocation.lng - 0.005},${operatorLocation.lat - 0.005},${operatorLocation.lng + 0.005},${operatorLocation.lat + 0.005}&layer=mapnik&marker=${operatorLocation.lat},${operatorLocation.lng}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Mapa de Localização"
                />
              </div>


              <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3" /> Informações GPS
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5 text-[9px] sm:text-[10px]">Atualização</p>
                    <p className="text-slate-700 font-bold">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5 text-[9px] sm:text-[10px]">Precisão</p>
                    <p className="text-slate-700 font-bold">~{Math.floor(operatorLocation.accuracy)}m</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5 text-[9px] sm:text-[10px]">Status</p>
                    <p className="text-emerald-600 font-bold">Ativo</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setIsOperatorMapOpen(false);
                  setSelectedOperator(null);
                }}
                className="flex-1 py-2.5 sm:py-3 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-sm uppercase tracking-wide text-[10px] sm:text-[11px]"
              >
                Fechar
              </button>
              <button
                onClick={() => onNavigate('atendimento')}
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg uppercase tracking-wide text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" /> Despacho
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Componente auxiliar CheckCircle2
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
);

export default Dashboard;

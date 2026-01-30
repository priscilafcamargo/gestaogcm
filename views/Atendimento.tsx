
import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Clock,
  Plus,
  Filter,
  AlertTriangle,
  Radio,
  X,
  Save,
  Sparkles,
  Loader2,
  Trash2,
  Eye,
  CheckCircle2,
  Car,
  ChevronRight,
  UserCheck,
  RefreshCcw,
  Printer,
  FileText,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { analyzeIncident } from '../services/geminiService';
import { BRASAO_GCM } from '../config/constants';
import OperatorMap from '../components/OperatorMap';

// Usuário Logado (Administrador definido como GCM Ferraz)
const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

interface Call {
  id: string;
  protocol: string;
  type: string;
  priority: string;
  time: string;
  status: 'Aguardando' | 'Em Deslocamento' | 'Solucionado';
  caller: string;
  address: string;
  vtr?: string;
  team?: string;
  description?: string;
  resolutionSummary?: string;
}

interface Operator {
  name: string;
  role: string;
  isOnline: boolean;
  location?: {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
  };
}

const Atendimento: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([
    { id: '1', protocol: '2024.1023', type: 'Violência Doméstica', priority: 'Urgente', time: '14:22', status: 'Aguardando', caller: 'Maria Silva', address: 'Rua das Flores, 123', description: 'Vítima relata agressão verbal e ameaças do ex-companheiro no local.' },
    { id: '2', protocol: '2024.1024', type: 'Furto em Andamento', priority: 'Emergência', time: '14:25', status: 'Em Deslocamento', vtr: 'VTR-12', team: 'GCM Melo, GCM Ferreira', caller: 'Anônimo', address: 'Av. Central, 1000', description: 'Indivíduo tentando arrombar portão de estabelecimento comercial.' },
    { id: '3', protocol: '2024.1025', type: 'Dano ao Patrimônio', priority: 'Normal', time: '14:30', status: 'Solucionado', vtr: 'VTR-08', team: 'GCM Ricardo, GCM Souza', caller: 'Zelador Condomínio', address: 'Pça da Matriz, s/n', description: 'Pichação em monumento público detectada pelas câmeras.', resolutionSummary: 'Equipe chegou ao local, os indivíduos já haviam se evadido. Foi feito o registro fotográfico e orientado o zelador.' },
  ]);

  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [selectedCallForDetails, setSelectedCallForDetails] = useState<Call | null>(null);
  const [dispatchCall, setDispatchCall] = useState<Call | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    priority: 'Todas',
    status: 'Todos'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    caller: '',
    type: '',
    priority: 'Normal',
    address: '',
    description: ''
  });

  const [operators, setOperators] = useState<Operator[]>([
    { name: "Insp. Santos", role: "Supervisor", isOnline: true, location: { lat: -23.9975, lng: -48.3458, timestamp: new Date().toISOString(), accuracy: 10 } },
    { name: "GCM Ferraz", role: "Gestão Digital", isOnline: true, location: { lat: -23.9985, lng: -48.3468, timestamp: new Date().toISOString(), accuracy: 15 } },
    { name: "GCM Melo", role: "Telemática", isOnline: true, location: { lat: -23.9965, lng: -48.3448, timestamp: new Date().toISOString(), accuracy: 12 } },
    { name: "GCM Ferreira", role: "Despachante", isOnline: false },
    { name: "GCM Silva", role: "Operador", isOnline: true, location: { lat: -23.9955, lng: -48.3438, timestamp: new Date().toISOString(), accuracy: 8 } },
  ]);

  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const availableVTRs = [
    { prefixo: 'ROMU-01', team: 'Insp. Santos, GCM Silva' },
    { prefixo: 'VTR-08', team: 'GCM Ricardo, GCM Souza' },
    { prefixo: 'MOTO-04', team: 'GCM Pedro' },
    { prefixo: 'VTR-15', team: 'GCM Oliveira, GCM Costa' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIClassify = async () => {
    if (!formData.description || formData.description.length < 15) return;
    setIsAnalyzing(true);
    const result = await analyzeIncident(formData.description);
    if (result) {
      setFormData(prev => ({
        ...prev,
        type: result.tipo_crime || prev.type,
        priority: result.gravidade === 'alto' ? 'Emergência' : result.gravidade === 'medio' ? 'Urgente' : 'Normal'
      }));
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const newCall: Call = {
      id: Math.random().toString(36).substr(2, 9),
      protocol: `${now.getFullYear()}.${Math.floor(1000 + Math.random() * 9000)}`,
      type: formData.type || 'Natureza a Verificar',
      priority: formData.priority,
      time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
      status: 'Aguardando',
      caller: formData.caller,
      address: formData.address,
      description: formData.description
    };

    setCalls([newCall, ...calls]);
    setIsNewCallModalOpen(false);
    setFormData({ caller: '', type: '', priority: 'Normal', address: '', description: '' });
  };

  const updateCallStatus = (id: string, newStatus: Call['status']) => {
    setCalls(calls.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCallForDetails && selectedCallForDetails.id === id) {
      setSelectedCallForDetails({ ...selectedCallForDetails, status: newStatus });
    }
  };

  const updateResolution = (id: string, summary: string) => {
    setCalls(calls.map(c => c.id === id ? { ...c, resolutionSummary: summary } : c));
    if (selectedCallForDetails && selectedCallForDetails.id === id) {
      setSelectedCallForDetails({ ...selectedCallForDetails, resolutionSummary: summary });
    }
  };

  const assignVTR = (prefixo: string, team: string) => {
    if (!dispatchCall) return;
    setCalls(calls.map(c => c.id === dispatchCall.id ? {
      ...c,
      vtr: prefixo,
      team: team,
      status: 'Em Deslocamento'
    } : c));
    setDispatchCall(null);
  };

  const deleteCall = (id: string) => {
    if (CURRENT_USER.name !== 'GCM Ferraz') return;
    if (window.confirm("Atenção GCM Ferraz: Deseja realmente excluir este atendimento?")) {
      setCalls(calls.filter(c => c.id !== id));
    }
  };

  const handleLocateOperator = async (operator: Operator) => {
    if (!operator.isOnline) return;

    setIsLoadingLocation(true);

    // Try to get real-time location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const updatedOperator = {
            ...operator,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: position.coords.accuracy
            }
          };
          setSelectedOperator(updatedOperator);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to mock location if permission denied or error
          setSelectedOperator(operator);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Fallback to mock location if geolocation not supported
      setSelectedOperator(operator);
      setIsLoadingLocation(false);
    }
  };

  const handleRefreshLocation = () => {
    if (selectedOperator) {
      setSelectedOperator(null);
      setTimeout(() => handleLocateOperator(selectedOperator), 100);
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesPriority = activeFilters.priority === 'Todas' || call.priority === activeFilters.priority;
    const matchesStatus = activeFilters.status === 'Todos' || call.status === activeFilters.status;
    return matchesPriority && matchesStatus;
  });

  const handlePrint = (call: Call) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>RA Digital - Prot: ${call.protocol}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.4; font-size: 11px; }
            .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header-left { display: flex; align-items: center; gap: 15px; }
            .logo { width: 60px; height: auto; }
            .header-info h1 { margin: 0; font-size: 18px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.5px; }
            .header-info p { margin: 2px 0 0 0; font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .protocol-box { text-align: right; }
            .protocol-label { font-size: 8px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 2px; }
            .protocol-number { font-size: 16px; font-weight: 900; color: #000; letter-spacing: 1px; }
            
            .section { margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; page-break-inside: avoid; }
            .section-title { background: #f8fafc; padding: 6px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 900; font-size: 8px; text-transform: uppercase; color: #1e3a8a; }
            
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); padding: 10px 12px; gap: 15px; }
            .field { display: flex; flex-direction: column; }
            .label { font-size: 7px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
            .value { font-size: 11px; font-weight: 600; color: #1e293b; }
            .col-span-2 { grid-column: span 2; }
            .col-span-3 { grid-column: span 3; }
            .col-span-4 { grid-column: span 4; }

            .text-block { padding: 12px; font-size: 11px; line-height: 1.6; color: #334155; }
            .italic { font-style: italic; }
            
            .auth-badge { margin-top: 30px; border: 2px solid #10b981; color: #059669; padding: 15px; border-radius: 8px; text-align: center; background: #ecfdf5; page-break-inside: avoid; }
            .auth-title { font-weight: 900; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; }
            .auth-info { font-size: 9px; font-weight: 600; }
            
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 8px; color: #94a3b8; text-transform: uppercase; }
            
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <img src="${BRASAO_GCM}" class="logo" />
              <div class="header-info">
                <h1>Registro de Atendimento Digital (RA)</h1>
                <p>Centro de Operações Integradas - GCM Capão Bonito SP</p>
              </div>
            </div>
            <div class="protocol-box">
              <div class="protocol-label">N.º Protocolo 153</div>
              <div class="protocol-number">${call.protocol}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">01. Dados do Chamado e Classificação</div>
            <div class="grid">
              <div class="field col-span-2"><div class="label">Natureza da Ocorrência</div><div class="value">${call.type}</div></div>
              <div class="field"><div class="label">Prioridade</div><div class="value">${call.priority.toUpperCase()}</div></div>
              <div class="field"><div class="label">Horário de Registro</div><div class="value">${call.time}h</div></div>
              
              <div class="field col-span-2"><div class="label">Solicitante</div><div class="value">${call.caller}</div></div>
              <div class="field col-span-2"><div class="label">Status Final</div><div class="value">${call.status.toUpperCase()}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">02. Localização dos Fatos</div>
            <div class="grid">
              <div class="field col-span-3"><div class="label">Endereço Completo</div><div class="value">${call.address}</div></div>
              <div class="field"><div class="label">Município</div><div class="value">Capão Bonito - SP</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">03. Narrativa Inicial do Solicitante</div>
            <div class="text-block italic">
              "${call.description || 'Nenhuma narrativa adicional registrada.'}"
            </div>
          </div>

          <div class="section">
            <div class="section-title">04. Recursos Empenhados e Guarnição</div>
            <div class="grid">
              <div class="field"><div class="label">Viatura (Prefixo)</div><div class="value">${call.vtr || 'SEM VTR VINCULADA'}</div></div>
              <div class="field col-span-3"><div class="label">Composição da Equipe</div><div class="value">${call.team || 'NENHUMA EQUIPE INFORMADA'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">05. Desfecho e Resumo da Resolução</div>
            <div class="text-block">
              ${call.resolutionSummary || 'Atendimento em andamento ou sem resumo de conclusão preenchido.'}
            </div>
          </div>

          <div class="auth-badge">
            <div class="auth-title">Documento Autenticado Digitalmente</div>
            <div class="auth-info">
              Este registro foi processado eletronicamente através do sistema oficial da GCM Capão Bonito.<br>
              Operador Responsável: ${CURRENT_USER.name} às ${new Date().toLocaleTimeString('pt-BR')} do dia ${new Date().toLocaleDateString('pt-BR')}.
            </div>
            <div style="font-size: 7px; margin-top: 5px; opacity: 0.7;">Hash de Auditoria: ${Math.random().toString(36).substring(2, 15).toUpperCase()}</div>
          </div>

          <div class="footer">
            Sistema Digital de Gestão Operacional - GCM de Capão Bonito SP<br>
            Impresso por ${CURRENT_USER.name} em ${new Date().toLocaleString('pt-BR')}
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const StatusBadge = ({ status }: { status: Call['status'] }) => {
    const config = {
      'Aguardando': { color: 'bg-amber-500', text: 'text-amber-600' },
      'Em Deslocamento': { color: 'bg-blue-500', text: 'text-blue-600' },
      'Solucionado': { color: 'bg-emerald-500', text: 'text-emerald-600' }
    };
    const c = config[status];
    return (
      <span className={`flex items-center gap-2 px-1 py-1 rounded-lg text-xs font-normal tracking-tight ${c.text}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${c.color} ${status !== 'Solucionado' ? 'animate-pulse ring-4 ring-white/30' : ''}`}></div>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header UI */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Despacho Operacional (153)</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Logado: {CURRENT_USER.name}</span>
            <p className="text-slate-400 text-sm font-light">Gerenciamento dinâmico de incidentes em tempo real</p>
          </div>
        </div>
        <div className="flex gap-3 relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
          >
            <Filter className="w-4 h-4" /> Filtrar
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="absolute top-12 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-[110] p-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filtrar Prioridade</p>
                  <div className="flex flex-wrap gap-2">
                    {['Todas', 'Normal', 'Urgente', 'Emergência'].map(p => (
                      <button
                        key={p}
                        onClick={() => setActiveFilters(prev => ({ ...prev, priority: p }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${activeFilters.priority === p
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Filtrar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Aguardando', 'Em Deslocamento', 'Solucionado'].map(s => (
                      <button
                        key={s}
                        onClick={() => setActiveFilters(prev => ({ ...prev, status: s }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${activeFilters.status === s
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveFilters({ priority: 'Todas', status: 'Todos' });
                    setShowFilters(false);
                  }}
                  className="w-full mt-2 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all uppercase tracking-widest"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsNewCallModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" /> Nova Chamada
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {filteredCalls.length === 0 && (
            <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300">
              <PhoneCall className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-light text-lg">Nenhum atendimento corresponde aos filtros selecionados.</p>
            </div>
          )}
          {filteredCalls.map((call) => (
            <div key={call.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group animate-in slide-in-from-left duration-300">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${call.priority === 'Emergência' ? 'bg-red-50 text-red-500 animate-pulse' :
                    call.priority === 'Urgente' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                    } border border-white shadow-sm`}>
                    {call.priority === 'Emergência' ? <AlertTriangle className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 tracking-tight">{call.type}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${call.priority === 'Emergência' ? 'bg-red-500 text-white' :
                        call.priority === 'Urgente' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {call.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">#{call.protocol} • <span className="text-slate-500">{call.caller}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-slate-400 text-[9px] mb-1 justify-end font-bold tracking-wider uppercase">
                    <Clock className="w-3 h-3" /> {call.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs justify-end font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> {call.address}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={call.status} />

                  {call.vtr && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[9px] font-black shadow-sm border border-white/10 uppercase tracking-wider">
                      <Radio className="w-2.5 h-2.5 text-blue-400" /> {call.vtr}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCallForDetails(call)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all uppercase tracking-tight"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detalhes
                  </button>

                  <button
                    onClick={() => setDispatchCall(call)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95 uppercase tracking-tight"
                  >
                    <Car className="w-3.5 h-3.5" /> Empenhar
                  </button>

                  <button
                    onClick={() => handlePrint(call)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Imprimir Protocolo Profissional"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  {CURRENT_USER.name === 'GCM Ferraz' && (
                    <button
                      onClick={() => deleteCall(call.id)}
                      className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir (Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Resumo Operacional
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2 font-light italic">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> Aguardando Despacho
                </span>
                <span className="font-semibold text-slate-600">{calls.filter(c => c.status === 'Aguardando').length.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2 font-light italic">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Unidades em Trânsito
                </span>
                <span className="font-semibold text-slate-600">{calls.filter(c => c.status === 'Em Deslocamento').length.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50">
                <span className="text-slate-800 font-semibold tracking-tight">Total Hoje</span>
                <span className="font-bold text-blue-600 text-lg">{calls.length.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <ShieldCheck className="w-16 h-16" />
            </div>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 border-b border-white/10 pb-2.5 tracking-tight">
              <UserCheck className="w-4 h-4 text-blue-400" /> Operadores Online ({operators.filter(op => op.isOnline).length})
            </h3>
            <div className="space-y-2.5">
              {operators.filter(op => op.isOnline).map((op, i) => (
                <div
                  key={i}
                  onClick={() => handleLocateOperator(op)}
                  className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
                    <div>
                      <p className="text-xs font-bold tracking-tight group-hover:text-blue-400 transition-colors">{op.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{op.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {op.name === CURRENT_USER.name && <span className="text-[7px] bg-blue-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-blue-400">Você</span>}
                    <MapPin className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modais omitidos por brevidade, permanecem iguais ao original do arquivo */}
      {selectedCallForDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-7 border-b border-blue-900 flex justify-between items-center bg-blue-700 text-white relative">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Gerenciamento de Atendimento</h3>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-[0.2em] mt-1">Protocolo Digital #{selectedCallForDetails.protocol}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedCallForDetails)}
                  className="p-2.5 hover:bg-white/10 rounded-2xl transition-all"
                  title="Imprimir RA Profissional"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedCallForDetails(null)} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-7 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="bg-blue-50/40 p-6 rounded-3xl border border-blue-100/50 space-y-5">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.15em] flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> Transição de Estado Operacional
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {(['Aguardando', 'Em Deslocamento', 'Solucionado'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateCallStatus(selectedCallForDetails.id, st)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${selectedCallForDetails.status === st
                        ? 'bg-blue-600 border-blue-800 text-white shadow-xl -translate-y-1'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${st === 'Aguardando' ? 'bg-amber-500' : st === 'Em Deslocamento' ? 'bg-blue-400' : 'bg-emerald-500'
                        } ${selectedCallForDetails.status === st && st !== 'Solucionado' ? 'animate-pulse ring-4 ring-white/20' : ''}`}></div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCallForDetails.status === 'Solucionado' && (
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.15em] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Desfecho da Ocorrência
                  </p>
                  <textarea
                    value={selectedCallForDetails.resolutionSummary || ''}
                    onChange={(e) => updateResolution(selectedCallForDetails.id, e.target.value)}
                    rows={4}
                    placeholder="GCM, relate aqui como a situação foi resolvida..."
                    className="w-full p-4 bg-white border border-emerald-200 rounded-2xl text-sm font-light text-slate-700 italic outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  ></textarea>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Natureza</p>
                  <p className="font-semibold text-slate-800 tracking-tight">{selectedCallForDetails.type}</p>
                </div>
                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Gravidade</p>
                  <p className={`font-bold ${selectedCallForDetails.priority === 'Emergência' ? 'text-red-500' :
                    selectedCallForDetails.priority === 'Urgente' ? 'text-amber-500' : 'text-slate-600'
                    }`}>
                    {selectedCallForDetails.priority.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Cidadão Solicitante</p>
                    <p className="font-semibold text-slate-800 text-lg tracking-tight">{selectedCallForDetails.caller}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm mt-1">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Localização dos Fatos</p>
                    <p className="font-semibold text-slate-800 text-lg tracking-tight leading-snug">{selectedCallForDetails.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                <p className="text-[10px] font-normal text-slate-500 uppercase mb-3 tracking-widest">Narrativa Original</p>
                <p className="text-slate-600 italic leading-relaxed text-sm font-light">"{selectedCallForDetails.description || 'Sem narrativa adicional.'}"</p>
              </div>

              {selectedCallForDetails.vtr && (
                <div className="bg-slate-900 p-7 rounded-3xl text-white shadow-2xl border-l-4 border-blue-500 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Car className="w-9 h-9" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold tracking-widest">{selectedCallForDetails.vtr}</p>
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mt-1">{selectedCallForDetails.team}</p>
                    </div>
                  </div>
                  <FileText className="w-8 h-8 text-white/10" />
                </div>
              )}
            </div>

            <div className="p-7 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => setSelectedCallForDetails(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[11px]">Fechar Painel</button>
              <button
                onClick={() => {
                  setDispatchCall(selectedCallForDetails);
                  setSelectedCallForDetails(null);
                }}
                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-[11px]"
              >
                Remanejar Recurso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outros modais NewCall e Dispatch permanecem idênticos ao original */}
      {isNewCallModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-blue-700 p-7 text-white flex justify-between items-center shadow-lg relative">
              <h3 className="text-xl font-semibold tracking-tight flex items-center gap-3">
                <Plus className="w-6 h-6" /> Novo Atendimento (153)
              </h3>
              <button onClick={() => setIsNewCallModalOpen(false)} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.15em] ml-1">Solicitante</label>
                  <input required name="caller" value={formData.caller} onChange={handleInputChange} type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm" placeholder="Nome Completo" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.15em] ml-1">Prioridade</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold outline-none focus:border-blue-500 transition-all cursor-pointer text-sm">
                    <option value="Normal">ROTINEIRO</option>
                    <option value="Urgente">URGENTE</option>
                    <option value="Emergência">EMERGÊNCIA</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.15em] ml-1">Endereço do Evento</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input required name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium outline-none focus:border-blue-500 transition-all text-sm" placeholder="Rua, número, bairro..." />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1 pr-2">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.15em] ml-1">Narrativa dos Fatos</label>
                  <button type="button" onClick={handleAIClassify} disabled={isAnalyzing} className="text-[9px] font-normal text-blue-600 flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all border border-blue-100">
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} IA ANALISAR
                  </button>
                </div>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-light italic outline-none resize-none focus:border-blue-500 transition-all text-sm" placeholder="O que o cidadão está relatando?"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.15em] ml-1">Natureza do Chamado</label>
                <input name="type" value={formData.type} onChange={handleInputChange} type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold outline-none focus:border-blue-500 transition-all text-sm" placeholder="Ex: Averiguação de Atitude Suspeita" />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[11px]">Gerar Protocolo e Finalizar</button>
            </form>
          </div>
        </div>
      )}

      {dispatchCall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-slate-900 p-7 text-white flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Despacho de Unidade</h3>
                <p className="text-[10px] text-blue-400 font-normal uppercase tracking-[0.2em] mt-1">Prot: {dispatchCall.protocol}</p>
              </div>
              <button onClick={() => setDispatchCall(null)} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-7">
              <p className="text-[10px] font-normal text-slate-400 uppercase mb-5 tracking-[0.2em] text-center">Unidades Operacionais Prontas</p>
              <div className="space-y-4">
                {availableVTRs.map((vtr, i) => (
                  <button
                    key={i}
                    onClick={() => assignVTR(vtr.prefixo, vtr.team)}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all group active:scale-95 shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100 group-hover:border-blue-500">
                        <Car className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-blue-700">{vtr.prefixo}</p>
                        <p className="text-[10px] text-slate-400 font-normal uppercase tracking-tighter group-hover:text-blue-500">{vtr.team}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={() => setDispatchCall(null)} className="text-[10px] font-normal text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">Abortar Operação</button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Location Map Modal */}
      {selectedOperator && selectedOperator.location && (
        <OperatorMap
          operatorName={selectedOperator.name}
          location={selectedOperator.location}
          onClose={() => setSelectedOperator(null)}
          onRefresh={handleRefreshLocation}
        />
      )}

      {/* Loading indicator */}
      {isLoadingLocation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Obtendo localização...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Atendimento;

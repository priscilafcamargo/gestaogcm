
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  PhoneIncoming,
  FileText,
  Car,
  Users,
  Clock,
  Flame,
  BarChart3,
  ClipboardCheck,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  User,
  CalendarDays,
  CalendarRange,
  Shield,
  SearchCheck,
  Camera,
  Upload,
  Radio,
  Palmtree,
  ChevronDown,
  UserCheck,
  Lock,
  Fingerprint,
  LogIn,
  ShieldAlert,
  MessageCircleQuestion,
  AlertTriangle,
  UserCog,
  Package,
  Boxes,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldEllipsis,
  Save,
  Scale
} from 'lucide-react';
import { Module, RelatorioRonda, Funcionario, DailySchedule, Audiencia } from './types';
import { authService, funcionariosService, relatoriosService, escalasService } from './services/supabaseService';
import { BRASAO_GCM } from './config/constants';
import Dashboard from './views/Dashboard';
import Atendimento from './views/Atendimento';
import Boletim from './views/Boletim';
import ControleVTR from './views/ControleVTR';
import Funcionarios from './views/Funcionarios';
import BancoHoras from './views/BancoHoras';
import GestaoJornada from './views/GestaoJornada';
import EscalaTrabalho from './views/EscalaTrabalho';
import BrigadaIncendio from './views/BrigadaIncendio';
import Estatisticas from './views/Estatisticas';
import Relatorios from './views/Relatorios';
import OperacaoVeicular from './views/OperacaoVeicular';
import ControleFerias from './views/ControleFerias';
import Abordados from './views/Abordados';
import GestaoUsuarios from './views/GestaoUsuarios';
import Estoque from './views/Estoque';
import Audiencias from './views/Audiencias';
import { supabase } from './lib/supabase';

type AuthStep = 'login' | 'forgot' | 'first_access' | 'waiting' | 'reset' | 'success';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [keepConnected, setKeepConnected] = useState(true);

  // Estados para Recuperação de Senha e Primeiro Acesso
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [firstAccessEmail, setFirstAccessEmail] = useState('');
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Base de dados de usuários (agora carregado do Supabase)
  const [staff, setStaff] = useState<Funcionario[]>([]);

  const [loggedInUser, setLoggedInUser] = useState<{ name: string, role: string, foto: string | null, matricula: string | null }>({
    name: "Aguardando...",
    role: "OPERADOR",
    foto: null,
    matricula: null
  });

  const currentUserRegistration = useMemo(() => {
    return staff.find(u => u.matricula === loggedInUser.matricula);
  }, [staff, loggedInUser.matricula]);

  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [systemLogo, setSystemLogo] = useState<string | null>(null);

  // Estado compartilhado de Escalas
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Recursos Humanos': true,
    'Operacional': true,
    'Gestão': true
  });

  const [relatorios, setRelatorios] = useState<RelatorioRonda[]>([]);

  const [audiencias, setAudiencias] = useState<Audiencia[]>([]);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load data from Supabase
  const loadDataFromDatabase = async () => {
    try {
      // Load funcionarios
      const { data: funcionariosData } = await funcionariosService.getAll();
      if (funcionariosData) {
        setStaff(funcionariosData);
      }

      // Load relatorios
      const { data: relatoriosData } = await relatoriosService.getAll();
      if (relatoriosData) {
        setRelatorios(relatoriosData);
      }

      // Load escalas
      const { data: escalasData } = await escalasService.getAll();
      if (escalasData) {
        setSchedules(escalasData);
      }
    } catch (error) {
      console.error('Error loading data from database:', error);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    loadDataFromDatabase();

    // Listener for Auth State Changes (Password Recovery)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthStep('reset');
      } else if (event === 'SIGNED_IN' && session) {
        // Optional: auto-login if session persists, but we might want to force manual login for security or just load user
        // For now, let's keep manual login to fetch 'funcionario' details properly via handleLogin logic
        // or we could implement a session check here.
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Efeito para redirecionar após sucesso na redefinição
  useEffect(() => {
    if (authStep === 'success') {
      const timer = setTimeout(() => {
        setAuthStep('login');
        setNewPassword({ password: '', confirm: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authStep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const { data, error } = await authService.signIn(loginForm.email, loginForm.senha);

      if (error || !data) {
        const errorMessage = error?.message || 'Email ou Senha incorreta';
        console.error('Login failed:', error);

        alert(
          `ERRO DE AUTENTICAÇÃO\n\n${errorMessage}\n\n` +
          `Se o problema persistir, verifique:\n` +
          `• Se você tem cadastro ativo\n` +
          `• A ortografia do email\n` +
          `• Sua conexão com a internet`
        );
        setIsLoginLoading(false);
        return;
      }

      const userFound = data.user;
      setLoggedInUser({
        name: userFound.nome_guerra ? `GCM ${userFound.nome_guerra}` : userFound.nome,
        role: userFound.nivel_acesso?.toUpperCase() || 'OPERADOR',
        foto: userFound.foto || null,
        matricula: userFound.matricula
      });

      // Load all data from database
      await loadDataFromDatabase();

      setIsAuthenticated(true);
      setIsLoginLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      alert(
        "ERRO DE AUTENTICAÇÃO\n\n" +
        "Não foi possível conectar ao servidor.\n\n" +
        "Verifique sua conexão com a internet."
      );
      setIsLoginLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    const { error } = await authService.resetPassword(recoveryEmail);

    if (error) {
      alert(`Erro ao enviar email: ${error.message}`);
      setIsLoginLoading(false);
      return;
    }

    setAuthStep('waiting');
    setIsLoginLoading(false);
  };

  const handleFirstAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    // Logic for first access: check if user exists in db, then trigger password reset mail
    const { error } = await authService.initiateFirstAccess(firstAccessEmail);

    if (error) {
      alert(`Erro no Primeiro Acesso: ${error.message}`);
      setIsLoginLoading(false);
      return;
    }

    setAuthStep('waiting');
    setIsLoginLoading(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    const { error } = await authService.updatePassword(newPassword.password);

    if (error) {
      alert(`Erro ao redefinir senha: ${error.message}`);
      setIsLoginLoading(false);
      return;
    }

    setAuthStep('success');
    setIsLoginLoading(false);
  };

  const isResetValid = newPassword.password.length >= 8 && newPassword.password === newPassword.confirm;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSystemLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    const isSupervisorOrAdmin = loggedInUser.role === 'ADMINISTRADOR' || loggedInUser.role === 'SUPERVISOR';
    const isAdmin = loggedInUser.role === 'ADMINISTRADOR';

    switch (activeModule) {
      case 'dashboard': return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
      case 'atendimento': return <Atendimento />;
      case 'operacao_veicular': return <OperacaoVeicular systemLogo={systemLogo} />;
      case 'boletim': return <Boletim systemLogo={systemLogo} />;
      case 'vtr': return <ControleVTR />;
      case 'funcionario':
        if (!isSupervisorOrAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <Funcionarios staff={staff} setStaff={setStaff} systemLogo={systemLogo} />;
      case 'banco_horas': return <BancoHoras systemLogo={systemLogo} />;
      case 'jornada':
        if (!isSupervisorOrAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <GestaoJornada />;
      case 'escala':
        if (!isSupervisorOrAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <EscalaTrabalho schedules={schedules} setSchedules={setSchedules} />;
      case 'ferias':
        if (!isSupervisorOrAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <ControleFerias systemLogo={systemLogo} />;
      case 'brigada': return <BrigadaIncendio systemLogo={systemLogo} />;
      case 'estatistica': return <Estatisticas systemLogo={systemLogo} />;
      case 'relatorio': return <Relatorios relatorios={relatorios} setRelatorios={setRelatorios} systemLogo={systemLogo} />;
      case 'abordados': return <Abordados relatorios={relatorios} />;
      case 'gestao_usuarios':
        if (!isAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <GestaoUsuarios staff={staff} setStaff={setStaff} />;
      case 'estoque':
        if (!isSupervisorOrAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <Estoque />;
      case 'audiencias':
        if (!isSupervisorOrAdmin) return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
        return <Audiencias audiencias={audiencias} setAudiencias={setAudiencias} staff={staff} relatorios={relatorios} onNavigate={setActiveModule} />;
      default: return <Dashboard onNavigate={setActiveModule} schedules={schedules} staff={staff} audiencias={audiencias} />;
    }
  };

  const getActiveLabel = () => {
    const menuGroups = [
      { items: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'atendimento', label: 'Atendimento (153)' }, { id: 'estatistica', label: 'Estatísticas' }] },
      { items: [{ id: 'funcionario', label: 'Efetivo' }, { id: 'audiencias', label: 'Audiências' }, { id: 'ferias', label: 'Controle de Férias' }, { id: 'banco_horas', label: 'Banco de Horas' }, { id: 'brigada', label: 'Brigada de Incêndio' }] },
      { items: [{ id: 'vtr', label: 'Controle de VTR' }, { id: 'operacao_veicular', label: 'Operação Veicular' }, { id: 'boletim', label: 'Boletim de Ocorrência' }, { id: 'relatorio', label: 'Relatório Operacional' }, { id: 'abordados', label: 'Pessoas Abordadas' }] },
      { items: [{ id: 'escala', label: 'Escala de Trabalho' }, { id: 'jornada', label: 'Gestão de Jornada' }, { id: 'gestao_usuarios', label: 'Gestão de Usuários' }, { id: 'estoque', label: 'Controle de Estoque' }] }
    ];
    for (const group of menuGroups) {
      const item = group.items.find(i => i.id === activeModule);
      if (item) return item.label;
    }
    return 'Dashboard';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 motion-safe:animate-[pulse_20s_infinite]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1920&q=80')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-blue-900/60 backdrop-brightness-[0.3]"></div>

        <div className="w-full max-w-[450px] px-6 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
          <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"></div>

            <div className="pt-12 pb-8 px-10 text-center relative overflow-hidden">
              <div className="w-24 h-24 bg-slate-950/40 rounded-[2rem] border border-white/10 mx-auto mb-6 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                <img
                  src={systemLogo || BRASAO_GCM}
                  className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-700"
                  alt="Logotipo Sistema"
                />
              </div>
              <div className="space-y-1">
                <h1 className="interactive-title text-3xl font-black tracking-tighter italic uppercase leading-none drop-shadow-2xl">
                  GESTÃO OPERACIONAL
                </h1>
                <p className="text-lg font-bold text-blue-100/80 uppercase tracking-widest italic drop-shadow-md">
                  Guarda Civil Municipal
                </p>
              </div>
            </div>

            {/* FLUXO: LOGIN */}
            {authStep === 'login' && (
              <form onSubmit={handleLogin} className="px-10 pb-14 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">E-mail Institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 group-focus-within:scale-110 transition-all" />
                      <input required type="email" placeholder="usuario@gcm.sp.gov.br" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value.toLowerCase() })} className="w-full pl-12 pr-4 py-4.5 bg-black/40 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">Senha de Acesso</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 group-focus-within:scale-110 transition-all" />
                      <input required type="password" placeholder="••••••••" value={loginForm.senha} onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })} className="w-full pl-12 pr-4 py-4.5 bg-black/40 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setKeepConnected(!keepConnected)}>
                    <div className={`w-4 h-4 rounded border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-blue-500 transition-all ${keepConnected ? 'border-blue-500' : ''}`}>
                      <div className={`w-2 h-2 rounded-sm bg-blue-500 transition-transform ${keepConnected ? 'scale-100' : 'scale-0'}`}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manter conectado</span>
                  </label>
                  <button type="button" onClick={() => setAuthStep('forgot')} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">Esqueci Senha</button>
                </div>

                <div className="space-y-3">
                  <button disabled={isLoginLoading} type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 relative overflow-hidden group border-b-4 border-blue-800">
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><LogIn className="w-5 h-5" /> Autenticar Oficial</>}
                  </button>
                  <button disabled={isLoginLoading} type="button" onClick={() => setAuthStep('first_access')} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]">
                    Primeiro Acesso / Cadastrar Senha
                  </button>
                </div>
              </form>
            )}

            {/* FLUXO: PRIMEIRO ACESSO */}
            {authStep === 'first_access' && (
              <div className="px-10 pb-14 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Primeiro Acesso</h3>
                  <p className="text-xs text-slate-400 font-medium">Cadastre sua senha para acessar o sistema.</p>
                </div>
                <form onSubmit={handleFirstAccessSubmit} className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-all" />
                      <input required type="email" placeholder="seu.email@gcm.sp.gov.br" value={firstAccessEmail} onChange={(e) => setFirstAccessEmail(e.target.value)} className="w-full pl-12 pr-4 py-4.5 bg-black/40 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" />
                    </div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="text-[10px] text-blue-200 leading-relaxed text-center">
                      Você receberá um link no email acima para definir sua senha de acesso pessoal.
                    </p>
                  </div>
                  <button disabled={isLoginLoading} type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-lg transition-all active:scale-[0.95] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 border-b-4 border-blue-800">
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Mail className="w-5 h-5" /> Gerar Senha de Acesso</>}
                  </button>
                  <button type="button" onClick={() => setAuthStep('login')} className="w-full text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:text-slate-300 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Voltar ao Login
                  </button>
                </form>
              </div>
            )}

            {/* FLUXO: ESQUECI A SENHA (SOLICITAÇÃO) */}
            {authStep === 'forgot' && (
              <div className="px-10 pb-14 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Recuperar Acesso</h3>
                  <p className="text-xs text-slate-400 font-medium">Insira seu e-mail institucional para receber as instruções.</p>
                </div>
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-all" />
                      <input required type="email" placeholder="usuario@gcm.sp.gov.br" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="w-full pl-12 pr-4 py-4.5 bg-black/40 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner" />
                    </div>
                  </div>
                  <button disabled={isLoginLoading} type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl shadow-lg transition-all active:scale-[0.95] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 border-b-4 border-blue-800">
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Mail className="w-5 h-5" /> Enviar Link de Recuperação</>}
                  </button>
                  <button type="button" onClick={() => setAuthStep('login')} className="w-full text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:text-slate-300 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Voltar ao Login
                  </button>
                </form>
              </div>
            )}

            {/* FLUXO: AGUARDANDO LINK */}
            {authStep === 'waiting' && (
              <div className="px-10 pb-14 text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-blue-500/20 shadow-inner">
                  <Mail className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">E-mail Enviado!</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Aguarde o link para nova senha em seu e-mail institucional.</p>
                  <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/10">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">Não recebeu? Verifique a caixa de spam ou solicite novo envio em 2 minutos.</p>
                  </div>
                </div>
                {/* Botão de simulador para teste do desenvolvedor */}
                <button onClick={() => setAuthStep('reset')} className="w-full py-4 bg-white/5 border border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                  Simular Acesso via Link
                </button>
              </div>
            )}

            {/* FLUXO: REDEFINIÇÃO DE SENHA */}
            {authStep === 'reset' && (
              <div className="px-10 pb-14 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Nova Credencial</h3>
                  <p className="text-xs text-slate-400 font-medium italic">Sua senha deve ser forte e confidencial.</p>
                </div>
                <form onSubmit={handleResetSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input required type={showPassword ? "text" : "password"} value={newPassword.password} onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })} className="w-full pl-12 pr-12 py-4.5 bg-black/40 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" placeholder="Mínimo 8 caracteres" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                      <div className="relative">
                        <ShieldEllipsis className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input required type={showPassword ? "text" : "password"} value={newPassword.confirm} onChange={(e) => setNewPassword({ ...newPassword, confirm: e.target.value })} className="w-full pl-12 pr-12 py-4.5 bg-black/40 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" placeholder="Repita a senha" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border ${newPassword.password.length >= 8 ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-800 border-slate-700'}`}></div>
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Mínimo de 8 caracteres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border ${newPassword.password !== '' && newPassword.password === newPassword.confirm ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-800 border-slate-700'}`}></div>
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">As senhas coincidem</span>
                    </div>
                  </div>

                  <button disabled={!isResetValid || isLoginLoading} type="submit" className={`w-full py-5 font-black rounded-3xl shadow-lg transition-all active:scale-[0.95] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 border-b-4 border-blue-800 ${isResetValid ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800' : 'bg-slate-800 text-slate-600 border-slate-950 cursor-not-allowed'}`}>
                    {isLoginLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save className="w-5 h-5" /> Confirmar Nova Senha</>}
                  </button>
                </form>
              </div>
            )}

            {/* FLUXO: SUCESSO */}
            {authStep === 'success' && (
              <div className="px-10 pb-14 text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Senha Alterada!</h3>
                  <p className="text-sm text-slate-400 font-medium">Sua nova credencial operacional foi validada com sucesso.</p>
                  <div className="flex items-center justify-center gap-3 pt-6">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Redirecionando para login...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-black/50 py-6 px-10 border-t border-white/5 flex items-center justify-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Rede Operacional Criptografada</span>
            </div>
          </div>
          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] drop-shadow-md">GCM Capão Bonito SP • {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isSidebarOpen ? 'lg:w-72' : 'lg:w-24'
          } fixed lg:relative sidebar-gradient text-white flex flex-col transition-all duration-300 ease-in-out z-60 shadow-xl h-full w-72`}
      >
        <div className="p-6 lg:p-8 flex items-center gap-4 border-b border-white/10 relative overflow-hidden group shrink-0">
          <div
            className={`w-12 h-12 flex items-center justify-center relative ${loggedInUser.role === 'ADMINISTRADOR' ? 'cursor-pointer group' : ''}`}
            onClick={() => loggedInUser.role === 'ADMINISTRADOR' && logoInputRef.current?.click()}
          >
            <img
              src={systemLogo || BRASAO_GCM}
              className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
              alt="Logo"
            />
            {loggedInUser.role === 'ADMINISTRADOR' && (
              <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
            )}
          </div>
          <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          <div className={`${!isSidebarOpen && 'lg:hidden'} animate-in fade-in slide-in-from-left duration-700`}>
            <h1 className="interactive-title text-[13px] font-black tracking-tighter italic leading-none uppercase">GESTÃO OPERACIONAL</h1>
            <p className="text-[8px] text-blue-200/80 font-bold uppercase tracking-widest whitespace-nowrap mt-0.5">Guarda Civil Municipal</p>
          </div>
          <button className="lg:hidden ml-auto p-2" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-6 overflow-y-auto custom-scrollbar pb-8">
          {[
            {
              title: null,
              items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'atendimento', label: 'Atendimento (153)', icon: PhoneIncoming },
                { id: 'estatistica', label: 'Estatísticas', icon: BarChart3 },
              ]
            },
            {
              title: 'Recursos Humanos',
              items: [
                { id: 'funcionario', label: 'Efetivo', icon: Users },
                { id: 'audiencias', label: 'Audiências', icon: Scale },
                { id: 'ferias', label: 'Controle de Férias', icon: Palmtree },
                { id: 'banco_horas', label: 'Banco de Horas', icon: Clock },
                { id: 'brigada', label: 'Brigada de Incêndio', icon: Flame },
              ]
            },
            {
              title: 'Operacional',
              items: [
                { id: 'vtr', label: 'Controle de VTR', icon: Car },
                { id: 'operacao_veicular', label: 'Operação Veicular', icon: SearchCheck },
                { id: 'boletim', label: 'Boletim de Ocorrência', icon: FileText },
                { id: 'relatorio', label: 'Relatório Operacional', icon: ClipboardCheck },
                { id: 'abordados', label: 'Pessoas Abordadas', icon: UserCheck },
              ]
            },
            {
              title: 'Gestão',
              items: [
                { id: 'escala', label: 'Escala de Trabalho', icon: CalendarRange },
                { id: 'jornada', label: 'Gestão de Jornada', icon: CalendarDays },
                { id: 'gestao_usuarios', label: 'Gestão de Usuários', icon: UserCog },
                { id: 'estoque', label: 'Controle de Estoque', icon: Package },
              ]
            }
          ].map((group, groupIdx) => {
            const isGroupOpen = group.title ? openGroups[group.title] : true;
            const isSupervisorOrAdmin = loggedInUser.role === 'ADMINISTRADOR' || loggedInUser.role === 'SUPERVISOR';
            const isAdmin = loggedInUser.role === 'ADMINISTRADOR';

            return (
              <div key={groupIdx} className="space-y-1">
                {group.title && isSidebarOpen && (
                  <button
                    onClick={() => setOpenGroups(prev => ({ ...prev, [group.title!]: !prev[group.title!] }))}
                    className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60 mb-1 hover:text-blue-300 transition-colors"
                  >
                    <span>{group.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isGroupOpen ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                )}
                {(isGroupOpen || !isSidebarOpen) && group.items.filter(item => {
                  // Filtros de visibilidade baseados em role
                  if (item.id === 'gestao_usuarios') return isAdmin;
                  if (['funcionario', 'ferias', 'escala', 'jornada', 'estoque'].includes(item.id)) return isSupervisorOrAdmin;
                  return true;
                }).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id as Module)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all group ${activeModule === item.id
                      ? 'bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${activeModule === item.id ? 'text-white' : 'text-blue-400/50'}`} />
                    <span className={`${!isSidebarOpen && 'lg:hidden'} text-sm font-bold tracking-tight text-left`}>{item.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <LogIn className="w-5 h-5 shrink-0 rotate-180" />
              <span className={`${!isSidebarOpen && 'lg:hidden'} text-sm font-bold tracking-tight text-left`}>Sair do Sistema</span>
            </button>
          </div>
        </nav>
        <div className="hidden lg:block p-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-full flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white`}
          >
            {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-sm lg:text-lg font-black text-slate-800 uppercase tracking-tighter italic truncate max-w-[150px] sm:max-w-none">
              {getActiveLabel()}
            </h1>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-4 pl-3 lg:pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs lg:text-sm font-black text-slate-800 leading-none">{loggedInUser.name}</p>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">{loggedInUser.role}</p>
              </div>
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100 overflow-hidden group">
                {currentUserRegistration?.foto ? (
                  <img src={currentUserRegistration.foto} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Avatar" />
                ) : (
                  <User className="w-5 h-5 lg:w-6 lg:h-6 text-slate-500 transition-transform group-hover:scale-110" />
                )}
              </div>
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f1f5f9] custom-scrollbar">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;

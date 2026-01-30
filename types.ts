
export type Module =
  | 'dashboard'
  | 'atendimento'
  | 'boletim'
  | 'vtr'
  | 'funcionario'
  | 'banco_horas'
  | 'jornada'
  | 'escala'
  | 'brigada'
  | 'estatistica'
  | 'relatorio'
  | 'operacao_veicular'
  | 'abordados'
  | 'gestao_usuarios'
  | 'estoque'
  | 'ferias'
  | 'audiencias';

export interface EstoqueItem {
  id: string;
  nome: string;
  categoria: 'Uniforme' | 'Equipamento' | 'Armamento' | 'Informática' | 'Limpeza' | 'Outros';
  quantidade: number;
  unidade: 'UN' | 'CX' | 'PT' | 'L' | 'KG';
  estoqueMinimo: number;
  ultimaMovimentacao?: string;
  observacao?: string;
  nPatrimonio?: string;
}

export interface UserIA {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Operador' | 'Supervisor';
  status: 'Ativo' | 'Inativo';
  mustChangePassword: boolean;
}

export interface RondaLinha {
  id: string;
  hora: string;
  km: string;
  local: string;
  cargoNome: string;
  visto: string;
}

export interface AtividadeDetalhada {
  id: string;
  local: string;
  talao: string;
  codigo: string;
  qtrIn: string;
  kmIn: string;
  qtrOut: string;
  kmOut: string;
  observacao?: string;
  foto?: string;
}

export interface AbordagemSimples {
  id: string;
  data: string;
  tipo: 'Vítima' | 'Suspeito' | 'Autor' | 'Envolvido' | '';
  nome: string;
  alcunha: string;
  nascimento: string;
  mae: string;
  matricula: string;
  cpf: string;
  rg: string;
  endereco: string;
  local: string;
  hora: string;
  observacao: string;
  foto?: string;
}

export interface VeiculoSimples {
  id: string;
  data: string;
  hora: string;
  placa: string;
  renavam: string;
  marcaModelo: string;
  cor: string;
  condutor: string;
  cnh: string;
  cpf: string;
  foto?: string;
  observacao: string;
}

export interface RelatorioRonda {
  id: string;
  numeroVtr: string;
  data: string;
  horario: string; // Período
  vistoData: string;
  horaInicial: string;
  horaFinal: string;
  kmInicial: number;
  kmFinal: number;
  setor: string;
  encarregado: string;
  matriculaEncarregado: string;
  motorista: string;
  matriculaMotorista: string;
  auxiliar: string;
  matriculaAuxiliar: string;

  rondas: RondaLinha[];
  atividades: AtividadeDetalhada[];
  abordagens: AbordagemSimples[];
  veiculos: VeiculoSimples[];

  abastecimento: {
    nReq: string;
    litros: string;
  };
  ocorrenciasAtendidas: string;
  proximoEncarregado: string;

  situacaoVtr: Record<string, string>;
  historico: string;
  status: 'rascunho' | 'finalizado';
  assinadoEncarregado: boolean;
  dataAssinatura?: string;
}

export interface VTRLog {
  id: string;
  data: string;
  motorista: string;
  saida: string;
  chegada: string;
  kmInicial: number;
  kmFinal: number;
  combustivel: string;
  destino: string;
}

export interface MaintenanceRecord {
  id: string;
  tipo: string;
  dataRealizada: string;
  kmRealizada: number;
  proximaRevisaoKm: number;
  proximaRevisaoData: string;
  observacoes: string;
}

export interface VTR {
  id: string;
  placa: string;
  prefixo: string;
  modelo: string;
  status: 'disponivel' | 'em_patrulha' | 'manutencao' | 'em_ocorrencia';
  equipe: string[];
  km: number;
  logs?: VTRLog[];
  lastChecklist?: {
    date: string;
    items: Record<string, boolean>;
  };
  manutencoes?: MaintenanceRecord[];
}

export interface TeamMember {
  id: string;
  nomeGuerra: string;
  cargo: string;
  status: 'disponivel' | 'em_vtr' | 'base' | 'afastado';
  foto?: string;
}

export interface Team {
  id: string;
  name: string;
  supervisor: string;
  shift: '06h - 18h' | '18h - 06h' | '24h x 72h' | 'Administrativo';
  status: 'Em Turno' | 'Folga' | 'Próximo';
  members: TeamMember[];
}

export interface DailySchedule {
  date: string;
  teams: {
    teamId: string;
    shift: string;
    members: TeamMember[];
  }[];
}

export interface VacationEntry {
  id: string;
  gcmId: string;
  nomeGuerra: string;
  dataInicio: string;
  dataFim: string;
  dataAdmissao?: string;
  diasPecunia?: number;
  status: 'Agendado' | 'Em Fruição' | 'Concluído' | 'Cancelado';
  observacoes?: string;
}

export interface AbordagemVeicular {
  id: string;
  condutor: string;
  rgCpf: string;
  cnh: string;
  placa: string;
  modelo: string;
  ano: string;
  cor: string;
  status: 'Regular' | 'Irregular' | 'Apreendido' | 'Autuado';
  observacoes?: string;
}

export interface OperacaoVeicularData {
  id: string;
  data: string;
  local: string;
  equipe: string;
  encarregado: string;
  abordagens: AbordagemVeicular[];
}

export interface Ocorrencia {
  id: string;
  protocolo: string;
  tipo: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  endereco: string;
  data: string;
  vtr_empenhada?: string;
  descricao: string;
}

export interface Funcionario {
  id: string;
  matricula: string;
  nome: string;
  nomeGuerra?: string;
  cargo: string;
  status: 'ativo' | 'inativo' | 'exonerado' | 'afastado' | 'aposentado';
  bancoHoras: number;
  dataNascimento?: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
  mae?: string;
  pai?: string;
  conjuge?: string;
  filhos?: string;
  estadoCivil?: string;
  nivelAcesso?: 'Administrador' | 'Supervisor' | 'Operador';
  foto?: string;
  // Added email and senha properties used throughout the application for auth and user management
  email?: string;
  senha?: string;
  isOnline?: boolean;
  location?: {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
  };
}

export interface HoraLog {
  id: string;
  gcmNome: string;
  tipo: 'Adicional' | 'Compensação';
  horas: number;
  data: string;
  descricao: string;
}

export interface JornadaEntry {
  id: string;
  gcmNome: string;
  tipo: 'Folga' | 'Troca de Escala' | 'Falta' | 'Atestado' | 'Afastamento';
  dataInicio: string;
  dataFim?: string;
  detalhes: string;
  local?: string;
  gcmTroca?: string;
}

export interface Audiencia {
  id: string;
  gcmId: string;
  gcmNome: string;
  dataAudiencia: string;
  tipo: 'Testemunha' | 'Condutor' | 'Vítima' | 'Autor';
  autuante: string;
  dataFato?: string;
}


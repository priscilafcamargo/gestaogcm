
import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Sparkles, Save, Trash2, Plus, X, Printer,
  UserPlus, Car, Package, MapPin, Clock, Shield, AlertTriangle,
  ChevronRight, Info, Loader2, CheckCircle2, User, PenTool,
  RotateCcw, Check, Filter, Smartphone, Map as MapIcon, HardHat,
  CloudRain, Sun, Moon, Zap, ShieldAlert, Fingerprint, ShieldCheck,
  ChevronDown, Phone, Users, Baby, FileSignature, UserCheck, Calendar,
  Grid3X3, Wand2, Briefcase, Edit2, Tag, Home
} from 'lucide-react';
import { analyzeIncident, refineReportText } from '../services/geminiService';
import { BRASAO_GCM } from '../config/constants';

const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

// Pool de Efetivo (Sincronizado com Funcionarios.tsx)
const GCM_POOL = [
  { id: '1', nomeGuerra: 'SANTOS', cargo: 'Inspetor' },
  { id: '2', nomeGuerra: 'SILVA', cargo: 'Guarda 1ª Classe' },
  { id: '3', nomeGuerra: 'MELO', cargo: 'Guarda 1ª Classe' },
  { id: '4', nomeGuerra: 'FERREIRA', cargo: 'Guarda 2ª Classe' },
  { id: '5', nomeGuerra: 'OLIVEIRA', cargo: 'Guarda Especial' },
  { id: '6', nomeGuerra: 'COSTA', cargo: 'Guarda 2ª Classe' },
  { id: '7', nomeGuerra: 'FERRAZ', cargo: 'Administrador' },
  { id: '8', nomeGuerra: 'RICARDO', cargo: 'Guarda 1ª Classe' },
  { id: '9', nomeGuerra: 'SOUZA', cargo: 'Guarda 3ª Classe' },
  { id: '10', nomeGuerra: 'PEDRO', cargo: 'Guarda 3ª Classe' },
];

// Lista sincronizada com o módulo ControleVTR
const VTR_LIST = [
  { prefixo: 'ROMU-01', modelo: 'Hilux 4x4 SW4' },
  { prefixo: 'VTR-12', modelo: 'Spin Premier' },
  { prefixo: 'MOTO-04', modelo: 'Tiger 900 Raly' },
  { prefixo: 'VTR-09', modelo: 'Duster Oroch' },
  { prefixo: 'VTR-15', modelo: 'Spin Premier' },
  { prefixo: 'ROMU-02', modelo: 'Hilux 4x4 SW4' },
];

const NATUREZAS_DATA: Record<string, string[]> = {
  "A - Pessoa E A Vida": [
    "A 01 – Homicídio", "A 02 – Suicídio", "A 04 – Aborto", "A 05 – Lesão Corporal",
    "A 06 – Infanticídio", "A 07 – Periclitação Da Vida", "A 08 – Abandono De Incapaz",
    "A 09 – Omissão De Socorro", "A 10 – Ameaça", "A 11 – Seqüestro / Carcere Privado",
    "A 12 – Violação De Domicílio", "A 13 – Maus Tratos", "A 14 – Racismo",
    "A 15- Rixa", "A 16 – Difamação", "A 17 – Injuria", "A 18 – Constrangimento Ilegal",
    "A 19 – Pedido De Socorro", "A 20 – Afogamento Em Curso", "A 21 – Tortura",
    "A 22 - Abandono Material", "A 23 – Abandono Intelectual",
    "A 24 – Entrega De Filho Menor A Pessoa Inidonea", "A 25 – Subtração De Incapaz"
  ],
  "B - Patrimônio": [
    "B 01 – Furto", "B 03 – Furto / Tentativa", "B 04 – Roubo", "B 06 – Extorsão",
    "B 07 – Posse / Invasão De Propriedade", "B 08 – Dano / Depredação",
    "B 09 – Apropriação Indébita", "B 10 – Estelionato / Fraude", "B 11 – Receptação",
    "B 12 – Latrocínio", "B 13 – Arrastão", "B 14 – Alarme Disparado", "B 15 – Saque",
    "B 16 – Auto Localizado"
  ],
  "C - Tranquilidade E Os Mortos": [
    "C 01 – Perturbação De Sossego Público", "C 02 – Conduta Incoveniente",
    "C 03 – Embriaguez", "C 04 – Desinteligência", "C 05 – Averiguação De Atitude Suspeita",
    "C 06 – Perturbação De Cerimonia Funerária", "C 07 – Violação De Sepultura",
    "C 08 – Encontro De Cadaver"
  ],
  "D - Costumes": [
    "D 01 – Estupro", "D 02 – Ato Obsceno", "D 03 – Escrito Ou Objeto Obsceno",
    "D 04 – Corrupção De Menores", "D 05 – Rapto", "D 06 – Exploração De Lenocinio",
    "D 07 – Jogo De Azar", "D 08 – Vadiagem", "D 09 – Mendicância",
    "D 10 – Servir Bebida Alcoolica A Incapaz", "D 11 – Importunação Ofensiva Ao Pudor",
    "D 14 – Desordem E Perturbação Da Tranquilidade"
  ],
  "E – Administração Publica": [
    "E 01 – Concussão", "E 02 – Corrupção", "E 03 – Danos Ao Patrimônio Público",
    "E 04 – Desobediência", "E 05 – Desacato", "E 07 - Contrabando / Descaminho",
    "E 08 – Abuso De Autoridade", "E 09 – Peculato", "E 10 – Prevaricação",
    "E 11 – Violência Arbitrária", "E 12 – Usurpação De Função Pública", "E 13 – Resistência"
  ],
  "F – Tráfico": [
    "F 01 – Tráfico De Entorpecentes", "F 02 – Tráfico De Entorpecentes/Ato Infracional",
    "F 03 – Porte De Entorpecentes"
  ],
  "G – Preso E A Administração Da Justiça": [
    "G 01 - Ocorrências Com Preso", "G 02 – Comunicação Falsa De Crime/Contravenção",
    "G 03 – Captura De Procurado"
  ],
  "H – Organização Do Trabalho": [
    "H 01 – Greve", "H 02 – Piquete", "H 03 – Tumulto", "H 04 – Passeata",
    "H 06 – Manifestação Pública", "H 07 – Trabalho Infantil / Juvenil",
    "H 08 – Exercicio Ilegal De Profissão Ou Atividade"
  ],
  "I – Meio Ambiente": [
    "I 01 – Causar Degradação Ambiental", "I 03 – Não Efetuar Reposição Florestal",
    "I 05 – Cortar Árvore Isolada", "I 06 – Cortar Árvore Seletivamente",
    "I 07 – Cortar Palmito", "I 08 – Efetuar Bosqueamento", "I 09 – Efetuar Corte Raso",
    "I 10 – Efetuar Aterro", "I 11 – Efetuar Drenagem", "I 12 – Efetuar Desvio",
    "I 13 – Efetuar Represamento", "I 14 – Causar Poluição Ambiental",
    "I 15 – Causar Mortandade Da Biota Nativa", "I 16 – Praticar Ato De Caça",
    "I 17 – Praticar Ato De Pesca", "I 18 – Irregulariedade Com Produto De Pesca",
    "I 19 – Apreensão Ou Recolhimento De Petrecho", "I 20 – Manter Espécime Em Cativeiro",
    "I 21 – Comercializar Produto Ou Subproduto De Fauna", "I 22 – Introduzir Espécime",
    "I 23 – Perseguir, Apreensão, Apanhar Espécime",
    "I 24 – Utilizar, Destruir, Transportar, Comercializar Espécime", "I 25 – Bloqueio / Barreira",
    "I 26 – Vistoria Ambiental", "I 27 – Vistoria De Pesca", "I 28 – Captura / Soltura De Animal Silvestre",
    "I 29 – Atividade De Educação Ambiental", "I 30 - Maus Tratos De Animais", "I 31 - Incêndio"
  ],
  "L – Trânsito": [
    "L 01 – Veículo", "L 02 – Sinistro De Transito", "L 03 – Diregao Perigosa De Veiculo Ou Sem Cnh",
    "L 04 - Congestionamento", "L 05 – Infração De Trânsito", "L 06 – Interdição De Via Pública",
    "L 07 – Sinistro De Trânsito Sem Vítima", "L 08 – Atropelamento",
    "L 11 – Direção De Veículo Automotor Sem Cnh", "L 12 – Veículo Abandonado",
    "L 13 – Embriaguez Ao Volante"
  ],
  "M - Lei Maria Da Penha": [
    "M 01 – Violência Doméstica", "M 02 – Violência Física", "M 03 – Violência Psicológica",
    "M 04 – Violência Sexual", "M 05 – Violência Patrimonial", "M 06 – Violência Moral"
  ],
  "O – Incolumidade, A Paz E A Fé Pública": [
    "O 03 – Falsa Identidade", "O 04 – Uso De Documento Falso", "O 05 – Falsidade Ideológica",
    "O 06 – Detenção De Suspeito", "O 07 – Subversão / Terrorismo",
    "O 08 – Crime Contra A Economia Popular", "O 09 – Envenenamento De Água Potavel",
    "O 10 – Porte Ilegal Arma Fogo Uso Permitido", "O 11 – Porte Ilegal Arma Fogo Uso Restrito",
    "O 12 – Posse Ilegal Arma Fogo", "O 13 – Porte/Posse Ilegal Munição Uso Permitido",
    "O 14 – Porte/Posse Ilegal Munição De Uso Restrito", "O 15 – Tráfico De Armas",
    "O 16 – Falsificação", "O 17 – Formação De Quadrilha/Bando", "O 18 – Ocorrências Com Explosivos",
    "O 19 – Perigo De Desabamento", "O 21 – Soltura De Balões / Fogos"
  ],
  "R – Auxilio Ao Público": [
    "R 01 – Acidente Pessoal", "R 02 – Auxilio A Gestante", "R 03 – Auxílio Ao Deficiente Mental",
    "R 04 – Morte Natural", "R 05 – Mal Súbito", "R 06 – Indigente", "R 07 – Tradicional Pessoas",
    "R 08 – Ameaça De Salto De Edificação", "R 10 – Pessoa Desaparecida", "R 11 – Pessoa Localizada",
    "R 13 – Objeto Abandonado", "R 14 – Objeto Localizado", "R 22 – Choque Elétrico", "R 61 – Overdose",
    "R 63 – Ingestão / Injeção De Substancia", "R 71 – Queimadura", "R 83 – Parada Cárdio Respiratória",
    "R 84 – Crise Convulsiva", "R 85 – Emergência Clinica", "R 86 - Assistência/Ocorrência Com Animal",
    "R 87 - Ocorrência Com Indivíduo Alcoolizado", "R 88 - Pessoa em Surto"
  ],
  "S – Bombeiro": [
    "S 01 – Incêndio", "S 02 – Explosão", "S 10 – Vazamento", "S 16 – Ocorrencia Com Árvore",
    "S 26 – Desmoronamento", "S 28 – Desabamento", "S 36 – Ocorrência Com Animal",
    "S 44 – Ocorrencia Com Objeto", "S 46 – Enchente", "S 54 – Queda"
  ],
  "Não Cadastrada": ["Z99 – Ocorrências Não Cadastradas"]
};

const formatCPF = (value: string) => {
  const raw = value.replace(/\D/g, '');
  return raw
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

const formatRG = (value: string) => {
  const raw = value.replace(/\D/g, '');
  return raw
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 12);
};

const formatPlaca = (value: string) => {
  const raw = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (raw.length > 3) {
    return `${raw.substring(0, 3)}-${raw.substring(3, 7)}`;
  }
  return raw;
};

const calculateAge = (birthDate: string) => {
  if (!birthDate) return { age: 0, category: 'Adulto' };
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  let category = 'Adulto';
  if (age < 12) category = 'Criança';
  else if (age < 18) category = 'Adolescente';

  return { age, category };
};

interface Apreensao {
  id: string;
  objeto: string;
  quantidade: string;
  marca: string;
  modelo: string;
  nFabricacao: string;
  destino: string;
  recebedor: string;
}

interface EnvolvidoFull {
  id: string;
  condicao: string;
  nome: string;
  cpf: string;
  rg: string;
  nascimento: string;
  sexo: 'Masculino' | 'Feminino' | 'Não Identificado' | '';
  estadoCivil: string;
  profissao: string;
  mae: string;
  pai: string;
  endereco: string;
  bairro: string;
  cidade: string;
  telefone: string;
  versao: string;
  assinado: boolean;
  dataAssignatura?: string;
  nomeResponsavel?: string;
  documentoResponsavel?: string;
  vinculoResponsavel?: string;
}

interface VeiculoFull {
  id: string;
  placa: string;
  renavam: string;
  chassi: string;
  ano: string;
  marcaModelo: string;
  cor: string;
  nCNH: string;
  catCNH: string;
  validadeCNH: string;
  danos: 'Pequena' | 'Média' | 'Grande' | 'Nenhum';
  locaisDano: string[];
}

interface EquipeVTR {
  encarregado: string;
  motorista: string;
  auxiliar1: string;
  auxiliar2: string;
}

interface BoletimCompleto {
  id: string;
  numero: string;
  dataEmissao: string;
  horaComunicacao: string;
  solicitadoVia: string;
  nomeSolicitante: string;
  grupoNatureza: string;
  natureza: string;
  prefixoVTR: string;
  equipe: EquipeVTR;
  dataFato: string;
  local: string;
  cidade: string;
  apreensoes: Apreensao[];
  envolvidos: EnvolvidoFull[];
  veiculos: VeiculoFull[];
  relatorioEncarregado: string;
  assinadoEncarregado: boolean;
  iluminacao: string;
  tempo: string;
  tipoPista: string;
}

interface BoletimProps {
  systemLogo: string | null;
}

const Boletim: React.FC<BoletimProps> = ({ systemLogo }) => {
  const [boletins, setBoletins] = useState<any[]>([
    {
      id: 'test-1',
      numero: 'BOGCM 0001/2024',
      dataEmissao: '2024-10-31',
      horaComunicacao: '10:15',
      solicitadoVia: 'Via Rede',
      nomeSolicitante: 'ANÔNIMO',
      grupoNatureza: 'B - Patrimônio',
      natureza: 'B 01 – Furto',
      prefixoVTR: 'ROMU-02',
      dataFato: '2024-10-31',
      local: 'Rua General Carneiro, 400, Vila Nova',
      cidade: 'Capão Bonito-SP',
      equipe: {
        encarregado: 'FERRAZ',
        motorista: 'SANTOS',
        auxiliar1: 'RICARDO',
        auxiliar2: ''
      },
      apreensoes: [
        { id: 'apr-1', objeto: 'FERRAMENTA DE CORTE', quantidade: '01', marca: 'STILL', modelo: 'ALICATE CORTA FRIO', nFabricacao: '8812-X', destino: 'DP CENTRAL', recebedor: 'ESCRIVÃO DE PLANTÃO' }
      ],
      envolvidos: [
        { id: 'env-1', condicao: 'Vítima', nome: 'CARLOS ALBERTO DE ALMEIDA', cpf: '333.444.555-66', rg: '10.200.300-4', nascimento: '1975-08-12', sexo: 'Masculino', estadoCivil: 'Casado', profissao: 'Proprietário Comercial', mae: 'Ana Almeida', pai: 'Roberto Almeida', endereco: 'Rua General Carneiro, 400', bairro: 'Vila Nova', cidade: 'Capão Bonito-SP', telefone: '(15) 99887-1122', versao: 'Fui informado por vizinhos que havia um indivíduo tentando cortar a grade da minha loja. Ao chegar no local com a GCM, notei que a grade já estava danificada.', assinado: true, dataAssignatura: '31/10/2024 10:45:00' },
        { id: 'env-2', condicao: 'Autor', nome: 'LUCAS DA SILVA', cpf: '999.888.777-66', rg: '55.666.777-8', nascimento: '2000-02-14', sexo: 'Masculino', estadoCivil: 'Solteiro', profissao: 'Sem Ocupação', mae: 'Marta Silva', pai: 'Pai Ignorado', endereco: 'Rua da Beira Rio, S/N', bairro: 'Vila Aparecida', cidade: 'Capão Bonito-SP', telefone: '---', versao: 'Eu estava apenas segurando a ferramenta, não ia roubar nada.', assinado: false }
      ],
      veiculos: [
        { id: 'vtr-1', placa: 'GCM-2024', renavam: '102938475', chassi: '9BZ3827163', ano: '2024/2024', marcaModelo: 'TOYOTA HILUX SW4', cor: 'BRANCO', nCNH: '---', catCNH: '---', validadeCNH: '---', danos: 'Nenhum', locaisDano: [] }
      ],
      relatorioEncarregado: 'A guarnição ROMU-02 em patrulhamento preventivo pela Vila Nova foi acionada via rede rádio (COI) informando ocorrência de furto em andamento. No local, visualizamos o indivíduo supracitado portando uma ferramenta de corte próxima à grade do estabelecimento. Foi realizada a abordagem técnica e busca pessoal. Indivíduo não ofereceu resistência. Vítima chegou logo em seguida e confirmou os danos. Diante dos fatos, as partes e o objeto foram apresentados à autoridade policial no DP Central para as providências cabíveis.',
      assinadoEncarregado: true
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [editingBoId, setEditingBoId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [activeEnvForSignature, setActiveEnvForSignature] = useState<EnvolvidoFull | null>(null);

  const isAdmin = CURRENT_USER.role === 'ADMIN';

  // Função para gerar o próximo número sequencial de BO
  const generateNextBoNumber = () => {
    const currentYear = new Date().getFullYear();

    // Filtra BOs do ano atual
    const currentYearBos = boletins.filter(bo => {
      const boYear = bo.numero?.split('/')[1];
      return boYear === currentYear.toString();
    });

    // Encontra o maior número sequencial do ano
    let maxSequence = 0;
    currentYearBos.forEach(bo => {
      const match = bo.numero?.match(/BOGCM\s+(\d+)\/\d{4}/);
      if (match) {
        const sequence = parseInt(match[1], 10);
        if (sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    });

    // Próximo número sequencial
    const nextSequence = maxSequence + 1;

    // Formata com 4 dígitos (0001, 0002, etc.)
    const formattedSequence = nextSequence.toString().padStart(4, '0');

    return `BOGCM ${formattedSequence}/${currentYear}`;
  };

  const emptyFormData: Partial<BoletimCompleto> = {
    numero: generateNextBoNumber(),
    dataEmissao: new Date().toISOString().split('T')[0],
    envolvidos: [],
    veiculos: [],
    apreensoes: [],
    equipe: {
      encarregado: '',
      motorista: '',
      auxiliar1: '',
      auxiliar2: ''
    },
    solicitadoVia: 'Via Rede',
    iluminacao: 'Luz Solar',
    tempo: 'Bom',
    grupoNatureza: '',
    natureza: '',
    prefixoVTR: '',
    cidade: 'Capão Bonito-SP',
    assinadoEncarregado: false
  };

  const [formData, setFormData] = useState<Partial<BoletimCompleto>>(emptyFormData);

  const availableTypes = useMemo(() => {
    if (!formData.grupoNatureza) return [];
    return NATUREZAS_DATA[formData.grupoNatureza] || [];
  }, [formData.grupoNatureza]);

  const handlePrintBoletim = (bo: Partial<BoletimCompleto>) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>BO Digital - ${bo.numero}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Arial', sans-serif; font-size: 8pt; color: #000; line-height: 1.1; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 0pt; table-layout: fixed; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            td, th { border: 1px solid #000; padding: 3pt 4pt; vertical-align: top; }
            thead { display: table-header-group; }
            .section-title { background: #f0f0f0; text-align: center; font-weight: bold; font-size: 9pt; text-transform: uppercase; padding: 2pt; border: 1px solid #000; margin-top: 5pt; page-break-after: avoid; }
            .label { font-size: 6pt; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 1pt; }
            .value { font-size: 9pt; font-weight: bold; display: block; min-height: 10pt; }
            .checkbox-group { display: flex; flex-wrap: wrap; gap: 5pt; padding: 2pt 0; }
            .checkbox-item { display: flex; items-center: center; gap: 2pt; font-size: 7pt; }
            .box { border: 1px solid #000; width: 8pt; height: 8pt; display: inline-block; text-align: center; line-height: 8pt; font-size: 7pt; font-weight: bold; }
            .text-block { min-height: 80pt; padding: 8pt; font-size: 9pt; line-height: 1.3; border: 1px solid #000; word-break: break-word; }
            .table-apreensoes td, .table-apreensoes th { font-size: 6.5pt; padding: 2pt; }
            .footer-sig-container { margin-top: 25pt; display: flex; justify-content: space-around; page-break-inside: avoid; }
            .sig-box { text-align: center; width: 180pt; }
            .sig-line { border-top: 1px solid #000; margin-bottom: 3pt; padding-top: 2pt; font-weight: bold; font-size: 8pt; text-transform: uppercase; }
            .env-sig-area { margin-top: 20pt; text-align: center; }
            .env-sig-line { border-top: 0.5pt solid #000; width: 220pt; margin: 12pt auto 2pt; padding-top: 2pt; font-size: 7pt; font-weight: bold; text-transform: uppercase; }
            .digital-auth { font-size: 5.5pt; color: #555; font-style: italic; margin-bottom: 1pt; display: block; text-transform: uppercase; }
            .printable-section { page-break-inside: avoid; margin-bottom: 2pt; }
          </style>
        </head>
        <body>
          <!-- HEADER TIMBRADO -->
          <div class="printable-section">
            <table style="margin-bottom: 5pt;">
              <tr>
                <td style="width: 20%; text-align: center; vertical-align: middle; border: none;">
                  <img src="${systemLogo || BRASAO_GCM}" style="width: 65px; height: auto;" />
                </td>
                <td style="width: 40%; text-align: center; vertical-align: middle; border: none;">
                  <div style="font-weight: 900; font-size: 11pt; margin-bottom: 2pt;">GUARDA CIVIL MUNICIPAL DE CAPÃO BONITO</div>
                  <div style="font-weight: 700; font-size: 8pt; margin-bottom: 4pt;">Secretaria de Segurança Publica e Mobilidade Urbana</div>
                  <div style="font-weight: 900; font-size: 13pt; border-top: 1px solid #000; padding-top: 4pt; margin-top: 4pt;">BOLETIM DE OCORRENCIA</div>
                </td>
                <td style="width: 40%; padding: 0; border: none;">
                  <table style="width: 100%; height: 100%; border: 1px solid #000;">
                    <tr>
                      <td style="border: none; border-bottom: 1px solid #000; padding: 4pt;">
                        <span class="label">Data de Emissão</span>
                        <span class="value">${new Date(bo.dataEmissao!).toLocaleDateString('pt-BR')}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="border: none; padding: 4pt;">
                        <span class="label">N.º do BOGCM</span>
                        <span class="value" style="font-size: 12pt;">${bo.numero}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <div class="printable-section">
            <div class="section-title">Origem da Comunicação</div>
            <table>
              <tr>
                <td style="width: 15%;">
                  <span class="label">Hora Comunicação</span>
                  <span class="value">${bo.horaComunicacao || '--:--'}</span>
                </td>
                <td style="width: 45%;">
                  <span class="label">Como foi solicitado o atendimento da ocorrência?</span>
                  <div class="checkbox-group">
                    <div class="checkbox-item"><div class="box">${bo.solicitadoVia === 'Via Rede' ? 'X' : ''}</div> Via rede</div>
                    <div class="checkbox-item"><div class="box">${bo.solicitadoVia === 'Directamente à Guarnição' ? 'X' : ''}</div> Diretamente à guarnição</div>
                    <div class="checkbox-item"><div class="box">${bo.solicitadoVia === 'A Guarnição se deparou' ? 'X' : ''}</div> A guarnição se deparou</div>
                  </div>
                </td>
                <td style="width: 40%;">
                  <span class="label">Nome do Solicitante</span>
                  <span class="value">${bo.nomeSolicitante || 'NÃO IDENTIFICADO'}</span>
                </td>
              </tr>
            </table>
          </div>

          <div class="printable-section">
            <div class="section-title">Dados da Ocorrência</div>
            <table>
              <tr>
                <td colspan="2">
                  <span class="label">Natureza da Ocorrência</span>
                  <span class="value">${bo.natureza || 'Natureza a verificar'}</span>
                </td>
                <td style="width: 15%;">
                  <span class="label">Prefixo VTR</span>
                  <span class="value">${bo.prefixoVTR || '---'}</span>
                </td>
                <td style="width: 15%;">
                  <span class="label">Data do Fato</span>
                  <span class="value">${bo.dataFato ? new Date(bo.dataFato).toLocaleDateString('pt-BR') : '---'}</span>
                </td>
              </tr>
              <tr>
                <td colspan="3">
                  <span class="label">Logradouro (Rua, Av, Número, Bairro)</span>
                  <span class="value">${bo.local || '---'}</span>
                </td>
                <td>
                  <span class="label">Cidade</span>
                  <span class="value">${bo.cidade || 'Capão Bonito'}</span>
                </td>
              </tr>
            </table>
          </div>

          <div class="printable-section">
            <div class="section-title">Apreensões / Objetos</div>
            <table class="table-apreensoes">
              <thead>
                <tr style="background: #f9f9f9;">
                  <th style="width: 25%;">Objeto</th>
                  <th style="width: 10%;">Quant.</th>
                  <th style="width: 15%;">Marca</th>
                  <th style="width: 15%;">Modelo</th>
                  <th style="width: 15%;">N.º Fabricação</th>
                  <th style="width: 20%;">Destino / Recebedor</th>
                </tr>
              </thead>
              <tbody>
                ${bo.apreensoes?.length ? bo.apreensoes.map(a => `
                  <tr>
                    <td>${a.objeto}</td>
                    <td style="text-align:center">${a.quantidade}</td>
                    <td>${a.marca}</td>
                    <td>${a.modelo}</td>
                    <td>${a.nFabricacao}</td>
                    <td>${a.destino} / ${a.recebedor}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6" style="text-align:center; height: 25pt; color: #999; vertical-align: middle;">Nenhum objeto registrado</td></tr>
                `}
              </tbody>
            </table>
          </div>

          <div class="section-title">Qualificação dos Envolvidos</div>
          ${bo.envolvidos?.map((e, idx) => `
            <div style="border: 1px solid #000; margin-bottom: 5pt; padding: 2pt; page-break-inside: avoid;">
              <table>
                <tr style="border: none;">
                  <td style="border: none; width: 100%;" colspan="4">
                    <div class="checkbox-group" style="border-bottom: 1px solid #000; padding-bottom: 4pt; margin-bottom: 4pt;">
                      <span class="label" style="display:inline; margin-right: 10pt;">CONDIÇÃO:</span>
                      <div class="checkbox-item"><div class="box">${e.condicao === 'Vítima' ? 'X' : ''}</div> (V) VÍTMA</div>
                      <div class="checkbox-item"><div class="box">${e.condicao === 'Autor' ? 'X' : ''}</div> (A) AUTOR</div>
                      <div class="checkbox-item"><div class="box">${e.condicao === 'Indiciado' ? 'X' : ''}</div> (I) INDICIADO</div>
                      <div class="checkbox-item"><div class="box">${e.condicao === 'Testemunha' ? 'X' : ''}</div> (T) TESTEMUNHA</div>
                      <div class="checkbox-item"><div class="box">${e.condicao === 'Condutor' ? 'X' : ''}</div> (C) CONDUTOR</div>
                    </div>
                  </td>
                </tr>
                <tr style="border: none;">
                  <td colspan="3" style="border: none;">
                    <span class="label">Nome Completo (Não abreviar)</span>
                    <span class="value">${e.nome}</span>
                  </td>
                  <td style="border: none;">
                    <span class="label">CPF</span>
                    <span class="value">${e.cpf}</span>
                  </td>
                </tr>
                <tr style="border: none;">
                  <td style="border: none; width: 25%;"><span class="label">RG</span><span class="value">${e.rg}</span></td>
                  <td style="border: none; width: 25%;"><span class="label">Data Nasc.</span><span class="value">${new Date(e.nascimento).toLocaleDateString('pt-BR')}</span></td>
                  <td style="border: none; width: 25%;"><span class="label">Sexo</span><span class="value">${e.sexo}</span></td>
                  <td style="border: none; width: 25%;"><span class="label">Telefone</span><span class="value">${e.telefone}</span></td>
                </tr>
                <tr style="border: none;">
                   <td colspan="4" style="border: none; padding-top: 5pt;">
                     <span class="label">Versão do Envolvido:</span>
                     <div style="font-style: italic; font-size: 8pt; line-height: 1.3; min-height: 35pt;">"${e.versao || '---'}"</div>
                     <div class="env-sig-area">
                        ${e.assinado ? `<span class="digital-auth">AUTENTICADO DIGITALMENTE EM ${e.dataAssignatura}</span>` : ''}
                        <div class="env-sig-line">Assinatura do Envolvido / Responsável: ${e.nome}</div>
                     </div>
                   </td>
                </tr>
              </table>
            </div>
          `).join('') || '<div style="text-align:center; padding: 20pt; border: 1px solid #000;">Nenhum envolvido qualificado</div>'}

          <div class="section-title">04. Qualificação de Veículos Envolvidos</div>
          ${bo.veiculos?.length ? bo.veiculos.map((v, vIdx) => `
            <div style="border: 1px solid #000; margin-bottom: 5pt; padding: 2pt; page-break-inside: avoid;">
              <table>
                <tr>
                  <td colspan="2"><span class="label">Placa</span><span class="value">${v.placa}</span></td>
                  <td colspan="2"><span class="label">Renavam</span><span class="value">${v.renavam}</span></td>
                  <td colspan="2"><span class="label">Chassi</span><span class="value">${v.chassi}</span></td>
                </tr>
                <tr>
                  <td colspan="2"><span class="label">Marca/Modelo</span><span class="value">${v.marcaModelo}</span></td>
                  <td><span class="label">Ano</span><span class="value">${v.ano}</span></td>
                  <td><span class="label">Cor</span><span class="value">${v.cor}</span></td>
                  <td><span class="label">Danos</span><span class="value">${v.danos}</span></td>
                  <td><span class="label">Locais Avarias</span><span class="value">${v.locaisDano?.join(', ') || 'Nenhum'}</span></td>
                </tr>
                <tr>
                  <td colspan="2"><span class="label">CNH do Condutor</span><span class="value">${v.nCNH}</span></td>
                  <td><span class="label">Cat.</span><span class="value">${v.catCNH}</span></td>
                  <td colspan="3"><span class="label">Validade CNH</span><span class="value">${v.validadeCNH ? new Date(v.validadeCNH + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</span></td>
                </tr>
              </table>
            </div>
          `).join('') : '<div style="text-align:center; padding: 10pt; border: 1px solid #000; color: #999;">Nenhum veículo registrado</div>'}

          <div class="printable-section" style="page-break-inside: auto;">
            <div class="section-title">Relatório do Encarregado</div>
            <div class="text-block">
              ${bo.relatorioEncarregado?.replace(/\n/g, '<br>') || 'Nenhum relatório oficial preenchido.'}
            </div>
          </div>

          <div class="footer-sig-container">
            <div class="sig-box">
              ${bo.assinadoEncarregado ? `<span class="digital-auth">ASSINADO DIGITALMENTE POR GCM ${bo.equipe?.encarregado}</span>` : ''}
              <div class="sig-line">GCM ${bo.equipe?.encarregado || '---'}</div>
              <span style="font-size: 7pt;">ENCARREGADO DA OCORRÊNCIA</span>
            </div>
            <div class="sig-box">
              <div class="sig-line" style="margin-top: 10pt;">VISTO / GCM CAPÃO BONITO</div>
              <span style="font-size: 7pt;">SUPERVISOR DE TURNO</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20pt; font-size: 6pt; color: #666; text-transform: uppercase;">
            Este documento é um Registro Digital Oficial da Guarda Civil Municipal de Capão Bonito SP.<br>
            Impresso em ${new Date().toLocaleString('pt-BR')} por ${bo.equipe?.encarregado || 'SISTEMA'}
          </div>

          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
             <button onClick="window.print()" style="padding: 10px 20px; background: #1e3a8a; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">IMPRIMIR AGORA</button>
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

  const addApreensao = () => {
    const novo: Apreensao = {
      id: Date.now().toString(),
      objeto: '', quantidade: '', marca: '', modelo: '', nFabricacao: '', destino: '', recebedor: ''
    };
    setFormData({ ...formData, apreensoes: [...(formData.apreensoes || []), novo] });
  };

  const addEnvolvido = () => {
    const novo: EnvolvidoFull = {
      id: Date.now().toString(),
      condicao: 'Vítima',
      nome: '', cpf: '', rg: '', nascimento: '', sexo: '',
      estadoCivil: 'Solteiro(a)', profissao: '', mae: '', pai: '',
      endereco: '', bairro: '', cidade: 'Capão Bonito-SP', telefone: '',
      versao: '', assinado: false,
      nomeResponsavel: '', documentoResponsavel: '', vinculoResponsavel: ''
    };
    setFormData({ ...formData, envolvidos: [...(formData.envolvidos || []), novo] });
  };

  const addVeiculo = () => {
    const novo: VeiculoFull = {
      id: Date.now().toString(),
      placa: '', renavam: '', chassi: '', ano: '', marcaModelo: '', cor: '',
      nCNH: '', catCNH: '', validadeCNH: '', danos: 'Nenhum', locaisDano: []
    };
    setFormData({ ...formData, veiculos: [...(formData.veiculos || []), novo] });
  };

  const toggleLocalDano = (vtrIdx: number, ponto: number, prefixo: 'C' | 'M') => {
    const newVeiculos = [...(formData.veiculos || [])];
    const pontoId = `${prefixo}${ponto}`;
    const locais = newVeiculos[vtrIdx].locaisDano || [];
    if (locais.includes(pontoId)) {
      newVeiculos[vtrIdx].locaisDano = locais.filter(p => p !== pontoId);
    } else {
      newVeiculos[vtrIdx].locaisDano = [...locais, pontoId];
    }
    setFormData({ ...formData, veiculos: newVeiculos });
  };

  const handleAIRefinement = async () => {
    if (!formData.relatorioEncarregado || formData.relatorioEncarregado.length < 15) return;
    setIsRefining(true);
    const refined = await refineReportText(formData.relatorioEncarregado);
    if (refined) {
      setFormData({ ...formData, relatorioEncarregado: refined });
    }
    setIsRefining(false);
  };

  const openSignatureCollector = (env: EnvolvidoFull) => {
    if (!env.nome || !env.versao) {
      alert("Por favor, preencha o Nome e a Versão do envolvido antes de assinar.");
      return;
    }
    setActiveEnvForSignature(env);
    setIsSignatureModalOpen(true);
  };

  const finalizeSignature = () => {
    if (!activeEnvForSignature) return;

    setFormData({
      ...formData,
      envolvidos: formData.envolvidos?.map(e => e.id === activeEnvForSignature.id ? {
        ...e,
        assinado: true,
        dataAssignatura: new Date().toLocaleString('pt-BR')
      } : e)
    });

    setIsSignatureModalOpen(false);
    setActiveEnvForSignature(null);
  };

  const handleSave = () => {
    if (editingBoId) {
      setBoletins(boletins.map(bo => bo.id === editingBoId ? { ...formData, id: bo.id } : bo));
    } else {
      const newBo = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      setBoletins([newBo, ...boletins]);
    }
    setIsModalOpen(false);
    setEditingBoId(null);
  };

  const handleEditBo = (bo: any) => {
    setFormData(bo);
    setEditingBoId(bo.id);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setBoletins(prev => prev.filter(bo => bo.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-black tracking-tighter uppercase">Gerenciamento de B.O.</h2>
          <p className="text-black font-medium text-xs flex items-center gap-2 mt-1">
            <Shield className="w-3.5 h-3.5 text-blue-800" /> Sistema de Registro Eletrônico - GCM Capão Bonito
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              ...emptyFormData,
              numero: generateNextBoNumber()
            });
            setEditingBoId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-900 transition-all shadow-xl shadow-blue-200 active:scale-95 border-b-4 border-blue-950"
        >
          <Plus className="w-4 h-4" /> Novo Registro (BOGCM)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {boletins.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <FileText className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-black font-bold uppercase tracking-widest text-xs">Aguardando novos registros de ocorrência.</p>
          </div>
        )}
        {boletins.map((bo, i) => (
          <div key={bo.id || i} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl transition-all"><FileText /></div>
              <div>
                <h4 className="font-black text-black uppercase tracking-tight">{bo.numero}</h4>
                <p className="text-xs text-black font-medium">
                  {bo.natureza || 'Natureza Não Definida'} •
                  <span className="ml-1 text-black uppercase">{bo.local || 'Local não informado'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrintBoletim(bo)}
                className="p-3 bg-slate-50 text-black hover:bg-blue-50 hover:text-blue-800 rounded-xl transition-all border border-transparent hover:border-blue-100"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleEditBo(bo)}
                className="p-3 bg-slate-50 text-black hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(bo.id); }}
                  className="p-3 bg-slate-50 text-black hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Excluir (Admin)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#f1f5f9] z-[100] flex flex-col animate-in fade-in duration-300">
          <div className="w-full h-full flex flex-col overflow-hidden">

            <div className="bg-blue-900 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-950">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden flex items-center justify-center border border-white/20">
                  <img src={systemLogo || BRASAO_GCM} className="w-full h-full object-contain p-1" alt="Logo Header" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    {editingBoId ? 'Edição de Boletim' : 'Novo Boletim Digital'}
                  </h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1">GCM de Capão Bonito</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-[10px] text-blue-400 uppercase font-black">N.º DO BOGCM</p>
                  <p className="text-xl font-black tracking-widest text-white">{formData.numero}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white"><X className="w-8 h-8" /></button>
              </div>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1">

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <h4 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <MapIcon className="w-4 h-4" /> 01. Origem e Dados do Fato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Hora Comunic.</label>
                    <input type="time" value={formData.horaComunicacao} onChange={e => setFormData({ ...formData, horaComunicacao: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Solicitado Via</label>
                    <select value={formData.solicitadoVia} onChange={e => setFormData({ ...formData, solicitadoVia: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black">
                      <option>Via Rede</option><option>Directamente à Guarnição</option><option>A Guarnição se deparou</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Nome do Solicitante</label>
                    <input type="text" value={formData.nomeSolicitante} onChange={e => setFormData({ ...formData, nomeSolicitante: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black" placeholder="Nome Completo" />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Grupo de Natureza</label>
                    <div className="relative group">
                      <select
                        value={formData.grupoNatureza}
                        onChange={e => setFormData({ ...formData, grupoNatureza: e.target.value, natureza: '' })}
                        className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm font-black text-black appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="">Selecione o Grupo...</option>
                        {Object.keys(NATUREZAS_DATA).map(grupo => (
                          <option key={grupo} value={grupo}>{grupo}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Natureza Específica</label>
                    <div className="relative group">
                      <select
                        disabled={!formData.grupoNatureza}
                        value={formData.natureza}
                        onChange={e => setFormData({ ...formData, natureza: e.target.value })}
                        className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm font-black text-black appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-50"
                      >
                        <option value="">Selecione o Tipo...</option>
                        {availableTypes.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Prefixo VTR</label>
                    <select value={formData.prefixoVTR} onChange={e => setFormData({ ...formData, prefixoVTR: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black outline-none">
                      <option value="">Selecione...</option>
                      {VTR_LIST.map(vtr => <option key={vtr.prefixo} value={vtr.prefixo}>{vtr.prefixo}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Data do Fato</label>
                    <input type="date" value={formData.dataFato} onChange={e => setFormData({ ...formData, dataFato: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black" />
                  </div>

                  <div className="space-y-1 md:col-span-3">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Local (Rua, Nº, Bairro)</label>
                    <input type="text" value={formData.local} onChange={e => setFormData({ ...formData, local: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black" placeholder="Rua, Número, Bairro" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-black uppercase ml-1">Cidade</label>
                    <input type="text" value={formData.cidade} onChange={e => setFormData({ ...formData, cidade: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-black" placeholder="Cidade" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> 02. Registro de Apreensões / Objetos
                  </h4>
                  <button type="button" onClick={addApreensao} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl border border-blue-100 uppercase tracking-widest hover:bg-blue-100 transition-all">
                    + Adicionar Objeto
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-[2rem] shadow-inner">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-black uppercase tracking-widest text-left">
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">Objeto</th>
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">Quant.</th>
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">Marca</th>
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">Modelo</th>
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">N.º Fabricação</th>
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">Destino</th>
                        <th className="px-4 py-3 text-[9px] font-black text-black uppercase tracking-widest text-left">Recebedor</th>
                        <th className="px-2 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                      {formData.apreensoes?.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-2"><input type="text" value={item.objeto} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].objeto = e.target.value.toUpperCase();
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none" /></td>

                          <td className="p-2"><input type="text" value={item.quantidade} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].quantidade = e.target.value;
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none text-center" /></td>

                          <td className="p-2"><input type="text" value={item.marca} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].marca = e.target.value.toUpperCase();
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none" /></td>

                          <td className="p-2"><input type="text" value={item.modelo} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].modelo = e.target.value.toUpperCase();
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none" /></td>

                          <td className="p-2"><input type="text" value={item.nFabricacao} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].nFabricacao = e.target.value.toUpperCase();
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none" /></td>

                          <td className="p-2"><input type="text" value={item.destino} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].destino = e.target.value.toUpperCase();
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none" /></td>

                          <td className="p-2"><input type="text" value={item.recebedor} onChange={e => {
                            const newA = [...(formData.apreensoes || [])];
                            newA[idx].recebedor = e.target.value.toUpperCase();
                            setFormData({ ...formData, apreensoes: newA });
                          }} className="w-full p-2 bg-transparent border-b border-transparent focus:border-blue-300 text-xs font-bold text-black outline-none" /></td>

                          <td className="px-2">
                            <button type="button" onClick={() => {
                              const newA = formData.apreensoes?.filter(a => a.id !== item.id);
                              setFormData({ ...formData, apreensoes: newA });
                            }} className="text-red-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> 03. Qualificação dos Envolvidos e Versões
                  </h4>
                  <button type="button" onClick={addEnvolvido} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl border border-blue-100 uppercase tracking-widest hover:bg-blue-100 transition-all">
                    + Adicionar Envolvido
                  </button>
                </div>

                <div className="space-y-8">
                  {formData.envolvidos?.map((env, idx) => {
                    const { age, category } = calculateAge(env.nascimento);
                    const isMinorOrIncapable = category !== 'Adulto';

                    return (
                      <div key={env.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-6 animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-black uppercase italic">Envolvido N.º {idx + 1}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${category === 'Adulto' ? 'bg-slate-200 text-black' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                                {category}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <select value={env.condicao} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].condicao = e.target.value;
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="text-[10px] font-black bg-white border border-slate-200 px-3 py-1 rounded-lg uppercase text-black">
                              <option>Vítima</option><option>Autor</option><option>Testemunha</option><option>Condutor</option><option>Proprietário</option>
                            </select>
                            <button type="button" onClick={() => {
                              const newEnv = formData.envolvidos?.filter(e => e.id !== env.id);
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Nome Completo</label>
                            <input type="text" value={env.nome} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].nome = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">RG</label>
                            <input type="text" value={env.rg} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].rg = formatRG(e.target.value);
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" maxLength={12} placeholder="00.000.000-0" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">CPF</label>
                            <input type="text" value={env.cpf} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].cpf = formatCPF(e.target.value);
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" maxLength={14} placeholder="000.000.000-00" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] font-black text-black uppercase">Data Nasc.</label>
                              {env.nascimento && (
                                <span className="text-[8px] font-black bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded uppercase">
                                  {calculateAge(env.nascimento).age} Anos
                                </span>
                              )}
                            </div>
                            <input type="date" value={env.nascimento} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].nascimento = e.target.value;
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Sexo</label>
                            <select value={env.sexo} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].sexo = e.target.value as any;
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black">
                              <option value="">Selecione...</option>
                              <option>Masculino</option>
                              <option>Feminino</option>
                              <option>Não Identificado</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Estado Civil</label>
                            <select value={env.estadoCivil} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].estadoCivil = e.target.value;
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black">
                              <option value="">Selecione...</option>
                              <option>Solteiro(a)</option>
                              <option>Casado(a)</option>
                              <option>Divorciado(a)</option>
                              <option>Viúvo(a)</option>
                              <option>União Estável</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Profissão</label>
                            <input type="text" value={env.profissao} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].profissao = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" placeholder="EX: AUTÔNOMO" />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Nome do Pai</label>
                            <input type="text" value={env.pai} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].pai = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Nome da Mãe</label>
                            <input type="text" value={env.mae} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].mae = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Endereço (Rua, Nº)</label>
                            <input type="text" value={env.endereco} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].endereco = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Bairro</label>
                            <input type="text" value={env.bairro} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].bairro = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Cidade</label>
                            <input type="text" value={env.cidade} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].cidade = e.target.value.toUpperCase();
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-black uppercase">Telefone</label>
                            <input type="text" value={env.telefone} onChange={e => {
                              const newEnv = [...(formData.envolvidos || [])];
                              newEnv[idx].telefone = e.target.value;
                              setFormData({ ...formData, envolvidos: newEnv });
                            }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" placeholder="(15) 99999-9999" />
                          </div>

                          <div className={`md:col-span-4 p-6 rounded-3xl border transition-all ${isMinorOrIncapable ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                            <div className="flex items-center gap-3 mb-4">
                              <UserCheck className={`w-5 h-5 ${isMinorOrIncapable ? 'text-amber-600' : 'text-slate-400'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${isMinorOrIncapable ? 'text-black' : 'text-slate-500'}`}>
                                Responsável Legal (Menor/Incapaz)
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input type="text" placeholder="Nome do Responsável" value={env.nomeResponsavel} onChange={e => {
                                const newEnv = [...(formData.envolvidos || [])];
                                newEnv[idx].nomeResponsavel = e.target.value.toUpperCase();
                                setFormData({ ...formData, envolvidos: newEnv });
                              }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                              <input type="text" placeholder="Documento Responsável" value={env.documentoResponsavel} onChange={e => {
                                const newEnv = [...(formData.envolvidos || [])];
                                newEnv[idx].documentoResponsavel = e.target.value;
                                setFormData({ ...formData, envolvidos: newEnv });
                              }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                              <select value={env.vinculoResponsavel} onChange={e => {
                                const newEnv = [...(formData.envolvidos || [])];
                                newEnv[idx].vinculoResponsavel = e.target.value;
                                setFormData({ ...formData, envolvidos: newEnv });
                              }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black">
                                <option value="">Vínculo...</option>
                                <option>Pai</option><option>Mãe</option><option>Tutor(a)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Versão do Envolvido (Relato Próprio)</label>
                          <textarea rows={3} value={env.versao} onChange={e => {
                            const newEnv = [...(formData.envolvidos || [])];
                            newEnv[idx].versao = e.target.value;
                            setFormData({ ...formData, envolvidos: newEnv });
                          }} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium italic text-black resize-none outline-none" placeholder="Digite o relato aqui..." />
                        </div>

                        <div className={`p-6 rounded-3xl border border-dashed flex flex-col sm:flex-row items-center gap-6 transition-all ${env.assinado ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 'bg-white border-slate-200'}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <Fingerprint className={`w-8 h-8 ${env.assinado ? 'text-emerald-500' : 'text-slate-300'}`} />
                            <div>
                              <p className="text-[10px] font-black text-black uppercase tracking-widest">Assinatura Digital</p>
                              <p className="text-[9px] text-black uppercase">{env.assinado ? `AUTENTICADO EM ${env.dataAssignatura}` : 'AGUARDANDO COLETA'}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={env.assinado || !env.versao}
                            onClick={() => openSignatureCollector(env)}
                            className={`w-full sm:w-auto px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${env.assinado
                              ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                              : 'bg-slate-900 text-white hover:bg-black active:scale-95 shadow-xl'
                              }`}
                          >
                            {env.assinado ? '✓ ASSINADO' : 'ASSINAR AGORA'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xs font-black text-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Car className="w-4 h-4" /> 04. Qualificação de Veículos Envolvidos
                  </h4>
                  <button type="button" onClick={addVeiculo} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl border border-blue-100 uppercase tracking-widest hover:bg-blue-100 transition-all">
                    + Adicionar Veículo
                  </button>
                </div>

                <div className="space-y-8">
                  {formData.veiculos?.map((vtr, vIdx) => (
                    <div key={vtr.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-6 animate-in slide-in-from-top-4">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                        <span className="text-xs font-black text-black uppercase italic">Veículo N.º {vIdx + 1}</span>
                        <button type="button" onClick={() => {
                          const newV = formData.veiculos?.filter(v => v.id !== vtr.id);
                          setFormData({ ...formData, veiculos: newV });
                        }} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Placa</label>
                          <input type="text" value={vtr.placa} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].placa = formatPlaca(e.target.value);
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" maxLength={8} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Renavam</label>
                          <input type="text" value={vtr.renavam} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].renavam = e.target.value.toUpperCase();
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-black text-black uppercase">Marca/Modelo</label>
                          <input type="text" value={vtr.marcaModelo} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].marcaModelo = e.target.value.toUpperCase();
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Cor</label>
                          <input type="text" value={vtr.cor} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].cor = e.target.value.toUpperCase();
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Ano</label>
                          <input type="text" value={vtr.ano} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].ano = e.target.value;
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" placeholder="XXXX/XXXX" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Danos</label>
                          <select value={vtr.danos} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].danos = e.target.value as any;
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black">
                            <option>Nenhum</option>
                            <option>Pequena</option>
                            <option>Média</option>
                            <option>Grande</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Chassi</label>
                          <input type="text" value={vtr.chassi} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].chassi = e.target.value.toUpperCase();
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">CNH do Condutor</label>
                          <input type="text" value={vtr.nCNH} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].nCNH = e.target.value;
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Cat. CNH</label>
                          <input type="text" value={vtr.catCNH} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].catCNH = e.target.value.toUpperCase();
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" maxLength={3} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-black uppercase">Validade CNH</label>
                          <input type="date" value={vtr.validadeCNH} onChange={e => {
                            const newV = [...(formData.veiculos || [])];
                            newV[vIdx].validadeCNH = e.target.value;
                            setFormData({ ...formData, veiculos: newV });
                          }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black" />
                        </div>

                        {/* Mapa de Avarias (Automóvel e Motocicleta) */}
                        <div className="md:col-span-4 mt-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-4">Diagramas de Avarias (Impactos: 1-14)</label>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                            {/* Automóvel */}
                            <div className="flex flex-col items-center gap-6">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Avarias Automóvel</p>
                              <div className="relative w-48 h-80 shrink-0">
                                <svg viewBox="0 0 200 400" className="w-full h-full text-slate-200">
                                  <path d="M50,40 Q100,20 150,40 L160,100 Q170,200 160,300 L150,360 Q100,380 50,360 L40,300 Q30,200 40,100 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <rect x="60" y="80" width="80" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                  <rect x="60" y="160" width="80" height="120" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                                  <rect x="60" y="300" width="80" height="50" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>

                                {[
                                  { n: 1, x: 25, y: 15 }, { n: 2, x: 50, y: 10 }, { n: 3, x: 75, y: 15 },
                                  { n: 4, x: 15, y: 35 }, { n: 5, x: 15, y: 60 }, { n: 6, x: 85, y: 35 },
                                  { n: 7, x: 85, y: 60 }, { n: 8, x: 25, y: 85 }, { n: 9, x: 50, y: 90 },
                                  { n: 10, x: 75, y: 85 }, { n: 11, x: 50, y: 50 }, { n: 12, x: 50, y: 35 },
                                  { n: 13, x: 50, y: 65 }, { n: 14, x: 50, y: 22 },
                                ].map((p) => (
                                  <button
                                    key={p.n}
                                    type="button"
                                    onClick={() => toggleLocalDano(vIdx, p.n, 'C')}
                                    className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 ${vtr.locaisDano?.includes(`C${p.n}`)
                                      ? 'bg-red-600 border-red-800 text-white shadow-lg'
                                      : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'
                                      }`}
                                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                  >
                                    {p.n}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Motocicleta */}
                            <div className="flex flex-col items-center gap-6">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Avarias Motocicleta</p>
                              <div className="relative w-72 h-80 shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 400 300" className="w-full h-full text-slate-200">
                                  {/* Simple Bike Silhouette */}
                                  <circle cx="80" cy="220" r="50" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <circle cx="320" cy="220" r="50" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <path d="M80,220 L160,80 L280,80 L320,220" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <path d="M160,80 L220,150 L280,80" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <path d="M120,60 L200,60 L180,40" fill="none" stroke="currentColor" strokeWidth="4" />
                                </svg>

                                {[
                                  { n: 1, x: 20, y: 75 },   // Roda Dianteira
                                  { n: 2, x: 25, y: 55 },   // Paralama Dianteiro
                                  { n: 3, x: 38, y: 25 },   // Guidão/Farol
                                  { n: 4, x: 45, y: 15 },   // Retrovisor esq
                                  { n: 5, x: 55, y: 15 },   // Retrovisor dir
                                  { n: 6, x: 50, y: 35 },   // Tanque frontal
                                  { n: 7, x: 60, y: 35 },   // Tanque traseiro
                                  { n: 8, x: 45, y: 60 },   // Motor/Carenagem esq
                                  { n: 9, x: 58, y: 60 },   // Motor/Carenagem dir
                                  { n: 10, x: 68, y: 30 },  // Assento
                                  { n: 11, x: 80, y: 50 },  // Paralama Traseiro
                                  { n: 12, x: 82, y: 75 },  // Roda Traseira
                                  { n: 13, x: 75, y: 65 },  // Escapamento
                                  { n: 14, x: 50, y: 85 },  // Quadro/Cavalete
                                ].map((p) => (
                                  <button
                                    key={p.n}
                                    type="button"
                                    onClick={() => toggleLocalDano(vIdx, p.n, 'M')}
                                    className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 ${vtr.locaisDano?.includes(`M${p.n}`)
                                      ? 'bg-red-600 border-red-800 text-white shadow-lg'
                                      : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'
                                      }`}
                                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                  >
                                    {p.n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest text-center">Pontos de Impacto Selecionados:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {vtr.locaisDano?.sort().map(p => (
                                <span key={p} className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-lg border border-red-200 animate-in zoom-in-95">{p.startsWith('C') ? 'CARRO' : 'MOTO'} PT {p.substring(1)}</span>
                              ))}
                              {(!vtr.locaisDano || vtr.locaisDano.length === 0) && <span className="text-[10px] text-slate-300 italic font-medium">Nenhum ponto selecionado nos diagramas.</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!formData.veiculos || formData.veiculos.length === 0) && (
                    <div className="p-10 text-center text-slate-300 font-black uppercase tracking-widest italic text-[10px]">Nenhum veículo vinculado.</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <h4 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <HardHat className="w-4 h-4" /> 05. Relatório do Encarregado
                </h4>

                <div className="mb-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-black uppercase ml-1">Encarregado</label>
                      <select
                        value={formData.equipe?.encarregado}
                        onChange={e => setFormData({ ...formData, equipe: { ...formData.equipe!, encarregado: e.target.value } })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase outline-none text-black"
                      >
                        <option value="">SELECIONAR...</option>
                        {GCM_POOL.map(gcm => <option key={gcm.id} value={gcm.nomeGuerra}>{gcm.nomeGuerra}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-black uppercase ml-1">Motorista</label>
                      <select
                        value={formData.equipe?.motorista}
                        onChange={e => setFormData({ ...formData, equipe: { ...formData.equipe!, motorista: e.target.value } })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase outline-none text-black"
                      >
                        <option value="">SELECIONAR...</option>
                        {GCM_POOL.map(gcm => <option key={gcm.id} value={gcm.nomeGuerra}>{gcm.nomeGuerra}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-black uppercase ml-1">Auxiliar</label>
                      <select
                        value={formData.equipe?.auxiliar1}
                        onChange={e => setFormData({ ...formData, equipe: { ...formData.equipe!, auxiliar1: e.target.value } })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase outline-none text-black"
                      >
                        <option value="">NENHUM...</option>
                        {GCM_POOL.map(gcm => <option key={gcm.id} value={gcm.nomeGuerra}>{gcm.nomeGuerra}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black text-black uppercase ml-1 tracking-widest">Narrativa Técnica</label>
                    <button
                      type="button"
                      onClick={handleAIRefinement}
                      disabled={isRefining || !formData.relatorioEncarregado}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-blue-300 text-[9px] font-black rounded-xl hover:bg-black transition-all"
                    >
                      {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      REVISAR (IA)
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={formData.relatorioEncarregado}
                    onChange={e => setFormData({ ...formData, relatorioEncarregado: e.target.value })}
                    className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm font-medium italic text-black outline-none resize-none shadow-inner"
                    placeholder="Relate detalhadamente o ocorrido..."
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-center p-8 bg-blue-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden gap-6">
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`p-4 rounded-2xl border-2 transition-all ${formData.assinadoEncarregado ? 'bg-emerald-50 border-white' : 'bg-white/10 border-white/20'}`}>
                        <Fingerprint className={`w-10 h-10 ${formData.assinadoEncarregado ? 'text-white' : 'text-blue-300'}`} />
                      </div>
                      <div>
                        <h5 className="text-xl font-black italic uppercase tracking-tighter text-white">Autenticação</h5>
                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.3em] mt-1">
                          {formData.assinadoEncarregado && formData.equipe?.encarregado
                            ? `GCM ${formData.equipe.encarregado} - OK`
                            : 'Aguardando Assinatura'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.equipe?.encarregado) {
                          alert("Selecione o Encarregado.");
                          return;
                        }
                        setFormData({ ...formData, assinadoEncarregado: true });
                      }}
                      disabled={formData.assinadoEncarregado || !formData.relatorioEncarregado}
                      className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${formData.assinadoEncarregado
                        ? 'bg-emerald-50 text-white'
                        : 'bg-white text-blue-900 shadow-xl'
                        }`}
                    >
                      {formData.assinadoEncarregado ? '✓ ASSINADO' : 'ASSINAR E FINALIZAR'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-8 bg-white border-t-4 border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingBoId(null); }} className="order-2 sm:order-1 flex-1 py-5 bg-white border border-slate-200 text-black font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-[11px]">Cancelar</button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formData.assinadoEncarregado || !formData.natureza}
                className="order-1 sm:order-2 flex-1 py-5 bg-blue-800 text-white font-black rounded-3xl shadow-2xl hover:bg-blue-900 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" /> {editingBoId ? 'Salvar Alterações' : 'Finalizar Registro'}
              </button>
            </div>

          </div>
        </div>
      )}

      {isSignatureModalOpen && activeEnvForSignature && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <FileSignature className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Assinatura Digital</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GCM Capão Bonito SP</p>
                </div>
              </div>
              <button onClick={() => setIsSignatureModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-10 space-y-8">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                <p className="text-[10px] font-black text-black uppercase tracking-widest mb-4">REVISÃO DO RELATO</p>
                <p className="text-sm text-black italic font-medium leading-relaxed">
                  "{activeEnvForSignature.versao}"
                </p>
              </div>

              <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                <p className="text-[11px] font-bold text-black uppercase mb-2">Termo de Veracidade</p>
                <p className="text-[10px] text-black leading-relaxed italic">
                  Confirmo que o relato acima é a expressão da verdade sobre os fatos ocorridos, sob pena do Art. 340 do Código Penal.
                </p>
              </div>

              <button
                onClick={finalizeSignature}
                className="w-full py-6 bg-blue-800 text-white font-black rounded-3xl shadow-xl hover:bg-blue-900 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 border-b-4 border-blue-950"
              >
                <Fingerprint className="w-5 h-5" /> Confirmar e Assinar
              </button>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-[10px] font-black text-black uppercase tracking-widest">Abortar Procedimento</button>
            </div>
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
              <h3 className="text-xl font-black text-xl text-black tracking-tight">Confirmar Exclusão?</h3>
              <p className="text-sm text-black font-medium italic">
                O registro será removido permanentemente.
              </p>
            </div>
            <div className="flex border-t border-slate-50 p-6 gap-3 bg-slate-50/50">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-white border border-slate-200 text-black font-black rounded-2xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm">Abortar</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-[10px] uppercase tracking-widest border-b-4 border-red-800">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-t-8 border-blue-600">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white/10 rounded-[2rem] border border-white/20">
            <Zap className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-white">AUTENTICAÇÃO DIGITAL</h4>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
              Este sistema utiliza criptografia da GCM Capão Bonito. Todo registro sem assinatura digital será considerado inválido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boletim;

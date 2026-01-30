import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, FileText, Plus, Trash2, Printer, X,
  ChevronRight, ShieldCheck, CheckCircle2, Info, Car,
  Users, Clock, MapPin, Fuel, Gauge, AlertTriangle, Fingerprint,
  ChevronDown, Check, AlertOctagon, Camera, User, Smartphone, CreditCard, Tag, Home, Loader2, Wand2
} from 'lucide-react';
import { RelatorioRonda, RondaLinha, AtividadeDetalhada, AbordagemSimples, VeiculoSimples } from '../types';
import { refineReportText } from '../services/geminiService';
import { BRASAO_GCM } from '../config/constants';

const LOGO_PREFEITURA = "https://i.ibb.co/3yg6Y9N/logo-prefeitura.png";

const formatCPF = (value: string) => {
  const raw = value.replace(/\D/g, '');
  return raw
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

const formatRG = (value: string) => {
  const raw = value.replace(/\D/g, '').toUpperCase();
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
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// Pool de Viaturas (Sincronizado)
const VTR_LIST = [
  { prefixo: 'ROMU-01', modelo: 'Hilux 4x4 SW4', placa: 'GCM-2021' },
  { prefixo: 'VTR-12', modelo: 'Spin Premier', placa: 'GCM-2025' },
  { prefixo: 'MOTO-04', modelo: 'Tiger 900 Raly', placa: 'GCM-2030' },
  { prefixo: 'VTR-09', modelo: 'Duster Oroch', placa: 'GCM-2018' },
  { prefixo: 'VTR-15', modelo: 'Spin Premier', placa: 'GCM-1515' },
  { prefixo: 'ROMU-02', modelo: 'Hilux 4x4 SW4', placa: 'GCM-2024' },
];

// Pool de Funcionários (Sincronizado)
const GCM_POOL = [
  { id: '1', nomeGuerra: 'SANTOS', matricula: 'GCM-001' },
  { id: '2', nomeGuerra: 'SILVA', matricula: 'GCM-002' },
  { id: '3', nomeGuerra: 'MELO', matricula: 'GCM-042' },
  { id: '4', nomeGuerra: 'FERREIRA', matricula: 'GCM-015' },
  { id: '5', nomeGuerra: 'OLIVEIRA', matricula: 'GCM-088' },
  { id: '6', nomeGuerra: 'COSTA', matricula: 'GCM-099' },
  { id: '7', nomeGuerra: 'FERRAZ', matricula: 'GCM-MASTER' },
  { id: '8', nomeGuerra: 'RICARDO', matricula: 'GCM-008' },
  { id: '9', nomeGuerra: 'SOUZA', matricula: 'GCM-009' },
  { id: '10', nomeGuerra: 'PEDRO', matricula: 'GCM-010' },
];

const CHECKLIST_ITEMS = [
  { id: 'high_light', label: 'High Light' }, { id: 'radio', label: 'Rádio' },
  { id: 'sirene', label: 'Sirene' }, { id: 'lanternas', label: 'Lanternas' },
  { id: 'farol', label: 'Faról/Seta' }, { id: 'pneu', label: 'Pneu/Estepe' },
  { id: 'suspensao', label: 'Suspensão' }, { id: 'extintor', label: 'Extintor' },
  { id: 'ch_roda', label: 'Ch. Roda' }, { id: 'macaco', label: 'Macaco' },
  { id: 'l_parabrisa', label: 'L.Parabrisa' }, { id: 'radiador', label: 'Radiador' },
  { id: 'oleo', label: 'Óleo' }, { id: 'limpeza', label: 'Limpeza' }
];

const LOCAIS_ATIVIDADE: Record<string, string[]> = {
  "AVENIDAS": [
    "Avenida Lucas Nogueira Garcez", "Avenida Ademar de Barros", "Avenida Amazonas",
    "Avenida Santos Dumont", "Avenida Massaichi Kakihara", "Avenida Dona Nenê",
    "Avenida Capitão Calixto", "Avenida Elias Jorge Daniel", "Avenida Plácido Batista da Silveira",
    "Outros (Colocar na Observação*)"
  ],
  "BAIRROS": [
    "Vila Santa Izabel", "Jd Colonial/Jd Alvorada/Vila Triunfo", "Vila Brasil/Vila São José",
    "Nova Capão/Vila Cruzeiro", "Terra do Imbiruçu", "Jardim Europa/Parque das Nations",
    "Parque das Águas/Vila Santa Rosa", "Vila Maria/CDHU", "São Judas/São Pedro",
    "Vila Boa Esperança", "Jd Vale Verde", "Vila São Paulo/São Francisco de Assis",
    "Bela Vista/Jd Helena", "Vila Guanabara", "Caetê", "Centro",
    "Vila Aparecida/Jd da Amizade", "Setor Comercial/Distrito Industrial", "Bairro São Paulinho",
    "Bairro dos Turvos", "Bairro Ana Benta", "Bairro Pinhalzinho", "Bairro dos Gomes",
    "Bairro Taquaral", "Bairro dos Lemes", "Bairro dos Proenças", "Bairro Apiaí Mirim",
    "Bairro Ferreira das Almas", "Bairro Capoava", "Bairro Camilos", "Bairro dos Thomés",
    "Bairro dos Mendes", "Bairro Mato Pavão", "Bairro Boituva", "Bairro Paineras",
    "Bairro Campininhas", "Bairro Palatta", "Outros (Colocar na Observação*)"
  ],
  "BASE": ["ARVA"],
  "ENTIDADES": [
    "APAE", "ASILO", "Cooperativa Agrícola", "CAS Padre Henrique",
    "Legionários na Defesa do Menor", "Igreja", "Outros (Colocar na Observação*)"
  ],
  "ESCOLAS PRIVADAS": [
    "Anglo", "Conviver", "ETEC", "FATEC", "Objetivo", "Unisa", "Waldorf", "Outros (Colocar na Observação*)"
  ],
  "ESCOLAS PÚBLICAS": [
    "Akiko Ikeda", "Angelino Sudário de Souza", "Bairro dos Thomés", "Bairro Ferreira das Almas",
    "Balangá", "Cacilda dos Santos Queiroz", "CAMP", "Centro Educacional e Esportivo Paulo Freire",
    "Creche Anair da Ap. Miguel Bestel", "Cristiano Lucas Ferreira", "Dona Clementina Correa de Almeida",
    "Dr. Raul Venturelli", "Elias Jorge Daniel", "Girassol", "Gov André Franco Montoro",
    "Ileny de Souza Galvão Dias", "João Laurindo da Silva", "Jornalista José Carlos Tallarico",
    "Leoni da Silva Lopes", "Monsenhor Pedro José Vieira", "Octávio Miller", "Oscar Kurts Camargo",
    "Padre Arlindo Vieira", "Prof Alice Dias", "Prof Benjamim Venturelli", "Prof Faustino Cesarino Barreto",
    "Prof Isolina Leonel Ferreira", "Prof Jacyra Landim Stori", "Prof Joao Batista A Vasconcelos",
    "Prof Maria Borges Domingues Bugni", "Prof Maria da Conceicao Lucas Mieldazis",
    "Prof Sumie Tereza Matsuura Baldissera", "Prof Tania Luzia campos M Alves",
    "Recanto Maria Lirio", "Samuel Messias de Freitas", "Turvo dos Almeidas", "Yolanda Marchetti Balsevícius"
  ],
  "PATRIMÔNIO": [
    "Aeroporto", "ARVA", "Ambulatório Especializado", "Almoxarifado", "Bombeiro",
    "Biblioteca Municipal", "CAMP", "Casa do Empreendedor", "Casa da Agricultura",
    "Centro de Convenções", "Casa do Adolescente", "Câmara Municipal", "Campo Municipal",
    "Canil Municipal", "Cozinha Central", "CAPS", "CRAS", "CREAS", "Cemitério",
    "Conselho Tutelar", "Demutran", "Defesa Civil", "Delegacia", "Desenvolvimento Social",
    "DDM", "Elo Esporte", "Fórum", "Ginásio José Ermírio de Moraes", "Hospital",
    "Imóvel Privado", "Igreja", "Prefeitura Municipal", "Paulo Freire",
    "Secretaria Municipal de Educação", "Secretaria Municipal de Saúde", "Secretaria de Obras",
    "Sede da Guarda Civil Municipal", "Subprefeitura Turvo dos Almeidas", "Rodoviária",
    "Postos de Saúde", "Parque das Águas", "Posto de Gasolina", "Praça Rui Barbosa",
    "Praça João XXIII", "Polícia Militar", "Subestação de Energia", "Outros (Colocar na Observação*)"
  ],
  "COMÉRCIO": [
    "Feira Livre - Avenida Ademar de Barros", "Feira Livre - Vila Aparecida",
    "Feira Livre - Avenida Amazonas", "Posto de Gasolina", "Mercado Municipal",
    "Borraharia", "Outros (Colocar na Observação*)"
  ],
  "VISITAS": ["GCM Itararé", "GCM Itapeva", "GCM Buri", "GCM Itapetininga"],
  "RODOVIAS": ["Rodovia Municipal", "Rodovia Estadual", "Rodovia Federal"]
};

const OCORRENCIAS_LIST: Record<string, string[]> = {
  "GERAL": ["Patrulhamento", "Monitoramento CCO", "Parada"],
  "A - PESSOA E A VIDA": [
    "A 01 – Homicídio", "A 02 – Suicídio", "A 04 – Aborto", "A 05 – Lesão Corporal",
    "A 06 – Infanticídio", "A 07 – Periclitação Da Vida", "A 08 – Abandono De Incapaz",
    "A 09 – Omissão De Socorro", "A 10 – Ameaça", "A 11 – Seqüestro / Carcere Privado",
    "A 12 – Violação De Domicílio", "A 13 – Maus Tratos", "A 14 – Racismo",
    "A 15- Rixa", "A 16 – Difamação", "A 17 – Injuria", "A 18 – Constrangimento Ilegal",
    "A 19 – Pedido De Socorro", "A 20 – Afogamento Em Curso", "A 21 – Tortura",
    "A 22 - Abandono Material", "A 23 – Abandono Intelectual",
    "A 24 – Entrega De Filho Menor A Pessoa Inidonea", "A 25 – Subtração De Incapaz"
  ],
  "B - PATRIMÔNIO": [
    "B 01 – Furto", "B 03 – Furto / Tentativa", "B 04 – RouBO", "B 06 – Extorsão",
    "B 07 – Posse / Invasão De Propriedade", "B 08 – Dano / Depredação",
    "B 09 – Apropriação Indébita", "B 10 – Estelionato / Fraude", "B 11 – Receptação",
    "B 12 – Latrocínio", "B 13 – Arrastão", "B 14 – Alarme Disparado", "B 15 – Saque",
    "B 16 – Auto Localizado"
  ],
  "C - TRANQUILIDADE E OS MORTOS": [
    "C 01 – Perturbação De Sossego Público", "C 02 – Conduta Incoveniente",
    "C 03 – Embriaguez", "C 04 – Desinteligência", "C 05 – Averiguação De Atitude Suspeita",
    "C 06 – Perturbação De Cerimonia Funerária", "C 07 – Violação De Sepultura",
    "C 08 – Encontro De Cadaver"
  ],
  "D - COSTUMES": [
    "D 01 – Estupro", "D 02 – Ato Obsceno", "D 03 – Escrito Ou Objeto Obsceno",
    "D 04 – Corrupção De Menores", "D 05 – Rapto", "D 06 – Exploração De Lenocinio",
    "D 07 – Jogo De Azar", "D 08 – Vadiagem", "D 09 – Mendicância",
    "D 10 – Servir Bebida Alcoolica A Incapaz", "D 11 – Importunação Ofensiva Ao Pudor",
    "D 14 – Desordem E Perturbação Da Tranquilidade"
  ],
  "E – ADMINISTRAÇÃO PUBLICA": [
    "E 01 – Concussão", "E 02 – Corrupção", "E 03 – Danos Ao Patrimônio Público",
    "E 04 – Desobediência", "E 05 – Desacato", "E 07 - Contrabando / Descaminho",
    "E 08 – Abuso De Autoridade", "E 09 – Peculato", "E 10 – Prevaricação",
    "E 11 – Violência Arbitrária", "E 12 – Usurpação De Função Pública", "E 13 – Resistance"
  ],
  "F – TRÁFICO": ["F 01 – Tráfico De Entorpecentes", "F 02 – Tráfico De Entorpecentes/Ato Infracional", "F 03 – Porte De Entorpecentes"],
  "G – PRESO E A JUSTIÇA": ["G 01 - Ocorrências Com Preso", "G 02 – Comunicação Falsa De Crime", "G 03 – Captura De Procurado"],
  "H – ORGANIZAÇÃO DO TRABALHO": ["H 01 – Greve", "H 02 – Piquete", "H 03 – Tumulto", "H 04 – Passeata", "H 06 – Manifestação Pública", "H 07 – Trabalho Infantil", "H 08 – Exercicio Ilegal De Profissão"],
  "I – MEio AMBIENTE": [
    "I 01 – Causar Degradação Ambiental", "I 03 – Não Efetuar Reposição Florestal", "I 05 – Cortar Árvore Isolada",
    "I 06 – Cortar Árvore Seletivamente", "I 07 – Cortar Palmito", "I 08 – Efetuar Bosqueamento",
    "I 09 – Efetuar Corte Raso", "I 10 – Efetuar Aterro", "I 11 – Efetuar Drenagem",
    "I 12 – Efetuar Desvio", "I 13 – Efetuar Represamento", "I 14 – Causar Poluição Ambiental",
    "I 15 – Causar Mortandade Da Biota Nativa", "I 16 – Praticar Ato De Caça", "I 17 – Praticar Ato De Pesca",
    "I 18 – Irregulariedade Com Produto De Pesca", "I 19 – Apreensão De Petrecho", "I 20 – Manter Espécime Em Cativeiro",
    "I 21 – Comercializar Produto De Fauna", "I 22 – Introduzir Espécime", "I 23 – Perseguir Espécime",
    "I 24 – Transportar Espécime", "I 25 – Bloqueio / Barreira", "I 26 – Vistoria Ambiental",
    "I 27 – Vistoria De Pesca", "I 28 – Captura / Soltura De Animal Silvestre", "I 29 – Atividade De Educação Ambiental",
    "I 30 - Maus Tratos De Animais", "I 31 - Incêndio"
  ],
  "L – TRÂNSITO": [
    "L 01 – Veículo", "L 02 – Sinistro De Transito", "L 03 – Direção Perigosa",
    "L 04 - Congestionamento", "L 05 – Infração De Trânsito", "L 06 – Interdição De Via Pública",
    "L 07 – Sinistro De Trânsito Sem Vítima", "L 08 – Atropelamento", "L 11 – Direção Sem Cnh",
    "L 12 – Veículo Abandonado", "L 13 – Embriaguez Ao Volante"
  ],
  "M - LEI MARIA DA PENHA": ["M 01 Violência Doméstica", "M 02 Violência Física", "M 03 Violência Psicológica", "M 04 Violência Sexual", "M 05 Violência Patrimonial", "M 06 Violência Moral"],
  "O – INCOLUMIDADE E FÉ PÚBLICA": [
    "O 03 – Falsa Identity", "O 04 – Uso De Documento Falso", "O 05 – Falsidade Ideológica",
    "O 06 – Detenção De Suspeito", "O 07 – Subversão / Terrorismo", "O 08 – Crime Contra Economia Popular",
    "O 09 – Envenenamento De Água Potavel", "O 10 – Porte Ilegal Arma Fogo", "O 11 – Porte Ilegal Arma Restrita",
    "O 12 – Posse Ilegal Arma Fogo", "O 13 – Porte Ilegal Munição", "O 14 – Munição De Uso Restrito",
    "O 15 – Tráfico De Armas", "O 16 – Falsificação", "O 17 – Formação De Quadrilha",
    "O 18 – Ocorrências Com Explosivos", "O 19 – Perigo De Desabamento", "O 21 – Soltura De Balões / Fogos"
  ],
  "R – AUXILIO AO PÚBLICO": [
    "R 01 – Acidente Pessoal", "R 02 – Auxilio A Gestante", "R 03 – Auxílio Ao Deficiente Mental",
    "R 04 – Morte Natural", "R 05 – Mal Súbito", "R 06 – Indigente", "R 07 – Transporte De Pessoas",
    "R 08 – Ameaça De Salto", "R 10 – Pessoa Desaparecida", "R 11 – Pessoa Localizada",
    "R 13 – Objeto Abandonado", "R 14 – Objeto Localizado", "R 22 – Choque Elétrico",
    "R 61 – Overdose", "R 63 – Ingestão De Substancia", "R 71 – Queimadura",
    "R 83 – Parada Cárdio Respiratória", "R 84 – Crise Convulsiva", "R 85 – Emergência Clinica",
    "R 86 - Assistência Com Animal", "R 87 - Ocorrência Com Indivíduo Alcoolizado", "R 88 - Pessoa em Surto"
  ],
  "S – BOMBEIRO": ["S 01 – Incêndio", "S 02 – Explosão", "S 10 – Vazamento", "S 16 – Ocorrencia Com Árvore", "S 26 – Desmoronamento", "S 28 – Desabamento", "S 36 – Ocorrência Com Animal", "S 44 – Ocorrencia Com Objeto", "S 46 – Enchente", "S 54 – Queda"],
  "NÃO CADASTRADA": ["Z99 – Ocorrências Não Cadastradas"]
};

interface RelatoriosProps {
  relatorios: RelatorioRonda[];
  setRelatorios: React.Dispatch<React.SetStateAction<RelatorioRonda[]>>;
  systemLogo: string | null;
}

const Relatorios: React.FC<RelatoriosProps> = ({ relatorios, setRelatorios, systemLogo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dados' | 'vtr' | 'atividades' | 'abordagens' | 'veiculos' | 'historico'>('dados');
  const [isRefining, setIsRefining] = useState(false);

  const emptyRelatorio: Partial<RelatorioRonda> = {
    numeroVtr: '', data: new Date().toISOString().split('T')[0], horario: '',
    rondas: [], atividades: [], abordagens: [], veiculos: [],
    abastecimento: { nReq: '', litros: '' }, situacaoVtr: {},
    assinadoEncarregado: false,
    kmInicial: undefined, kmFinal: undefined,
    encarregado: '', matriculaEncarregado: '',
    motorista: '', matriculaMotorista: '',
    auxiliar: '', matriculaAuxiliar: '',
    historico: ''
  };

  const [formData, setFormData] = useState<Partial<RelatorioRonda>>(emptyRelatorio);
  const [tempValorTotal, setTempValorTotal] = useState('');

  // Efeito para automatizar o turno baseando-se na hora atual
  useEffect(() => {
    if (isModalOpen && !formData.horario) {
      const hours = new Date().getHours();
      let shift = 'ADMINISTRATIVO';
      if (hours >= 6 && hours < 18) shift = '06H - 18H';
      else shift = '18H - 06H';
      setFormData(prev => ({ ...prev, horario: shift }));
    }
  }, [isModalOpen]);

  const handlePrint = (rel: RelatorioRonda) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const kmRodado = (rel.kmFinal || 0) - (rel.kmInicial || 0);
    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Ronda - GCM</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Arial', sans-serif; font-size: 8pt; color: #000; margin: 0; padding: 0; line-height: 1.1; }
            .page { page-break-after: auto; min-height: 277mm; position: relative; border: 0.5pt solid transparent; padding-bottom: 20pt; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5pt; }
            .header-center { text-align: center; flex: 1; font-weight: bold; }
            .header-center h1 { font-size: 11pt; margin: 0; color: #444; }
            .header-center p { margin: 1pt 0; font-size: 9pt; }
            .logo { width: 40pt; height: 40pt; object-fit: contain; }
            .row { display: flex; width: 100%; border-collapse: collapse; }
            .field { border: 0.5pt solid #000; padding: 2pt; flex: 1; min-height: 10pt; display: flex; flex-direction: column; }
            .label { font-size: 5.5pt; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 1pt; color: #444; }
            .value { font-size: 8pt; font-weight: bold; word-break: break-all; }
            .section-title { background: #eee; color: #000; text-align: center; font-weight: bold; font-size: 8pt; text-transform: uppercase; padding: 2pt; border: 1px solid #000; margin-top: 4pt; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 0; }
            th, td { border: 0.5pt solid #000; padding: 2pt; text-align: center; font-size: 7.5pt; overflow: hidden; }
            th { font-weight: bold; background: #fafafa; font-size: 6.5pt; text-transform: uppercase; }
            .text-block { min-height: 80pt; padding: 10pt; font-size: 9pt; line-height: 1.4; border: 0.5pt solid #000; margin-top: 2pt; white-space: pre-wrap; }
            .footer-sig { display: flex; flex-direction: row; justify-content: space-around; align-items: flex-end; margin-top: 30pt; page-break-inside: avoid; }
            .sig-box { text-align: center; display: flex; flex-direction: column; align-items: center; }
            .sig-line { border-top: 0.5pt solid #000; width: 200pt; text-align: center; font-weight: bold; font-size: 8pt; padding-top: 4pt; }
            .digital-badge { color: #059669; font-size: 6pt; font-weight: bold; font-style: italic; text-transform: uppercase; margin-bottom: 2pt; }
            .checklist-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border: 0.5pt solid #000; font-size: 6.5pt; }
            .checklist-item { border: 0.1pt solid #ddd; padding: 2pt; display: flex; justify-content: space-between; align-items: center; }
            .visto-comando-box { width: 200pt; text-align: left; }
            .visto-label { font-size: 9pt; font-weight: bold; text-transform: uppercase; margin-bottom: 15pt; display: block; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <!-- LOGO DO SISTEMA ANEXADA NO LADO ESQUERDO -->
              <div style="width: 40pt; text-align: left;">
                 <img src="${systemLogo || BRASAO_GCM}" class="logo" />
              </div>
              <div class="header-center">
                <p>Prefeitura Municipal de Capão Bonito</p>
                <p>Secretaria de Segurança Pública</p>
                <p>Guarda Civil Municipal</p>
                <h1 style="margin-top: 5pt;">RELATÓRIO DE RONDA</h1>
              </div>
            </div>

            <!-- INFORMAÇÕES BÁSICAS -->
            <div class="row" style="margin-top: 5pt;">
              <div class="field" style="flex: 1;"><span class="label">DATA:</span><span class="value">${new Date(rel.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span></div>
              <div class="field" style="flex: 1;"><span class="label">HORÁRIO/PERÍODO:</span><span class="value">${rel.horario || '---'}</span></div>
              <div class="field" style="flex: 1;"><span class="label">VIATURA:</span><span class="value">${rel.numeroVtr}</span></div>
            </div>
            <div class="row">
              <div class="field"><span class="label">HORA INICIAL:</span><span class="value">${rel.horaInicial || '--:--'}</span></div>
              <div class="field"><span class="label">HORA FINAL:</span><span class="value">${rel.horaFinal || '--:--'}</span></div>
              <div class="field"><span class="label">KM INICIAL:</span><span class="value">${rel.kmInicial || 0}</span></div>
              <div class="field"><span class="label">KM FINAL:</span><span class="value">${rel.kmFinal || 0}</span></div>
              <div class="field"><span class="label">KM RODADO:</span><span class="value">${kmRodado}</span></div>
            </div>

            <!-- EQUIPE DE SERVIÇO -->
            <div class="section-title">EQUIPE DE SERVIÇO</div>
            <div class="row">
              <div class="field" style="flex: 1;"><span class="label">ENCARREGADO:</span><span class="value">${rel.encarregado} (${rel.matriculaEncarregado})</span></div>
              <div class="field" style="flex: 1;"><span class="label">MOTORISTA:</span><span class="value">${rel.motorista} (${rel.matriculaMotorista})</span></div>
              <div class="field" style="flex: 1;"><span class="label">AUXILIAR:</span><span class="value">${rel.auxiliar || '---'} ${rel.matriculaAuxiliar ? `(${rel.matriculaAuxiliar})` : ''}</span></div>
            </div>

            <!-- INSPEÇÃO E ABASTECIMENTO (Movido para antes das Atividades) -->
            <div style="display: flex; gap: 5pt; margin-top: 5pt;">
              <div style="flex: 3;">
                <div class="section-title">INSPEÇÃO DA VIATURA (CHECKLIST)</div>
                <div class="checklist-grid">
                  ${CHECKLIST_ITEMS.map(item => {
      const status = rel.situacaoVtr?.[item.id] === 'B' ? 'OK' : rel.situacaoVtr?.[item.id] === 'D' ? 'RUIM' : '---';
      return `
                      <div class="checklist-item">
                        <span>${item.label}:</span>
                        <span style="font-weight: bold; margin-left: 2pt;">${status}</span>
                      </div>`;
    }).join('')}
                </div>
              </div>
              <div style="flex: 1;">
                <div class="section-title">ABASTECIMENTO</div>
                <div class="field" style="border: 0.5pt solid #000; height: auto;">
                  <span class="label">N.º REQUISIÇÃO:</span><span class="value">${rel.abastecimento?.nReq || '---'}</span>
                  <span class="label" style="margin-top: 4pt;">LITROS:</span><span class="value">${rel.abastecimento?.litros || '---'}</span>
                </div>
              </div>
            </div>

            <!-- REGISTRO DE ATIVIDADES -->
            <div class="section-title">REGISTRO DE ATIVIDADES</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">LOCAL</th>
                  <th style="width: 30%;">OCORRÊNCIA / NATUREZA</th>
                  <th style="width: 10%;">QTR IN</th>
                  <th style="width: 35%;">OBSERVAÇÃO</th>
                </tr>
              </thead>
              <tbody>
                ${rel.atividades?.map(at => `
                  <tr>
                    <td style="text-align: left;">${at.local}</td>
                    <td style="text-align: left;">${at.codigo}</td>
                    <td>${at.qtrIn}</td>
                    <td style="text-align: left;">${at.observacao || ''}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4">Nenhuma atividade registrada</td></tr>'}
              </tbody>
            </table>

            <!-- REGISTRO DE ABORDAGENS -->
            <div class="section-title">REGISTRO DE ABORDAGENS (INDIVÍDUOS)</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 10%;">HORA</th>
                  <th style="width: 20%;">NOME / ALCUNHA</th>
                  <th style="width: 20%;">RG / CPF / NASC.</th>
                  <th style="width: 10%;">TIPO</th>
                  <th style="width: 15%;">NOME DA MÃE</th>
                  <th style="width: 25%;">OBSERVAÇÃO</th>
                </tr>
              </thead>
              <tbody>
                ${rel.abordagens?.length > 0 ? rel.abordagens.map(a => `
                  <tr>
                    <td>${a.hora}</td>
                    <td style="text-align: left;">${a.nome}<br><small>(${a.alcunha || '---'})</small></td>
                    <td>${a.rg}<br>${a.cpf}<br>${a.nascimento ? new Date(a.nascimento + 'T12:00:00').toLocaleDateString('pt-BR') : ''}</td>
                    <td>${a.tipo}</td>
                    <td>${a.mae}</td>
                    <td style="text-align: left;">${a.observacao}</td>
                  </tr>
                `).join('') : '<tr><td colspan="6">Nenhuma abordagem registrada</td></tr>'}
              </tbody>
            </table>
            
            <!-- VEÍCULOS FISCALIZADOS -->
            <div class="section-title">VEÍCULOS FISCALIZADOS</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 10%;">HORA</th>
                  <th style="width: 15%;">PLACA / RENAVAM</th>
                  <th style="width: 20%;">MODELO / COR</th>
                  <th style="width: 25%;">CONDUTOR / CNH / CPF</th>
                  <th style="width: 30%;">OBSERVAÇÃO</th>
                </tr>
              </thead>
              <tbody>
                ${rel.veiculos?.length > 0 ? rel.veiculos.map(v => `
                  <tr>
                    <td>${v.hora}</td>
                    <td>${v.placa}<br>${v.renavam}</td>
                    <td>${v.marcaModelo}<br>${v.cor}</td>
                    <td style="text-align: left;">${v.condutor}<br>CNH: ${v.cnh}<br>CPF: ${v.cpf}</td>
                    <td style="text-align: left;">${v.observacao}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5">Nenhum veículo fiscalizado</td></tr>'}
              </tbody>
            </table>

            <!-- HISTÓRICO -->
            <div class="section-title">HISTÓRICO / RELATO OPERACIONAL</div>
            <div class="text-block">${rel.historico || 'Nenhum histórico registrado.'}</div>

            <!-- ASSINATURAS -->
            <div class="footer-sig">
              <div class="sig-box">
                ${rel.assinadoEncarregado ? `<div class="digital-badge">AUTENTICADO DIGITALMENTE EM ${rel.dataAssinatura}</div>` : ''}
                <div class="sig-line">GCM ${rel.encarregado || '---'}</div>
                <div style="font-size: 7pt; font-weight: bold; margin-top: 2pt;">ENCARREGADO DA EQUIPE</div>
              </div>
              <div class="sig-box">
                <div class="visto-comando-box">
                   <span class="visto-label">VISTO: ____/____/____</span>
                </div>
                <div class="sig-line">COMANDO GCM</div>
                <div style="font-size: 7pt; font-weight: bold; margin-top: 2pt;">VISTO DO COMANDO</div>
              </div>
            </div>
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSave = () => {
    const rel: RelatorioRonda = {
      ...formData as RelatorioRonda,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      status: 'finalizado'
    };
    if (formData.id) setRelatorios(relatorios.map(r => r.id === formData.id ? rel : r));
    else setRelatorios([rel, ...relatorios]);
    setIsModalOpen(false);
  };

  const addLinhaAtividade = () => {
    setFormData({ ...formData, atividades: [...(formData.atividades || []), { id: Date.now().toString(), local: '', talao: '', codigo: '', qtrIn: '', kmIn: '', qtrOut: '', kmOut: '', observacao: '', foto: '' }] });
  };

  const addAbordagem = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setFormData({
      ...formData,
      abordagens: [
        ...(formData.abordagens || []),
        {
          id: Date.now().toString(),
          data: dateStr,
          tipo: '',
          nome: '',
          alcunha: '',
          nascimento: '',
          mae: '',
          matricula: '',
          cpf: '',
          rg: '',
          endereco: '',
          local: '',
          hora: timeStr,
          observacao: '',
          foto: ''
        }
      ]
    });
  };

  const addVeiculo = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setFormData({
      ...formData,
      veiculos: [
        ...(formData.veiculos || []),
        {
          id: Date.now().toString(),
          data: dateStr,
          hora: timeStr,
          placa: '',
          renavam: '',
          marcaModelo: '',
          cor: '',
          condutor: '',
          cnh: '',
          cpf: '',
          foto: '',
          observacao: ''
        }
      ]
    });
  };

  const handleSelectGCM = (field: 'encarregado' | 'motorista' | 'auxiliar', id: string) => {
    const gcm = GCM_POOL.find(g => g.id === id);
    if (!gcm) return;
    const matriculaField = field === 'encarregado' ? 'matriculaEncarregado' : field === 'motorista' ? 'matriculaMotorista' : 'matriculaAuxiliar';
    setFormData({ ...formData, [field]: gcm.nomeGuerra, [matriculaField]: gcm.matricula });
  };

  const handleAtividadePhoto = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const n = [...formData.atividades!];
        n[idx].foto = reader.result as string;
        setFormData({ ...formData, atividades: n });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAbordagemPhoto = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const n = [...formData.abordagens!];
        n[idx].foto = reader.result as string;
        setFormData({ ...formData, abordagens: n });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVeiculoPhoto = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const n = [...formData.veiculos!];
        n[idx].foto = reader.result as string;
        setFormData({ ...formData, veiculos: n });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const numericValue = parseInt(cleanValue, 10) || 0;
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue / 100);
    return formatted;
  };

  const handleValorTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setTempValorTotal(formatted);
  };

  const handleAIRefineHistory = async () => {
    if (!formData.historico || formData.historico.length < 15) return;
    setIsRefining(true);
    const refined = await refineReportText(formData.historico);
    if (refined) {
      setFormData({ ...formData, historico: refined });
    }
    setIsRefining(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Módulo de Rondas</h2>
          <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-1">
            <ClipboardCheck className="w-4 h-4 text-blue-800" /> Relatório Oficial
          </p>
        </div>
        <button onClick={() => { setFormData(emptyRelatorio); setTempValorTotal(''); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-900 transition-all shadow-xl border-b-4 border-blue-950">
          <Plus className="w-4 h-4" /> Novo Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {relatorios.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <FileText className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aguardando novos registros de rondas.</p>
          </div>
        )}
        {relatorios.map((rel) => (
          <div key={rel.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl"><Car /></div>
              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tight">VTR {rel.numeroVtr} - {new Date(rel.data + 'T12:00:00').toLocaleDateString('pt-BR')}</h4>
                <p className="text-xs text-slate-500 font-medium italic">Encarregado: {rel.encarregado}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePrint(rel)} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-lg" title="Gerar PDF Modelo">
                <Printer className="w-4 h-4" />
              </button>
              <button onClick={() => { setFormData(rel); setIsModalOpen(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#f1f5f9] z-[100] flex flex-col animate-in fade-in duration-300">
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="bg-blue-900 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-950">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10"><ShieldCheck className="w-8 h-8 text-blue-400" /></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Relatório de Ronda Digital</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1">Conformidade Operacional GCM Capão Bonito</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
            </div>

            <div className="flex bg-slate-50 border-b border-slate-200 shrink-0 overflow-x-auto custom-scrollbar">
              {(['dados', 'vtr', 'atividades', 'abordagens', 'veiculos', 'historico'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${activeTab === tab ? 'border-blue-800 text-blue-800 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  {tab === 'dados' ? '1. Dados e Equipe' : tab === 'vtr' ? '2. Inspeção VTR' : tab === 'atividades' ? '3. Atividades' : tab === 'abordagens' ? '4. Abordagens' : tab === 'veiculos' ? '5. Veículos' : '6. Histórico e Finalização'}
                </button>
              ))}
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'dados' && (
                <div className="space-y-10 animate-in slide-in-from-left duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Viatura</label>
                      <select value={formData.numeroVtr} onChange={e => setFormData({ ...formData, numeroVtr: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-blue-900 outline-none appearance-none">
                        <option value="">- SELECIONAR VTR -</option>
                        {VTR_LIST.map(v => <option key={v.prefixo} value={v.prefixo}>{v.prefixo} - {v.modelo}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data</label><input type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" /></div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Horário</label>
                      <input type="text" readOnly value={formData.horario} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black text-slate-500 outline-none" placeholder="06H - 18H" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6">
                      <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" /> Jornada e Quilometragem</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">H. Inicial</label><input type="time" value={formData.horaInicial} onChange={e => setFormData({ ...formData, horaInicial: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" /></div>
                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase ml-1">H. Final</label><input type="time" value={formData.horaFinal} onChange={e => setFormData({ ...formData, horaFinal: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" /></div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">KM Inicial</label>
                          <input
                            type="number"
                            value={formData.kmInicial === undefined ? '' : formData.kmInicial}
                            onChange={e => setFormData({ ...formData, kmInicial: e.target.value === '' ? undefined : Number(e.target.value) })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">KM Final</label>
                          <input
                            type="number"
                            value={formData.kmFinal === undefined ? '' : formData.kmFinal}
                            onChange={e => setFormData({ ...formData, kmFinal: e.target.value === '' ? undefined : Number(e.target.value) })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Km Percorrida no Turno</p>
                        <p className="text-3xl font-black text-blue-800 italic">
                          {((formData.kmFinal || 0) - (formData.kmInicial || 0))} KM
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-4">
                      <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> Composição da Equipe</h4>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <select onChange={e => handleSelectGCM('encarregado', e.target.value)} className="flex-[3] p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase outline-none">
                            <option value="">- SELECIONAR ENCARREGADO -</option>
                            {GCM_POOL.map(g => <option key={g.id} value={g.id} selected={formData.encarregado === g.nomeGuerra}>{g.nomeGuerra}</option>)}
                          </select>
                          <input type="text" readOnly placeholder="Matrícula" value={formData.matriculaEncarregado} className="flex-1 p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500" />
                        </div>
                        <div className="flex gap-2">
                          <select onChange={e => handleSelectGCM('motorista', e.target.value)} className="flex-[3] p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase outline-none">
                            <option value="">- SELECIONAR MOTORISTA -</option>
                            {GCM_POOL.map(g => <option key={g.id} value={g.id} selected={formData.motorista === g.nomeGuerra}>{g.nomeGuerra}</option>)}
                          </select>
                          <input type="text" readOnly placeholder="Matrícula" value={formData.matriculaMotorista} className="flex-1 p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500" />
                        </div>
                        <div className="flex gap-2">
                          <select onChange={e => handleSelectGCM('auxiliar', e.target.value)} className="flex-[3] p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase outline-none">
                            <option value="">- SELECIONAR AUXILIAR -</option>
                            {GCM_POOL.map(g => <option key={g.id} value={g.id} selected={formData.auxiliar === g.nomeGuerra}>{g.nomeGuerra}</option>)}
                          </select>
                          <input type="text" readOnly placeholder="Matrícula" value={formData.matriculaAuxiliar} className="flex-1 p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vtr' && (
                <div className="space-y-10 animate-in slide-in-from-top duration-300">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-8 flex items-center gap-2"><Gauge className="w-5 h-5" /> Inspeção de Viatura (Checklist Oficial)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {CHECKLIST_ITEMS.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-blue-50/30 transition-all">
                          <span className="text-[10px] font-black text-slate-400 uppercase ml-1">{item.label}</span>
                          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                            <button onClick={() => setFormData({ ...formData, situacaoVtr: { ...formData.situacaoVtr, [item.id]: 'B' } })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${formData.situacaoVtr?.[item.id] === 'B' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-50'}`}>
                              <Check className="w-3 h-3" /> OK
                            </button>
                            <button onClick={() => setFormData({ ...formData, situacaoVtr: { ...formData.situacaoVtr, [item.id]: 'D' } })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${formData.situacaoVtr?.[item.id] === 'D' ? 'bg-red-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-50'}`}>
                              <AlertOctagon className="w-3 h-3" /> RUIM
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100">
                      <h5 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-8 flex items-center gap-3"><Fuel className="w-6 h-6" /> Registro de Abastecimento</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Viatura</label>
                          <select className="w-full p-4 bg-white border border-emerald-200 rounded-2xl text-sm font-black outline-none appearance-none">
                            <option value="">- SELECIONAR VTR -</option>
                            {VTR_LIST.map(v => <option key={v.prefixo} value={v.prefixo} selected={formData.numeroVtr === v.prefixo}>{v.prefixo}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Quilometragem (KM)</label>
                          <input type="number" placeholder="KM Atual" className="w-full p-4 bg-white border border-emerald-200 rounded-2xl text-sm font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Litros</label>
                          <input type="text" placeholder="Qtd. Litros" value={formData.id === 'test-rel-1' ? formData.abastecimento?.litros : ''} onChange={e => setFormData({ ...formData, abastecimento: { ...formData.abastecimento!, litros: e.target.value } })} className="w-full p-4 bg-white border border-emerald-200 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Valor Total (R$)</label>
                          <input
                            type="text"
                            placeholder="R$ 0,00"
                            value={tempValorTotal}
                            onChange={handleValorTotalChange}
                            className="w-full p-4 bg-white border border-emerald-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'atividades' && (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-900 p-6 flex justify-between items-center border-b-4 border-blue-600">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Registro Detalhado de Atividades</h4>
                      <button onClick={addLinhaAtividade} className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-700 transition-all">+ Adicionar Linha</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Local da Atividade</th>
                            <th className="px-4 py-4">Ocorrência</th>
                            <th className="px-4 py-4">QTR In</th>
                            <th className="px-4 py-4">Observação</th>
                            <th className="px-4 py-4">Foto</th>
                            <th className="px-4 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {formData.atividades?.map((at, idx) => (
                            <tr key={at.id} className="hover:bg-blue-50/20 transition-all">
                              <td className="px-4 py-2">
                                <select
                                  value={at.local}
                                  onChange={e => {
                                    const n = [...formData.atividades!];
                                    n[idx].local = e.target.value;
                                    setFormData({ ...formData, atividades: n });
                                  }}
                                  className="w-full p-2 bg-transparent text-[10px] font-black text-black outline-none border-b border-transparent focus:border-blue-400 appearance-none"
                                >
                                  <option value="">Selecione o Local...</option>
                                  {Object.entries(LOCAIS_ATIVIDADE).map(([grupo, itens]) => (
                                    <optgroup key={grupo} label={grupo}>
                                      {itens.map(item => (
                                        <option key={item} value={item}>{item}</option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  value={at.codigo}
                                  onChange={e => {
                                    const n = [...formData.atividades!];
                                    n[idx].codigo = e.target.value;
                                    setFormData({ ...formData, atividades: n });
                                  }}
                                  className="w-full p-2 bg-transparent text-[10px] font-black text-black outline-none border-b border-transparent focus:border-blue-400 appearance-none"
                                >
                                  <option value="">Selecione a Ocorrência...</option>
                                  {Object.entries(OCORRENCIAS_LIST).map(([grupo, itens]) => (
                                    <optgroup key={grupo} label={grupo}>
                                      {itens.map(item => (
                                        <option key={item} value={item}>{item}</option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <input type="time" value={at.qtrIn} onChange={e => { const n = [...formData.atividades!]; n[idx].qtrIn = e.target.value; setFormData({ ...formData, atividades: n }); }} className="w-full p-2 bg-transparent text-[10px] font-bold text-black text-center outline-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="Obs..."
                                  value={at.observacao || ''}
                                  onChange={e => {
                                    const n = [...formData.atividades!];
                                    n[idx].observacao = e.target.value;
                                    setFormData({ ...formData, atividades: n });
                                  }}
                                  className="w-full p-2 bg-transparent text-[10px] font-medium text-black outline-none border-b border-transparent focus:border-blue-400"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`foto-input-${idx}`)?.click()}
                                    className={`p-1.5 rounded-lg transition-all ${at.foto ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                  >
                                    <Camera className="w-4 h-4" />
                                  </button>
                                  <input
                                    id={`foto-input-${idx}`}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e => handleAtividadePhoto(idx, e)}
                                  />
                                  {at.foto && (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                      <img src={at.foto} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <button onClick={() => setFormData({ ...formData, atividades: formData.atividades?.filter(a => a.id !== at.id) })} className="text-red-300 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'abordagens' && (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-900 p-6 flex justify-between items-center border-b-4 border-emerald-600">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Abordagens Realizadas (Indivíduos)</h4>
                      <button onClick={addAbordagem} className="px-6 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-emerald-700 transition-all">+ Adicionar Pessoa</button>
                    </div>
                    <div className="p-4 space-y-6">
                      {formData.abordagens?.map((ab, idx) => {
                        const age = calculateAge(ab.nascimento);
                        return (
                          <div key={ab.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4 animate-in slide-in-from-top-4">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <div className="flex gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase italic">Registro #{idx + 1}</span>
                                {age !== null && <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">{age} ANOS</span>}
                              </div>
                              <button onClick={() => setFormData({ ...formData, abordagens: formData.abordagens?.filter(a => a.id !== ab.id) })} className="text-red-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-1 md:col-span-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Data/Hora</label>
                                <div className="flex gap-2">
                                  <input type="date" value={ab.data} onChange={e => { const n = [...formData.abordagens!]; n[idx].data = e.target.value; setFormData({ ...formData, abordagens: n }); }} className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                  <input type="time" value={ab.hora} onChange={e => { const n = [...formData.abordagens!]; n[idx].hora = e.target.value; setFormData({ ...formData, abordagens: n }); }} className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Tipo</label>
                                <select value={ab.tipo} onChange={e => { const n = [...formData.abordagens!]; n[idx].tipo = e.target.value as any; setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase">
                                  <option value="">Selecione...</option>
                                  <option>Vítima</option>
                                  <option>Suspeito</option>
                                  <option>Autor</option>
                                  <option>Envolvido</option>
                                </select>
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Nome Completo</label>
                                {/* Fix: Removed property 'envolvidos' as it does not exist on RelatorioRonda type */}
                                <input type="text" placeholder="NOME CIVIL" value={ab.nome} onChange={e => { const n = [...formData.abordagens!]; n[idx].nome = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Alcunha</label>
                                <div className="relative">
                                  <Tag className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                  <input type="text" placeholder="APELIDO" value={ab.alcunha} onChange={e => { const n = [...formData.abordagens!]; n[idx].alcunha = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full pl-7 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Data Nascimento</label>
                                <input type="date" value={ab.nascimento} onChange={e => { const n = [...formData.abordagens!]; n[idx].nascimento = e.target.value; setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Nome da Mãe</label>
                                <input type="text" placeholder="NOME DA MÃE" value={ab.mae} onChange={e => { const n = [...formData.abordagens!]; n[idx].mae = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Matrícula (Opcional)</label>
                                {/* Fix: Removed property 'envolvidos' as it does not exist on RelatorioRonda type */}
                                <input type="text" placeholder="MATRÍCULA" value={ab.matricula} onChange={e => { const n = [...formData.abordagens!]; n[idx].matricula = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">CPF (Automático)</label>
                                {/* Fix: Removed property 'envolvidos' as it does not exist on RelatorioRonda type */}
                                <input type="text" placeholder="000.000.000-00" value={ab.cpf} onChange={e => { const n = [...formData.abordagens!]; n[idx].cpf = formatCPF(e.target.value); setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" maxLength={14} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">RG (Automático)</label>
                                {/* Fix: Removed property 'envolvidos' as it does not exist on RelatorioRonda type */}
                                <input type="text" placeholder="00.000.000-0" value={ab.rg} onChange={e => { const n = [...formData.abordagens!]; n[idx].rg = formatRG(e.target.value); setFormData({ ...formData, abordagens: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" maxLength={12} />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Local Abordagem</label>
                                <div className="relative">
                                  <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input type="text" placeholder="Rua, Bairro..." value={ab.local} onChange={e => { const n = [...formData.abordagens!]; n[idx].local = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full pl-7 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                </div>
                              </div>

                              <div className="md:col-span-3 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Endereço Residencial</label>
                                <div className="relative">
                                  <Home className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                  {/* Fix: Removed property 'envolvidos' as it does not exist on RelatorioRonda type */}
                                  <input type="text" placeholder="Logradouro Completo" value={ab.endereco} onChange={e => { const n = [...formData.abordagens!]; n[idx].endereco = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full pl-7 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                </div>
                              </div>
                              <div className="md:col-span-1 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Imagem/Foto</label>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => document.getElementById(`abordagem-photo-${idx}`)?.click()} className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 border ${ab.foto ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                    <Camera className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase">{ab.foto ? 'Alterar' : 'Capturar'}</span>
                                  </button>
                                  <input id={`abordagem-photo-${idx}`} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleAbordagemPhoto(idx, e)} />
                                  {ab.foto && (
                                    <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                      <img src={ab.foto} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="md:col-span-4 space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Observação Adicional</label>
                                <textarea rows={2} value={ab.observacao} onChange={e => { const n = [...formData.abordagens!]; n[idx].observacao = e.target.value.toUpperCase(); setFormData({ ...formData, abordagens: n }); }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium italic text-slate-700 resize-none outline-none focus:border-emerald-400" placeholder="Relate detalhes da abordagem, itens encontrados, comportamento, etc..." />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {(!formData.abordagens || formData.abordagens.length === 0) && (
                        <div className="p-16 text-center text-slate-300 font-black uppercase tracking-widest italic text-xs">Nenhuma abordagem registrada neste turno.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'veiculos' && (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-900 p-6 flex justify-between items-center border-b-4 border-amber-600">
                      <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Veículos Fiscalizados</h4>
                      <button onClick={addVeiculo} className="px-6 py-2 bg-amber-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-amber-700 transition-all">+ Adicionar Veículo</button>
                    </div>
                    <div className="p-4 space-y-6">
                      {formData.veiculos?.map((ve, idx) => (
                        <div key={ve.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4 animate-in slide-in-from-top-4">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase italic">Registro de Veículo #{idx + 1}</span>
                            <button onClick={() => setFormData({ ...formData, veiculos: formData.veiculos?.filter(v => v.id !== ve.id) })} className="text-red-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Data/Hora</label>
                              <div className="flex gap-2">
                                <input type="date" value={ve.data} onChange={e => { const n = [...formData.veiculos!]; n[idx].data = e.target.value; setFormData({ ...formData, veiculos: n }); }} className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                                <input type="time" value={ve.hora} onChange={e => { const n = [...formData.veiculos!]; n[idx].hora = e.target.value; setFormData({ ...formData, veiculos: n }); }} className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Placa</label>
                              <input type="text" placeholder="ABC-1234" value={ve.placa} onChange={e => { const n = [...formData.veiculos!]; n[idx].placa = formatPlaca(e.target.value); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" maxLength={8} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Renavam</label>
                              <input type="text" placeholder="RENAVAM" value={ve.renavam} onChange={e => { const n = [...formData.veiculos!]; n[idx].renavam = e.target.value.toUpperCase(); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Marca/Modelo</label>
                              <input type="text" placeholder="EX: VW GOL" value={ve.marcaModelo} onChange={e => { const n = [...formData.veiculos!]; n[idx].marcaModelo = e.target.value.toUpperCase(); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Cor</label>
                              <input type="text" placeholder="EX: BRANCO" value={ve.cor} onChange={e => { const n = [...formData.veiculos!]; n[idx].cor = e.target.value.toUpperCase(); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Condutor</label>
                              <input type="text" placeholder="NOME DO CONDUTOR" value={ve.condutor} onChange={e => { const n = [...formData.veiculos!]; n[idx].condutor = e.target.value.toUpperCase(); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">CNH</label>
                              <input type="text" placeholder="N.º CNH" value={ve.cnh} onChange={e => { const n = [...formData.veiculos!]; n[idx].cnh = e.target.value.toUpperCase(); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">CPF (Automático)</label>
                              <input type="text" placeholder="000.000.000-00" value={ve.cpf} onChange={e => { const n = [...formData.veiculos!]; n[idx].cpf = formatCPF(e.target.value); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" maxLength={14} />
                            </div>
                            <div className="md:col-span-1 space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Imagem/Foto</label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => document.getElementById(`veiculo-photo-${idx}`)?.click()} className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 border ${ve.foto ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                  <Camera className="w-4 h-4" />
                                  <span className="text-[9px] font-black uppercase">{ve.foto ? 'Alterar' : 'Capturar'}</span>
                                </button>
                                <input id={`veiculo-photo-${idx}`} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleVeiculoPhoto(idx, e)} />
                                {ve.foto && (
                                  <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    <img src={ve.foto} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Observação</label>
                              <input type="text" placeholder="DETALHES DO VEÍCULO..." value={ve.observacao} onChange={e => { const n = [...formData.veiculos!]; n[idx].observacao = e.target.value.toUpperCase(); setFormData({ ...formData, veiculos: n }); }} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold" />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!formData.veiculos || formData.veiculos.length === 0) && (
                        <div className="p-16 text-center text-slate-300 font-black uppercase tracking-widest italic text-xs">Nenhum veículo fiscalizado neste turno.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'historico' && (
                <div className="space-y-12 animate-in fade-in duration-500">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-inner space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2"><FileText className="w-5 h-5" /> Histórico Resumido (Narrativa Tática)</h4>
                      <button
                        type="button"
                        onClick={handleAIRefineHistory}
                        disabled={isRefining || !formData.historico}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-blue-300 text-[9px] font-black rounded-xl hover:bg-black transition-all disabled:opacity-50 shadow-xl"
                      >
                        {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        MELHORAR COM IA
                      </button>
                    </div>
                    <textarea rows={12} value={formData.historico} onChange={e => setFormData({ ...formData, historico: e.target.value })} className="w-full p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm font-medium italic text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner" placeholder="Relate aqui patrulhamentos, ordens de serviço executadas, apoio a outras instituições..." />
                  </div>

                  <div className="p-10 bg-blue-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between border-b-8 border-blue-950 gap-6">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><Fingerprint className="w-32 h-32" /></div>
                    <div className="flex items-center gap-6 relative z-10">
                      <div className={`p-5 rounded-3xl border-2 transition-all ${formData.assinadoEncarregado ? 'bg-emerald-50 border-white' : 'bg-white/10 border-white/20'}`}><ShieldCheck className={`w-12 h-12 ${formData.assinadoEncarregado ? 'text-white' : 'text-blue-300'}`} /></div>
                      <div>
                        <h5 className="text-xl font-black italic uppercase tracking-tighter">Assinatura do Encarregado</h5>
                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.3em] mt-1">
                          {formData.assinadoEncarregado ? `AUTENTICADO EM ${formData.dataAssinatura}` : 'AGUARDANDO COLETA DIGITAL'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto relative z-10">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, assinadoEncarregado: true, dataAssinatura: new Date().toLocaleString('pt-BR') })}
                        disabled={formData.assinadoEncarregado || !formData.encarregado || !formData.historico}
                        className={`px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.assinadoEncarregado ? 'bg-emerald-50 text-white border border-emerald-400' : 'bg-white text-blue-900 hover:bg-blue-50 active:scale-95 shadow-xl'}`}
                      >
                        {formData.assinadoEncarregado ? '✓ RELATÓRIO ASSINADO' : 'AUTENTICAR REGISTRO'}
                      </button>
                      <p className="text-[8px] text-center text-blue-400 font-black uppercase tracking-widest">Etapa obrigatória para finalização</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-white border-t-4 border-slate-100 flex gap-6 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-white border border-slate-200 text-slate-500 font-black rounded-[2rem] hover:bg-slate-50 transition-all uppercase tracking-[0.2em] text-[11px]">Descartar Alterações</button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formData.assinadoEncarregado}
                className={`flex-1 py-6 font-black rounded-[2rem] shadow-2xl transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 border-b-4 ${formData.assinadoEncarregado ? 'bg-blue-800 text-white hover:bg-blue-900 border-blue-950 shadow-blue-100' : 'bg-slate-100 text-slate-300 border-slate-200 pointer-events-none'}`}
              >
                <CheckCircle2 className="w-6 h-6" /> Finalizar e Arquivar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border-t-8 border-blue-600">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="p-7 bg-white/10 rounded-[2.5rem] border border-white/20 backdrop-blur-md"><Gauge className="w-12 h-12 text-blue-400" /></div>
          <div>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-3">GESTÃO DIGITAL DE RONDAS</h4>
            <p className="text-slate-400 font-medium text-base max-w-2xl leading-relaxed">O sistema sincroniza automaticamente a quilometragem das viaturas e gera o arquivo PDF formatado para impressão oficial.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
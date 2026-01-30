import React, { useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  Calendar,
  Activity,
  PhoneCall,
  FileText,
  Users,
  FileBarChart,
  Filter,
  X,
  ChevronDown,
  Check,
  CalendarDays,
  ArrowRight,
  UserCheck,
  Fuel
} from 'lucide-react';
import { BRASAO_GCM } from '../config/constants';

const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

interface EstatisticasProps {
  systemLogo: string | null;
}

const Estatisticas: React.FC<EstatisticasProps> = ({ systemLogo }) => {

  // Estados de Filtro e UI
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 30 Dias');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  // Estados para o Modal de Geração de Relatório
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriodType, setReportPeriodType] = useState<'preset' | 'custom'>('preset');
  const [selectedReportPreset, setSelectedReportPreset] = useState('Últimos 30 Dias');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Dados de Atendimento 153 (Chamadas por dia)
  const dataCalls = [
    { name: 'Seg', total: 120 },
    { name: 'Ter', total: 145 },
    { name: 'Qua', total: 110 },
    { name: 'Qui', total: 160 },
    { name: 'Sex', total: 195 },
    { name: 'Sab', total: 230 },
    { name: 'Dom', total: 180 },
  ];

  // Quantidade de Boletins de Ocorrência por Equipe
  const dataBoTeams = [
    { name: 'EQUIPE ALFA', value: 85 },
    { name: 'EQUIPE BRAVO', value: 72 },
    { name: 'EQUIPE CHARLIE', value: 64 },
    { name: 'EQUIPE DELTA', value: 48 },
  ];

  // Dados de Abordados por Condição
  const dataAbordados = [
    { name: 'Suspeitos', value: 142 },
    { name: 'Vítimas', value: 88 },
    { name: 'Testemunhas', value: 56 },
    { name: 'Condutores', value: 210 },
  ];

  // Dados de Abastecimento por VTR (Litros)
  const dataAbastecimento = [
    { vtr: 'ROMU-01', litros: 450 },
    { vtr: 'VTR-12', litros: 380 },
    { vtr: 'MOTO-04', litros: 120 },
    { vtr: 'VTR-09', litros: 310 },
    { vtr: 'VTR-15', litros: 260 },
  ];

  const tableData = [
    { region: 'Centro / Comercial', calls: 342, bos: 42, vtrs: 6, status: 'Crítico' },
    { region: 'Zona Norte / Periferia', calls: 215, bos: 28, vtrs: 4, status: 'Estável' },
    { region: 'Zona SUL / Residencial', calls: 188, bos: 19, vtrs: 4, status: 'Estável' },
    { region: 'Distritos / Rural', calls: 94, bos: 12, vtrs: 2, status: 'Calmo' },
  ];

  const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
  const FUEL_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  // Dados consolidados para o Relatório Analítico
  const reportData = {
    porArea: [
      { area: 'CENTRO / COMERCIAL', total: 342, percent: 40.8 },
      { area: 'ZONA NORTE / PERIFERIA', total: 215, percent: 25.6 },
      { area: 'ZONA SUL / RESIDENCIAL', total: 188, percent: 22.4 },
      { area: 'DISTRITOS / RURAL', total: 94, percent: 11.2 },
    ],
    porTipo: [
      { tipo: 'PATRIMONIAL', total: 278, percent: 33.1 },
      { tipo: 'TRÂNSITO', total: 210, percent: 25.0 },
      { tipo: 'APOIO AO CIDADÃO', total: 194, percent: 23.1 },
      { tipo: 'CONTRA A PESSOA', total: 157, percent: 18.8 },
    ],
    abastecimentoVtr: [
      { vtr: 'ROMU-01', litros: 450, percent: 32.1 },
      { vtr: 'VTR-12', litros: 380, percent: 27.1 },
      { vtr: 'VTR-09', litros: 310, percent: 22.1 },
      { vtr: 'VTR-15', litros: 260, percent: 18.7 },
    ],
    totalGeral: 839,
    totalCombustivel: 1400
  };

  const handleGenerateFullReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const finalPeriodDisplay = reportPeriodType === 'preset'
      ? selectedReportPreset
      : `${new Date(customStartDate + 'T12:00:00').toLocaleDateString('pt-BR')} até ${new Date(customEndDate + 'T12:00:00').toLocaleDateString('pt-BR')}`;

    const htmlContent = `
      <html>
        <head>
          <title>Relatório Analítico GCM - ${finalPeriodDisplay}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            @page { size: A4 landscape; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; font-size: 9pt; color: #1e293b; line-height: 1.4; background: #f8fafc; padding: 15pt; }
            
            .header { display: flex; align-items: center; background: white; border-bottom: 3px solid #e2e8f0; padding: 15pt; margin-bottom: 15pt; }
            .header img { width: 50pt; height: 50pt; object-fit: contain; margin-right: 15pt; }
            .header-info h1 { margin: 0; font-size: 14pt; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.3pt; }
            .header-info p { margin: 2pt 0 0 0; font-size: 7.5pt; font-weight: 700; color: #64748b; }
            
            .report-title { text-align: center; margin-bottom: 15pt; background: white; padding: 12pt; border-radius: 8pt; border: 1px solid #e2e8f0; }
            .report-title h2 { margin: 0; font-size: 13pt; font-weight: 900; text-transform: uppercase; color: #1e293b; letter-spacing: -0.2pt; }
            .report-title p { margin: 5pt 0 0 0; font-size: 8pt; font-weight: 700; color: #64748b; }
            
            .section { margin-bottom: 15pt; background: white; border-radius: 8pt; overflow: hidden; border: 1px solid #e2e8f0; }
            .section-header { background: #1e3a8a; color: white; padding: 8pt 12pt; font-weight: 900; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5pt; }
            
            table { width: 100%; border-collapse: collapse; }
            thead { background: #f1f5f9; }
            th { padding: 8pt 10pt; text-align: left; font-size: 7.5pt; font-weight: 900; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; letter-spacing: 0.3pt; }
            td { padding: 8pt 10pt; font-size: 8.5pt; font-weight: 600; border-bottom: 1px solid #f1f5f9; color: #334155; }
            tbody tr:hover { background: #f8fafc; }
            
            .text-center { text-align: center; }
            .bg-highlight { background: #f1f5f9; font-weight: 900; color: #1e293b; }
            
            .summary-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12pt; margin-top: 15pt; padding: 0 15pt 15pt 15pt; }
            .summary-card { background: white; border: 2px solid #e2e8f0; padding: 12pt; border-radius: 8pt; text-align: center; }
            .summary-card p { margin: 0 0 6pt 0; font-size: 7.5pt; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.5pt; }
            .summary-card span { font-size: 18pt; font-weight: 900; color: #1e3a8a; }
            
            .footer { margin-top: 15pt; padding-top: 10pt; border-top: 2px solid #e2e8f0; text-align: center; font-size: 7pt; color: #94a3b8; text-transform: uppercase; background: white; padding: 10pt; border-radius: 8pt; }
            
            @media print {
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
              .section, .report-title, .footer { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${systemLogo || BRASAO_GCM}" />
            <div class="header-info">
              <h1>Guarda Civil Municipal de Capão Bonito</h1>
              <p>Secretaria de Segurança Pública e Mobilidade Urbana</p>
              <p>Departamento de Inteligência e Estatística</p>
            </div>
          </div>
          
          <div class="report-title">
            <h2>Relatório Analítico de Atendimentos e Consumo</h2>
            <p>Período Analisado: ${finalPeriodDisplay}</p>
          </div>
          
          <div class="section">
            <div class="section-header">01. Atendimentos Realizados por Área</div>
            <table>
              <thead>
                <tr><th>Setor / Região</th><th class="text-center">Quantidade Absoluta</th><th class="text-center">Porcentagem (%)</th></tr>
              </thead>
              <tbody>
                ${reportData.porArea.map(item => `<tr><td>${item.area}</td><td class="text-center">${item.total}</td><td class="text-center">${item.percent}%</td></tr>`).join('')}
                <tr class="bg-highlight"><td>TOTAL CONSOLIDADO POR ÁREA</td><td class="text-center">${reportData.totalGeral}</td><td class="text-center">100%</td></tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-header">02. Atendimentos Realizados por Tipo de Ocorrência</div>
            <table>
              <thead>
                <tr><th>Natureza da Ocorrência</th><th class="text-center">Quantidade Absoluta</th><th class="text-center">Porcentagem (%)</th></tr>
              </thead>
              <tbody>
                ${reportData.porTipo.map(item => `<tr><td>${item.tipo}</td><td class="text-center">${item.total}</td><td class="text-center">${item.percent}%</td></tr>`).join('')}
                <tr class="bg-highlight"><td>TOTAL GERAL DE OCORRÊNCIAS</td><td class="text-center">${reportData.totalGeral}</td><td class="text-center">100%</td></tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-header">03. Estatística de Abastecimento por VTR</div>
            <table>
              <thead>
                <tr><th>Prefixo da Viatura</th><th class="text-center">Total Litros (L)</th><th class="text-center">Porcentagem Consumo (%)</th></tr>
              </thead>
              <tbody>
                ${reportData.abastecimentoVtr.map(item => `<tr><td>${item.vtr}</td><td class="text-center">${item.litros} L</td><td class="text-center">${item.percent}%</td></tr>`).join('')}
                <tr class="bg-highlight"><td>TOTAL DE COMBUSTÍVEL CONSUMIDO</td><td class="text-center">${reportData.totalCombustivel} L</td><td class="text-center">100%</td></tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-header">04. Resumo de Atendimentos Realizados</div>
            <div class="summary-box">
              <div class="summary-card"><p>Chamadas 153</p><span>${reportData.totalGeral}</span></div>
              <div class="summary-card"><p>BOs Efetuados</p><span>269</span></div>
              <div class="summary-card"><p>Consumo Total</p><span>${reportData.totalCombustivel} L</span></div>
            </div>
          </div>
          
          <div class="footer">Documento Oficial GCM • Processado por ${CURRENT_USER.name} em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsReportModalOpen(false);
  };

  const filteredData = filterRegion
    ? tableData.filter(d => d.region === filterRegion)
    : tableData;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">PAINEL DE INTELIGÊNCIA</h2>
          <p className="text-slate-500 text-sm font-medium">Análise de Atendimentos 153 e Produtividade BO por Equipe</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <button
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Calendar className="w-4 h-4 text-blue-600" /> {selectedPeriod}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPeriodOpen ? 'rotate-180' : ''}`} />
            </button>
            {isPeriodOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-[120] p-2 animate-in fade-in slide-in-from-top-2">
                {['Hoje', 'Últimos 7 Dias', 'Últimos 30 Dias', 'Este Mês'].map(period => (
                  <button
                    key={period}
                    onClick={() => { setSelectedPeriod(period); setIsPeriodOpen(false); }}
                    className={`w-full text-left p-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-between ${selectedPeriod === period ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {period} {selectedPeriod === period && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all border-b-4 border-emerald-900 active:scale-95"
          >
            <FileBarChart className="w-4 h-4" /> Gerar Relatório Completo
          </button>
        </div>
      </div>

      {/* Modal de Seleção de Período do Relatório */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-emerald-800">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Configurar Relatório</h3>
                  <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-[0.4em] mt-1">Seleção de Período Analítico</p>
                </div>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white"><X className="w-7 h-7" /></button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setReportPeriodType('preset')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportPeriodType === 'preset' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Períodos Fixos
                  </button>
                  <button
                    onClick={() => setReportPeriodType('custom')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportPeriodType === 'custom' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Personalizado
                  </button>
                </div>

                {reportPeriodType === 'preset' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {['Hoje', 'Últimos 7 Dias', 'Últimos 30 Dias', 'Este Mês', 'Este Ano'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => setSelectedReportPreset(preset)}
                        className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all flex items-center justify-between ${selectedReportPreset === preset ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'}`}
                      >
                        {preset} {selectedReportPreset === preset && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                    <div className="flex justify-center"><ArrowRight className="text-slate-200 rotate-90 sm:rotate-0" /></div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Término</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerateFullReport}
                disabled={reportPeriodType === 'custom' && (!customStartDate || !customEndDate)}
                className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-emerald-900 active:scale-95 disabled:opacity-50"
              >
                <FileBarChart className="w-5 h-5" /> Processar e Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atendimentos 153 */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><PhoneCall className="w-5 h-5 text-blue-600" /></div>
              Volume de Atendimentos (153)
            </h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">+18% vs anterior</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataCalls}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke="#1e40af" strokeWidth={4} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Boletim por Equipe */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            B.O. Registrados por Equipe
          </h3>
          <div className="h-80 w-full flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataBoTeams}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {dataBoTeams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full md:w-56 space-y-3">
              {dataBoTeams.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.name}</span>
                  </div>
                  <span className="font-black text-slate-800 text-sm">{item.value} <span className="text-[10px] text-slate-400 font-bold">BOs</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ESTATÍSTICA DE ABORDADOS */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg"><UserCheck className="w-5 h-5 text-indigo-600" /></div>
            Perfil de Integrantes Abordados
          </h3>
          <div className="h-80 w-full flex flex-col md:flex-row items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataAbordados}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataAbordados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full md:w-56 space-y-2">
              {dataAbordados.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 1) % COLORS.length] }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.name}</span>
                  </div>
                  <span className="font-black text-slate-800 text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ESTATÍSTICA DE ABASTECIMENTO */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg"><Fuel className="w-5 h-5 text-emerald-600" /></div>
            Consumo de Combustível por VTR (Litros)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataAbastecimento} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="vtr" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="litros" radius={[8, 8, 0, 0]} barSize={40}>
                  {dataAbastecimento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FUEL_COLORS[index % FUEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Produtividade (Ativado Filtro de Região) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-800" />
            <h3 className="font-black text-slate-800 uppercase tracking-tight">Produtividade por Setor Operacional</h3>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`text-blue-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all border ${isFilterOpen || filterRegion ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'} active:scale-95`}
            >
              <Filter className="w-4 h-4" /> {filterRegion ? `Filtrando: ${filterRegion}` : 'Filtrar Região'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-[110] p-2 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => { setFilterRegion(null); setIsFilterOpen(false); }}
                  className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase flex items-center justify-between border-b border-slate-50 mb-1"
                >
                  Exibir Todas <X className="w-3 h-3" />
                </button>
                {tableData.map(d => (
                  <button
                    key={d.region}
                    onClick={() => { setFilterRegion(d.region); setIsFilterOpen(false); }}
                    className={`w-full text-left p-3 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase flex items-center justify-between ${filterRegion === d.region ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}
                  >
                    {d.region} {filterRegion === d.region && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Setor / Região</th>
                <th className="px-8 py-6 text-center">Atendimentos 153</th>
                <th className="px-8 py-6 text-center">Boletins (BO)</th>
                <th className="px-8 py-6 text-center">VTRs Alocadas</th>
                <th className="px-8 py-6">Status Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhuma região encontrada com os filtros atuais.</td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 uppercase italic tracking-tighter text-base">{row.region}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-blue-800 text-lg">{row.calls}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-slate-700 text-lg">{row.bos}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-slate-300" />
                        <span className="font-black text-slate-500 text-base">{row.vtrs}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'Crítico' ? 'bg-red-500 animate-pulse ring-4 ring-red-100' :
                          row.status === 'Estável' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}></div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${row.status === 'Crítico' ? 'text-red-600' :
                          row.status === 'Estável' ? 'text-blue-600' : 'text-emerald-600'
                          }`}>{row.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Estatisticas;
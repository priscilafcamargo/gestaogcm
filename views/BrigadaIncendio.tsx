
import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  Plus, 
  History,
  TrendingUp,
  Save,
  Trash2,
  CheckCircle2,
  Info,
  FileText,
  Printer,
  X,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface FireHourLog {
  id: string;
  gcmNome: string;
  data: string;
  horasTrabalhadas: number; // No caso de fruição, são as horas efetivamente retiradas
  horasCreditadas: number;   // Valor líquido (+ para empenho, - para fruição)
  local: string;
  tipo: 'Empenho' | 'Fruição';
}

const BRASAO_URL = "https://raw.githubusercontent.com/pmcb/gcm-assets/main/brasao.png";
const STAFF_NAMES = ["SANTOS", "SILVA", "MELO", "FERREIRA", "OLIVEIRA", "COSTA", "FERRAZ", "RICARDO", "SOUZA", "PEDRO"];

interface BrigadaIncendioProps {
  systemLogo: string | null;
}

const BrigadaIncendio: React.FC<BrigadaIncendioProps> = ({ systemLogo }) => {
  const [logs, setLogs] = useState<FireHourLog[]>([
    { id: '1', gcmNome: 'SANTOS', data: '2024-10-22', horasTrabalhadas: 2, horasCreditadas: 6, local: 'INCÊNDIO EM MATA - JD. BRASIL', tipo: 'Empenho' },
    { id: '2', gcmNome: 'MELO', data: '2024-10-21', horasTrabalhadas: 1.5, horasCreditadas: 4.5, local: 'APOIO À BRIGADA - DISTRITO', tipo: 'Empenho' },
    { id: '3', gcmNome: 'SANTOS', data: '2024-10-25', horasTrabalhadas: 4, horasCreditadas: 4, local: 'COMPENSAÇÃO DE HORAS (BANCO)', tipo: 'Fruição' },
  ]);

  const [selectedGCMForReport, setSelectedGCMForReport] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    gcmNome: '',
    data: new Date().toISOString().split('T')[0],
    horas: '',
    local: '',
    tipo: 'Empenho' as 'Empenho' | 'Fruição'
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gcmNome || !form.horas || !form.local) return;

    const horasInformadas = parseFloat(form.horas);
    // Se for empenho, multiplica por 3. Se for fruição, o valor é 1:1.
    const valorLiquido = form.tipo === 'Empenho' ? horasInformadas * 3 : horasInformadas;

    const newLog: FireHourLog = {
      id: Math.random().toString(36).substr(2, 9),
      gcmNome: form.gcmNome,
      data: form.data,
      horasTrabalhadas: horasInformadas,
      horasCreditadas: valorLiquido,
      local: form.local.toUpperCase(),
      tipo: form.tipo
    };

    setLogs([newLog, ...logs]);
    setForm({ ...form, horas: '', local: '', tipo: 'Empenho' });
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setLogs(logs.filter(l => l.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const calculateGCMStats = (nome: string) => {
    const gcmLogs = logs.filter(l => l.gcmNome === nome);
    const creditos = gcmLogs.filter(l => l.tipo === 'Empenho').reduce((acc, curr) => acc + curr.horasCreditadas, 0);
    const fruicoes = gcmLogs.filter(l => l.tipo === 'Fruição').reduce((acc, curr) => acc + curr.horasCreditadas, 0);
    return { creditos, fruicoes, saldo: creditos - fruicoes };
  };

  const handlePrintIndividual = () => {
    if (!selectedGCMForReport) return;
    const gcmLogs = logs.filter(l => l.gcmNome === selectedGCMForReport);
    const stats = calculateGCMStats(selectedGCMForReport);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Extrato Brigada - GCM ${selectedGCMForReport}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; line-height: 1.2; }
            .header { display: flex; align-items: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { width: 70px; height: 70px; object-fit: contain; margin-right: 20px; }
            .header-text h1 { margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; }
            .title-box { text-align: center; margin-bottom: 25px; border: 1px solid #000; padding: 10px; background: #f1f5f9; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { border: 1px solid #000; padding: 6px; font-size: 9px; text-transform: uppercase; background: #e2e8f0; font-weight: 900; }
            td { border: 1px solid #000; padding: 6px; font-size: 10px; text-align: center; font-weight: 700; }
            .summary { margin-top: 20px; text-align: right; border-top: 2px solid #000; padding-top: 10px; }
            .summary p { margin: 2px 0; font-size: 11px; font-weight: 900; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${systemLogo || BRASAO_URL}" class="logo" />
            <div class="header-text">
              <h1>GUARDA CIVIL MUNICIPAL</h1>
              <p>CAPÃO BONITO - DIVISÃO DE BRIGADA (MOVIMENTAÇÃO DE HORAS)</p>
            </div>
          </div>
          <div class="title-box">
            <h2>Extrato Analítico: GCM ${selectedGCMForReport}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição / Local</th>
                <th>Tipo</th>
                <th>H. Informada</th>
                <th>Movimentação</th>
              </tr>
            </thead>
            <tbody>
              ${gcmLogs.map(l => `
                <tr>
                  <td>${new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td style="text-align: left;">${l.local}</td>
                  <td>${l.tipo.toUpperCase()}</td>
                  <td>${l.horasTrabalhadas}h</td>
                  <td class="${l.tipo === 'Empenho' ? 'positive' : 'negative'}">${l.tipo === 'Empenho' ? '+' : '-'}${l.horasCreditadas}h</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <p>TOTAL ACUMULADO (3:1): <span class="positive">+${stats.creditos}h</span></p>
            <p>TOTAL COMPENSADO: <span class="negative">-${stats.fruicoes}h</span></p>
            <p style="font-size: 18px; margin-top: 10px;">SALDO ATUAL DISPONÍVEL: ${stats.saldo}h</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const totalCreditosGeral = logs.filter(l => l.tipo === 'Empenho').reduce((acc, curr) => acc + curr.horasCreditadas, 0);
  const totalCompensadoGeral = logs.filter(l => l.tipo === 'Fruição').reduce((acc, curr) => acc + curr.horasCreditadas, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-10">
      {/* Header Compacto com Saldo Consolidado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <Flame className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Brigada (3:1)</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Créditos e Compensações</p>
          </div>
        </div>
        <div className="flex gap-3">
           <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
              <TrendingUp className="text-emerald-600 w-4 h-4" />
              <div>
                 <p className="text-[9px] font-black text-emerald-800 uppercase leading-none mb-1">Saldo Líquido</p>
                 <p className="text-lg font-black text-emerald-700 leading-none">{totalCreditosGeral - totalCompensadoGeral}h</p>
              </div>
           </div>
           <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
              <ArrowDownRight className="text-red-600 w-4 h-4" />
              <div>
                 <p className="text-[9px] font-black text-red-800 uppercase leading-none mb-1">Compensado</p>
                 <p className="text-lg font-black text-red-700 leading-none">{totalCompensadoGeral}h</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-3 h-3 text-red-500" /> Movimentação
              </h3>
            </div>
            
            <form onSubmit={handleAddLog} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Natureza do Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     type="button" 
                     onClick={() => setForm({...form, tipo: 'Empenho'})}
                     className={`py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${form.tipo === 'Empenho' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}
                   >
                     Empenho (3x)
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setForm({...form, tipo: 'Fruição'})}
                     className={`py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${form.tipo === 'Fruição' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}
                   >
                     Compensar
                   </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Integrante GCM</label>
                <select 
                  required
                  value={form.gcmNome}
                  onChange={(e) => setForm({...form, gcmNome: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none focus:border-red-500 transition-all text-xs appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {STAFF_NAMES.map(name => <option key={name} value={name}>GCM {name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data</label>
                  <input required type="date" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold outline-none text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Horas</label>
                  <input required type="number" step="0.5" placeholder="2.0" value={form.horas} onChange={(e) => setForm({...form, horas: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-black outline-none focus:border-red-500 transition-all text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Justificativa / Local</label>
                <input 
                  required
                  type="text"
                  value={form.local}
                  onChange={(e) => setForm({...form, local: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold outline-none focus:border-red-500 transition-all text-xs italic"
                  placeholder={form.tipo === 'Empenho' ? "EX: INCÊNDIO JD. BRASIL" : "EX: COMPENSAÇÃO DE BANCO"}
                />
              </div>

              {form.horas && form.tipo === 'Empenho' && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between animate-in zoom-in-95">
                  <span className="text-[9px] font-black text-emerald-800 uppercase">Crédito (3:1):</span>
                  <span className="text-base font-black text-emerald-600">{(parseFloat(form.horas) * 3).toFixed(1)}h</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`w-full py-3.5 text-white font-black rounded-xl shadow-lg transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border-b-2 ${form.tipo === 'Empenho' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-900' : 'bg-red-600 hover:bg-red-700 border-red-900'}`}
              >
                <Save className="w-3.5 h-3.5" /> {form.tipo === 'Empenho' ? 'Confirmar Empenho' : 'Lançar Compensação'}
              </button>
            </form>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
             <Info className="w-4 h-4 text-blue-500 shrink-0" />
             <p className="text-[9px] text-blue-700 font-bold uppercase italic leading-tight">
               Regra: O empenho gera crédito triplo. A fruição desconta o valor nominal do saldo triplicado.
             </p>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
               <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Registro Geral de Movimentações</h3>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">GCM</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Descrição / Motivo</th>
                    <th className="px-6 py-3 text-center">Movimentação</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-2.5">
                        <button 
                          onClick={() => setSelectedGCMForReport(log.gcmNome)}
                          className="font-black text-slate-800 text-xs uppercase hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          GCM {log.gcmNome} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="px-6 py-2.5">
                        <p className="text-[10px] font-bold text-slate-500">{new Date(log.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      </td>
                      <td className="px-6 py-2.5">
                        <p className="text-[10px] font-medium text-slate-600 italic truncate max-w-[220px]">"{log.local}"</p>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <span className={`font-black text-xs px-2 py-0.5 rounded-lg border flex items-center justify-center gap-1 w-20 mx-auto ${
                          log.tipo === 'Empenho' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {log.tipo === 'Empenho' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {log.tipo === 'Empenho' ? '+' : '-'}{log.horasCreditadas}h
                        </span>
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedGCMForReport(log.gcmNome)}
                            className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Extrato Individual"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(log.id); }}
                            className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-auto p-4 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado com Banco de Horas Digital</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Relatório Individual */}
      {selectedGCMForReport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b-4 border-blue-900">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-3xl">
                       <UserCheck className="w-10 h-10 text-blue-300" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter">Controle de Horas: Brigada</h3>
                       <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.4em] mt-1">GCM {selectedGCMForReport} • Extrato de Movimentação</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={handlePrintIndividual} className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">
                       <Printer className="w-4 h-4" /> Imprimir
                    </button>
                    <button onClick={() => setSelectedGCMForReport(null)} className="p-4 hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8" /></button>
                 </div>
              </div>

              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] flex flex-col justify-center shadow-sm">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Saldo Líquido</p>
                       <p className="text-6xl font-black text-blue-900 tracking-tighter">
                         {calculateGCMStats(selectedGCMForReport).saldo}h
                       </p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase mt-4 italic">Total pronto para compensação.</p>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-inner">
                       <div className="p-6 border-b border-slate-200 bg-white/50 flex justify-between items-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico Completo do Integrante</p>
                          <div className="flex gap-4">
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[8px] font-black text-slate-400 uppercase">Crédito</span></div>
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[8px] font-black text-slate-400 uppercase">Fruição</span></div>
                          </div>
                       </div>
                       <table className="w-full border-collapse">
                          <thead className="bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                             <tr>
                                <th className="p-4 text-left">Data</th>
                                <th className="p-4 text-left">Natureza</th>
                                <th className="p-4">H. Real</th>
                                <th className="p-4">Liquido</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white text-[11px] font-bold text-slate-700 uppercase">
                             {logs.filter(l => l.gcmNome === selectedGCMForReport).map(log => (
                                <tr key={log.id}>
                                   <td className="p-4 font-mono">{new Date(log.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                   <td className="p-4 text-left italic text-slate-500 truncate max-w-[180px]">"{log.local}"</td>
                                   <td className="p-4">{log.horasTrabalhadas}h</td>
                                   <td className={`p-4 font-black ${log.tipo === 'Empenho' ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {log.tipo === 'Empenho' ? '+' : '-'}{log.horasCreditadas}h
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                    <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                       <p className="text-xs font-bold text-amber-900 uppercase tracking-tight mb-1">Aviso Operacional de Compensação</p>
                       <p className="text-[10px] text-amber-700 leading-relaxed italic">
                          Toda fruição (retirada de horas) deve ser previamente autorizada pelo Comando ou Encarregado de Equipe. O lançamento de compensação neste módulo debita automaticamente do saldo triplicado da brigada.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">GCM-CAPÃO BONITO • DIVISÃO DE RECURSOS HUMANOS E BRIGADA</p>
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
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirmar Exclusão?</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                O registro de horas da brigada será removido permanentemente.
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

export default BrigadaIncendio;

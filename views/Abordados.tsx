
import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  ChevronRight,
  X,
  User,
  Calendar,
  MapPin,
  FileText,
  Smartphone,
  Eye,
  Printer,
  Shield,
  Tag,
  AlertTriangle,
  History,
  FileBarChart,
  ArrowRight,
  Fingerprint,
  Camera
} from 'lucide-react';
import { RelatorioRonda } from '../types';

const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

interface Abordado {
  id: string;
  nome: string;
  alcunha: string;
  data: string;
  hora: string;
  local: string;
  tipo: 'Suspeito' | 'Autor' | 'Vítima' | 'Testemunha' | 'Envolvido' | string;
  rg: string;
  cpf: string;
  nascimento: string;
  mae: string;
  matricula: string;
  endereco: string;
  observacao: string;
  relatorioVinculado: string;
  vtr: string;
  foto?: string;
}

interface AbordadosProps {
  relatorios: RelatorioRonda[];
}

const Abordados: React.FC<AbordadosProps> = ({ relatorios }) => {
  // Consolidar todos os abordados de todos os relatórios operacionais
  const abordadosConsolidados: Abordado[] = useMemo(() => {
    const list: Abordado[] = [];
    relatorios.forEach(rel => {
      if (rel.abordagens) {
        rel.abordagens.forEach(ab => {
          list.push({
            id: ab.id,
            nome: ab.nome,
            alcunha: ab.alcunha,
            data: rel.data, // Pega a data do relatório
            hora: ab.hora,
            local: ab.local || 'NÃO INFORMADO',
            tipo: ab.tipo || 'Suspeito',
            rg: ab.rg,
            cpf: ab.cpf,
            nascimento: ab.nascimento,
            mae: ab.mae,
            matricula: ab.matricula,
            endereco: ab.endereco,
            observacao: ab.observacao,
            relatorioVinculado: rel.id,
            vtr: rel.numeroVtr,
            foto: ab.foto
          });
        });
      }
    });
    return list.sort((a, b) => b.data.localeCompare(a.data));
  }, [relatorios]);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAbordado, setSelectedAbordado] = useState<Abordado | null>(null);

  const filteredAbordados = abordadosConsolidados.filter(a => {
    const matchesSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.alcunha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf.includes(searchTerm) ||
      a.rg.includes(searchTerm) ||
      a.matricula?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = (!startDate || a.data >= startDate) && (!endDate || a.data <= endDate);

    return matchesSearch && matchesDate;
  });

  const handlePrintDateReport = () => {
    if (filteredAbordados.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const periodStr = startDate && endDate
      ? `Período: ${new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}`
      : 'Relatório Geral de Abordados';

    const htmlContent = `
      <html>
        <head>
          <title>Relatório de Abordados - GCM</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #000; font-size: 10px; }
            .header { border-bottom: 2px solid #1e3a8a; margin-bottom: 20px; padding-bottom: 10px; text-align: center; }
            .title { font-size: 16px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; }
            .period { font-size: 11px; font-weight: 700; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; border: 1px solid #000; padding: 6px; font-size: 9px; font-weight: 900; text-transform: uppercase; }
            td { border: 1px solid #000; padding: 6px; font-weight: 600; font-size: 8px; }
            .footer { margin-top: 30px; text-align: center; font-size: 8px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Relatório Consolidado de Pessoas Abordadas</div>
            <div class="period">${periodStr}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome / Alcunha</th>
                <th>Matrícula / RG / CPF</th>
                <th>Tipo</th>
                <th>Local</th>
                <th>VTR</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAbordados.map(a => `
                <tr>
                  <td style="text-align:center">${new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td>${a.nome}<br><small>(${a.alcunha || '---'})</small></td>
                  <td>MAT: ${a.matricula || '---'}<br>RG: ${a.rg}<br>CPF: ${a.cpf}</td>
                  <td style="text-align:center">${a.tipo}</td>
                  <td>${a.local}</td>
                  <td style="text-align:center">${a.vtr}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Gerado via Sistema GCM em ${new Date().toLocaleString('pt-BR')} por ${CURRENT_USER.name}</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintIndividual = (a: Abordado) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Ficha de Abordagem - ${a.nome}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; line-height: 1.5; font-size: 11px; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
            .title { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #1e3a8a; }
            .section { margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
            .section-title { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 5px; border-bottom: 1px solid #eee; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .label { font-weight: 800; font-size: 8px; color: #666; text-transform: uppercase; }
            .value { font-weight: 700; font-size: 11px; color: #000; }
            .full-width { grid-column: span 2; }
            .photo-box { width: 120px; height: 160px; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .footer { margin-top: 50px; text-align: center; font-size: 8px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
             <div class="title">Ficha de Identificação de Abordado</div>
             <div style="font-weight: 900;">ID: ${a.id}</div>
          </div>

          ${a.foto ? `<div class="photo-box"><img src="${a.foto}" /></div>` : ''}

          <div class="section">
             <div class="section-title">Dados Pessoais</div>
             <div class="grid">
                <div class="full-width"><span class="label">Nome Completo:</span><br><span class="value">${a.nome}</span></div>
                <div><span class="label">Alcunha:</span><br><span class="value">${a.alcunha || '---'}</span></div>
                <div><span class="label">Matrícula:</span><br><span class="value">${a.matricula || '---'}</span></div>
                <div><span class="label">Data Nasc:</span><br><span class="value">${a.nascimento ? new Date(a.nascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</span></div>
                <div><span class="label">CPF:</span><br><span class="value">${a.cpf}</span></div>
                <div><span class="label">RG:</span><br><span class="value">${a.rg}</span></div>
                <div class="full-width"><span class="label">Nome da Mãe:</span><br><span class="value">${a.mae}</span></div>
                <div class="full-width"><span class="label">Endereço:</span><br><span class="value">${a.endereco}</span></div>
             </div>
          </div>
          <div class="section">
             <div class="section-title">Dados da Abordagem</div>
             <div class="grid">
                <div><span class="label">Data/Hora:</span><br><span class="value">${new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')} às ${a.hora}</span></div>
                <div><span class="label">Local:</span><br><span class="value">${a.local}</span></div>
                <div><span class="label">Condição:</span><br><span class="value">${a.tipo.toUpperCase()}</span></div>
                <div><span class="label">Viatura:</span><br><span class="value">${a.vtr}</span></div>
             </div>
          </div>
          <div class="section">
             <div class="section-title">Narrativa Operacional</div>
             <p style="font-style: italic;">"${a.observacao}"</p>
          </div>
          <div class="footer">Gerado via Sistema GCM Capão Bonito SP em ${new Date().toLocaleString('pt-BR')}</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Pessoas Abordadas</h2>
          <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-1">
            <UserCheck className="w-4 h-4 text-blue-800" /> Histórico Centralizado de Identificações em Campo
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-2 px-2 border-r border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-slate-600"
              />
            </div>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-2 px-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-slate-600"
              />
            </div>
          </div>

          <button
            onClick={handlePrintDateReport}
            className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg active:scale-95 whitespace-nowrap border-b-4 border-blue-950"
          >
            <FileBarChart className="w-4 h-4" /> Gerar Relatório por Data
          </button>

          <div className="relative group w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all text-xs font-bold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAbordados.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <User className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum registro encontrado para esta pesquisa/período.</p>
          </div>
        ) : (
          filteredAbordados.map((a) => (
            <div
              key={a.id}
              className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer group gap-4"
              onClick={() => setSelectedAbordado(a)}
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors shrink-0 overflow-hidden">
                  {a.foto ? (
                    <img src={a.foto} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight truncate">{a.nome}</h4>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0 ${a.tipo === 'Autor' ? 'bg-red-50 text-red-600 border-red-100' :
                        a.tipo === 'Vítima' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                      {a.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Vulgo: <span className="text-slate-600 font-bold">{a.alcunha || 'NÃO INFORMADO'}</span> •
                    Data: <span className="text-slate-600 font-bold">{new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <div className="text-right hidden sm:block mr-4">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Matrícula</p>
                  <p className="text-xs font-black text-slate-500 uppercase">{a.matricula || '---'}</p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handlePrintIndividual(a); }}
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all border border-transparent hover:border-blue-100"
                  title="Imprimir Ficha Individual"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAbordado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#f8fafc] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Consulta de Abordado</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">GCM de Capão Bonito SP</p>
                </div>
              </div>
              <button onClick={() => setSelectedAbordado(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">

              {/* Card Fotográfico e de Matrícula */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {selectedAbordado.foto ? (
                  <div className="w-full md:w-48 h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl shrink-0">
                    <img src={selectedAbordado.foto} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-64 rounded-3xl bg-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 border-4 border-white shadow-lg">
                    <Camera className="w-12 h-12 mb-2" />
                    <span className="text-[10px] font-black uppercase">Sem Fotografia</span>
                  </div>
                )}

                <div className="flex-1 space-y-6 py-2">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Matrícula (Sistema)</p>
                    <p className="text-xl font-black text-blue-900 uppercase tracking-widest">{selectedAbordado.matricula || 'NÃO REGISTRADA'}</p>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight uppercase">{selectedAbordado.nome}</h4>
                    {selectedAbordado.alcunha && (
                      <span className="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-black text-[10px] uppercase border border-amber-100">
                        Vulgo: "${selectedAbordado.alcunha}"
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Principal de Identidade */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase">CPF</p><p className="text-sm font-bold text-slate-700">{selectedAbordado.cpf}</p></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase">RG</p><p className="text-sm font-bold text-slate-700">{selectedAbordado.rg}</p></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase">Data Nasc.</p><p className="text-sm font-bold text-slate-700">{selectedAbordado.nascimento ? new Date(selectedAbordado.nascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p></div>
                  <div className="col-span-2 md:col-span-3"><p className="text-[9px] font-black text-slate-400 uppercase">Nome da Mãe</p><p className="text-sm font-bold text-slate-700 uppercase">{selectedAbordado.mae}</p></div>
                  <div className="col-span-2 md:col-span-3"><p className="text-[9px] font-black text-slate-400 uppercase">Endereço Residencial</p><p className="text-sm font-bold text-slate-700 uppercase">{selectedAbordado.endereco}</p></div>
                </div>
              </div>

              {/* Histórico da Ocorrência */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4" /> Detalhes da Abordagem
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Data/Hora</p>
                    <p className="text-sm font-bold text-slate-800">{new Date(selectedAbordado.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedAbordado.hora}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Viatura / Equipe</p>
                    <p className="text-sm font-bold text-slate-800">{selectedAbordado.vtr}</p>
                  </div>
                </div>
                <div className="p-6 bg-blue-900 rounded-[2rem] text-white">
                  <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-3">Relato do Agente</p>
                  <p className="text-sm font-medium italic leading-relaxed">"{selectedAbordado.observacao}"</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-800 font-medium leading-relaxed italic">
                  Informações extraídas do Relatório Operacional <span className="font-bold">{selectedAbordado.relatorioVinculado}</span>. Em caso de divergência, consulte o documento original assinado digitalmente pelo encarregado.
                </p>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex gap-4 shrink-0">
              <button
                onClick={() => handlePrintIndividual(selectedAbordado)}
                className="flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 active:scale-95"
              >
                <Printer className="w-5 h-5" /> Imprimir Ficha
              </button>
              <button
                onClick={() => setSelectedAbordado(null)}
                className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]"
              >
                Fechar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-t-8 border-blue-600">
        <div className="absolute top-0 right-0 p-12 opacity-5"><History className="w-48 h-48" /></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white/10 rounded-[2.5rem] border border-white/20">
            <UserCheck className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">Banco de Dados de Abordagens</h4>
            <p className="text-slate-400 font-medium text-sm max-w-xl leading-relaxed">
              Esta ferramenta centraliza todas as qualificações realizadas em patrulhamento diário. A busca por CPF, RG ou Matrícula permite identificar indivíduos com passagens anteriores por equipes da <span className="text-blue-400 font-bold">GCM Capão Bonito</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Abordados;

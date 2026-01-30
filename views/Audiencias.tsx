import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, Trash2, X, Calendar, User, FileText, Scale, Printer, ExternalLink, AlertCircle } from 'lucide-react';
import { Audiencia, Funcionario, RelatorioRonda } from '../types';

const CURRENT_USER = { name: "GCM Ferraz", role: "ADMIN" };

interface AudienciasProps {
    audiencias: Audiencia[];
    setAudiencias: React.Dispatch<React.SetStateAction<Audiencia[]>>;
    staff: Funcionario[];
    relatorios: RelatorioRonda[];
    onNavigate?: (module: string) => void;
}

const Audiencias: React.FC<AudienciasProps> = ({ audiencias, setAudiencias, staff, relatorios, onNavigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
    const [selectedAudiencia, setSelectedAudiencia] = useState<Audiencia | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ tipo: 'Todos' });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const initialFormState: Omit<Audiencia, 'id'> = {
        gcmId: '',
        gcmNome: '',
        dataAudiencia: '',
        tipo: 'Testemunha',
        autuante: '',
        dataFato: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleOpenCreate = () => {
        setModalMode('create');
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const handleOpenView = (audiencia: Audiencia) => {
        setSelectedAudiencia(audiencia);
        setFormData(audiencia);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (audiencia: Audiencia) => {
        setSelectedAudiencia(audiencia);
        setFormData(audiencia);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setAudiencias(audiencias.filter(a => a.id !== id));
        setDeleteConfirmId(null);
    };

    const handleSubmit = () => {
        if (!formData.gcmId || !formData.dataAudiencia || !formData.autuante) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        const selectedGCM = staff.find(s => s.id === formData.gcmId);
        if (!selectedGCM) {
            alert('GCM não encontrado!');
            return;
        }

        if (modalMode === 'create') {
            const newAudiencia: Audiencia = {
                ...formData,
                gcmNome: selectedGCM.nome,
                id: Date.now().toString()
            };
            setAudiencias([...audiencias, newAudiencia]);
        } else if (modalMode === 'edit' && selectedAudiencia) {
            setAudiencias(audiencias.map(a =>
                a.id === selectedAudiencia.id
                    ? { ...formData, id: a.id, gcmNome: selectedGCM.nome }
                    : a
            ));
        }
        setIsModalOpen(false);
    };

    const filteredAudiencias = audiencias
        .filter(audiencia => {
            const matchesSearch =
                audiencia.gcmNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                audiencia.autuante.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTipo = activeFilters.tipo === 'Todos' || audiencia.tipo === activeFilters.tipo;
            return matchesSearch && matchesTipo;
        })
        .sort((a, b) => new Date(a.dataAudiencia).getTime() - new Date(b.dataAudiencia).getTime());

    const isReadOnly = modalMode === 'view';

    // Find reports matching the incident date
    const findReportByDate = (dataFato?: string) => {
        if (!dataFato) return null;
        return relatorios.find(r => r.data === dataFato);
    };

    const handleNavigateToReport = (dataFato?: string) => {
        if (dataFato && onNavigate) {
            // Store the date to filter/highlight in the reports module
            sessionStorage.setItem('selectedReportDate', dataFato);
            onNavigate('relatorio');
        }
    };

    const getTipoBadgeColor = (tipo: string) => {
        const colors = {
            'Testemunha': 'bg-blue-100 text-blue-700 border-blue-200',
            'Condutor': 'bg-purple-100 text-purple-700 border-purple-200',
            'Vítima': 'bg-green-100 text-green-700 border-green-200',
            'Autor': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Controle de Audiências</h2>
                    <p className="text-slate-500 text-sm font-medium">Gerenciamento de audiências dos integrantes da GCM</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 text-xs uppercase tracking-widest border-b-4 border-blue-800">
                        <Plus className="w-4 h-4" /> Nova Audiência
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filtrar por nome do GCM ou autuante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-5 py-3 rounded-xl border transition-all shadow-sm flex items-center gap-3 ${showFilters ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest'}`}
                    >
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                </div>

                {showFilters && (
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Tipo de Participação</label>
                                <select
                                    value={activeFilters.tipo}
                                    onChange={(e) => setActiveFilters({ ...activeFilters, tipo: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold"
                                >
                                    <option value="Todos">Todos os Tipos</option>
                                    <option value="Testemunha">Testemunha</option>
                                    <option value="Condutor">Condutor</option>
                                    <option value="Vítima">Vítima</option>
                                    <option value="Autor">Autor</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setActiveFilters({ tipo: 'Todos' })}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Integrante</th>
                                <th className="px-8 py-5">Data/Hora</th>
                                <th className="px-8 py-5">Tipo</th>
                                <th className="px-8 py-5">Autuante</th>
                                <th className="px-8 py-5">Data do Fato</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAudiencias.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm">
                                        <Scale className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-bold">Nenhuma audiência cadastrada</p>
                                        <p className="text-xs mt-1">Clique em "Nova Audiência" para começar</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAudiencias.map((audiencia) => (
                                    <tr key={audiencia.id} className="hover:bg-blue-50/20 transition-all group animate-in fade-in duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                                    {audiencia.gcmNome.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{audiencia.gcmNome}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-700 text-sm">
                                                {new Date(audiencia.dataAudiencia).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${getTipoBadgeColor(audiencia.tipo)}`}>
                                                {audiencia.tipo}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-700 text-sm">{audiencia.autuante}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            {audiencia.dataFato ? (
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-700 text-sm">
                                                        {new Date(audiencia.dataFato + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                    </p>
                                                    {findReportByDate(audiencia.dataFato) ? (
                                                        <button
                                                            onClick={() => handleNavigateToReport(audiencia.dataFato)}
                                                            className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all text-blue-600"
                                                            title="Ver Relatório Operacional"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-slate-300" title="Sem relatório nesta data" />
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Não informada</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenView(audiencia)} className="p-2 hover:bg-blue-50 rounded-xl transition-all text-blue-600" title="Visualizar">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenEdit(audiencia)} className="p-2 hover:bg-amber-50 rounded-xl transition-all text-amber-600" title="Editar">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {deleteConfirmId === audiencia.id ? (
                                                    <div className="flex items-center gap-1 bg-red-50 rounded-xl p-1">
                                                        <button onClick={() => handleDelete(audiencia.id)} className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-bold">Confirmar</button>
                                                        <button onClick={() => setDeleteConfirmId(null)} className="p-1 hover:bg-red-100 rounded-lg">
                                                            <X className="w-3 h-3 text-red-600" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setDeleteConfirmId(audiencia.id)} className="p-2 hover:bg-red-50 rounded-xl transition-all text-red-600" title="Excluir">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-8 animate-in fade-in duration-1000">
                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-3xl max-h-[95vh] overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-1000 ease-in-out flex flex-col">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <Scale className="w-6 h-6" />
                                <h3 className="text-xl font-black uppercase tracking-tight">
                                    {modalMode === 'create' ? 'Nova Audiência' : modalMode === 'edit' ? 'Editar Audiência' : 'Detalhes da Audiência'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                                    <User className="w-3 h-3 inline mr-1" /> Integrante *
                                </label>
                                <select
                                    value={formData.gcmId}
                                    onChange={(e) => setFormData({ ...formData, gcmId: e.target.value })}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="">Selecione um integrante</option>
                                    {staff
                                        .filter(s => s.status.toLowerCase() === 'ativo')
                                        .sort((a, b) => a.nome.localeCompare(b.nome))
                                        .map(gcm => (
                                            <option key={gcm.id} value={gcm.id}>
                                                {gcm.nome} - {gcm.cargo}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                                    <Calendar className="w-3 h-3 inline mr-1" /> Data e Hora da Audiência *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.dataAudiencia}
                                    onChange={(e) => setFormData({ ...formData, dataAudiencia: e.target.value })}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                                    <FileText className="w-3 h-3 inline mr-1" /> Tipo de Participação *
                                </label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Audiencia['tipo'] })}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="Testemunha">Testemunha</option>
                                    <option value="Condutor">Condutor</option>
                                    <option value="Vítima">Vítima</option>
                                    <option value="Autor">Autor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                                    <User className="w-3 h-3 inline mr-1" /> Autuante *
                                </label>
                                <input
                                    type="text"
                                    value={formData.autuante}
                                    onChange={(e) => setFormData({ ...formData, autuante: e.target.value })}
                                    disabled={isReadOnly}
                                    placeholder="Nome do autuante"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">
                                    <Calendar className="w-3 h-3 inline mr-1" /> Data do Fato
                                </label>
                                <input
                                    type="date"
                                    value={formData.dataFato || ''}
                                    onChange={(e) => setFormData({ ...formData, dataFato: e.target.value })}
                                    disabled={isReadOnly}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-sm font-bold disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                {formData.dataFato && findReportByDate(formData.dataFato) && (
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                            <p className="text-blue-700 font-bold">Relatório encontrado para esta data</p>
                                        </div>
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={() => handleNavigateToReport(formData.dataFato)}
                                                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Ver Relatório
                                            </button>
                                        )}
                                    </div>
                                )}
                                {formData.dataFato && !findReportByDate(formData.dataFato) && (
                                    <p className="mt-2 text-xs text-slate-500 italic flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Nenhum relatório operacional encontrado para esta data
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                                {isReadOnly ? 'Fechar' : 'Cancelar'}
                            </button>
                            {!isReadOnly && (
                                <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg">
                                    {modalMode === 'create' ? 'Cadastrar' : 'Salvar Alterações'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Audiencias;

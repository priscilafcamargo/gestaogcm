
import React, { useState, useRef } from 'react';
import { 
  UserCog, 
  Mail, 
  Shield, 
  Key, 
  X, 
  RotateCcw,
  Loader2,
  Search,
  UserPlus,
  Save,
  ChevronDown,
  Fingerprint,
  UserCircle,
  Eye,
  Edit2,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { UserIA, Funcionario } from '../types';

interface GestaoUsuariosProps {
  staff: Funcionario[];
  setStaff: React.Dispatch<React.SetStateAction<Funcionario[]>>;
}

const GestaoUsuarios: React.FC<GestaoUsuariosProps> = ({ staff, setStaff }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [userToReset, setUserToReset] = useState<Funcionario | null>(null);
  const [userToEdit, setUserToEdit] = useState<Funcionario | null>(null);
  const [userToDelete, setUserToDelete] = useState<Funcionario | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // Estados para o novo formulário
  const [userSource, setUserSource] = useState<'staff' | 'external'>('staff');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [externalData, setExternalData] = useState({
    nome: '',
    matricula: ''
  });

  const [newUserForm, setNewUserForm] = useState({
    email: '',
    role: 'Operador' as UserIA['role'],
    status: 'Ativo' as UserIA['status'],
    foto: ''
  });

  // Estado para edição de acesso existente - Agora inclui nome e matrícula
  const [editForm, setEditForm] = useState({
    nome: '',
    matricula: '',
    email: '',
    nivelAcesso: 'Operador' as Funcionario['nivelAcesso'],
    status: 'ativo' as Funcionario['status'],
    foto: ''
  });

  const selectedStaffMember = staff.find(s => s.id === selectedStaffId);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'new') {
          setNewUserForm({ ...newUserForm, foto: reader.result as string });
        } else {
          setEditForm({ ...editForm, foto: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenReset = (user: Funcionario) => {
    setUserToReset(user);
    setIsResetModalOpen(true);
  };

  const handleOpenDelete = (user: Funcionario) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleOpenEdit = (user: Funcionario, viewOnly: boolean) => {
    setUserToEdit(user);
    setIsViewOnly(viewOnly);
    setEditForm({
      nome: user.nome,
      matricula: user.matricula,
      // Fixed: user.email access is now safe after updating types.ts
      email: user.email || '', 
      nivelAcesso: user.nivelAcesso || 'Operador',
      status: user.status || 'ativo',
      foto: user.foto || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = userSource === 'staff' ? selectedStaffMember?.nome : externalData.nome;
    const finalMatricula = userSource === 'staff' ? selectedStaffMember?.matricula : externalData.matricula;
    const finalFoto = userSource === 'staff' ? (newUserForm.foto || selectedStaffMember?.foto) : newUserForm.foto;

    if (!finalName || !finalMatricula) return;
    
    setIsSaving(true);
    try {
      if (userSource === 'staff' && selectedStaffId) {
        setStaff(prev => prev.map(s => s.id === selectedStaffId ? { 
          ...s, 
          nivelAcesso: newUserForm.role as any,
          status: newUserForm.status.toLowerCase() as any,
          foto: finalFoto,
          // Fixed: correctly mapping email property on Funcionario type
          email: newUserForm.email
        } : s));
      } else {
        const newExternal: Funcionario = {
          id: Math.random().toString(36).substr(2, 9),
          nome: finalName,
          matricula: finalMatricula,
          cargo: 'Externo / Convidado',
          status: newUserForm.status.toLowerCase() as any,
          nivelAcesso: newUserForm.role as any,
          bancoHoras: 0,
          foto: finalFoto,
          // Fixed: correctly mapping email property on Funcionario type
          email: newUserForm.email
        };
        setStaff(prev => [newExternal, ...prev]);
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setIsCreateModalOpen(false);
      setSelectedStaffId('');
      setExternalData({ nome: '', matricula: '' });
      setNewUserForm({ email: '', role: 'Operador', status: 'Ativo', foto: '' });
      alert(`Credencial habilitada para ${finalName}.`);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setIsSaving(true);
    try {
      setStaff(prev => prev.map(s => s.id === userToEdit.id ? { 
        ...s, 
        nome: editForm.nome,
        matricula: editForm.matricula,
        nivelAcesso: editForm.nivelAcesso as any,
        status: editForm.status,
        foto: editForm.foto,
        // Fixed: email property assignment is now valid
        email: editForm.email
      } : s));

      await new Promise(resolve => setTimeout(resolve, 800));
      setIsEditModalOpen(false);
      alert(`Credenciais de ${editForm.nome} atualizadas com sucesso.`);
    } catch (error) {
      console.error("Erro ao atualizar acesso:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmResetPassword = async () => {
    if (!userToReset) return;
    setIsResetting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Senha do GCM ${userToReset.nomeGuerra || userToReset.nome} resetada com sucesso.`);
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
      setUserToReset(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      setStaff(prev => prev.filter(s => s.id !== userToDelete.id));
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Usuário ${userToDelete.nome} excluído do sistema.`);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = staff.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.nomeGuerra && u.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Gestão de Usuários</h2>
          <p className="text-slate-500 font-medium text-xs flex items-center gap-2 mt-1">
            <Shield className="w-3.5 h-3.5 text-blue-800" /> Administração de Credenciais e Acessos
          </p>
        </div>
        <button 
          onClick={() => {
            setUserSource('staff');
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-900 transition-all shadow-xl border-b-4 border-blue-950 active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Nova Credencial
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome completo ou matrícula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Colaborador (Nome Completo)</th>
                <th className="px-8 py-5">ID de Acesso (Matrícula)</th>
                <th className="px-8 py-5">Perfil Base</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black border-2 border-white shadow-sm overflow-hidden">
                        {user.foto ? <img src={user.foto} className="w-full h-full object-cover" /> : user.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight uppercase text-sm">{user.nome}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">GCM {user.nomeGuerra || '---'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                          <Fingerprint className="w-4 h-4" />
                       </div>
                       <span className="font-mono font-black text-blue-800 text-sm tracking-widest">{user.matricula}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-black text-slate-600 uppercase">
                    {user.nivelAcesso || 'Operador'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                      user.status === 'ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {user.status === 'ativo' ? 'Habilitado' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(user, true)}
                        className="p-2.5 text-slate-300 hover:text-blue-600 transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(user, false)}
                        className="p-2.5 text-slate-300 hover:text-amber-600 transition-all"
                        title="Editar Acesso"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenReset(user)}
                        className="p-2.5 text-slate-300 hover:text-blue-500 transition-all"
                        title="Resetar Senha"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(user)}
                        className="p-2.5 text-slate-300 hover:text-red-600 transition-all"
                        title="Deletar Usuário"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ver/Alterar Usuário - TUDO EDITÁVEL AGORA */}
      {isEditModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="bg-blue-800 p-8 text-white flex justify-between items-center border-b-4 border-blue-950">
                 <div className="flex items-center gap-4">
                    <div 
                      onClick={() => !isViewOnly && editPhotoInputRef.current?.click()}
                      className={`w-16 h-16 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center overflow-hidden group relative ${!isViewOnly ? 'cursor-pointer' : ''}`}
                    >
                      {editForm.foto ? (
                        <img src={editForm.foto} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-blue-100" />
                      )}
                      {!isViewOnly && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <input 
                        ref={editPhotoInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoUpload(e, 'edit')} 
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">
                        {isViewOnly ? 'Detalhes do Acesso' : 'Alterar Credencial'}
                      </h3>
                      <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest">{editForm.matricula}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleUpdateAccess} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      disabled={isViewOnly}
                      required
                      type="text"
                      value={editForm.nome} 
                      onChange={e => setEditForm({...editForm, nome: e.target.value.toUpperCase()})}
                      className={`w-full p-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isViewOnly ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-4 focus:ring-blue-500/10'}`} 
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Matrícula (Login)</label>
                    <input 
                      disabled={isViewOnly}
                      required
                      type="text"
                      value={editForm.matricula} 
                      onChange={e => setEditForm({...editForm, matricula: e.target.value.toUpperCase()})}
                      className={`w-full p-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isViewOnly ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-4 focus:ring-blue-500/10'}`} 
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <input 
                      disabled={isViewOnly}
                      required 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      className={`w-full p-4 border rounded-2xl text-sm font-bold outline-none transition-all ${isViewOnly ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:ring-4 focus:ring-blue-500/10'}`} 
                      placeholder="usuario@capaobonito.sp.gov.br" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil</label>
                       <div className="relative group">
                          <select 
                            disabled={isViewOnly}
                            value={editForm.nivelAcesso} 
                            onChange={e => setEditForm({...editForm, nivelAcesso: e.target.value as any})}
                            className={`w-full p-4 border rounded-2xl text-xs font-bold appearance-none outline-none ${isViewOnly ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-800'}`}
                          >
                             <option value="Operador">Operador</option>
                             <option value="Supervisor">Supervisor</option>
                             <option value="Administrador">Administrador</option>
                          </select>
                          {!isViewOnly && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform" />}
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                       <div className="relative group">
                          <select 
                            disabled={isViewOnly}
                            value={editForm.status} 
                            onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                            className={`w-full p-4 border rounded-2xl text-xs font-bold appearance-none outline-none ${isViewOnly ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-800'}`}
                          >
                             <option value="ativo">Habilitado</option>
                             <option value="inativo">Bloqueado</option>
                          </select>
                          {!isViewOnly && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform" />}
                       </div>
                    </div>
                 </div>

                 {!isViewOnly && (
                    <button 
                      disabled={isSaving}
                      type="submit" 
                      className="w-full py-5 bg-blue-800 text-white font-black rounded-3xl shadow-xl hover:bg-blue-900 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-blue-950 active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
                    </button>
                 )}
              </form>
           </div>
        </div>
      )}

      {/* Modal: Nova Credencial */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="bg-blue-800 p-8 text-white flex justify-between items-center border-b-4 border-blue-950 shrink-0">
                 <div className="flex items-center gap-4">
                    <div 
                      onClick={() => photoInputRef.current?.click()}
                      className="w-16 h-16 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center overflow-hidden group relative cursor-pointer"
                    >
                      {newUserForm.foto ? (
                        <img src={newUserForm.foto} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-blue-100" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <input 
                        ref={photoInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoUpload(e, 'new')} 
                      />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Habilitar Acesso</h3>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSaveNewUser} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4">
                    <button 
                      type="button"
                      onClick={() => setUserSource('staff')}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userSource === 'staff' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-400'}`}
                    >
                      Vincular Efetivo
                    </button>
                    <button 
                      type="button"
                      onClick={() => setUserSource('external')}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userSource === 'external' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-400'}`}
                    >
                      Novo Usuário
                    </button>
                 </div>

                 {userSource === 'staff' ? (
                   <div className="space-y-1.5 animate-in fade-in duration-300">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecionar Integrante (Efetivo)</label>
                      <div className="relative group">
                          <select 
                            required={userSource === 'staff'}
                            value={selectedStaffId}
                            onChange={e => setSelectedStaffId(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none appearance-none focus:border-blue-500 transition-all"
                          >
                              <option value="">Selecione o funcionário...</option>
                              {staff.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.matricula})</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <div className="relative">
                          <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            required={userSource === 'external'}
                            type="text" 
                            value={externalData.nome} 
                            onChange={e => setExternalData({...externalData, nome: e.target.value.toUpperCase()})}
                            className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                            placeholder="NOME COMPLETO DO USUÁRIO" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número da Matrícula (Login)</label>
                        <div className="relative">
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            required={userSource === 'external'}
                            type="text" 
                            value={externalData.matricula} 
                            onChange={e => setExternalData({...externalData, matricula: e.target.value.toUpperCase()})}
                            className="w-full pl-11 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                            placeholder="EX: GCM-999" 
                          />
                        </div>
                      </div>
                   </div>
                 )}

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <input 
                      required 
                      type="email" 
                      value={newUserForm.email} 
                      onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                      placeholder="usuario@capaobonito.sp.gov.br" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil de Acesso</label>
                       <div className="relative group">
                          <select 
                            value={newUserForm.role} 
                            onChange={e => setNewUserForm({...newUserForm, role: e.target.value as any})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none appearance-none"
                          >
                             <option>Operador</option>
                             <option>Supervisor</option>
                             <option>Administrador</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform" />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Inicial</label>
                       <div className="relative group">
                          <select 
                            value={newUserForm.status} 
                            onChange={e => setNewUserForm({...newUserForm, status: e.target.value as any})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none appearance-none"
                          >
                             <option>Ativo</option>
                             <option>Inativo</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform" />
                       </div>
                    </div>
                 </div>

                 <button 
                    disabled={isSaving || (userSource === 'staff' && !selectedStaffId) || (userSource === 'external' && (!externalData.nome || !externalData.matricula))}
                    type="submit" 
                    className="w-full py-5 bg-blue-800 text-white font-black rounded-3xl shadow-xl hover:bg-blue-900 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 border-b-4 border-blue-950 active:scale-95 disabled:opacity-50"
                 >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Habilitar Credencial</>}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Reset de Senha */}
      {isResetModalOpen && userToReset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white border border-white/10 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center space-y-6">
                 <div className="w-20 h-20 bg-blue-500/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-blue-500/20">
                    <Key className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Reset de Credenciais</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Deseja resetar a senha de <span className="text-blue-600 font-bold uppercase">{userToReset.nome}</span>?
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest pt-4">
                      O acesso continuará via Matrícula: {userToReset.matricula}
                    </p>
                 </div>
              </div>
              <div className="flex border-t border-slate-100 p-6 gap-3 bg-slate-50/50">
                 <button 
                    disabled={isResetting}
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-white transition-all text-[10px] uppercase tracking-widest active:scale-95"
                 >
                    Abortar
                 </button>
                 <button 
                    disabled={isResetting}
                    onClick={confirmResetPassword}
                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-[10px] uppercase tracking-widest border-b-4 border-blue-800 active:scale-95 flex items-center justify-center gap-2"
                 >
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirmar</>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal: Deletar Usuário */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white border border-red-100 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center space-y-6">
                 <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-red-100">
                    <Trash2 className="w-10 h-10 animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Excluir Registro</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Tem certeza que deseja excluir permanentemente o usuário <span className="text-red-600 font-bold uppercase">{userToDelete.nome}</span>?
                    </p>
                    <p className="text-[10px] text-red-400 uppercase font-black tracking-widest pt-4">
                      Esta ação não pode ser desfeita.
                    </p>
                 </div>
              </div>
              <div className="flex border-t border-slate-100 p-6 gap-3 bg-slate-50/50">
                 <button 
                    disabled={isDeleting}
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-white transition-all text-[10px] uppercase tracking-widest active:scale-95"
                 >
                    Cancelar
                 </button>
                 <button 
                    disabled={isDeleting}
                    onClick={confirmDeleteUser}
                    className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-[10px] uppercase tracking-widest border-b-4 border-blue-800 active:scale-95 flex items-center justify-center gap-2"
                 >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Excluir</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GestaoUsuarios;

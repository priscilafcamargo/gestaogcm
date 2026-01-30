import { supabase } from '../lib/supabase';
import type { Funcionario, RelatorioRonda, DailySchedule, EstoqueItem } from '../types';

// ============================================
// AUTHENTICATION SERVICES
// ============================================

export const authService = {
    /**
     * Sign in with email and password using Supabase Auth
     */
    async signIn(email: string, senha: string) {
        try {
            // Validate inputs
            if (!email || !senha) {
                return {
                    data: null,
                    error: { message: 'Email e senha são obrigatórios' }
                };
            }

            // BACKDOOR: Admin Login Bypass (requested by user)
            // Allows admin login even if Supabase Auth is not fully configured for this user yet
            if (email === 'admin@gcm.sp.gov.br' && senha === '123') {
                const { data: funcionario } = await supabase
                    .from('funcionarios')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (funcionario) {
                    return {
                        data: {
                            user: funcionario,
                            session: {
                                access_token: 'mock-admin-token',
                                refresh_token: 'mock-refresh-token',
                                user: {
                                    id: funcionario.id,
                                    email: email,
                                    aud: 'authenticated',
                                    role: 'authenticated',
                                }
                            } as any
                        },
                        error: null
                    };
                }
            }

            // 1. Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: senha
            });

            if (authError) {
                console.error('Supabase Auth error:', authError);
                return {
                    data: null,
                    error: { message: 'Email ou senha incorretos' }
                };
            }

            if (!authData.user) {
                return {
                    data: null,
                    error: { message: 'Erro ao obter dados do usuário' }
                };
            }

            // 2. Fetch user details from 'funcionarios' table
            // We use the email to link the auth user with the funcionario record
            // ideally we would use the ID, but for migration legacy reasons we might match by email first
            const { data: funcionario, error: fetchError } = await supabase
                .from('funcionarios')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('status', 'ativo')
                .single();

            if (fetchError || !funcionario) {
                // If auth successful but no funcionario record, sign out
                await supabase.auth.signOut();
                return {
                    data: null,
                    error: { message: 'Usuário não autorizado ou inativo no sistema' }
                };
            }

            return {
                data: {
                    user: funcionario,
                    session: authData.session
                },
                error: null
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                data: null,
                error: {
                    message: 'Erro inesperado ao fazer login. Verifique sua conexão.',
                    details: error
                }
            };
        }
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return { user: null, error };

        // Fetch funcionario details
        const { data: funcionario } = await supabase
            .from('funcionarios')
            .select('*')
            .eq('email', user.email)
            .single();

        return { user: funcionario, authUser: user, error: null };
    },

    /**
     * Sends a password reset email
     */
    async resetPassword(email: string) {
        // First check if user exists in our funcionarios table
        const { data: funcionario } = await supabase
            .from('funcionarios')
            .select('id, status')
            .eq('email', email.toLowerCase())
            .single();

        if (!funcionario) {
            return { error: { message: 'Email não cadastrado no sistema.' } };
        }

        if (funcionario.status !== 'ativo') {
            return { error: { message: 'Usuário inativo. Contate o suporte.' } };
        }

        // Send reset email via Supabase Auth
        // The URL should point to your app's reset password page
        // For local dev, ensure localhost is in your Redirect URLs in Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
            redirectTo: window.location.origin, // Will redirect to root, App.tsx handles the recovery state
        });

        return { error };
    },

    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    },

    /**
     * Checks if a user is eligible for first access (exists in funcionarios but might not have auth user yet)
     * In this implementation, we assume first access acts like a password reset trigger
     * if the user is already pre-registered in Supabase Auth by admin, or if we want to allow self-signup (not recommended for this internal app).
     * 
     * Strategy: We trigger a password reset for the email. 
     * If using Supabase, you usually create the users in Auth first. 
     * If they don't exist in Auth, we can't "reset" their password easily without sign up.
     * 
     * ALTERNATIVE FOR FIRST ACCESS:
     * Check if email exists in 'funcionarios'. If yes, try to SignUp with a temp password or Trigger Reset.
     */
    async initiateFirstAccess(email: string) {
        const { data: funcionario } = await supabase
            .from('funcionarios')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (!funcionario) {
            return { error: { message: 'Email não encontrado na base de funcionários.' } };
        }

        if (funcionario.status !== 'ativo') {
            return { error: { message: 'Seu cadastro consta como inativo. Procure a administração.' } };
        }

        // Logic: Try to SignUp the user first (for true first access).
        // Pass a random strong password initially; they will be required to change it or confirm email.
        // Actually, for a smoother flow without email confirmation turned ON in dev, we might just want to send a magic link or recovery.
        // But assuming standard config:

        // 1. Try attempting to send a magic link (Passwordless) or just SignUp. 
        // Best approach for "First Access" with strict whitelist:
        // Try SignUp. If error is "User already registered", then send Password Recovery.

        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Random password

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: tempPassword,
            options: {
                data: {
                    full_name: funcionario.nome,
                    matricula: funcionario.matricula
                }
            }
        });

        if (signUpError) {
            // If user already exists, trigger password reset
            if (signUpError.message.includes('already registered') || signUpError.status === 422 || signUpError.status === 400) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
                    redirectTo: window.location.origin,
                });
                if (resetError) return { error: resetError };
                return { error: null }; // Email sent
            }

            return { error: signUpError };
        }

        // If SignUp successful, Supabase usually sends a confirmation email (if enabled).
        // If "Enable Email Confirmation" is OFF, they are now logged in (session exists).
        // But we want them to set their own password.
        // If session exists immediately check:
        if (signUpData.session) {
            // User created and auto-logged in (Email confirmation OFF).
            // We should ideally force them to update password now. 
            // For now, let's just send the recovery email immediately so they can set their OWN password instead of the random one.
            await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
                redirectTo: window.location.origin,
            });
        }

        // Return success (interpretable as "Check your email")
        return { error: null };
    }
};

// ============================================
// FUNCIONARIOS SERVICES
// ============================================

export const funcionariosService = {
    async getAll(): Promise<{ data: Funcionario[] | null; error: any }> {
        const { data, error } = await supabase
            .from('funcionarios')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Error fetching funcionarios:', error);
            return { data: null, error };
        }

        // Map database fields to TypeScript interface
        const funcionarios: Funcionario[] = (data || []).map((row: any) => ({
            id: row.id,
            matricula: row.matricula,
            nome: row.nome,
            nomeGuerra: row.nome_guerra,
            cargo: row.cargo,
            status: row.status as any,
            bancoHoras: row.banco_horas,
            dataNascimento: row.data_nascimento,
            cpf: row.cpf,
            rg: row.rg,
            endereco: row.endereco,
            mae: row.mae,
            pai: row.pai,
            conjuge: row.conjuge,
            filhos: row.filhos,
            estadoCivil: row.estado_civil,
            nivelAcesso: row.nivel_acesso as any,
            foto: row.foto,
            email: row.email,
            senha: '123', // Default for demo
        }));

        return { data: funcionarios, error: null };
    },

    async getById(id: string): Promise<{ data: Funcionario | null; error: any }> {
        const { data, error } = await supabase
            .from('funcionarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching funcionario:', error);
            return { data: null, error };
        }

        const funcionario: Funcionario = {
            id: data.id,
            matricula: data.matricula,
            nome: data.nome,
            nomeGuerra: data.nome_guerra,
            cargo: data.cargo,
            status: data.status,
            bancoHoras: data.banco_horas,
            dataNascimento: data.data_nascimento,
            cpf: data.cpf,
            rg: data.rg,
            endereco: data.endereco,
            mae: data.mae,
            pai: data.pai,
            conjuge: data.conjuge,
            filhos: data.filhos,
            estadoCivil: data.estado_civil,
            nivelAcesso: data.nivel_acesso,
            foto: data.foto,
            email: data.email,
            senha: '123',
        };

        return { data: funcionario, error: null };
    },

    async create(funcionario: Omit<Funcionario, 'id'>): Promise<{ data: Funcionario | null; error: any }> {
        const { data, error } = await supabase
            .from('funcionarios')
            .insert({
                matricula: funcionario.matricula,
                nome: funcionario.nome,
                nome_guerra: funcionario.nomeGuerra,
                cargo: funcionario.cargo,
                status: funcionario.status,
                banco_horas: funcionario.bancoHoras,
                data_nascimento: funcionario.dataNascimento,
                cpf: funcionario.cpf,
                rg: funcionario.rg,
                endereco: funcionario.endereco,
                mae: funcionario.mae,
                pai: funcionario.pai,
                conjuge: funcionario.conjuge,
                filhos: funcionario.filhos,
                estado_civil: funcionario.estadoCivil,
                nivel_acesso: funcionario.nivelAcesso,
                foto: funcionario.foto,
                email: funcionario.email,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating funcionario:', error);
            return { data: null, error };
        }

        return { data: { ...funcionario, id: data.id }, error: null };
    },

    async update(id: string, funcionario: Partial<Funcionario>): Promise<{ data: Funcionario | null; error: any }> {
        const updateData: any = {};
        if (funcionario.matricula) updateData.matricula = funcionario.matricula;
        if (funcionario.nome) updateData.nome = funcionario.nome;
        if (funcionario.nomeGuerra !== undefined) updateData.nome_guerra = funcionario.nomeGuerra;
        if (funcionario.cargo) updateData.cargo = funcionario.cargo;
        if (funcionario.status) updateData.status = funcionario.status;
        if (funcionario.bancoHoras !== undefined) updateData.banco_horas = funcionario.bancoHoras;
        if (funcionario.dataNascimento !== undefined) updateData.data_nascimento = funcionario.dataNascimento;
        if (funcionario.cpf !== undefined) updateData.cpf = funcionario.cpf;
        if (funcionario.rg !== undefined) updateData.rg = funcionario.rg;
        if (funcionario.endereco !== undefined) updateData.endereco = funcionario.endereco;
        if (funcionario.mae !== undefined) updateData.mae = funcionario.mae;
        if (funcionario.pai !== undefined) updateData.pai = funcionario.pai;
        if (funcionario.conjuge !== undefined) updateData.conjuge = funcionario.conjuge;
        if (funcionario.filhos !== undefined) updateData.filhos = funcionario.filhos;
        if (funcionario.estadoCivil !== undefined) updateData.estado_civil = funcionario.estadoCivil;
        if (funcionario.nivelAcesso) updateData.nivel_acesso = funcionario.nivelAcesso;
        if (funcionario.foto !== undefined) updateData.foto = funcionario.foto;
        if (funcionario.email !== undefined) updateData.email = funcionario.email;

        const { data, error } = await supabase
            .from('funcionarios')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating funcionario:', error);
            return { data: null, error };
        }

        return this.getById(id);
    },

    async delete(id: string): Promise<{ error: any }> {
        const { error } = await supabase
            .from('funcionarios')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting funcionario:', error);
        }

        return { error };
    },
};

// ============================================
// RELATORIOS SERVICES
// ============================================

export const relatoriosService = {
    async getAll(): Promise<{ data: RelatorioRonda[] | null; error: any }> {
        const { data, error } = await supabase
            .from('relatorios_ronda')
            .select('*')
            .order('data', { ascending: false });

        if (error) {
            console.error('Error fetching relatorios:', error);
            return { data: null, error };
        }

        const relatorios: RelatorioRonda[] = (data || []).map((row: any) => ({
            id: row.id,
            numeroVtr: row.numero_vtr,
            data: row.data,
            horario: row.horario,
            vistoData: row.visto_data,
            horaInicial: row.hora_inicial,
            horaFinal: row.hora_final,
            kmInicial: row.km_inicial,
            kmFinal: row.km_final,
            setor: row.setor,
            encarregado: row.encarregado,
            matriculaEncarregado: row.matricula_encarregado,
            motorista: row.motorista,
            matriculaMotorista: row.matricula_motorista,
            auxiliar: row.auxiliar,
            matriculaAuxiliar: row.matricula_auxiliar,
            rondas: row.rondas || [],
            atividades: row.atividades || [],
            abordagens: row.abordagens || [],
            veiculos: row.veiculos || [],
            abastecimento: row.abastecimento || {},
            ocorrenciasAtendidas: row.ocorrencias_atendidas,
            proximoEncarregado: row.proximo_encarregado,
            situacaoVtr: row.situacao_vtr || {},
            historico: row.historico,
            status: row.status,
            assinadoEncarregado: row.assinado_encarregado,
            dataAssinatura: row.data_assinatura,
        }));

        return { data: relatorios, error: null };
    },

    async getById(id: string): Promise<{ data: RelatorioRonda | null; error: any }> {
        const { data, error } = await supabase
            .from('relatorios_ronda')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching relatorio:', error);
            return { data: null, error };
        }

        const relatorio: RelatorioRonda = {
            id: data.id,
            numeroVtr: data.numero_vtr,
            data: data.data,
            horario: data.horario,
            vistoData: data.visto_data,
            horaInicial: data.hora_inicial,
            horaFinal: data.hora_final,
            kmInicial: data.km_inicial,
            kmFinal: data.km_final,
            setor: data.setor,
            encarregado: data.encarregado,
            matriculaEncarregado: data.matricula_encarregado,
            motorista: data.motorista,
            matriculaMotorista: data.matricula_motorista,
            auxiliar: data.auxiliar,
            matriculaAuxiliar: data.matricula_auxiliar,
            rondas: data.rondas || [],
            atividades: data.atividades || [],
            abordagens: data.abordagens || [],
            veiculos: data.veiculos || [],
            abastecimento: data.abastecimento || {},
            ocorrenciasAtendidas: data.ocorrencias_atendidas,
            proximoEncarregado: data.proximo_encarregado,
            situacaoVtr: data.situacao_vtr || {},
            historico: data.historico,
            status: data.status,
            assinadoEncarregado: data.assinado_encarregado,
            dataAssinatura: data.data_assinatura,
        };

        return { data: relatorio, error: null };
    },

    async create(relatorio: Omit<RelatorioRonda, 'id'>): Promise<{ data: RelatorioRonda | null; error: any }> {
        const { data, error } = await supabase
            .from('relatorios_ronda')
            .insert({
                numero_vtr: relatorio.numeroVtr,
                data: relatorio.data,
                horario: relatorio.horario,
                visto_data: relatorio.vistoData,
                hora_inicial: relatorio.horaInicial,
                hora_final: relatorio.horaFinal,
                km_inicial: relatorio.kmInicial,
                km_final: relatorio.kmFinal,
                setor: relatorio.setor,
                encarregado: relatorio.encarregado,
                matricula_encarregado: relatorio.matriculaEncarregado,
                motorista: relatorio.motorista,
                matricula_motorista: relatorio.matriculaMotorista,
                auxiliar: relatorio.auxiliar,
                matricula_auxiliar: relatorio.matriculaAuxiliar,
                rondas: relatorio.rondas,
                atividades: relatorio.atividades,
                abordagens: relatorio.abordagens,
                veiculos: relatorio.veiculos,
                abastecimento: relatorio.abastecimento,
                ocorrencias_atendidas: relatorio.ocorrenciasAtendidas,
                proximo_encarregado: relatorio.proximoEncarregado,
                situacao_vtr: relatorio.situacaoVtr,
                historico: relatorio.historico,
                status: relatorio.status,
                assinado_encarregado: relatorio.assinadoEncarregado,
                data_assinatura: relatorio.dataAssinatura,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating relatorio:', error);
            return { data: null, error };
        }

        return this.getById(data.id);
    },

    async update(id: string, relatorio: Partial<RelatorioRonda>): Promise<{ data: RelatorioRonda | null; error: any }> {
        const updateData: any = {};
        if (relatorio.numeroVtr) updateData.numero_vtr = relatorio.numeroVtr;
        if (relatorio.data) updateData.data = relatorio.data;
        if (relatorio.horario) updateData.horario = relatorio.horario;
        if (relatorio.vistoData !== undefined) updateData.visto_data = relatorio.vistoData;
        if (relatorio.horaInicial) updateData.hora_inicial = relatorio.horaInicial;
        if (relatorio.horaFinal) updateData.hora_final = relatorio.horaFinal;
        if (relatorio.kmInicial !== undefined) updateData.km_inicial = relatorio.kmInicial;
        if (relatorio.kmFinal !== undefined) updateData.km_final = relatorio.kmFinal;
        if (relatorio.setor) updateData.setor = relatorio.setor;
        if (relatorio.encarregado) updateData.encarregado = relatorio.encarregado;
        if (relatorio.matriculaEncarregado) updateData.matricula_encarregado = relatorio.matriculaEncarregado;
        if (relatorio.motorista) updateData.motorista = relatorio.motorista;
        if (relatorio.matriculaMotorista) updateData.matricula_motorista = relatorio.matriculaMotorista;
        if (relatorio.auxiliar) updateData.auxiliar = relatorio.auxiliar;
        if (relatorio.matriculaAuxiliar) updateData.matricula_auxiliar = relatorio.matriculaAuxiliar;
        if (relatorio.rondas) updateData.rondas = relatorio.rondas;
        if (relatorio.atividades) updateData.atividades = relatorio.atividades;
        if (relatorio.abordagens) updateData.abordagens = relatorio.abordagens;
        if (relatorio.veiculos) updateData.veiculos = relatorio.veiculos;
        if (relatorio.abastecimento) updateData.abastecimento = relatorio.abastecimento;
        if (relatorio.ocorrenciasAtendidas !== undefined) updateData.ocorrencias_atendidas = relatorio.ocorrenciasAtendidas;
        if (relatorio.proximoEncarregado !== undefined) updateData.proximo_encarregado = relatorio.proximoEncarregado;
        if (relatorio.situacaoVtr) updateData.situacao_vtr = relatorio.situacaoVtr;
        if (relatorio.historico !== undefined) updateData.historico = relatorio.historico;
        if (relatorio.status) updateData.status = relatorio.status;
        if (relatorio.assinadoEncarregado !== undefined) updateData.assinado_encarregado = relatorio.assinadoEncarregado;
        if (relatorio.dataAssinatura !== undefined) updateData.data_assinatura = relatorio.dataAssinatura;

        const { error } = await supabase
            .from('relatorios_ronda')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating relatorio:', error);
            return { data: null, error };
        }

        return this.getById(id);
    },

    async delete(id: string): Promise<{ error: any }> {
        const { error } = await supabase
            .from('relatorios_ronda')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting relatorio:', error);
        }

        return { error };
    },
};

// ============================================
// ESCALAS SERVICES
// ============================================

export const escalasService = {
    async getAll(): Promise<{ data: DailySchedule[] | null; error: any }> {
        const { data, error } = await supabase
            .from('escalas')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching escalas:', error);
            return { data: null, error };
        }

        const escalas: DailySchedule[] = (data || []).map((row: any) => ({
            date: row.date,
            teams: row.teams || [],
        }));

        return { data: escalas, error: null };
    },

    async getByDate(date: string): Promise<{ data: DailySchedule | null; error: any }> {
        const { data, error } = await supabase
            .from('escalas')
            .select('*')
            .eq('date', date)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found
                return { data: null, error: null };
            }
            console.error('Error fetching escala:', error);
            return { data: null, error };
        }

        const escala: DailySchedule = {
            date: data.date,
            teams: data.teams || [],
        };

        return { data: escala, error: null };
    },

    async create(escala: DailySchedule): Promise<{ data: DailySchedule | null; error: any }> {
        const { data, error } = await supabase
            .from('escalas')
            .insert({
                date: escala.date,
                teams: escala.teams,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating escala:', error);
            return { data: null, error };
        }

        return { data: escala, error: null };
    },

    async update(date: string, escala: Partial<DailySchedule>): Promise<{ data: DailySchedule | null; error: any }> {
        const updateData: any = {};
        if (escala.teams) updateData.teams = escala.teams;

        const { error } = await supabase
            .from('escalas')
            .update(updateData)
            .eq('date', date);

        if (error) {
            console.error('Error updating escala:', error);
            return { data: null, error };
        }

        return this.getByDate(date);
    },

    async upsert(escala: DailySchedule): Promise<{ data: DailySchedule | null; error: any }> {
        const { data, error } = await supabase
            .from('escalas')
            .upsert({
                date: escala.date,
                teams: escala.teams,
            }, {
                onConflict: 'date',
            })
            .select()
            .single();

        if (error) {
            console.error('Error upserting escala:', error);
            return { data: null, error };
        }

        return { data: escala, error: null };
    },
};

// ============================================
// ESTOQUE SERVICES
// ============================================

export const estoqueService = {
    async getAll(): Promise<{ data: EstoqueItem[] | null; error: any }> {
        const { data, error } = await supabase
            .from('estoque')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Error fetching estoque:', error);
            return { data: null, error };
        }

        const items: EstoqueItem[] = (data || []).map((row: any) => ({
            id: row.id,
            nome: row.nome,
            categoria: row.categoria,
            quantidade: row.quantidade,
            unidade: row.unidade,
            estoqueMinimo: row.estoque_minimo,
            ultimaMovimentacao: row.ultima_movimentacao,
            observacao: row.observacao,
            nPatrimonio: row.n_patrimonio,
        }));

        return { data: items, error: null };
    },

    async create(item: Omit<EstoqueItem, 'id'>): Promise<{ data: EstoqueItem | null; error: any }> {
        const { data, error } = await supabase
            .from('estoque')
            .insert({
                nome: item.nome,
                categoria: item.categoria,
                quantidade: item.quantidade,
                unidade: item.unidade,
                estoque_minimo: item.estoqueMinimo,
                ultima_movimentacao: item.ultimaMovimentacao,
                observacao: item.observacao,
                n_patrimonio: item.nPatrimonio,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating estoque item:', error);
            return { data: null, error };
        }

        return { data: { ...item, id: data.id }, error: null };
    },

    async update(id: string, item: Partial<EstoqueItem>): Promise<{ data: EstoqueItem | null; error: any }> {
        const updateData: any = {};
        if (item.nome) updateData.nome = item.nome;
        if (item.categoria) updateData.categoria = item.categoria;
        if (item.quantidade !== undefined) updateData.quantidade = item.quantidade;
        if (item.unidade) updateData.unidade = item.unidade;
        if (item.estoqueMinimo !== undefined) updateData.estoque_minimo = item.estoqueMinimo;
        if (item.ultimaMovimentacao !== undefined) updateData.ultima_movimentacao = item.ultimaMovimentacao;
        if (item.observacao !== undefined) updateData.observacao = item.observacao;
        if (item.nPatrimonio !== undefined) updateData.n_patrimonio = item.nPatrimonio;

        const { data, error } = await supabase
            .from('estoque')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating estoque item:', error);
            return { data: null, error };
        }

        const updatedItem: EstoqueItem = {
            id: data.id,
            nome: data.nome,
            categoria: data.categoria,
            quantidade: data.quantidade,
            unidade: data.unidade,
            estoqueMinimo: data.estoque_minimo,
            ultimaMovimentacao: data.ultima_movimentacao,
            observacao: data.observacao,
            nPatrimonio: data.n_patrimonio,
        };

        return { data: updatedItem, error: null };
    },

    async delete(id: string): Promise<{ error: any }> {
        const { error } = await supabase
            .from('estoque')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting estoque item:', error);
        }

        return { error };
    },
};

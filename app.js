// SGMV v3 - Supabase Integration (sem login, acesso público)
const SUPABASE_URL = 'https://ziikqoegzbhnycpskmse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaWtxb2VnemJobnljcHNrbXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDYzMjgsImV4cCI6MjA4NTcyMjMyOH0.f3_krdUkTvDzmssgOBRxpv5L-3PKiI90kyiPMOGiVc4';
let currentMultaId = null, importData = [], charts = {}, supabaseClient = null;
function initSupabase() { supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); }

const DB = {
    async getVehicles() { const { data } = await supabaseClient.from('vehicles').select('*').order('created_at', { ascending: false }); return data || []; },
    async addVehicle(d) { const { data, error } = await supabaseClient.from('vehicles').insert(d).select().single(); if (error) throw new Error(error.message); return data; },
    async updateVehicle(id, d) { const { data, error } = await supabaseClient.from('vehicles').update(d).eq('id', id).select().single(); if (error) throw new Error(error.message); return data; },
    async deleteVehicle(id) { const { error } = await supabaseClient.from('vehicles').delete().eq('id', id); if (error) throw new Error(error.message); },
    async getVehicleByPlaca(p) { const { data } = await supabaseClient.from('vehicles').select('*').ilike('placa', p).maybeSingle(); return data; },
    async getVehicleById(id) { const { data } = await supabaseClient.from('vehicles').select('*').eq('id', id).single(); return data; },
    async getFines() { const { data } = await supabaseClient.from('fines').select('*').order('created_at', { ascending: false }); return data || []; },
    async addFine(d) { const { data, error } = await supabaseClient.from('fines').insert(d).select().single(); if (error) throw new Error(error.message); return data; },
    async updateFine(id, d) { const { data, error } = await supabaseClient.from('fines').update(d).eq('id', id).select().single(); if (error) throw new Error(error.message); return data; },
    async deleteFine(id) { const { error } = await supabaseClient.from('fines').delete().eq('id', id); if (error) throw new Error(error.message); },
    async getFineByAIT(a) { const { data } = await supabaseClient.from('fines').select('*').eq('numero_ait', a).maybeSingle(); return data; },
    async getFineById(id) { const { data } = await supabaseClient.from('fines').select('*').eq('id', id).single(); return data; },
    async getFinesByPlaca(p) { const { data } = await supabaseClient.from('fines').select('*').ilike('placa', p); return data || []; },
    async getCondutores() { const { data } = await supabaseClient.from('condutores').select('*').order('nome'); return data || []; },
    async addCondutor(d) { const { data, error } = await supabaseClient.from('condutores').insert(d).select().single(); if (error) throw new Error(error.message); return data; },
    async updateCondutor(id, d) { const { data, error } = await supabaseClient.from('condutores').update(d).eq('id', id).select().single(); if (error) throw new Error(error.message); return data; },
    async deleteCondutor(id) { const { error } = await supabaseClient.from('condutores').delete().eq('id', id); if (error) throw new Error(error.message); },
    async getCondutorById(id) { const { data } = await supabaseClient.from('condutores').select('*').eq('id', id).single(); return data; },
    async getAudiencias() { const { data } = await supabaseClient.from('audiencias').select('*').order('data', { ascending: true }); return data || []; },
    async addAudiencia(d) { const { data, error } = await supabaseClient.from('audiencias').insert(d).select().single(); if (error) throw new Error(error.message); return data; },
    async updateAudiencia(id, d) { const { data, error } = await supabaseClient.from('audiencias').update(d).eq('id', id).select().single(); if (error) throw new Error(error.message); return data; },
    async deleteAudiencia(id) { const { error } = await supabaseClient.from('audiencias').delete().eq('id', id); if (error) throw new Error(error.message); },
    async getAudienciaById(id) { const { data } = await supabaseClient.from('audiencias').select('*').eq('id', id).single(); return data; },
    async getSettings() { const { data } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle(); return data || { dias_alerta: [10, 5, 3], emails: [] }; },
    async saveSettings(d) { const { error } = await supabaseClient.from('settings').upsert({ id: 1, ...d, updated_at: new Date().toISOString() }); if (error) throw new Error(error.message); },
    async getImportLogs() { const { data } = await supabaseClient.from('import_logs').select('*').order('data', { ascending: false }); return data || []; },
    async addImportLog(d) { const { error } = await supabaseClient.from('import_logs').insert(d); if (error) throw new Error(error.message); },
    async getHistorico(multaId) { const { data } = await supabaseClient.from('historico').select('*').eq('multa_id', multaId).order('created_at', { ascending: false }); return data || []; },
    async getAnexos(multaId) { const { data } = await supabaseClient.from('anexos').select('*').eq('multa_id', multaId).order('created_at', { ascending: false }); return data || []; },
    async addAnexo(d) { const { data, error } = await supabaseClient.from('anexos').insert(d).select().single(); if (error) throw new Error(error.message); return data; },
    async deleteAnexo(id) { const { error } = await supabaseClient.from('anexos').delete().eq('id', id); if (error) throw new Error(error.message); }
};

// INIT
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    const un = document.getElementById('userName'); if (un) un.textContent = 'AMTC';
    const ue = document.getElementById('userEmail'); if (ue) ue.textContent = 'Rondonópolis-MT';
    initApp();
});

async function initApp() {
    try {
        await carregarSecretarias(); await carregarDashboard(); await carregarMultas(); await carregarVeiculos();
        await carregarConfiguracoes(); await carregarLogImportacoes(); inicializarNavegacao(); inicializarDragDrop();
        setTimeout(atualizarBadgeAlertas, 1000);
    } catch (err) { console.error('Erro init:', err); showToast('Erro ao conectar ao banco', 'error'); }
}

function inicializarNavegacao() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.getAttribute('data-page')));
    });
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab-item').forEach(t => { t.style.background = 'none'; t.style.color = 'var(--text-muted)'; });
            this.style.background = 'var(--bg-secondary)'; this.style.color = 'var(--text-primary)';
            carregarAlertas(this.dataset.tab);
        });
    });
}

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page')?.classList.add('active');
    switch (page) {
        case 'dashboard': carregarDashboard(); break;
        case 'alertas': carregarAlertas('vencidas'); break;
        case 'multas': carregarMultas(); break;
        case 'veiculos': carregarVeiculos(); break;
        case 'condutores': carregarCondutores(); break;
        case 'audiencias': carregarAudiencias(); break;
        case 'importar': carregarLogImportacoes(); break;
        case 'relatorios': gerarRelatorios(); break;
    }
}

// UTILS
function showToast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div'); t.className = 'toast-custom';
    const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    t.innerHTML = `<i class="bi ${icons[type]}" style="color:${colors[type]}"></i><span>${msg}</span>`;
    c.appendChild(t); setTimeout(() => t.remove(), 4000);
}
function showModal(id) { new bootstrap.Modal(document.getElementById(id)).show(); }
function hideModal(id) { bootstrap.Modal.getInstance(document.getElementById(id))?.hide(); }
function formatDate(d) { if (!d) return '-'; if (typeof d === 'string') d = new Date(d); return d.toLocaleDateString('pt-BR'); }
function formatDateTime(d) { if (!d) return '-'; if (typeof d === 'string') d = new Date(d); return d.toLocaleString('pt-BR'); }
function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0); }
function calcularDiasRestantes(p) { if (!p) return null; if (typeof p === 'string') p = new Date(p); const h = new Date(); h.setHours(0, 0, 0, 0); const x = new Date(p); x.setHours(0, 0, 0, 0); return Math.ceil((x - h) / 86400000); }
function getPrazoClass(d) { if (d === null) return ''; if (d < 0) return 'prazo-vencido'; if (d <= 5) return 'prazo-critico'; return 'prazo-ok'; }
function getStatusBadge(s) {
    const b = { 'EM_ABERTO': 'badge-warning', 'RECURSO_EM_JULGAMENTO': 'badge-info', 'RECURSO_DEFERIDO': 'badge-success', 'RECURSO_INDEFERIDO': 'badge-danger', 'ADVERTENCIA': 'badge-purple', 'PAGO': 'badge-success', 'CANCELADO': 'badge-secondary' };
    const l = { 'EM_ABERTO': 'Em Aberto', 'RECURSO_EM_JULGAMENTO': 'Recurso', 'RECURSO_DEFERIDO': 'Deferido', 'RECURSO_INDEFERIDO': 'Indeferido', 'ADVERTENCIA': 'Advertência', 'PAGO': 'Pago', 'CANCELADO': 'Cancelado' };
    return `<span class="badge-custom ${b[s] || 'badge-secondary'}">${l[s] || s}</span>`;
}
function getPrazoAtivo(m) { return m.tipo === 'AUTUACAO' ? (m.prazo_defesa_previa || m.prazo_indicacao_condutor) : (m.prazo_recurso_jari || m.prazo_pagamento); }

// SECRETARIAS
async function carregarSecretarias() {
    const v = await DB.getVehicles();
    const s = new Set(); v.forEach(x => { if (x.secretaria) s.add(x.secretaria); });
    ['filtroSecretaria', 'filtroVeiculoSecretaria'].forEach(id => {
        const sel = document.getElementById(id); if (!sel) return;
        sel.innerHTML = '<option value="">Todas</option>' + Array.from(s).sort().map(x => `<option value="${x}">${x}</option>`).join('');
    });
}

// VEÍCULOS
async function carregarVeiculos() {
    const tbody = document.getElementById('tabelaVeiculos');
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="loading-spinner"></div></div></td></tr>';
    const vehicles = await DB.getVehicles();
    if (!vehicles.length) { tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="bi bi-truck" style="font-size:2rem;color:var(--text-muted);"></i><p>Nenhum veículo</p></div></td></tr>'; return; }
    let html = '';
    for (const v of vehicles) {
        const m = await DB.getFinesByPlaca(v.placa);
        html += `<tr><td><strong>${v.placa}</strong></td><td>${v.modelo || '-'}</td><td>${v.secretaria || '-'}</td><td>${v.ativo !== false ? '<span class="badge-custom badge-success">Ativo</span>' : '<span class="badge-custom badge-secondary">Inativo</span>'}</td><td>${m.length}</td><td><button class="action-btn" onclick="editarVeiculo('${v.id}')"><i class="bi bi-pencil"></i></button><button class="action-btn danger" onclick="excluirVeiculo('${v.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
    }
    tbody.innerHTML = html;
}
async function buscarVeiculo(placa) {
    if (!placa || placa.length < 7) { document.getElementById('multaModelo').value = ''; document.getElementById('multaSecretaria').value = ''; document.getElementById('alertaVeiculoNaoEncontrado').classList.add('hidden'); return; }
    const v = await DB.getVehicleByPlaca(placa);
    if (v) { document.getElementById('multaModelo').value = v.modelo || ''; document.getElementById('multaSecretaria').value = v.secretaria || ''; document.getElementById('alertaVeiculoNaoEncontrado').classList.add('hidden'); }
    else { document.getElementById('multaModelo').value = ''; document.getElementById('multaSecretaria').value = ''; document.getElementById('alertaVeiculoNaoEncontrado').classList.remove('hidden'); }
}
async function salvarVeiculo() {
    const id = document.getElementById('veiculoId').value;
    const placa = document.getElementById('veiculoPlaca').value.toUpperCase().trim();
    const modelo = document.getElementById('veiculoModelo').value.trim();
    const secretaria = document.getElementById('veiculoSecretaria').value.trim();
    const ativo = document.getElementById('veiculoAtivo').value === 'true';
    if (!placa || !modelo || !secretaria) { showToast('Preencha todos campos', 'error'); return; }
    try {
        if (!id) { const e = await DB.getVehicleByPlaca(placa); if (e) { showToast('Placa já existe', 'error'); return; } }
        if (id) { await DB.updateVehicle(id, { placa, modelo, secretaria, ativo }); showToast('Atualizado!', 'success'); }
        else { await DB.addVehicle({ placa, modelo, secretaria, ativo }); showToast('Cadastrado!', 'success'); }
        hideModal('modalNovoVeiculo'); limparFormularioVeiculo(); await carregarVeiculos(); await carregarSecretarias();
    } catch (err) { showToast(err.message, 'error'); }
}
async function editarVeiculo(id) {
    const v = await DB.getVehicleById(id); if (!v) { showToast('Não encontrado', 'error'); return; }
    document.getElementById('veiculoId').value = id; document.getElementById('veiculoPlaca').value = v.placa;
    document.getElementById('veiculoModelo').value = v.modelo; document.getElementById('veiculoSecretaria').value = v.secretaria;
    document.getElementById('veiculoAtivo').value = String(v.ativo !== false);
    document.getElementById('modalVeiculoTitle').textContent = 'Editar Veículo'; showModal('modalNovoVeiculo');
}
async function excluirVeiculo(id) { if (!confirm('Excluir?')) return; await DB.deleteVehicle(id); showToast('Excluído!', 'success'); await carregarVeiculos(); }
function limparFormularioVeiculo() {
    document.getElementById('veiculoId').value = ''; document.getElementById('veiculoPlaca').value = '';
    document.getElementById('veiculoModelo').value = ''; document.getElementById('veiculoSecretaria').value = '';
    document.getElementById('veiculoAtivo').value = 'true'; document.getElementById('modalVeiculoTitle').textContent = 'Novo Veículo';
}
function cadastrarVeiculoRapido() { const p = document.getElementById('multaPlaca').value; hideModal('modalNovaMulta'); limparFormularioVeiculo(); document.getElementById('veiculoPlaca').value = p; showModal('modalNovoVeiculo'); }
function filtrarVeiculos() { carregarVeiculos(); }

// MULTAS
async function carregarMultas() {
    const tbody = document.getElementById('tabelaMultas');
    tbody.innerHTML = '<tr><td colspan="12"><div class="empty-state"><div class="loading-spinner"></div></div></td></tr>';
    const fines = await DB.getFines();
    if (!fines.length) { tbody.innerHTML = '<tr><td colspan="12"><div class="empty-state"><i class="bi bi-file-earmark-text" style="font-size:2rem;color:var(--text-muted);"></i><p>Nenhuma multa</p></div></td></tr>'; return; }
    tbody.innerHTML = fines.map(m => {
        const pr = calcularDiasRestantes(getPrazoAtivo(m));
        return `<tr><td><strong>${m.numero_ait || '-'}</strong></td><td>${m.tipo || '-'}</td><td>${m.placa || '-'}</td><td>${m.secretaria || '-'}</td><td>${m.condutor_infrator || '-'}</td><td>${formatDate(m.data_hora_infracao)}</td><td>R$ ${formatCurrency(m.valor)}</td><td>${getIndicacaoCondutorStatus(m)}</td><td>${pr !== null ? `<span class="prazo-indicator ${getPrazoClass(pr)}">${pr}d</span>` : '-'}</td><td>${getStatusBadge(m.status)}</td><td><button class="action-btn" onclick="verMulta('${m.id}')"><i class="bi bi-eye"></i></button><button class="action-btn" onclick="editarMulta('${m.id}')"><i class="bi bi-pencil"></i></button><button class="action-btn danger" onclick="excluirMulta('${m.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
    }).join('');
}
function getIndicacaoCondutorStatus(multa) {
    if (multa.tipo !== 'AUTUACAO') return '<span class="badge-custom badge-secondary">N/A</span>';
    if (multa.condutor_infrator && multa.condutor_infrator.trim() !== '' && multa.condutor_indicado === true) return '<span class="badge-custom badge-success"><i class="bi bi-check-circle"></i> Indicado</span>';
    if (!multa.prazo_indicacao_condutor) return '<span class="badge-custom badge-secondary">Sem prazo</span>';
    const d = calcularDiasRestantes(multa.prazo_indicacao_condutor);
    if (d === null) return '<span class="badge-custom badge-secondary">-</span>';
    if (d < 0) return `<span class="indicacao-status indicacao-vencido"><i class="bi bi-exclamation-triangle-fill"></i> ESGOTADO (${Math.abs(d)}d)</span>`;
    if (d === 0) return '<span class="indicacao-status indicacao-hoje"><i class="bi bi-clock-fill"></i> VENCE HOJE!</span>';
    if (d <= 3) return `<span class="indicacao-status indicacao-critico"><i class="bi bi-exclamation-circle"></i> ${d}d</span>`;
    if (d <= 7) return `<span class="indicacao-status indicacao-alerta"><i class="bi bi-clock"></i> ${d}d</span>`;
    return `<span class="indicacao-status indicacao-ok"><i class="bi bi-clock"></i> ${d}d</span>`;
}
function atualizarCamposPrazo() {
    const t = document.getElementById('multaTipo').value;
    document.getElementById('camposPrazoAutuacao').classList.toggle('hidden', t !== 'AUTUACAO');
    document.getElementById('camposPrazoPenalidade').classList.toggle('hidden', t !== 'PENALIDADE');
}
function verificarPrazoProtocolo() { document.getElementById('alertaProtocoloAposPrazo').classList.add('hidden'); }

async function salvarMulta() {
    const id = document.getElementById('multaId').value;
    const tipo = document.getElementById('multaTipo').value;
    const numero_ait = document.getElementById('multaAIT').value.trim();
    const placa = document.getElementById('multaPlaca').value.toUpperCase().trim();
    const orgao_autuador = document.getElementById('multaOrgao').value.trim();
    const data_hora_infracao = document.getElementById('multaDataInfracao').value || null;
    const valor = parseFloat(document.getElementById('multaValor').value) || 0;
    const status = document.getElementById('multaStatus').value;
    if (!tipo || !numero_ait || !placa || !orgao_autuador || !data_hora_infracao || !status) { showToast('Preencha campos obrigatórios', 'error'); return; }
    try {
        const e = await DB.getFineByAIT(numero_ait);
        if (e && e.id !== id) { showToast(`AIT já existe (${e.placa})`, 'error'); return; }
        const data = {
            tipo, numero_ait, placa, modelo: document.getElementById('multaModelo').value, secretaria: document.getElementById('multaSecretaria').value,
            orgao_autuador, condutor_infrator: document.getElementById('multaCondutor').value.trim(), data_hora_infracao,
            data_expedicao: document.getElementById('multaDataExpedicao').value || null,
            data_protocolo_entrega: document.getElementById('multaDataProtocolo').value || null,
            prazo_defesa_previa: tipo === 'AUTUACAO' ? document.getElementById('multaPrazoDefesa').value || null : null,
            prazo_indicacao_condutor: tipo === 'AUTUACAO' ? document.getElementById('multaPrazoIndicacao').value || null : null,
            condutor_indicado: tipo === 'AUTUACAO' ? document.getElementById('multaCondutorIndicado').checked : false,
            prazo_recurso_jari: tipo === 'PENALIDADE' ? document.getElementById('multaPrazoJARI').value || null : null,
            prazo_pagamento: tipo === 'PENALIDADE' ? document.getElementById('multaPrazoPagamento').value || null : null,
            valor, status, numero_processo: document.getElementById('multaProcesso').value.trim(),
            link_processo: document.getElementById('multaLinkProcesso').value.trim(), observacoes: document.getElementById('multaObservacoes').value.trim()
        };
        if (id) { await DB.updateFine(id, data); showToast('Atualizada!', 'success'); }
        else { await DB.addFine(data); showToast('Cadastrada!', 'success'); }
        hideModal('modalNovaMulta'); limparFormularioMulta(); await carregarMultas(); await carregarDashboard();
    } catch (err) { showToast(err.message, 'error'); }
}

async function verMulta(id) {
    currentMultaId = id;
    const m = await DB.getFineById(id); if (!m) { showToast('Não encontrada', 'error'); return; }
    const pr = calcularDiasRestantes(getPrazoAtivo(m));
    let html = `<div class="row g-3"><div class="col-md-6"><h6 style="color:var(--text-muted);margin-bottom:0.75rem;font-size:0.85rem;">INFORMAÇÕES GERAIS</h6><table class="table-custom"><tr><td style="width:40%;"><strong>AIT</strong></td><td>${m.numero_ait}</td></tr><tr><td><strong>Tipo</strong></td><td>${m.tipo}</td></tr><tr><td><strong>Status</strong></td><td>${getStatusBadge(m.status)}</td></tr><tr><td><strong>Órgão</strong></td><td>${m.orgao_autuador || '-'}</td></tr><tr><td><strong>Valor</strong></td><td>R$ ${formatCurrency(m.valor)}</td></tr></table></div><div class="col-md-6"><h6 style="color:var(--text-muted);margin-bottom:0.75rem;font-size:0.85rem;">VEÍCULO</h6><table class="table-custom"><tr><td style="width:40%;"><strong>Placa</strong></td><td>${m.placa}</td></tr><tr><td><strong>Modelo</strong></td><td>${m.modelo || '-'}</td></tr><tr><td><strong>Secretaria</strong></td><td>${m.secretaria || '-'}</td></tr><tr><td><strong>Condutor</strong></td><td>${m.condutor_infrator || '-'}</td></tr></table></div></div>`;
    if (m.tipo === 'AUTUACAO') html += `<div class="mt-3 p-3" style="background:var(--bg-tertiary);border-radius:8px;border:1px solid var(--border-color);"><h6 style="color:var(--text-muted);margin-bottom:0.75rem;font-size:0.85rem;">INDICAÇÃO DO CONDUTOR</h6><div class="d-flex align-items-center gap-3"><div><strong>Status:</strong> ${getIndicacaoCondutorStatus(m)}</div>${m.prazo_indicacao_condutor ? `<div><strong>Prazo:</strong> ${formatDate(m.prazo_indicacao_condutor)}</div>` : ''}</div></div>`;
    html += `<div class="row g-3 mt-2"><div class="col-md-6"><h6 style="color:var(--text-muted);margin-bottom:0.75rem;font-size:0.85rem;">DATAS</h6><table class="table-custom"><tr><td style="width:40%;"><strong>Infração</strong></td><td>${formatDateTime(m.data_hora_infracao)}</td></tr><tr><td><strong>Expedição</strong></td><td>${formatDate(m.data_expedicao)}</td></tr><tr><td><strong>Protocolo</strong></td><td>${formatDate(m.data_protocolo_entrega)}</td></tr></table></div><div class="col-md-6"><h6 style="color:var(--text-muted);margin-bottom:0.75rem;font-size:0.85rem;">PRAZOS</h6><table class="table-custom">${m.tipo === 'AUTUACAO' ? `<tr><td style="width:50%;"><strong>Defesa Prévia</strong></td><td>${formatDate(m.prazo_defesa_previa)}</td></tr>` : `<tr><td style="width:50%;"><strong>JARI</strong></td><td>${formatDate(m.prazo_recurso_jari)}</td></tr><tr><td><strong>Pagamento</strong></td><td>${formatDate(m.prazo_pagamento)}</td></tr>`}<tr><td><strong>Dias Restantes</strong></td><td>${pr !== null ? `<span class="prazo-indicator ${getPrazoClass(pr)}">${pr}d</span>` : '-'}</td></tr></table></div></div>`;
    if (m.numero_processo) html += `<p class="mt-3"><strong>Processo:</strong> ${m.numero_processo} ${m.link_processo ? `<a href="${m.link_processo}" target="_blank" class="link-custom">Abrir</a>` : ''}</p>`;
    if (m.observacoes) html += `<p><strong>Obs:</strong> ${m.observacoes}</p>`;
    document.getElementById('modalVerMultaBody').innerHTML = html; showModal('modalVerMulta');
}
function editarMultaAtual() { hideModal('modalVerMulta'); editarMulta(currentMultaId); }
async function editarMulta(id) {
    const m = await DB.getFineById(id); if (!m) { showToast('Não encontrada', 'error'); return; }
    document.getElementById('multaId').value = id; document.getElementById('multaTipo').value = m.tipo;
    document.getElementById('multaAIT').value = m.numero_ait; document.getElementById('multaPlaca').value = m.placa;
    document.getElementById('multaModelo').value = m.modelo || ''; document.getElementById('multaSecretaria').value = m.secretaria || '';
    document.getElementById('multaOrgao').value = m.orgao_autuador || ''; document.getElementById('multaCondutor').value = m.condutor_infrator || '';
    document.getElementById('multaValor').value = m.valor; document.getElementById('multaStatus').value = m.status;
    document.getElementById('multaProcesso').value = m.numero_processo || ''; document.getElementById('multaLinkProcesso').value = m.link_processo || '';
    document.getElementById('multaObservacoes').value = m.observacoes || '';
    if (m.data_hora_infracao) document.getElementById('multaDataInfracao').value = m.data_hora_infracao.slice(0, 16);
    if (m.data_expedicao) document.getElementById('multaDataExpedicao').value = m.data_expedicao.slice(0, 10);
    if (m.data_protocolo_entrega) document.getElementById('multaDataProtocolo').value = m.data_protocolo_entrega.slice(0, 10);
    atualizarCamposPrazo();
    if (m.tipo === 'AUTUACAO') {
        if (m.prazo_defesa_previa) document.getElementById('multaPrazoDefesa').value = m.prazo_defesa_previa.slice(0, 10);
        if (m.prazo_indicacao_condutor) document.getElementById('multaPrazoIndicacao').value = m.prazo_indicacao_condutor.slice(0, 10);
        document.getElementById('multaCondutorIndicado').checked = m.condutor_indicado === true;
    } else {
        if (m.prazo_recurso_jari) document.getElementById('multaPrazoJARI').value = m.prazo_recurso_jari.slice(0, 10);
        if (m.prazo_pagamento) document.getElementById('multaPrazoPagamento').value = m.prazo_pagamento.slice(0, 10);
    }
    document.getElementById('modalMultaTitle').textContent = 'Editar Multa'; showModal('modalNovaMulta');
}
async function excluirMulta(id) { if (!confirm('Excluir?')) return; await DB.deleteFine(id); showToast('Excluída!', 'success'); await carregarMultas(); await carregarDashboard(); }
function limparFormularioMulta() {
    document.getElementById('multaId').value = ''; document.getElementById('formMulta').reset();
    document.getElementById('multaModelo').value = ''; document.getElementById('multaSecretaria').value = '';
    document.getElementById('multaCondutorIndicado').checked = false;
    document.getElementById('alertaVeiculoNaoEncontrado').classList.add('hidden');
    document.getElementById('alertaProtocoloAposPrazo').classList.add('hidden');
    document.getElementById('camposPrazoAutuacao').classList.add('hidden');
    document.getElementById('camposPrazoPenalidade').classList.add('hidden');
    document.getElementById('modalMultaTitle').textContent = 'Nova Multa';
}
function filtrarMultas() { carregarMultas(); }

// DASHBOARD
async function carregarDashboard() {
    const fines = await DB.getFines();
    let total = 0, emAberto = 0, criticos = 0, valorTotal = 0, multasCriticas = [], porMes = {}, porStatus = {};
    fines.forEach(m => {
        total++; valorTotal += parseFloat(m.valor) || 0; porStatus[m.status] = (porStatus[m.status] || 0) + 1;
        if (m.status === 'EM_ABERTO' || m.status === 'RECURSO_EM_JULGAMENTO') {
            emAberto++; const d = calcularDiasRestantes(getPrazoAtivo(m));
            if (d !== null && d <= 10) { criticos++; multasCriticas.push({ ...m, diasRestantes: d }); }
        }
        if (m.data_hora_infracao) { const dt = new Date(m.data_hora_infracao); const mes = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; porMes[mes] = (porMes[mes] || 0) + 1; }
    });
    document.getElementById('statTotal').textContent = total; document.getElementById('statAberto').textContent = emAberto;
    document.getElementById('statCriticos').textContent = criticos; document.getElementById('statValor').textContent = formatCurrency(valorTotal);
    const tbody = document.getElementById('tabelaCriticos');
    if (!multasCriticas.length) tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state" style="padding:2rem;"><i class="bi bi-check-circle text-success" style="font-size:2rem;"></i><p>Nenhum prazo crítico</p></div></td></tr>';
    else { multasCriticas.sort((a, b) => a.diasRestantes - b.diasRestantes); tbody.innerHTML = multasCriticas.slice(0, 10).map(m => `<tr><td><strong>${m.numero_ait}</strong></td><td>${m.placa}</td><td>${m.tipo}</td><td>${formatDate(getPrazoAtivo(m))}</td><td><span class="prazo-indicator ${getPrazoClass(m.diasRestantes)}">${m.diasRestantes}d</span></td><td>${getStatusBadge(m.status)}</td><td><button class="action-btn" onclick="verMulta('${m.id}')"><i class="bi bi-eye"></i></button></td></tr>`).join(''); }
    renderChartMultasMes(porMes); renderChartStatus(porStatus);
}
function renderChartMultasMes(data) {
    const ctx = document.getElementById('chartMultasMes'); if (!ctx) return;
    const meses = Object.keys(data).sort(); const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    if (charts.multasMes) charts.multasMes.destroy();
    charts.multasMes = new Chart(ctx, { type: 'bar', data: { labels: meses.length ? meses.map(m => `${nomes[parseInt(m.split('-')[1]) - 1]}/${m.split('-')[0].slice(2)}`) : ['Sem dados'], datasets: [{ data: meses.length ? meses.map(m => data[m]) : [0], backgroundColor: 'rgba(59,130,246,0.8)', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#6c6c70' } }, y: { beginAtZero: true, grid: { color: '#2a2a2d' }, ticks: { color: '#6c6c70' } } } } });
}
function renderChartStatus(data) {
    const ctx = document.getElementById('chartStatus'); if (!ctx) return;
    const labels = { 'EM_ABERTO': 'Em Aberto', 'RECURSO_EM_JULGAMENTO': 'Recurso', 'RECURSO_DEFERIDO': 'Deferido', 'RECURSO_INDEFERIDO': 'Indeferido', 'PAGO': 'Pago', 'CANCELADO': 'Cancelado' };
    const colors = { 'EM_ABERTO': '#f59e0b', 'RECURSO_EM_JULGAMENTO': '#3b82f6', 'RECURSO_DEFERIDO': '#22c55e', 'RECURSO_INDEFERIDO': '#ef4444', 'PAGO': '#10b981', 'CANCELADO': '#6b7280' };
    const sts = Object.keys(data); if (charts.status) charts.status.destroy();
    charts.status = new Chart(ctx, { type: 'doughnut', data: { labels: sts.length ? sts.map(s => labels[s] || s) : ['Sem dados'], datasets: [{ data: sts.length ? sts.map(s => data[s]) : [1], backgroundColor: sts.length ? sts.map(s => colors[s] || '#6b7280') : ['#2a2a2d'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a0a0a5', padding: 15 } } } } });
}

// CSV
function inicializarDragDrop() {
    const zone = document.getElementById('uploadZone'); if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.csv')) processarCSV(f); else showToast('Selecione CSV', 'error'); });
}
function handleCSVUpload(e) { if (e.target.files[0]) processarCSV(e.target.files[0]); }
async function processarCSV(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const lines = e.target.result.split('\n').filter(l => l.trim()); if (lines.length < 2) { showToast('CSV vazio', 'error'); return; }
        const header = parseCSVLine(lines[0]); const map = mapearColunas(header); importData = []; let valid = 0, invalid = 0;
        for (let i = 1; i < lines.length; i++) {
            const vals = parseCSVLine(lines[i]); if (vals.length < 3) continue;
            const row = { linha: i, numero_ait: getVal(vals, map, 'ait'), tipo: getVal(vals, map, 'tipo')?.toUpperCase(), orgao_autuador: getVal(vals, map, 'orgao'), placa: getVal(vals, map, 'placa')?.toUpperCase(), condutor_infrator: getVal(vals, map, 'condutor'), data_hora_infracao: getVal(vals, map, 'data_infracao'), valor: parseFloat(getVal(vals, map, 'valor')?.replace(',', '.')) || 0, status: getVal(vals, map, 'status') || 'EM_ABERTO', secretaria: getVal(vals, map, 'secretaria'), valido: true, erro: '' };
            if (!row.numero_ait) { row.valido = false; row.erro = 'AIT obrigatório'; }
            else if (!row.tipo || !['AUTUACAO', 'PENALIDADE'].includes(row.tipo)) { row.valido = false; row.erro = 'Tipo inválido'; }
            else if (!row.placa) { row.valido = false; row.erro = 'Placa obrigatória'; }
            else if (!row.data_hora_infracao) { row.valido = false; row.erro = 'Data obrigatória'; }
            else { const ex = await DB.getFineByAIT(row.numero_ait); if (ex) { row.valido = false; row.erro = 'AIT duplicado'; row.duplicado = true; } }
            row.valido ? valid++ : invalid++; importData.push(row);
        }
        document.getElementById('importValidCount').textContent = `${valid} válidos`; document.getElementById('importInvalidCount').textContent = `${invalid} inválidos`;
        document.getElementById('importPreviewCard').classList.remove('hidden');
        document.getElementById('importPreviewBody').innerHTML = importData.map(r => `<tr class="${r.valido ? 'import-row-valid' : r.duplicado ? 'import-row-duplicate' : 'import-row-invalid'}"><td>${r.linha}</td><td>${r.valido ? '<i class="bi bi-check-circle text-success"></i>' : '<i class="bi bi-x-circle text-danger"></i>'}</td><td>${r.numero_ait || '-'}</td><td>${r.tipo || '-'}</td><td>${r.placa || '-'}</td><td>${r.condutor_infrator || '-'}</td><td>${r.data_hora_infracao || '-'}</td><td>${r.valor || '-'}</td><td style="color:var(--danger);">${r.erro || '-'}</td></tr>`).join('');
        importData.filename = file.name;
    }; reader.readAsText(file);
}
function parseCSVLine(line) { const r = []; let c = '', q = false; for (const ch of line) { if (ch === '"') q = !q; else if ((ch === ',' || ch === ';') && !q) { r.push(c.trim()); c = ''; } else c += ch; } r.push(c.trim()); return r; }
function mapearColunas(h) { const m = { ait: ['ait', 'numero_ait'], tipo: ['tipo'], orgao: ['orgao', 'órgão'], placa: ['placa'], condutor: ['condutor', 'motorista'], data_infracao: ['data_infracao', 'data_hora_infracao', 'data'], valor: ['valor'], status: ['status', 'situacao'], secretaria: ['secretaria', 'setor'] }; const map = {}; h.forEach((c, i) => { const l = c.toLowerCase().trim(); for (const [k, a] of Object.entries(m)) { if (a.some(x => l.includes(x))) { map[k] = i; break; } } }); return map; }
function getVal(v, m, k) { return m[k] !== undefined ? v[m[k]]?.trim() : ''; }
function cancelarImportacao() { importData = []; document.getElementById('importPreviewCard').classList.add('hidden'); document.getElementById('csvFile').value = ''; }
async function confirmarImportacao() {
    const validos = importData.filter(r => r.valido); if (!validos.length) { showToast('Nenhum válido', 'error'); return; }
    const btn = document.getElementById('btnConfirmarImport'); btn.disabled = true; btn.innerHTML = '<div class="loading-spinner"></div> Importando...';
    let importados = 0;
    for (const row of validos) { try { await DB.addFine({ tipo: row.tipo, numero_ait: row.numero_ait, placa: row.placa, secretaria: row.secretaria || '', orgao_autuador: row.orgao_autuador || '', condutor_infrator: row.condutor_infrator || '', data_hora_infracao: parseDate(row.data_hora_infracao), valor: row.valor, status: row.status || 'EM_ABERTO', importado: true }); importados++; } catch (err) { console.error('Import err:', row.numero_ait, err); } }
    await DB.addImportLog({ data: new Date().toISOString(), usuario: 'AMTC', arquivo: importData.filename || 'arquivo.csv', total_importado: importados, total_rejeitado: importData.filter(r => !r.valido).length });
    showToast(`${importados} importadas!`, 'success'); cancelarImportacao(); await carregarMultas(); await carregarDashboard(); await carregarLogImportacoes();
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg"></i> Confirmar Importação';
}
function parseDate(s) { if (!s) return new Date().toISOString(); const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/); if (m) return new Date(m[3], m[2] - 1, m[1]).toISOString(); return new Date(s).toISOString(); }
async function carregarLogImportacoes() {
    const tbody = document.getElementById('tabelaImportLogs'); const logs = await DB.getImportLogs();
    if (!logs.length) { tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">Nenhuma importação</div></td></tr>'; return; }
    tbody.innerHTML = logs.map(l => `<tr><td>${formatDateTime(l.data)}</td><td>${l.usuario}</td><td><span class="badge-custom badge-success">${l.total_importado}</span></td><td><span class="badge-custom badge-danger">${l.total_rejeitado}</span></td><td>${l.arquivo || '-'}</td></tr>`).join('');
}

// RELATÓRIOS
async function gerarRelatorios() {
    const fines = await DB.getFines(); const porSecretaria = {}, porCondutor = {};
    fines.forEach(m => {
        const sec = m.secretaria || 'Não informada'; if (!porSecretaria[sec]) porSecretaria[sec] = { total: 0, aberto: 0, valor: 0 };
        porSecretaria[sec].total++; porSecretaria[sec].valor += parseFloat(m.valor) || 0;
        if (m.status === 'EM_ABERTO' || m.status === 'RECURSO_EM_JULGAMENTO') porSecretaria[sec].aberto++;
        const cond = m.condutor_infrator || 'Não identificado'; if (!porCondutor[cond]) porCondutor[cond] = { total: 0, reincidencias: 0, valor: 0 };
        porCondutor[cond].total++; porCondutor[cond].valor += parseFloat(m.valor) || 0; if (porCondutor[cond].total > 1) porCondutor[cond].reincidencias = porCondutor[cond].total - 1;
    });
    const secRank = Object.entries(porSecretaria).map(([n, d]) => ({ nome: n, ...d })).sort((a, b) => b.total - a.total);
    document.getElementById('rankingSecretarias').innerHTML = secRank.slice(0, 10).map((s, i) => `<tr><td><span class="ranking-position ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</span></td><td>${s.nome}</td><td>${s.total}</td><td>${s.aberto}</td><td>R$ ${formatCurrency(s.valor)}</td></tr>`).join('') || '<tr><td colspan="5">Sem dados</td></tr>';
    const condRank = Object.entries(porCondutor).map(([n, d]) => ({ nome: n, ...d })).sort((a, b) => b.total - a.total);
    document.getElementById('rankingCondutores').innerHTML = condRank.slice(0, 10).map((c, i) => `<tr><td><span class="ranking-position ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</span></td><td>${c.nome}</td><td>${c.total}</td><td>${c.reincidencias}</td><td>R$ ${formatCurrency(c.valor)}</td></tr>`).join('') || '<tr><td colspan="5">Sem dados</td></tr>';
    renderChartSecretarias(secRank.slice(0, 8)); renderChartValorSecretarias(secRank.slice(0, 8));
}
function renderChartSecretarias(data) { const ctx = document.getElementById('chartSecretarias'); if (!ctx) return; if (charts.secretarias) charts.secretarias.destroy(); charts.secretarias = new Chart(ctx, { type: 'bar', data: { labels: data.map(d => d.nome.substring(0, 15)), datasets: [{ data: data.map(d => d.total), backgroundColor: 'rgba(59,130,246,0.8)', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: '#2a2a2d' }, ticks: { color: '#6c6c70' } }, y: { grid: { display: false }, ticks: { color: '#a0a0a5' } } } } }); }
function renderChartValorSecretarias(data) { const ctx = document.getElementById('chartValorSecretarias'); if (!ctx) return; if (charts.valorSecretarias) charts.valorSecretarias.destroy(); charts.valorSecretarias = new Chart(ctx, { type: 'bar', data: { labels: data.map(d => d.nome.substring(0, 15)), datasets: [{ data: data.map(d => d.valor), backgroundColor: 'rgba(34,197,94,0.8)', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: '#2a2a2d' }, ticks: { color: '#6c6c70' } }, y: { grid: { display: false }, ticks: { color: '#a0a0a5' } } } } }); }

// CONFIGURAÇÕES
async function carregarConfiguracoes() {
    const c = await DB.getSettings(); document.getElementById('configDiasAlerta').value = (c.dias_alerta || [10, 5, 3]).join(', ');
    document.getElementById('configEmails').value = (c.emails || []).join('\n');
    const cue = document.getElementById('configUserEmail'); if (cue) { const fg = cue.closest('.form-group'); if (fg) fg.remove(); }
}
async function salvarConfiguracoes() {
    const dias = document.getElementById('configDiasAlerta').value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    const emails = document.getElementById('configEmails').value.split('\n').map(e => e.trim()).filter(e => e);
    try { await DB.saveSettings({ dias_alerta: dias, emails }); showToast('Configurações salvas!', 'success'); } catch (err) { showToast(err.message, 'error'); }
}

// EXPORTAÇÃO
async function exportarMultasCSV() {
    const fines = await DB.getFines(); const headers = ['AIT', 'Tipo', 'Placa', 'Secretaria', 'Condutor', 'Data Infração', 'Valor', 'Status', 'Processo'];
    const rows = [headers.join(';')]; fines.forEach(m => { rows.push([m.numero_ait || '', m.tipo || '', m.placa || '', m.secretaria || '', m.condutor_infrator || '', formatDate(m.data_hora_infracao), m.valor || 0, m.status || '', m.numero_processo || ''].join(';')); });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `multas_${new Date().toISOString().slice(0, 10)}.csv`; link.click(); showToast('Exportado!', 'success');
}
function exportarRelatorio() { exportarMultasCSV(); }

// ALERTAS
async function carregarAlertas(tipo = 'vencidas') {
    const fines = await DB.getFines(); let vencidas = [], venceHoje = [], proxSemana = [], indicacoes = [], todas = [];
    fines.forEach(m => {
        if (m.status !== 'EM_ABERTO' && m.status !== 'RECURSO_EM_JULGAMENTO') return;
        const prazo = getPrazoAtivo(m);
        if (prazo) { const d = calcularDiasRestantes(prazo); const item = { ...m, tipoPrazo: 'Recurso', dataPrazo: prazo, dias: d }; if (d < 0) vencidas.push(item); else if (d === 0) venceHoje.push(item); else if (d <= 7) proxSemana.push(item); todas.push(item); }
        if (m.tipo === 'AUTUACAO' && !m.condutor_indicado && m.prazo_indicacao_condutor) { const d = calcularDiasRestantes(m.prazo_indicacao_condutor); const item = { ...m, tipoPrazo: 'Indicação', dataPrazo: m.prazo_indicacao_condutor, dias: d }; indicacoes.push(item); if (d < 0) vencidas.push(item); else if (d === 0) venceHoje.push(item); }
    });
    document.getElementById('alertVencidas').textContent = vencidas.length; document.getElementById('alertHoje').textContent = venceHoje.length;
    document.getElementById('alertSemana').textContent = proxSemana.length; document.getElementById('alertIndicacao').textContent = indicacoes.length;
    let lista = []; switch (tipo) { case 'vencidas': lista = vencidas; break; case 'criticas': lista = [...vencidas, ...venceHoje, ...proxSemana.filter(x => x.dias <= 5)]; break; case 'indicacoes': lista = indicacoes; break; case 'todas': lista = todas; break; }
    lista.sort((a, b) => (a.dias || 0) - (b.dias || 0));
    const tbody = document.getElementById('tabelaAlertas');
    if (!lista.length) { tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="bi bi-check-circle" style="color:var(--success);font-size:2rem;"></i><p>Nenhum alerta</p></div></td></tr>'; return; }
    tbody.innerHTML = lista.map(m => {
        let urg = '<span class="badge-custom badge-info">Normal</span>';
        if (m.dias < 0) urg = '<span class="badge-custom badge-danger">Vencido</span>'; else if (m.dias === 0) urg = '<span class="badge-custom badge-warning">Hoje</span>'; else if (m.dias <= 3) urg = '<span class="badge-custom badge-danger">Crítico</span>'; else if (m.dias <= 7) urg = '<span class="badge-custom badge-warning">Atenção</span>';
        return `<tr><td>${urg}</td><td><strong>${m.numero_ait}</strong></td><td>${m.placa}</td><td>${m.secretaria || '-'}</td><td>${m.tipoPrazo}</td><td>${formatDate(m.dataPrazo)}</td><td><span class="prazo-indicator ${getPrazoClass(m.dias)}">${m.dias}d</span></td><td><button class="action-btn" onclick="verMulta('${m.id}')"><i class="bi bi-eye"></i></button><button class="action-btn" onclick="editarMulta('${m.id}')"><i class="bi bi-pencil"></i></button></td></tr>`;
    }).join('');
}
async function atualizarBadgeAlertas() {
    const fines = await DB.getFines(); let total = 0;
    fines.forEach(m => {
        if (m.status === 'EM_ABERTO' || m.status === 'RECURSO_EM_JULGAMENTO') { const d = calcularDiasRestantes(getPrazoAtivo(m)); if (d !== null && d <= 5) total++; }
        if (m.tipo === 'AUTUACAO' && !m.condutor_indicado && m.prazo_indicacao_condutor) { const d = calcularDiasRestantes(m.prazo_indicacao_condutor); if (d !== null && d <= 5) total++; }
    });
    const badge = document.getElementById('alertasBadge'); if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline-block' : 'none'; }
}

// CONDUTORES
async function carregarCondutores() {
    const tbody = document.getElementById('tabelaCondutores'); if (!tbody) return;
    const condutores = await DB.getCondutores();
    if (!condutores.length) { tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="bi bi-person" style="font-size:2rem;color:var(--text-muted);"></i><p>Nenhum condutor</p></div></td></tr>'; return; }
    const fines = await DB.getFines();
    tbody.innerHTML = condutores.map(c => {
        const multas = fines.filter(m => m.condutor_infrator === c.nome); const cnhV = c.validade_cnh && new Date(c.validade_cnh) < new Date();
        return `<tr><td><strong>${c.nome}</strong></td><td>${c.cpf || '-'}</td><td>${c.cnh || '-'}</td><td>${c.validade_cnh ? `<span class="${cnhV ? 'text-danger' : ''}">${formatDate(c.validade_cnh)}</span>` : '-'}</td><td>${c.secretaria || '-'}</td><td>${multas.length}</td><td><button class="action-btn" onclick="editarCondutor('${c.id}')"><i class="bi bi-pencil"></i></button><button class="action-btn danger" onclick="excluirCondutor('${c.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
    }).join('');
}
function abrirNovoCondutor() { document.getElementById('condutorId').value = ''; document.getElementById('formCondutor').reset(); document.getElementById('modalCondutorTitle').textContent = 'Novo Condutor'; showModal('modalCondutor'); }
async function salvarCondutor() {
    const id = document.getElementById('condutorId').value; const nome = document.getElementById('condutorNome').value.trim();
    if (!nome) { showToast('Nome obrigatório', 'error'); return; }
    const data = { nome, cpf: document.getElementById('condutorCPF').value.trim(), cnh: document.getElementById('condutorCNH').value.trim(), categoria: document.getElementById('condutorCategoria').value, validade_cnh: document.getElementById('condutorValidadeCNH').value || null, secretaria: document.getElementById('condutorSecretaria').value.trim(), telefone: document.getElementById('condutorTelefone').value.trim() };
    try { if (id) { await DB.updateCondutor(id, data); showToast('Atualizado!', 'success'); } else { await DB.addCondutor(data); showToast('Cadastrado!', 'success'); } hideModal('modalCondutor'); carregarCondutores(); } catch (err) { showToast(err.message, 'error'); }
}
async function editarCondutor(id) {
    const c = await DB.getCondutorById(id); if (!c) return;
    document.getElementById('condutorId').value = id; document.getElementById('condutorNome').value = c.nome;
    document.getElementById('condutorCPF').value = c.cpf || ''; document.getElementById('condutorCNH').value = c.cnh || '';
    document.getElementById('condutorCategoria').value = c.categoria || ''; document.getElementById('condutorValidadeCNH').value = c.validade_cnh || '';
    document.getElementById('condutorSecretaria').value = c.secretaria || ''; document.getElementById('condutorTelefone').value = c.telefone || '';
    document.getElementById('modalCondutorTitle').textContent = 'Editar Condutor'; showModal('modalCondutor');
}
async function excluirCondutor(id) { if (!confirm('Excluir?')) return; await DB.deleteCondutor(id); showToast('Excluído!', 'success'); carregarCondutores(); }

// AUDIÊNCIAS
async function carregarAudiencias() {
    const tbody = document.getElementById('tabelaAudiencias'); if (!tbody) return;
    const audiencias = await DB.getAudiencias();
    if (!audiencias.length) { tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="bi bi-calendar" style="font-size:2rem;color:var(--text-muted);"></i><p>Nenhuma audiência</p></div></td></tr>'; return; }
    const fines = await DB.getFines();
    tbody.innerHTML = audiencias.map(a => {
        const multa = fines.find(m => m.id === a.multa_id); const passada = new Date(a.data) < new Date();
        return `<tr style="${passada ? 'opacity:0.5;' : ''}"><td>${formatDate(a.data)}</td><td>${a.horario}</td><td><span class="badge-custom badge-info">${a.orgao}</span></td><td>${multa?.numero_ait || '-'}</td><td>${multa?.placa || '-'}</td><td>Recurso</td><td>${a.resultado ? getStatusBadge(a.resultado) : '<span class="badge-custom badge-warning">Pendente</span>'}</td><td><button class="action-btn" onclick="editarAudiencia('${a.id}')"><i class="bi bi-pencil"></i></button><button class="action-btn danger" onclick="excluirAudiencia('${a.id}')"><i class="bi bi-trash"></i></button></td></tr>`;
    }).join('');
}
async function abrirNovaAudiencia() {
    document.getElementById('audienciaId').value = ''; document.getElementById('formAudiencia').reset();
    const fines = await DB.getFines(); const select = document.getElementById('audienciaMulta');
    select.innerHTML = '<option value="">Selecione</option>' + fines.filter(m => m.status === 'RECURSO_EM_JULGAMENTO' || m.status === 'EM_ABERTO').map(m => `<option value="${m.id}">${m.numero_ait} - ${m.placa}</option>`).join('');
    document.getElementById('modalAudienciaTitle').textContent = 'Nova Audiência'; showModal('modalAudiencia');
}
async function salvarAudiencia() {
    const id = document.getElementById('audienciaId').value; const multa_id = document.getElementById('audienciaMulta').value;
    const data = document.getElementById('audienciaData').value; const horario = document.getElementById('audienciaHorario').value; const orgao = document.getElementById('audienciaOrgao').value;
    if (!multa_id || !data || !horario || !orgao) { showToast('Preencha obrigatórios', 'error'); return; }
    const dados = { multa_id, data, horario, orgao, local: document.getElementById('audienciaLocal').value.trim(), observacoes: document.getElementById('audienciaObs').value.trim() };
    try { if (id) { await DB.updateAudiencia(id, dados); showToast('Atualizada!', 'success'); } else { await DB.addAudiencia(dados); showToast('Agendada!', 'success'); } hideModal('modalAudiencia'); carregarAudiencias(); } catch (err) { showToast(err.message, 'error'); }
}
async function editarAudiencia(id) {
    const a = await DB.getAudienciaById(id); if (!a) return;
    const fines = await DB.getFines(); const select = document.getElementById('audienciaMulta');
    select.innerHTML = '<option value="">Selecione</option>' + fines.map(m => `<option value="${m.id}">${m.numero_ait} - ${m.placa}</option>`).join('');
    document.getElementById('audienciaId').value = id; document.getElementById('audienciaMulta').value = a.multa_id;
    document.getElementById('audienciaData').value = a.data; document.getElementById('audienciaHorario').value = a.horario;
    document.getElementById('audienciaOrgao').value = a.orgao; document.getElementById('audienciaLocal').value = a.local || '';
    document.getElementById('audienciaObs').value = a.observacoes || ''; document.getElementById('modalAudienciaTitle').textContent = 'Editar'; showModal('modalAudiencia');
}
async function excluirAudiencia(id) { if (!confirm('Excluir?')) return; await DB.deleteAudiencia(id); showToast('Excluída!', 'success'); carregarAudiencias(); }

// HISTÓRICO
async function verHistoricoMulta() {
    const historico = await DB.getHistorico(currentMultaId); const container = document.getElementById('timelineHistorico');
    if (!historico.length) container.innerHTML = '<div class="empty-state" style="padding:1rem;"><p>Nenhuma alteração</p></div>';
    else container.innerHTML = historico.map(h => `<div style="position:relative;padding-left:1.5rem;padding-bottom:1rem;border-left:2px solid var(--border-color);margin-left:6px;"><div style="position:absolute;left:-6px;top:0;width:12px;height:12px;border-radius:50%;background:var(--accent-primary);"></div><div style="font-size:0.7rem;color:var(--text-muted);">${formatDateTime(h.created_at)}</div><div style="font-size:0.85rem;"><strong>${h.usuario || 'Sistema'}</strong>: ${h.descricao || 'alteração'}</div></div>`).join('');
    hideModal('modalVerMulta'); showModal('modalHistorico');
}

// ANEXOS
async function verAnexosMulta() { await carregarAnexosMulta(); hideModal('modalVerMulta'); showModal('modalAnexos'); }
async function carregarAnexosMulta() {
    const anexos = await DB.getAnexos(currentMultaId); const container = document.getElementById('listaAnexos');
    if (!anexos.length) container.innerHTML = '<div class="empty-state" style="padding:1rem;"><p style="font-size:0.85rem;">Nenhum anexo</p></div>';
    else container.innerHTML = anexos.map(a => `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:var(--bg-tertiary);border-radius:8px;margin-bottom:0.5rem;"><i class="bi bi-file-earmark-${a.tipo?.includes('pdf') ? 'pdf' : 'image'}" style="font-size:1.5rem;color:var(--accent-primary);"></i><div style="flex:1;min-width:0;"><div style="font-size:0.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.nome}</div><div style="font-size:0.7rem;color:var(--text-muted);">${formatDate(a.created_at)}</div></div><a href="${a.data_url}" download="${a.nome}" class="action-btn"><i class="bi bi-download"></i></a><button class="action-btn danger" onclick="excluirAnexoMulta('${a.id}')"><i class="bi bi-trash"></i></button></div>`).join('');
}
function handleAnexoUpload(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (e) { try { await DB.addAnexo({ multa_id: currentMultaId, nome: file.name, tipo: file.type, data_url: e.target.result }); showToast('Anexo adicionado!', 'success'); carregarAnexosMulta(); } catch (err) { showToast(err.message, 'error'); } };
    reader.readAsDataURL(file); event.target.value = '';
}
async function excluirAnexoMulta(id) { if (!confirm('Excluir?')) return; await DB.deleteAnexo(id); showToast('Excluído!', 'success'); carregarAnexosMulta(); }

function logout() { showToast('Sistema sem login', 'info'); }
function showRegister() { showToast('Sistema sem login', 'info'); }

// GLOBAL
window.logout = logout; window.showRegister = showRegister; window.showModal = showModal; window.buscarVeiculo = buscarVeiculo;
window.salvarVeiculo = salvarVeiculo; window.editarVeiculo = editarVeiculo; window.excluirVeiculo = excluirVeiculo;
window.cadastrarVeiculoRapido = cadastrarVeiculoRapido; window.filtrarVeiculos = filtrarVeiculos;
window.atualizarCamposPrazo = atualizarCamposPrazo; window.verificarPrazoProtocolo = verificarPrazoProtocolo;
window.salvarMulta = salvarMulta; window.verMulta = verMulta; window.editarMulta = editarMulta;
window.editarMultaAtual = editarMultaAtual; window.excluirMulta = excluirMulta; window.filtrarMultas = filtrarMultas;
window.handleCSVUpload = handleCSVUpload; window.cancelarImportacao = cancelarImportacao;
window.confirmarImportacao = confirmarImportacao; window.gerarRelatorios = gerarRelatorios;
window.salvarConfiguracoes = salvarConfiguracoes; window.exportarMultasCSV = exportarMultasCSV;
window.exportarRelatorio = exportarRelatorio; window.carregarAlertas = carregarAlertas;
window.abrirNovoCondutor = abrirNovoCondutor; window.salvarCondutor = salvarCondutor;
window.editarCondutor = editarCondutor; window.excluirCondutor = excluirCondutor;
window.abrirNovaAudiencia = abrirNovaAudiencia; window.salvarAudiencia = salvarAudiencia;
window.editarAudiencia = editarAudiencia; window.excluirAudiencia = excluirAudiencia;
window.verHistoricoMulta = verHistoricoMulta; window.verAnexosMulta = verAnexosMulta;
window.handleAnexoUpload = handleAnexoUpload; window.excluirAnexoMulta = excluirAnexoMulta;
console.log('SGMV v3 - Supabase (acesso público)');

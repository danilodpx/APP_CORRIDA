const App = (() => {
    // =====================
    // Variáveis Privadas
    // =====================
    let sessoes = [];

    // =====================
    // Utilitários de Tempo e Pace
    // =====================
    function formatarTempo(segundosTotais) {
        const horas = Math.floor(segundosTotais / 3600);
        const minutos = Math.floor((segundosTotais % 3600) / 60);
        const segundos = Math.floor(segundosTotais % 60);
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    function formatarPace(segundosPorKm) {
        if (!isFinite(segundosPorKm) || segundosPorKm <= 0) return '--:--';
        const minutos = Math.floor(segundosPorKm / 60);
        const segundos = Math.floor(segundosPorKm % 60);
        return `${minutos}:${segundos.toString().padStart(2, '0')}`;
    }

    function calcularPace(distanciaMetros, tempoSegundos) {
        const km = distanciaMetros / 1000;
        return km > 0 ? tempoSegundos / km : 0;
    }

    function calcularVelocidade(distanciaMetros, tempoSegundos) {
        const km = distanciaMetros / 1000;
        const horas = tempoSegundos / 3600;
        return horas > 0 ? km / horas : 0;
    }

    function obterTempoEmSegundos(horas, minutos, segundos) {
        return (parseInt(horas) || 0) * 3600 + (parseInt(minutos) || 0) * 60 + (parseInt(segundos) || 0);
    }

    // =====================
    // Sessões de Treino
    // =====================
    function adicionarSessao() {
        const tipo = document.getElementById('tipoTreino').value;
        const distancia = parseInt(document.getElementById('distancia').value);
        const horas = document.getElementById('horas').value;
        const minutos = document.getElementById('minutos').value;
        const segundos = document.getElementById('segundos').value;

        if (!distancia || distancia <= 0) {
            alert('Por favor, insira uma distância válida.');
            return;
        }

        const tempoSegundos = obterTempoEmSegundos(horas, minutos, segundos);
        if (tempoSegundos <= 0) {
            alert('Por favor, insira um tempo válido.');
            return;
        }

        const pace = calcularPace(distancia, tempoSegundos);
        const velocidade = calcularVelocidade(distancia, tempoSegundos);

        sessoes.push({ tipo, distancia, tempoSegundos, pace, velocidade });
        atualizarTabela();
        atualizarEstatisticas();
        limparFormulario();
    }

    function removerSessao(index) {
        sessoes.splice(index, 1);
        atualizarTabela();
        atualizarEstatisticas();
    }

    function atualizarTabela() {
        const tbody = document.getElementById('sessoesTabela');
        if (sessoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma sessão registrada ainda</td></tr>';
            return;
        }
        const isMobile = window.innerWidth <= 600;
        tbody.innerHTML = sessoes.map((sessao, index) => {
            if (isMobile) {
                return `
            <tr data-index="${index}">
                <td data-label="Tipo">${sessao.tipo}</td>
                <td data-label="Distância (m)">
                    ${sessao.distancia.toLocaleString()} m
                    <button class="btn-toggle-info" type="button" aria-label="Mostrar mais" title="Mostrar mais">
                        <span class="toggle-icon">▼</span>
                    </button>
                </td>
                <td class="td-extra" data-label="Tempo" style="display:none;">${formatarTempo(sessao.tempoSegundos)}</td>
                <td class="td-extra" data-label="Pace" style="display:none;">${formatarPace(sessao.pace)}/km</td>
                <td class="td-extra" data-label="Velocidade" style="display:none;">${sessao.velocidade.toFixed(2)} km/h</td>
                <td class="td-extra" data-label="Ação" style="display:none;">
                    <button class="btn btn-danger btn-remover" data-index="${index}">🗑️</button>
                </td>
            </tr>
            `;
            } else {
                return `
            <tr data-index="${index}">
                <td data-label="Tipo">${sessao.tipo}</td>
                <td data-label="Distância (m)">${sessao.distancia.toLocaleString()} m</td>
                <td data-label="Tempo">${formatarTempo(sessao.tempoSegundos)}</td>
                <td data-label="Pace">${formatarPace(sessao.pace)}/km</td>
                <td data-label="Velocidade">${sessao.velocidade.toFixed(2)} km/h</td>
                <td data-label="Ação"><button class="btn btn-danger btn-remover" data-index="${index}">🗑️</button></td>
            </tr>
            `;
            }
        }).join('');
    }

    function atualizarEstatisticas() {
        if (sessoes.length === 0) {
            document.getElementById('tempoTotal').textContent = '00:00:00';
            document.getElementById('distanciaTotal').textContent = '0 m';
            document.getElementById('distanciaMin').textContent = '- m';
            document.getElementById('distanciaMax').textContent = '- m';
            document.getElementById('paceMedio').textContent = '--:--';
            document.getElementById('paceMin').textContent = '--:--';
            document.getElementById('paceMax').textContent = '--:--';
            document.getElementById('velocidadeMedia').textContent = '0 km/h';
            return;
        }

        const tempoTotal = sessoes.reduce((total, sessao) => total + sessao.tempoSegundos, 0);
        const distanciaTotal = sessoes.reduce((total, sessao) => total + sessao.distancia, 0);
        const distancias = sessoes.map(s => s.distancia);
        const paces = sessoes.map(s => s.pace);
        const velocidades = sessoes.map(s => s.velocidade);

        const paceMedio = calcularPace(distanciaTotal, tempoTotal);
        const velocidadeMedia = calcularVelocidade(distanciaTotal, tempoTotal);

        document.getElementById('tempoTotal').textContent = formatarTempo(tempoTotal);
        document.getElementById('distanciaTotal').textContent = `${distanciaTotal.toLocaleString()} m`;
        document.getElementById('distanciaMin').textContent = `${Math.min(...distancias).toLocaleString()} m`;
        document.getElementById('distanciaMax').textContent = `${Math.max(...distancias).toLocaleString()} m`;
        document.getElementById('paceMedio').textContent = `${formatarPace(paceMedio)}/km`;
        document.getElementById('paceMin').textContent = `${formatarPace(Math.min(...paces))}/km`;
        document.getElementById('paceMax').textContent = `${formatarPace(Math.max(...paces))}/km`;
        document.getElementById('velocidadeMedia').textContent = `${velocidadeMedia.toFixed(2)} km/h`;
    }

    // =====================
    // Calculadora de Performance
    // =====================
    function calcularPrevisoes() {
        const distanciaRef = parseInt(document.getElementById('distanciaRef').value);
        const horasRef = document.getElementById('horasRef').value;
        const minutosRef = document.getElementById('minutosRef').value;
        const segundosRef = document.getElementById('segundosRef').value;

        if (!distanciaRef || distanciaRef <= 0) {
            alert('Por favor, insira uma distância de referência válida.');
            return;
        }

        const tempoRefSegundos = obterTempoEmSegundos(horasRef, minutosRef, segundosRef);
        if (tempoRefSegundos <= 0) {
            alert('Por favor, insira um tempo de referência válido.');
            return;
        }

        const velocidadeRef = calcularVelocidade(distanciaRef, tempoRefSegundos);
        const paceRef = calcularPace(distanciaRef, tempoRefSegundos);

        document.getElementById('velocidadeRef').textContent = `${velocidadeRef.toFixed(2)} km/h`;
        document.getElementById('paceRef').textContent = `${formatarPace(paceRef)}/km`;

        const distancias = [100, 200, 400, 5000, 10000, 15000, 21097, 42195];
        const fatores = {
            100: 1.15,
            200: 1.12,
            400: 1.08,
            5000: 1.0,
            10000: 0.95,
            15000: 0.92,
            21097: 0.88,
            42195: 0.82
        };

        let fatorBase = 1.0;
        if (distanciaRef <= 1000) fatorBase = 0.85;
        else if (distanciaRef <= 5000) fatorBase = 1.0;
        else if (distanciaRef <= 10000) fatorBase = 1.05;
        else fatorBase = 1.1;

        distancias.forEach(dist => {
            const fatorAjustado = fatores[dist] * fatorBase;
            const velocidadePrev = velocidadeRef * fatorAjustado;
            const tempoPrev = (dist / 1000) / velocidadePrev * 3600;

            const elementId = `prev${dist === 21097 ? '21km' : dist === 42195 ? '42km' : dist >= 1000 ? (dist/1000) + 'km' : dist + 'm'}`;
            document.getElementById(elementId).textContent = formatarTempo(tempoPrev);
        });

        document.getElementById('previsoesGrid').style.display = 'grid';
        document.getElementById('performanceStats').style.display = 'grid';
    }

    // =====================
    // Utilitários de Interface
    // =====================
    function limparFormulario() {
        document.getElementById('distancia').value = '';
        document.getElementById('horas').value = '';
        document.getElementById('minutos').value = '';
        document.getElementById('segundos').value = '';
    }

    function limparTudo() {
        if (confirm('Tem certeza que deseja limpar todas as sessões?')) {
            sessoes = [];
            atualizarTabela();
            atualizarEstatisticas();
        }
    }

    // =====================
    // Eventos
    // =====================
    function bindEvents() {
        document.getElementById('btnAdicionarSessao').addEventListener('click', adicionarSessao);
        document.getElementById('btnLimparTudo').addEventListener('click', limparTudo);
        document.getElementById('btnCalcularPrevisoes').addEventListener('click', calcularPrevisoes);

        document.getElementById('sessoesTabela').addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-remover')) {
                const idx = parseInt(e.target.getAttribute('data-index'));
                removerSessao(idx);
            }
            // Alternar exibição das infos extras no mobile
            if (
                e.target.classList.contains('btn-toggle-info') ||
                (e.target.classList.contains('toggle-icon') && e.target.parentElement.classList.contains('btn-toggle-info'))
            ) {
                // Garante que o botão seja o alvo
                const btn = e.target.classList.contains('btn-toggle-info') ? e.target : e.target.parentElement;
                const tr = btn.closest('tr');
                const extras = tr.querySelectorAll('.td-extra');
                const icon = btn.querySelector('.toggle-icon');
                const expanded = btn.getAttribute('aria-expanded') === 'true';

                extras.forEach(td => {
                    td.style.display = expanded ? 'none' : 'block';
                });

                btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                icon.textContent = expanded ? '▼' : '▲';
            }
        });
    }

    // =====================
    // Inicialização
    // =====================
    function init() {
        atualizarTabela();
        atualizarEstatisticas();
        bindEvents();
        // Atualiza a tabela ao redimensionar a janela (responsividade dinâmica)
        window.addEventListener('resize', atualizarTabela);
    }

    // Expor apenas o init
    return { init };
})();

window.addEventListener('DOMContentLoaded', App.init);
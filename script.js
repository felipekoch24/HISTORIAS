// ==========================================
// CONFIGURAÇÃO DO CHANGELOG / ATUALIZAÇÕES
// ==========================================
// Mude esta chave sempre que adicionar capítulos novos e quiser que o aviso apareça para ela de novo
const VERSAO_ATUALIZACAO = "v91-legendary-love";

function mudarAba(aba, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('aba-' + aba).classList.add('active');
    
    // Se clicar na aba de favoritos, atualiza a lista
    if (aba === 'favoritos') {
        renderizarFavoritos();
    }
    
    window.scrollTo(0, 0);
}

function abrirFotoGrande(src) { 
    const m = document.getElementById('modalFoto'); 
    m.style.display = 'flex'; 
    document.getElementById('imgModal').src = src; 
}

function fecharFotoGrande() { 
    document.getElementById('modalFoto').style.display = 'none'; 
}

// Lógica do Easter Egg via JSON
let listaSurpresas = [];
fetch('surpresas.json')
    .then(response => response.json())
    .then(data => { listaSurpresas = data; })
    .catch(error => console.log('Erro ao carregar surpresas:', error));

function abrirEasterEgg() {
    document.getElementById('modalEasterEgg').style.display = 'flex';
    sortearEasterEgg();
}

function sortearEasterEgg() {
    if (listaSurpresas.length === 0) return;
    const randomIndex = Math.floor(Math.random() * listaSurpresas.length);
    const atual = listaSurpresas[randomIndex];
    document.getElementById('imgEasterEgg').src = atual.img;
    document.getElementById('textoEasterEgg').innerHTML = atual.texto;
}

function fecharEasterEgg() { 
    document.getElementById('modalEasterEgg').style.display = 'none'; 
}

function fecharEasterEggFora(e) { 
    if(e.target.id === 'modalEasterEgg') fecharEasterEgg(); 
}

// Botões Flutuantes (Topo e Fim)
const btnTopo = document.getElementById('btnTopo');
const btnFim = document.getElementById('btnFim');

window.addEventListener('scroll', () => {
    const visivel = window.scrollY > 300 ? 'flex' : 'none';
    if (btnTopo) btnTopo.style.display = visivel;
    if (btnFim) btnFim.style.display = visivel;
});

function voltarAoTopo() { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

function irAoFim() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function filtrarVideos() {
    const termo = document.getElementById('inputBusca').value.toLowerCase();
    document.querySelectorAll('#feed-container .story-container').forEach(card => {
        const texto = card.innerText.toLowerCase();
        card.style.display = texto.includes(termo) ? 'block' : 'none';
    });
}

function verificarEnter(e) { 
    if (e.key === 'Enter') document.getElementById('inputBusca').blur(); 
}

// ==========================================
// SISTEMA DE FAVORITOS E VÍDEOS
// ==========================================
let listaFavoritos = JSON.parse(localStorage.getItem('loveRay_favoritos')) || [];
let todosOsVideos = [];

// Carregamento dos vídeos
fetch('videos.json')
    .then(r => r.json())
    .then(videos => {
        todosOsVideos = videos;
        const container = document.getElementById('feed-container');
        const recentContainer = document.getElementById('recent-container');
        
        // Renderiza todos os vídeos no feed principal
        videos.forEach(item => container.appendChild(criarCardVideo(item)));
        
        // ABA RECENTES: Mostra os últimos 5 lançamentos (ajustável se quiseres mais ou menos)
        const ultimosRecentes = [...videos].reverse().slice(0, 5);
        ultimosRecentes.forEach(item => recentContainer.appendChild(criarCardVideo(item)));
        
        renderizarFavoritos();
        verificarAtualizacoes(ultimosRecentes);
    });

function criarCardVideo(item) {
    const div = document.createElement('div'); 
    div.className = 'story-container';
    
    const ehFav = listaFavoritos.includes(item.src);

    div.innerHTML = `
        <div class="video-box">
            <video controls preload="none" muted playsinline loop>
                <source src="${item.src}" type="video/mp4">
            </video>
        </div>
        <div class="story-content">
            <h2>${item.titulo}</h2>
            <blockquote>"${item.citacao}"</blockquote>
            <p>${item.descricao}</p>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="like-btn" onclick="toggleLike(this)"><span>❤️</span> Curtir</button>
                <button class="like-btn ${ehFav ? 'liked' : ''}" onclick="toggleFavorito('${item.src}', this)">
                    <span>${ehFav ? '⭐' : '☆'}</span> ${ehFav ? 'Favoritado' : 'Favoritar'}
                </button>
            </div>
        </div>`;
    
    const video = div.querySelector('video');
    
    video.addEventListener('play', () => {
        video.muted = false;
        document.querySelectorAll('video').forEach(outroVideo => {
            if (outroVideo !== video) {
                outroVideo.pause();
            }
        });
    });

    return div;
}

function toggleLike(btn) { 
    btn.classList.toggle('liked'); 
    btn.innerHTML = btn.classList.contains('liked') ? '<span>❤️</span> Te amo!' : '<span>❤️</span> Curtir'; 
}

function toggleFavorito(src, btn) {
    const index = listaFavoritos.indexOf(src);
    if (index === -1) {
        listaFavoritos.push(src);
    } else {
        listaFavoritos.splice(index, 1);
    }
    
    localStorage.setItem('loveRay_favoritos', JSON.stringify(listaFavoritos));
    
    const ehFav = listaFavoritos.includes(src);
    if (btn) {
        btn.classList.toggle('liked', ehFav);
        btn.innerHTML = `<span>${ehFav ? '⭐' : '☆'}</span> ${ehFav ? 'Favoritado' : 'Favoritar'}`;
    }
    
    renderizarFavoritos();
}

function renderizarFavoritos() {
    const favContainer = document.getElementById('favoritos-container');
    if (!favContainer) return;
    
    favContainer.innerHTML = '';
    const vidsFavoritos = todosOsVideos.filter(v => listaFavoritos.includes(v.src));

    if (vidsFavoritos.length === 0) {
        favContainer.innerHTML = '<p style="text-align:center; padding: 20px; color: #888;">Nenhum momento favoritado ainda! Clique na estrelinha para guardar teus xodós aqui. ❤️</p>';
        return;
    }

    vidsFavoritos.forEach(item => favContainer.appendChild(criarCardVideo(item)));
}

// ==========================================
// SISTEMA DE MODAL DE ATUALIZAÇÕES
// ==========================================
function verificarAtualizacoes(ultimosVideos) {
    const listaChangelog = document.getElementById('listaChangelog');
    if (!listaChangelog) return;

    listaChangelog.innerHTML = '';
    
    // Pega os 3 vídeos mais recentes para listar o que mudou no changelog
    ultimosVideos.slice(0, 3).forEach(video => {
        const li = document.createElement('li');
        li.style.cssText = "margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; color: #fff;";
        li.innerHTML = `🚀 <b>${video.titulo}</b><br><span style="font-size: 12px; color: #aaa;">${video.descricao}</span>`;
        listaChangelog.appendChild(li);
    });

    // Se ela ainda não viu esta versão, abre o modal automaticamente
    const ultimaVersaoVista = localStorage.getItem('loveRay_versao');
    if (ultimaVersaoVista !== VERSAO_ATUALIZACAO) {
        document.getElementById('modalAtualizacoes').style.display = 'flex';
    }
}

function fecharModalAtualizacoes() {
    document.getElementById('modalAtualizacoes').style.display = 'none';
    localStorage.setItem('loveRay_versao', VERSAO_ATUALIZACAO);
}

function fecharModalAtualizacoesFora(e) {
    if (e.target.id === 'modalAtualizacoes') {
        fecharModalAtualizacoes();
    }
}

// ==========================================
// CRONÔMETRO DE NAMORO
// ==========================================
function atualizarCronometro() {
    const dataInicio = new Date(2025, 8, 22); // 22 de Setembro de 2025
    const agora = new Date();

    let anos = agora.getFullYear() - dataInicio.getFullYear();
    let meses = agora.getMonth() - dataInicio.getMonth();
    
    if (agora.getDate() < 22) {
        meses--;
    }

    if (meses < 0) {
        anos--;
        meses += 12;
    }

    const diffTime = Math.abs(agora - dataInicio);
    const diasTotais = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let proximoMes = new Date(agora.getFullYear(), agora.getMonth(), 22);
    if (agora.getDate() > 22) {
        proximoMes.setMonth(proximoMes.getMonth() + 1);
    }
    
    const diffTimeProximo = proximoMes - agora;
    const diffProximoMes = Math.ceil(diffTimeProximo / (1000 * 60 * 60 * 24));

    const textoTempo = anos > 0 
        ? `${anos} ${anos === 1 ? 'ano' : 'anos'}${meses > 0 ? ` e ${meses}${meses === 1 ? 'mês' : 'meses'}` : ''}`
        : `${meses} ${meses === 1 ? 'mês' : 'meses'}`;

    const container = document.getElementById("contador-tempo");
    if (container) {
        if (agora.getDate() === 22) {
            container.innerHTML = `
                <p>🏆 <b>${textoTempo}</b> de história (${diasTotais} dias juntos!)</p>
                <p style="color: #ff4d79; font-weight: bold;">🎉 HOJE É O NOSSO DIA 22! Mais um mês de muito amor! Te amo ❤️♾️</p>
            `;
        } else {
            container.innerHTML = `
                <p>🏆 <b>${textoTempo}</b> de história (${diasTotais} dias juntos!)</p>
                <p>⏳ Faltam <b>${diffProximoMes} dias</b> para o nosso próximo mêsversário (dia 22)</p>
            `;
        }
    }
}

// Executar assim que o site abrir
atualizarCronometro();

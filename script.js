// ==========================================
// MODO DESENVOLVEDOR (NÃO NOTIFICA VOCÊ MESMO)
// ==========================================
if (window.location.search.includes('dev=1')) {
    localStorage.setItem('loveRay_souDev', 'true');
}

function mudarAba(aba, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('aba-' + aba).classList.add('active');
    
    if (aba === 'favoritos') {
        renderizarFavoritos();
    }

    // Dispara o aviso também no clique direto (o iOS exige interação direta para liberar rede em PWA)
    if (aba === 'atualizacoes' || aba === 'suporte' || aba === 'recentes') {
        notificarSeuAcesso(`Clicou na aba: ${aba.toUpperCase()}`);
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

// ==========================================
// LÓGICA DO EASTER EGG
// ==========================================
let listaSurpresas = [];

function abrirEasterEgg() {
    document.getElementById('modalEasterEgg').style.display = 'flex';
    sortearEasterEgg();
    notificarSeuAcesso("Abriu um Easter Egg Secreto! 🎁");
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

// ==========================================
// BOTÕES FLUTUANTES E PESQUISA
// ==========================================
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
// CARREGAMENTO DE VÍDEOS, FAVORITOS E ATUALIZAÇÕES
// ==========================================
let listaFavoritos = JSON.parse(localStorage.getItem('loveRay_favoritos')) || [];
let todosOsVideos = [];

Promise.all([
    fetch('videos.json').then(r => r.json()),
    fetch('surpresas.json').then(r => r.json()).catch(() => [])
]).then(([videos, surpresas]) => {
    todosOsVideos = videos;
    listaSurpresas = surpresas;

    const container = document.getElementById('feed-container');
    const recentContainer = document.getElementById('recent-container');
    
    // 1. Renderiza todos os vídeos no feed principal
    videos.forEach(item => container.appendChild(criarCardVideo(item)));
    
    // 2. ABA RECENTES: Mostra os últimos 5 lançamentos
    const ultimosRecentes = [...videos].reverse().slice(0, 5);
    ultimosRecentes.forEach(item => recentContainer.appendChild(criarCardVideo(item)));
    
    // 3. PREENCHE A ABA DE ATUALIZAÇÕES (EASTER EGGS + VÍDEOS)
    const listaAbaAtualizacoes = document.getElementById('listaAbaAtualizacoes');
    if (listaAbaAtualizacoes) {
        listaAbaAtualizacoes.innerHTML = '';

        if (surpresas.length > 0) {
            [...surpresas].reverse().slice(0, 5).forEach(() => {
                const li = document.createElement('li');
                li.style.cssText = "margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,42,133,0.3); font-size: 14px; color: #ff85b3;";
                li.innerHTML = `🎁 <b>Novo Easter Egg Secreto!</b><br><span style="font-size: 12px; color: #ccc;">Uma nova surpresa escondida foi adicionada na aba Suporte. Vai lá procurar! 👀✨</span>`;
                listaAbaAtualizacoes.appendChild(li);
            });
        }

        [...videos].reverse().slice(0, 10).forEach(video => {
            const li = document.createElement('li');
            li.style.cssText = "margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; color: #fff;";
            li.innerHTML = `🚀 <b>${video.titulo}</b><br><span style="font-size: 12px; color: #aaa;">${video.descricao}</span>`;
            listaAbaAtualizacoes.appendChild(li);
        });
    }

    renderizarFavoritos();
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
        notificarSeuAcesso(`Deu play no vídeo: ${item.titulo}`);
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
// AVISO BLINDADO PARA IPHONE PWA (WEB3FORMS)
// ==========================================
let jaNotificouNestaAbertura = false;

function notificarSeuAcesso(acao = "Abriu o aplicativo") {
    // Se for o seu dispositivo (?dev=1), ignora
    if (localStorage.getItem('loveRay_souDev') === 'true') return;

    // Usa variável em memória (funciona no PWA do iOS mesmo se o sessionStorage falhar)
    if (jaNotificouNestaAbertura) return;
    jaNotificouNestaAbertura = true;

    // Usa FormData padrão em vez de JSON para passar direto pelo bloqueio do Safari/iOS
    const formData = new FormData();
    formData.append("access_key", "2e208f7f-d021-4eb2-89ff-f7edd528ebf2");
    formData.append("subject", "❤️ A Rayssa abriu o Love Ray!");
    formData.append("message", `Chefe, a Rayssa entrou no Love Ray agora mesmo! (${acao}) 🚀`);

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        keepalive: true
    }).catch(() => {
        // Se falhar na primeira tentativa (ex: rede oscilando), libera para tentar no próximo clique
        jaNotificouNestaAbertura = false;
    });
}

// Tenta notificar logo ao abrir o app também
window.addEventListener('load', () => {
    setTimeout(() => notificarSeuAcesso("Entrou na tela inicial"), 1500);
});

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

atualizarCronometro();

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
// LÓGICA INTELIGENTE DOS EASTER EGGS
// ==========================================
let listaSurpresas = [];

function abrirEasterEgg() {
    const modal = document.getElementById('modalEasterEgg');
    modal.style.display = 'flex';
    
    const imgEl = document.getElementById('imgEasterEgg');
    if (imgEl) {
        imgEl.style.cssText = "width: 100%; max-height: 70vh; object-fit: contain; border-radius: 12px; display: block; margin: 0 auto;";
    }

    sortearEasterEgg();
    notificarSeuAcesso("Abriu um Easter Egg Secreto! 🎁");
}

function sortearEasterEgg() {
    if (listaSurpresas.length === 0) return;

    let vezesAbertas = parseInt(localStorage.getItem('loveRay_vezesEasterEgg') || '0');
    let atual;

    if (vezesAbertas < 3 && listaSurpresas.length > vezesAbertas) {
        const listaInvertida = [...listaSurpresas].reverse();
        atual = listaInvertida[vezesAbertas];
        localStorage.setItem('loveRay_vezesEasterEgg', vezesAbertas + 1);
    } else {
        const randomIndex = Math.floor(Math.random() * listaSurpresas.length);
        atual = listaSurpresas[randomIndex];
    }

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
    
    // 1. FEED PRINCIPAL: Ordenado para os mais novos aparecerem no topo
    const videosOrdenados = [...videos].reverse();
    videosOrdenados.forEach(item => container.appendChild(criarCardVideo(item)));
    
    // 2. ABA RECENTES: Mostra os últimos 5 lançamentos
    const ultimosRecentes = videosOrdenados.slice(0, 5);
    ultimosRecentes.forEach(item => recentContainer.appendChild(criarCardVideo(item)));
    
    // 3. ABA DE ATUALIZAÇÕES INTELIGENTE (SEPARAÇÃO SISTEMA ANTIGO VS NOVOS)
    const listaAbaAtualizacoes = document.getElementById('listaAbaAtualizacoes');
    if (listaAbaAtualizacoes) {
        listaAbaAtualizacoes.innerHTML = '';

        // Bloco de Estatísticas Automáticas no Topo
        const cabecalhoEstatisticas = document.createElement('div');
        cabecalhoEstatisticas.style.cssText = "margin-bottom: 25px; padding: 18px; background: rgba(255, 42, 133, 0.18); border: 2px solid rgba(255, 42, 133, 0.6); border-radius: 12px; text-align: center; box-shadow: 0 0 15px rgba(255, 42, 133, 0.2);";
        cabecalhoEstatisticas.innerHTML = `🏆 <b style="color: #fff; font-size: 17px;">Total no ar:</b><br><span style="font-size: 17px; color: #ff4d94; font-weight: bold;">${surpresas.length} Easter Eggs</span> e <span style="font-size: 17px; color: #ff4d94; font-weight: bold;">${videos.length} vídeos</span>! ✨`;
        listaAbaAtualizacoes.appendChild(cabecalhoEstatisticas);

        const extrairNumeroCapitulo = (titulo) => {
            const match = titulo.match(/Cap[ií]tulo\s+(\d+)/i);
            return match ? parseInt(match[1]) : 0;
        };

        const parseDataParaObjeto = (dataStr) => {
            if (!dataStr) return new Date(0);
            const partes = dataStr.split(" às ");
            if (partes.length < 2) return new Date(0);
            const [dia, mes, ano] = partes[0].split("/");
            const [hora, min] = partes[1].split(":");
            return new Date(ano, mes - 1, dia, hora, min);
        };

        let todasAtualizacoes = [];

        videos.forEach(v => {
            const numCap = extrairNumeroCapitulo(v.titulo);
            todasAtualizacoes.push({
                tipo: 'video',
                titulo: v.titulo,
                descricao: v.descricao,
                numeroCapitulo: numCap,
                dataStr: v.data || "",
                dataObj: parseDataParaObjeto(v.data)
            });
        });

        surpresas.forEach(s => {
            todasAtualizacoes.push({
                tipo: 'easter_egg',
                titulo: "Novo Easter Egg Secreto! 🎁",
                descricao: "Uma nova surpresa escondida foi adicionada na aba Suporte. Vai lá procurar! 👀✨",
                numeroCapitulo: 9999,
                dataStr: s.data || "",
                dataObj: parseDataParaObjeto(s.data)
            });
        });

        // Ordenação inteligente: com data recente no topo, seguidos pelos do sistema antigo
        todasAtualizacoes.sort((a, b) => {
            if (a.dataStr && b.dataStr) return b.dataObj - a.dataObj;
            if (a.dataStr) return -1;
            if (b.dataStr) return 1;
            return b.numeroCapitulo - a.numeroCapitulo;
        });

        // Renderiza na aba de atualizações
        todasAtualizacoes.forEach(item => {
            let tagData = "";

            if (item.tipo === 'video') {
                if (item.numeroCapitulo > 0 && item.numeroCapitulo <= 91) {
                    tagData = `<span style="display: inline-block; background: rgba(255, 165, 0, 0.2); color: #ffb84d; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-bottom: 8px; border: 1px solid rgba(255,165,0,0.4);">📜 Sistema Antigo (Cap. 1 ao 91)</span>`;
                } else if (item.dataStr) {
                    tagData = `<span style="display: inline-block; background: rgba(255, 255, 255, 0.15); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.3);">🕒 ${item.dataStr}</span>`;
                } else {
                    tagData = `<span style="display: inline-block; background: rgba(255, 255, 255, 0.08); color: #aaa; padding: 4px 8px; border-radius: 6px; font-size: 12px; margin-bottom: 8px;">🕒 Lançamento Clássico</span>`;
                }
            } else {
                tagData = item.dataStr 
                    ? `<span style="display: inline-block; background: rgba(255, 77, 148, 0.25); color: #ff99c2; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-bottom: 8px; border: 1px solid rgba(255,77,148,0.4);">🕒 ${item.dataStr}</span>`
                    : `<span style="display: inline-block; background: rgba(255, 77, 148, 0.15); color: #ff99c2; padding: 4px 8px; border-radius: 6px; font-size: 12px; margin-bottom: 8px;">🕒 Easter Egg</span>`;
            }

            const iconeTitulo = item.tipo === 'video' ? `🚀 ${item.titulo}` : `🎁 ${item.titulo}`;
            const corTitulo = item.tipo === 'video' ? '#ffffff' : '#ff66b2';
            const bordaCor = item.tipo === 'video' ? 'rgba(255,255,255,0.15)' : 'rgba(255,42,133,0.3)';

            const li = document.createElement('li');
            li.style.cssText = `margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid ${bordaCor}; list-style: none;`;
            li.innerHTML = `
                ${tagData}<br>
                <span style="font-size: ${item.tipo === 'video' ? '17px' : '16px'}; color: ${corTitulo}; font-weight: bold;">${iconeTitulo}</span><br>
                <span style="font-size: 14px; color: #cccccc; line-height: 1.4; display: block; margin-top: 4px;">${item.descricao}</span>
            `;
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
    if (localStorage.getItem('loveRay_souDev') === 'true') return;

    if (jaNotificouNestaAbertura) return;
    jaNotificouNestaAbertura = true;

    const formData = new FormData();
    formData.append("access_key", "2e208f7f-d021-4eb2-89ff-f7edd528ebf2");
    formData.append("subject", "❤️ A Rayssa abriu o Love Ray!");
    formData.append("message", `Chefe, a Rayssa entrou no Love Ray agora mesmo! (${acao}) 🚀`);

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        keepalive: true
    }).catch(() => {
        jaNotificouNestaAbertura = false;
    });
}

window.addEventListener('load', () => {
    setTimeout(() => notificarSeuAcesso("Entrou na tela inicial"), 1500);
});

// ==========================================
// CRONÔMETRO DE NAMORO
// ==========================================
function atualizarCronometro() {
    const dataInicio = new Date(2025, 8, 22);
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
        

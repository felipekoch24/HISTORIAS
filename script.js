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
    if (btnFim) btnFim.style.display = visivel; // AJUSTADO: Agora os dois botões respondem ao scroll
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
// SISTEMA DE FAVORITOS (LOCALSTORAGE)
// ==========================================
let listaFavoritos = JSON.parse(localStorage.getItem('loveRay_favoritos')) || [];
let todosOsVideos = [];

// Carregamento dos vídeos com preload="none" para otimizar velocidade
fetch('videos.json')
    .then(r => r.json())
    .then(videos => {
        todosOsVideos = videos;
        const container = document.getElementById('feed-container');
        const recentContainer = document.getElementById('recent-container');
        
        videos.forEach(item => container.appendChild(criarCardVideo(item)));
        [...videos].reverse().slice(0, 2).forEach(item => recentContainer.appendChild(criarCardVideo(item)));
        
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
    
    // Garante que o vídeo só carrega metadados quando o usuário interagir ou dar play
    video.addEventListener('play', () => {
        // Remove o mudo assim que ela dá o play para o som sair normal
        video.muted = false;
        
        // Pausa todos os outros vídeos da página
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

function atualizarCronometro() {
    const dataInicio = new Date(2025, 8, 22); // 22 de Setembro de 2025
    const agora = new Date();

    let anos = agora.getFullYear() - dataInicio.getFullYear();
    let meses = agora.getMonth() - dataInicio.getMonth();
    
    // Se ainda NÃO chegou o dia 22 do mês atual, não completa o mês!
    if (agora.getDate() < 22) {
        meses--;
    }

    // Ajuste de virada de ano caso os meses fiquem negativos
    if (meses < 0) {
        anos--;
        meses += 12;
    }

    // Calcular dias totais corridos desde o início
    const diffTime = Math.abs(agora - dataInicio);
    const diasTotais = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Próximo mêsversário (dia 22)
    let proximoMes = new Date(agora.getFullYear(), agora.getMonth(), 22);
    if (agora.getDate() > 22) {
        proximoMes.setMonth(proximoMes.getMonth() + 1);
    }
    
    const diffTimeProximo = proximoMes - agora;
    const diffProximoMes = Math.ceil(diffTimeProximo / (1000 * 60 * 60 * 24));

    // Montar o texto do tempo (lidando com plural de ano/anos)
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
                     

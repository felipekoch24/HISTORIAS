function mudarAba(aba, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('aba-' + aba).classList.add('active');
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

const btnTopo = document.getElementById('btnTopo');
window.addEventListener('scroll', () => btnTopo.style.display = window.scrollY > 300 ? 'flex' : 'none');

function voltarAoTopo() { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
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

// Carregamento dos vídeos com preload="none" para otimizar velocidade
fetch('videos.json')
    .then(r => r.json())
    .then(videos => {
        const container = document.getElementById('feed-container');
        const recentContainer = document.getElementById('recent-container');
        
        videos.forEach(item => container.appendChild(criarCardVideo(item)));
        [...videos].reverse().slice(0, 2).forEach(item => recentContainer.appendChild(criarCardVideo(item)));
    });

function criarCardVideo(item) {
    const div = document.createElement('div'); 
    div.className = 'story-container';
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
            <button class="like-btn" onclick="toggleLike(this)"><span>❤️</span> Curtir</button>
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

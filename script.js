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
function atualizarCronometro() {
    const dataInicio = new Date(2025, 8, 22); // 22 de Setembro de 2025 (Mês 8 = Setembro em JS)
    const agora = new Date();

    // Cálculo de Anos e Meses
    let anos = agora.getFullYear() - dataInicio.getFullYear();
    let meses = agora.getMonth() - dataInicio.getMonth();
    
    if (meses < 0) {
        anos--;
        meses += 12;
    }

    // Calcular dias totais desde o início
    const diffTime = Math.abs(agora - dataInicio);
    const diasTotais = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Próximo mêsversario (dia 22)
    let proximoMes = new Date(agora.getFullYear(), agora.getMonth(), 22);
    if (agora.getDate() > 22) {
        proximoMes.setMonth(proximoMes.getMonth() + 1);
    }
    
    const diffTimeProximo = proximoMes - agora;
    const diffProximoMes = Math.ceil(diffTimeProximo / (1000 * 60 * 60 * 24));

    // Verificar se HOJE é dia 22!
    const container = document.getElementById("contador-tempo");
    if (container) {
        if (agora.getDate() === 22) {
            container.innerHTML = `
                <p>🏆 <b>${anos} ano e ${meses} meses</b> de história (${diasTotais} dias juntos!)</p>
                <p style="color: #ff4d79; font-weight: bold;">🎉 HOJE É O NOSSO DIA 22! Mais um mês de muito amor! Te amo ❤️♾️</p>
            `;
        } else if (diffProximoMes === 0) {
            container.innerHTML = `
                <p>🏆 <b>${anos} ano e ${meses} meses</b> de história (${diasTotais} dias juntos!)</p>
                <p style="color: #ff4d79; font-weight: bold;">✨ É HOJE! Feliz mais um mêsversário para nós! 🥂❤️</p>
            `;
        } else {
            container.innerHTML = `
                <p>🏆 <b>${anos} ano e ${meses} meses</b> de história (${diasTotais} dias juntos!)</p>
                <p>⏳ Faltam <b>${diffProximoMes} dias</b> para o nosso próximo mêsversario (dia 22)</p>
            `;
        }
    }
}

// Executar assim que o site abrir
atualizarCronometro();

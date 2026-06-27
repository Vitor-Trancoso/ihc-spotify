/* ============================================================
   MOCK DATA — protótipo Spotify IHC
   Capas via Picsum (deterministic seeds) e gradientes inline.
   ============================================================ */

const cover = (seed) => `https://picsum.photos/seed/spotify-${seed}/300/300`;

const ARTISTAS = [
  "M83","Tame Impala","Daft Punk","The Weeknd","Arctic Monkeys",
  "Radiohead","Lana Del Rey","Tyler, The Creator","Mac Miller","Frank Ocean",
  "Kendrick Lamar","Phoebe Bridgers","FKA twigs","Caribou","Floating Points",
  "Bonobo","Khruangbin","Mitski","Beach House","Sufjan Stevens"
];

const ALBUNS = [
  "After Hours","Hurry Up, We're Dreaming","Currents","Discovery","AM",
  "OK Computer","Norman Fucking Rockwell!","IGOR","Swimming","Blonde",
  "DAMN.","Punisher","MAGDALENE","Suddenly","Crush"
];

const TITULOS = [
  "Midnight City","Borderline","The Less I Know the Better","One More Time",
  "Do I Wanna Know?","Karma Police","Mariners Apartment Complex","EARFQUAKE",
  "Self Care","Pink + White","HUMBLE.","Kyoto","sad day","You and I",
  "Cellophane","Blinding Lights","Save Your Tears","Pyramids","Nikes","Ivy",
  "Pride.","Moon Song","Two Weeks","Andromeda","Holdin' On",
  "Time","Around the World","Get Lucky","Instant Crush","Fluorescent Adolescent",
  "No Surprises","Daydreaming","Venice Bitch","RUNNING OUT OF TIME","Ladies",
  "I Wonder","Solo","Self Control","DUCKWORTH.","Saviour Complex"
];

const DURACOES = [
  "4:03","3:42","3:38","5:20","4:32","4:21","3:54","3:10","4:35","3:04",
  "2:57","3:46","4:11","3:32","3:21","3:20","3:35","5:00","3:25","4:09",
  "4:35","3:01","3:35","4:32","3:18","3:21","7:09","4:08","3:37","2:59",
  "3:48","6:24","9:38","3:33","3:50","4:03","4:30","4:09","4:08","3:13"
];

const PLAYLIST_NOMES = [
  "Discover Weekly","Daily Mix 1","Daily Mix 2","Daily Mix 3","Release Radar",
  "Músicas Curtidas","Lo-fi Beats","Foco Profundo","Indie Quente","Rock Clássicos",
  "Rap Caviar","Pop Brasil","Sunset Drive","Late Night Vibes","Workout Hits",
  "Acústico Brasil","Música para Estudar","Jazz Vibes","Eletrônica","Anos 2000"
];

function gerarMusicas(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      id: `track-${i + 1}`,
      titulo: TITULOS[i % TITULOS.length],
      artista: ARTISTAS[i % ARTISTAS.length],
      album:   ALBUNS[i % ALBUNS.length],
      capa:    cover(`m${i}`),
      duracao: DURACOES[i % DURACOES.length],
      curtida: i % 4 === 0,
      baixada: i % 6 === 0
    });
  }
  return arr;
}

function gerarPlaylists(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      id: `pl-${i + 1}`,
      nome: PLAYLIST_NOMES[i % PLAYLIST_NOMES.length],
      capa: i === 5 ? null : cover(`p${i}`),
      gradiente: i === 5 ? "var(--gradient-liked-songs)" : null,
      criador: i % 3 === 0 ? "Spotify" : "Você",
      total: 10 + Math.floor(Math.random() * 250),
      tipo: "playlist"
    });
  }
  return arr;
}

const MUSICAS   = gerarMusicas(40);
const PLAYLISTS = gerarPlaylists(20);

const RECENTES = [
  { id: "r1", nome: "Discover Weekly",   capa: cover("p0"), tipo: "playlist" },
  { id: "r2", nome: "Daily Mix 1",       capa: cover("p1"), tipo: "playlist" },
  { id: "r3", nome: "Músicas Curtidas",  capa: null, gradiente: "var(--gradient-liked-songs)", tipo: "playlist" },
  { id: "r4", nome: "Lo-fi Beats",       capa: cover("p6"), tipo: "playlist" },
  { id: "r5", nome: "After Hours",       capa: cover("a0"), tipo: "album",    artista: "The Weeknd" },
  { id: "r6", nome: "Tame Impala",       capa: cover("ar1"), tipo: "artista" },
  { id: "r7", nome: "Lex Fridman Pod",   capa: cover("pod1"), tipo: "podcast" },
  { id: "r8", nome: "Release Radar",     capa: cover("p4"), tipo: "playlist" }
];

const PODCASTS = [
  { id: "pod1", nome: "Lex Fridman Podcast",      capa: cover("pod1"), autor: "Lex Fridman" },
  { id: "pod2", nome: "Huberman Lab",             capa: cover("pod2"), autor: "Andrew Huberman" },
  { id: "pod3", nome: "Flow Podcast",             capa: cover("pod3"), autor: "Estúdios Flow" },
  { id: "pod4", nome: "The Daily",                capa: cover("pod4"), autor: "The New York Times" },
  { id: "pod5", nome: "PrimoCast",                capa: cover("pod5"), autor: "Thiago Nigro" }
];

const AUDIOLIVROS = [
  { id: "ab1", nome: "Sapiens",              capa: cover("ab1"), autor: "Yuval Noah Harari" },
  { id: "ab2", nome: "Pense de Novo",        capa: cover("ab2"), autor: "Adam Grant" },
  { id: "ab3", nome: "O Mítico Homem-Mês",   capa: cover("ab3"), autor: "Frederick Brooks" }
];

const MUSICA_TOCANDO = {
  ...MUSICAS[0],
  contexto: "PLAYING FROM PLAYLIST",
  contextoNome: "Discover Weekly",
  posicao: 102,    // segundos atuais
  total: 243,      // segundos totais
  tocando: true,
  shuffle: true,
  smartShuffle: false,
  repeat: "all"    // off | all | one
};

const MOCK = {
  user: { nome: "Vitor", iniciais: "VT", avatar: cover("avatar") },
  recentes: RECENTES,
  playlists: PLAYLISTS,
  musicas: MUSICAS,
  podcasts: PODCASTS,
  audiolivros: AUDIOLIVROS,
  musicaTocando: MUSICA_TOCANDO
};

window.MOCK = MOCK;

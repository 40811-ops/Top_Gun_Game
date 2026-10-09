TOP GUN GAME - VERSAO COM CORRECOES

O que foi alterado:
- Menu principal agora usa diretamente os arquivos PNG reais de assets/f14.png, assets/f22.png, assets/fa18.png e assets/a10.png.
- Corrigido o identificador da carta F/A-18: agora usa data-plane="fa18", alinhado ao sistema de selecao e aos dados da aeronave.
- Removida a interface e a logica de escolha de pinturas; cada aeronave mantém uma cor fixa para os efeitos do motor.
- Aumentado o tamanho visual e o raio de colisao dos inimigos regulares: MiG-21 64x64, MiG-29 84x84, Su-35/Su-57 104x104. O B-2 chefe mantém 200x180.
- Limitado o delta de tempo do loop a 0,05 s por quadro para reduzir saltos grandes depois de travamentos momentaneos ou troca de aba.
- Melhorada a responsividade dos cards da garagem.

Como executar:
1. Extraia todos os arquivos mantendo a pasta assets.
2. Abra index.html em um navegador moderno. Se o navegador bloquear recursos locais, rode um servidor local na pasta do projeto (por exemplo: python -m http.server 8000) e abra http://localhost:8000.

Verificacoes realizadas:
- script.js passou em `node --check`.
- HTML analisado: sem IDs duplicados e sem IDs usados pelo JavaScript ausentes.
- Todas as imagens do menu, o script e o CSS referenciados existem.
- A interface e as referencias de selecao de pintura foram removidas.

Nota: a verificacao automatica completa de uma partida no navegador nao foi concluida neste ambiente. Teste iniciar, jogar, pausar e reiniciar localmente antes de publicar.

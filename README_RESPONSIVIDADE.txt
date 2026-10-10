TOP GUN ARCADE — RESPONSIVIDADE VERTICAL

Esta versão mantém a área lógica do jogo em 540 x 960 (formato 9:16). O contêiner inteiro
é escalado proporcionalmente para caber na janela, de modo que Canvas, HUD, menus e botões
permanecem alinhados e não são esticados separadamente.

- PC/desktop: usa a maior escala que cabe na janela, mantendo o jogo vertical.
- Tablet: recalcula a escala ao redimensionar ou mudar a orientação.
- Celular: reduz a escala para caber na área visível.
- Pixel art: mantém o desenho do Canvas sem suavização intencional.

Como o formato vertical foi mantido em todos os dispositivos, monitores muito largos terão
espaço lateral. Isso é esperado e evita deformar a proporção do jogo.

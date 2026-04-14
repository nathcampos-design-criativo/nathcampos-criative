// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Update ScrollTrigger on Lenis scroll
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ---------- ANIMATIONS ----------

// 1. Initial Hero Reveal Animation
const heroTimeline = gsap.timeline();

heroTimeline.to('.hero-title .word', {
    y: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: "power4.out",
    delay: 0.2
})
    .to(['.hero-sub', '.navbar'], {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out"
    }, "-=0.8");

// Menu Logic
const menuBtn = document.querySelector('.menu-btn');
const menuCloseBtn = document.querySelector('.menu-close-btn');
const menuOverlay = document.querySelector('.menu-overlay');
let isMenuOpen = false;

const menuTimeline = gsap.timeline({ paused: true });
menuTimeline.set(menuOverlay, { visibility: 'visible', pointerEvents: 'auto' })
    .to('.menu-overlay-bg', {
        y: '0%',
        duration: 0.8,
        ease: 'power4.inOut'
    })
    .to('.menu-links a, .menu-close-btn', {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power4.out'
    }, "-=0.2");

gsap.set('.menu-close-btn', { opacity: 0 });

function openMenu() {
    isMenuOpen = true;
    menuTimeline.play();
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    isMenuOpen = false;
    menuTimeline.reverse();
    document.body.style.overflow = '';
}

// Event listeners will be delegated or bound later to survive cloneNode,
// but let's just use event delegation on document for the menu button.
document.addEventListener('click', (e) => {
    if (e.target.closest('.menu-btn')) {
        openMenu();
    }
    if (e.target.closest('.menu-close-btn')) {
        closeMenu();
    }
});

const menuAnchorLinks = document.querySelectorAll('.menu-links a');
menuAnchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            closeMenu();
            setTimeout(() => {
                lenis.scrollTo(href, { duration: 1.2 });
            }, 800);
        }
    });
});

// 2. Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (window.innerWidth > 768 && cursor && follower) {
    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    gsap.to({}, {
        duration: 0.016,
        repeat: -1,
        onRepeat: function () {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;

            gsap.set(follower, {
                css: {
                    left: posX,
                    top: posY
                }
            });
            gsap.set(cursor, {
                css: {
                    left: mouseX,
                    top: mouseY
                }
            });
        }
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const hoverElements = document.querySelectorAll('[data-cursor], a, .menu-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const cursorText = el.getAttribute('data-cursor');
            if (cursorText) {
                follower.innerText = cursorText;
            }
            follower.classList.add('active');
            cursor.style.transform = 'translate(-50%, -50%) scale(0)';
        });

        el.addEventListener('mouseleave', () => {
            follower.innerText = '';
            follower.classList.remove('active');
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // Magnetic Button Effect
    const bindMagnetic = () => {
        const magneticElements = document.querySelectorAll('.magnetic, .menu-btn, .case-trigger, .testimonial-card');
        magneticElements.forEach((el) => {
            if (el.dataset.magneticBound === 'true') return;
            el.dataset.magneticBound = 'true';
            el.addEventListener('mousemove', function (e) {
                if (el.classList.contains('case-trigger') || el.classList.contains('testimonial-card')) return; // No magnetic pull on big cards
                const boundingRect = el.getBoundingClientRect();
                const relX = e.clientX - boundingRect.left;
                const relY = e.clientY - boundingRect.top;

                gsap.to(el, {
                    x: (relX - boundingRect.width / 2) * 0.4,
                    y: (relY - boundingRect.height / 2) * 0.4,
                    duration: 0.6,
                    ease: "power3.out"
                });
            });

            el.addEventListener('mouseleave', function () {
                if (el.classList.contains('case-trigger') || el.classList.contains('testimonial-card')) return;
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });

            // Rebind Cursor Hover logic
            el.addEventListener('mouseenter', () => {
                const cursorText = el.getAttribute('data-cursor');
                if (cursorText) {
                    follower.innerText = cursorText;
                }
                follower.classList.add('active');
                cursor.style.transform = 'translate(-50%, -50%) scale(0)';
            });
            el.addEventListener('mouseleave', () => {
                follower.innerText = '';
                follower.classList.remove('active');
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }

    bindMagnetic();

    // Will call bindMagnetic() after opening modal so X close button works
    window.bindCursorToModal = bindMagnetic;
}

// 3. ScrollTrigger Animations
const workItems = gsap.utils.toArray('.work-item');
workItems.forEach(item => {
    gsap.fromTo(item,
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );

    const img = item.querySelector('.placeholder-img');
    if (img) {
        gsap.to(img, {
            y: 20, // Reduced from 40 to prevent overlapping with the text below
            ease: "none",
            scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
});

// 4. KV Deck Animations
const deckContainer = document.querySelector('.cards-deck-container');
    if (deckContainer) {
        // We do not reverse for this layout. DOM order: first element is center.
        let cards = gsap.utils.toArray('.cards-deck-container .kv-item');

        function getCardPosition(index, total) {
            if (index === 0) return { diff: 0 };
            const half = Math.floor(total / 2);
            if (index <= half) {
                return { diff: index }; // Right side
            } else {
                return { diff: index - total }; // Left side
            }
        }

        function getCardProps(diff) {
            const absDiff = Math.abs(diff);
            const sign = Math.sign(diff);
            if (absDiff === 0) {
                return { xOffset: 0, scale: 1, opacity: 1, zIndex: 10 };
            }
            // Responsive spread out to edges
            const baseGap = window.innerWidth < 768 ? 160 : 340; 
            const extraGap = window.innerWidth < 768 ? 80 : 200;
            
            const xOffset = sign * (baseGap + (absDiff - 1) * extraGap);
            const scale = Math.max(0.2, 1 - (absDiff * 0.35)); // Scaled way down (0.65, 0.3)
            const opacity = Math.max(0, 1 - (absDiff * 0.4)); // Faded (0.6, 0.2)
            const zIndex = 10 - absDiff;
            
            return { xOffset, scale, opacity, zIndex };
        }

        function initCards(animate = true) {
            cards.forEach((card, index) => {
                const { diff } = getCardPosition(index, cards.length);
                const { xOffset, scale, opacity, zIndex } = getCardProps(diff);
                const yOffset = 0; 
                
                if (animate) {
                    gsap.to(card, {
                        x: xOffset,
                        y: yOffset,
                        scale: scale,
                        zIndex: zIndex,
                        opacity: opacity, 
                        duration: 0.8,
                        ease: "power3.out" 
                    });
                } else {
                    gsap.set(card, {
                        x: xOffset,
                        y: yOffset,
                        scale: scale,
                        zIndex: zIndex,
                        opacity: opacity,
                        transformOrigin: "50% 50%" 
                    });
                }
            });
        }

        initCards(false);

        let isAnimating = false;

        // Individual card clicks to bring them to center
        cards.forEach((card) => {
            card.addEventListener('click', (e) => {
                const currentIndex = cards.indexOf(card);
                if (currentIndex === 0 || isAnimating) return; 

                isAnimating = true;
                const { diff } = getCardPosition(currentIndex, cards.length);
                
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) cards.push(cards.shift());
                } else {
                    for (let i = 0; i < Math.abs(diff); i++) cards.unshift(cards.pop());
                }

                initCards(true);
                setTimeout(() => { isAnimating = false; }, 800);
                e.stopPropagation(); 
            });
        });

        // Clicking container blindly rotates Right (Next)
        deckContainer.addEventListener('click', () => {
            if (!isAnimating && cards.length > 1) {
                isAnimating = true;
                cards.push(cards.shift());
                initCards(true);
                setTimeout(() => { isAnimating = false; }, 800);
            }
        });

        gsap.fromTo('.kvs-deck-section', 
            { opacity: 0, y: 50 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: '.kvs-deck-section',
                    start: "top 80%"
                }
            }
        );
    }

// Marquee Infinity Scroll
const marqueeInner = document.querySelector('.marquee-inner');
if (marqueeInner) {
    const clone = marqueeInner.innerHTML;
    marqueeInner.innerHTML += clone;

    gsap.to(marqueeInner, {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: "linear"
    });
}

// Skills Marquee Infinity Scroll
const skillsMarqueeInner = document.querySelector('.skills-marquee-inner');
if (skillsMarqueeInner) {
    const clone = skillsMarqueeInner.innerHTML;
    skillsMarqueeInner.innerHTML += clone;
    skillsMarqueeInner.innerHTML += clone; // add another copy for smoother loop

    gsap.to(skillsMarqueeInner, {
        xPercent: -33.33,
        repeat: -1,
        duration: 15,
        ease: "linear"
    });
}


// // 4. Case Study Modal Logic
const caseData = {
    'omoda5': {
        title: 'Um SUV, Dois Mundos',
        category: 'Omoda | Jaecoo',
        agency: 'ID/TBWA',
        roleLabel: 'Diretora de Arte / Desdobramento de Campanha',
        img: 'assets/OMODA 5 -Lançamento Bruna/Portifolio-Bruna-omoda-5.webp',
        desc: 'Atuei no desdobramento do conceito criativo da campanha em diferentes plataformas, liderando a adaptação do KV para mídia digital, social e OOH. Defini como a narrativa visual se comportaria em cada ponto de contato, garantindo consistência estética e impacto tanto no online quanto no offline.\n\nO lançamento do Omoda 5 marcou a chegada da marca ao Brasil — um momento que exigia mais do que apresentar um novo modelo.\n\n"Um SUV, Dois Mundos" nasce como a expressão visual dessa dualidade: um carro que se adapta a diferentes versões. A presença de Bruna materializa esse equilíbrio — sofisticação e intensidade no mesmo frame.',
        credits: 'Head of Creation: Henrique Mattos\nCreative: Plácido Possam, Lucas Souza, Felipe Martins, Carlos Henrique e Nathalia Campos.',
        videoFirst: true,
        extraMedia: [
            { type: 'youtube', src: 'https://www.youtube.com/embed/G0wXtwLt_9s' }
        ]
    },
    'omoda7': {
        title: 'Design e Performance em seu Máximo',
        category: 'Omoda | Jaecoo',
        agency: 'ID/TBWA',
        roleLabel: 'Diretora de Arte',
        img: 'assets/Omoda 7/2.webp',
        desc: 'Fui responsável pela criação do KV da campanha, desenvolvendo a linguagem visual que guiou os desdobramentos para mídia digital, social e OOH. A partir disso, defini a narrativa estética em todos os pontos de contato, garantindo consistência e sofisticação.\n\nO Omoda 7 foi lançado junto ao Omoda 5, dentro de uma estratégia que apresentava dois modelos complementares, cada um com um território próprio.\n\nEnquanto o Omoda 5 explorava uma linguagem mais esportiva, o Omoda 7 exigia um posicionamento mais sofisticado, elevando a percepção de design, tecnologia e elegância.\n\nEm um segmento competitivo, entendi que não bastava comunicar inovação. Era necessário construir desejo a partir de uma estética refinada.\n\nAcredito que performance também pode ser silenciosa, expressa em forma, presença e detalhe.\n\nEntre tecnologia e estilo. Entre precisão e sofisticação. Entre design e atitude.\n\n"Design e Performance em seu Máximo" posiciona o Omoda 7 como um objeto de desejo, onde engenharia e estética se encontram.\n\nA presença da Bruna reforça esse território, trazendo uma leitura mais fashion e elegante.',
        credits: 'Head of Creation: Henrique Mattos\nCreative: Plácido Possam, Lucas Souza, Felipe Martins, Carlos Henrique e Nathalia Campos.',
        videoFirst: true,
        extraMedia: [
            { type: 'youtube', src: 'https://www.youtube.com/embed/SRsv10jGom4' }
        ],
        extraMediaAfter: [
            { type: 'video', src: 'assets/Omoda 7/23.10.25. 🔜.mp4' },
            { type: 'video', src: 'assets/Omoda 7/Nossa nova embaixadora representa o estilo, a inovação e o talento que nos inspiram. Bem-vinda, .mp4' },
            { type: 'video', src: 'assets/Omoda 7/O futuro chegou em grande estilo.O lançamento dos Super-Híbridos OMODA foi uma noite inesquecíve.mp4' },
            { type: 'image', src: 'assets/Omoda 7/1.webp' }
        ]
    },
    'ribeiro': {
        title: 'Identidade Visual Ribeiro',
        category: 'Ribeiro Advocacia',
        agency: '',
        roleLabel: 'Diretora de Arte / Identidade Visual',
        img: 'assets/Identidade Visual Ribeiro/capa maat.webp',
        desc: 'Responsável pela criação da identidade visual da marca, desenvolvendo o conceito e a linguagem estética da logo.\n\nO desafio partiu de um direcionamento claro da cliente, que desejava uma identidade inspirada na força de uma deusa egípcia. A partir disso, trabalhei para traduzir essa referência de forma sofisticada, evitando excessos e garantindo uma leitura elegante.\n\nO resultado é uma marca que transmite autoridade, feminilidade e empoderamento, equilibrando imponência e delicadeza.',
        credits: '',
        extraMedia: [
            { type: 'image', src: 'assets/Identidade Visual Ribeiro/Apresentação Maat.webp' }
        ]
    },
    'accoelho': {
        title: 'Liquida e Reforma',
        category: 'AC Coelho',
        agency: 'BEET',
        roleLabel: 'Diretora de Arte / Criação de KV',
        img: 'assets/AC COELHO/cartelado ac.webp',
        desc: 'Criei o KV da campanha, além dos cartelados para o filme e a identidade visual das redes sociais, garantindo consistência entre todas as peças.\n\nA proposta foi desenvolver uma comunicação de varejo mais limpa e organizada, valorizando o produto sem excessos visuais.\n\nEntregou uma comunicação de varejo mais limpa e organizada, valorizando o produto sem excessos visuais.',
        credits: '',
        videoFirst: true,
        extraMedia: [
            { type: 'youtube', src: 'https://www.youtube.com/embed/weMeI2YfrtM' }
        ]
    },
    'boliche': {
        title: 'Cardápio Boliche Brasil',
        category: 'Boliche Brasil',
        agency: '',
        roleLabel: 'Diretora de Arte / Estruturação Visual',
        img: 'assets/Cardapio Boliche/cardapio app.webp',
        desc: 'Fui responsável pelo desenvolvimento do cardápio do restaurante, criando a estrutura visual e a organização das informações.\n\nO desafio era tornar a experiência de leitura mais clara e intuitiva, sem perder o apelo visual.\n\nBusquei equilibrar organização e identidade, criando um material funcional, mas alinhado ao ambiente.',
        credits: '',
        extraMedia: [
            { type: 'image', src: 'assets/Cardapio Boliche/Captura de tela 2026-04-08 010022.webp' }
        ]
    },
    'vivaprevidencia': {
        title: 'Redes Sociais Viva',
        category: 'Viva Previdência',
        agency: 'Engrenagem',
        roleLabel: 'Diretora de Arte / Design Visual',
        img: 'assets/Redes Sociais Viva/redes sociais viva.webp',
        desc: 'Desenvolvi os criativos para as redes sociais, criando peças alinhadas à comunicação da marca e adaptadas aos diferentes formatos digitais.\n\nO desafio era traduzir um tema mais técnico de forma acessível e visualmente atrativa.\n\nO resultado trouxe um design acessível para temas técnicos que demandavam mais atenção visual.',
        credits: '',
        extraMedia: [
            { type: 'image', src: 'assets/Redes Sociais Viva/Captura de tela 2026-04-08 011444.webp' }
        ]
    },
    'caiado': {
        title: 'Seguro de Vidas',
        category: 'Ana Caiado',
        agency: '',
        roleLabel: 'Design Estratégico / Identidade Visual',
        img: 'assets/Identidade Visual Caiado Seguro De  vidas/capa ana caiado.webp',
        desc: 'Desenvolvimento estratégico de identidade visual e branding para o segmento de seguros de vida.\n\nO projeto teve foco na construção de uma marca marcante e confiável, utilizando elementos visuais que reforçam profissionalismo e sofisticação.\n\nCriação de um sistema visual sólido, transmitindo segurança e elegância para o cliente final.',
        credits: '',
        extraMedia: [
            { type: 'image', src: 'assets/Identidade Visual Caiado Seguro De  vidas/Apresentação_ana.webp' }
        ]
    },
    'fernanda': {
        title: 'Fernanda Nutricionista',
        category: 'Identidade Visual',
        agency: '',
        roleLabel: 'Branding e Identidade',
        img: 'assets/Identidade Visual Fernanda Nutricionista/Box-fernanda.webp',
        desc: 'Desenvolvimento de todo o ecossistema da marca, garantindo uma estética coerente, clean e moderna, perfeitamente adequada para a área da saúde.\n\nPositionamento estético atualizado e refinado para o nicho de saúde e nutrição.',
        credits: '',
        extraMedia: [
            { type: 'image', src: 'assets/Identidade Visual Fernanda Nutricionista/Apresentação-fernanda.webp' }
        ]
    },
    'jaecoo7': {
        title: 'SHS — Sistema Híbrido Inteligente',
        category: 'Omoda | Jaecoo',
        agency: 'ID/TBWA',
        roleLabel: 'Diretora de Arte',
        img: 'assets/Jaecoo 7/Capa.png',
        desc: 'O desafio foi transformar um sistema técnico em uma linguagem visual imediata, capaz de comunicar o conceito híbrido de forma simples e reconhecível.\n\nA identidade foi construída a partir de linhas contínuas, representando o fluxo inteligente entre os sistemas, combinadas com margens bem definidas e ícones que reforçam a leitura e facilitam a associação com o SHS.\n\nO resultado é uma direção visual limpa, funcional e consistente, que traduz o funcionamento do sistema em uma experiência visual clara e intuitiva.',
        credits: 'Creative: Plácido Possam, Nathalia Campos.',
        extraMedia: [
            { type: 'image', src: 'assets/Jaecoo 7/Campanha-SHS.png' }
        ]
    }
};

const caseModal = document.querySelector('.case-modal');
const caseClose = document.querySelector('.case-close');
const caseModalBg = document.querySelector('.case-modal-bg');
const caseModalContent = document.querySelector('.case-modal-content');
let modalLenis;

const openCaseModal = (caseId) => {
    const data = caseData[caseId];
    if (!data) return;

    // Populate header
    document.querySelector('.case-title').innerHTML = data.title.split(' ').map(w => `<span class="line"><span class="word" style="transform:translateY(110%); display:inline-block;">${w}</span></span>`).join(' ');
    document.querySelector('.case-category').innerText = data.category;

    // Populate agency name
    const agencyEl = document.querySelector('.case-agency-name');
    if (agencyEl) agencyEl.textContent = data.agency || '';

    // Populate role
    const roleEl = document.querySelector('.case-role-value');
    if (roleEl) roleEl.textContent = data.roleLabel || '';

    // Populate main text as formatted paragraphs
    const textEl = document.querySelector('#case-modal-text');
    if (textEl) {
        textEl.innerHTML = (data.desc || '')
            .split('\n\n')
            .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    // Populate credits
    const creditsEl = document.querySelector('.case-credits-block');
    if (creditsEl) {
        if (data.credits) {
            creditsEl.innerHTML = data.credits
                .split('\n')
                .map(line => `<p>${line}</p>`)
                .join('');
        } else {
            creditsEl.innerHTML = '';
        }
    }

    // Inject main image
    document.querySelector('#case-modal-img').src = data.img;

    // Inject extra images and videos with Lazy Load and Preload Metadata
    if(data.extraMedia) {
        const mediaHtml = data.extraMedia.map(media => {
            if(media.type === 'video') {
                return `<video src="${media.src}" autoplay loop muted playsinline preload="metadata" style="width:100%; border-radius:12px; opacity:0; transform:translateY(40px);" class="case-extra-img"></video>`;
            } else if(media.type === 'youtube') {
                return `<div class="case-extra-img youtube-embed-wrapper" style="width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; opacity:0; transform:translateY(40px);">
                    <iframe
                        src="${media.src}?rel=0&modestbranding=1"
                        style="width:100%; height:100%; border:none;"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>`;
            } else {
                return `<img src="${media.src}" alt="${data.title}" loading="lazy" style="width:100%; border-radius:12px; opacity:0; transform:translateY(40px);" class="case-extra-img">`;
            }
        }).join('');
        document.querySelector('.case-modal-extra-images').innerHTML = mediaHtml;
    } else {
        document.querySelector('.case-modal-extra-images').innerHTML = '';
    }

    // Inject extra media that always goes AFTER the main image
    const afterMediaEl = document.querySelector('.case-modal-extra-images-after');
    if (afterMediaEl) {
        if (data.extraMediaAfter) {
            const afterHtml = data.extraMediaAfter.map(media => {
                if (media.type === 'video') {
                    return `<video src="${media.src}" autoplay loop muted playsinline preload="metadata" style="width:100%; border-radius:12px; opacity:0; transform:translateY(40px);" class="case-extra-img"></video>`;
                } else if (media.type === 'youtube') {
                    return `<div class="case-extra-img youtube-embed-wrapper" style="width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; opacity:0; transform:translateY(40px);">
                        <iframe src="${media.src}?rel=0&modestbranding=1" style="width:100%; height:100%; border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
                    </div>`;
                } else {
                    return `<img src="${media.src}" alt="${data.title}" loading="lazy" style="width:100%; border-radius:12px; opacity:0; transform:translateY(40px);" class="case-extra-img">`;
                }
            }).join('');
            afterMediaEl.innerHTML = afterHtml;
        } else {
            afterMediaEl.innerHTML = '';
        }
    }

    // Reorder: se videoFirst, move o bloco de mídias extra para ANTES da imagem principal
    const extraMediaEl = document.querySelector('.case-modal-extra-images');
    const mainImgEl = document.querySelector('.case-modal-image');
    if (extraMediaEl && mainImgEl) {
        if (data.videoFirst) {
            mainImgEl.parentNode.insertBefore(extraMediaEl, mainImgEl);
        } else {
            mainImgEl.parentNode.insertBefore(extraMediaEl, mainImgEl.nextSibling);
        }
    }

    // Reset scroll position of modal content
    document.querySelector('.case-modal-content-wrapper').scrollTop = 0;

    gsap.set(caseModal, { visibility: 'visible', pointerEvents: 'auto' });
    gsap.set(caseModalContent, { opacity: 1, y: 0 });

    // Prepare animatable elements
    gsap.set('.case-meta-row, .case-paragraphs, .case-credits-block, .case-modal-image', { y: 40, opacity: 0 });
    gsap.set('.case-back-btn-wrapper', { opacity: 0 });

    const tl = gsap.timeline();
    tl.to(caseModalBg, { opacity: 1, duration: 0.5, ease: 'power2.out' })
        .to(caseClose, { opacity: 1, duration: 0.3 }, "-=0.2")
        .to('.case-title .word', { y: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, "-=0.2")
        .to(['.case-meta-row', '.case-paragraphs', '.case-credits-block', '.case-modal-image'], { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, "-=0.6")
        .to('.case-extra-img', { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out' }, "-=0.4")
        .to('.case-back-btn-wrapper', { opacity: 1, duration: 0.6 }, "-=0.2");

    document.body.style.overflow = 'hidden';
    if (window.bindCursorToModal) window.bindCursorToModal();
};

const closeCaseModal = () => {
    // Stop YouTube iframes from playing when modal closes
    document.querySelectorAll('.youtube-embed-wrapper iframe').forEach(iframe => {
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
    });

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(caseModal, { visibility: 'hidden', pointerEvents: 'none' });
            gsap.set('.case-title, .case-category', { y: 40 });
            document.body.style.overflow = ''; // Resume main page scrolling
        }
    });

    tl.to('.case-modal-content', { opacity: 0, y: -40, duration: 0.4, ease: 'power2.in' })
        .to(caseClose, { opacity: 0, duration: 0.2 }, "-=0.2")
        .to(caseModalBg, { opacity: 0, duration: 0.4, ease: 'power2.in' }, "-=0.2");
};

// Bind triggers
document.querySelectorAll('.case-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
        const caseId = trigger.getAttribute('data-case');
        openCaseModal(caseId);
    });
});

if (caseClose) {
    caseClose.addEventListener('click', closeCaseModal);
}

// Recalculate ScrollTrigger positions after all heavy images load
window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});

// 5. macOS Style Dock Magnification Logic
setTimeout(() => {
    const docks = document.querySelectorAll('.dock');
    const maxScale = 1.8; 
    const maxDist = 120; 

    docks.forEach(dock => {
        const items = Array.from(dock.querySelectorAll('.dock-item'));
        
        window.addEventListener('mousemove', (e) => {
            let anyActive = false;
            
            items.forEach(item => {
                // Calculate exact center of each icon for radial precision
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const itemCenterY = rect.top + rect.height / 2;
                
                // Pythagorean distance (true 360 degree radial distance)
                const distX = e.clientX - itemCenterX;
                const distY = e.clientY - itemCenterY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                let scale = 1;
                let lift = 0;
                
                if (dist < maxDist) {
                    anyActive = true;
                    // Cosine wave creates a beautiful magnetic growth curve
                    const normalizedDist = dist / maxDist;
                    scale = 1 + (maxScale - 1) * Math.cos(normalizedDist * Math.PI / 2);
                    
                    // Explicit Vertical Lift (Y-axis translation)
                    lift = (scale - 1) * -40; // up to -32px of physical vertical lift
                }
                
                gsap.to(item, {
                    width: 40 * scale,
                    height: 40 * scale,
                    y: lift, 
                    marginBottom: 0, // Reset any lingering styles
                    duration: 0.15,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
            
            // Fast reset if mouse is far from all icons
            if (!anyActive) {
                items.forEach(item => {
                    gsap.to(item, {
                        width: 40,
                        height: 40,
                        y: 0,
                        duration: 0.4,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                });
            }
        });

        document.addEventListener('mouseleave', () => {
            items.forEach(item => {
                gsap.to(item, {
                    width: 40,
                    height: 40,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        });
    });
}, 1000);

/* ==========================================================================
   Premium Refinements (Transitions & Scroll Progress)
   ========================================================================== */

// 1. App-like Page Transition (Fade-in on load)
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// 2. Intercept local links for fade-out transition
document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const target = this.getAttribute('target');
        
        // Skip links that open in new tab, anchors, or mailto
        if (target === '_blank' || href.startsWith('#') || href.startsWith('mailto:')) return;
        
        // Skip same page links (like empty href)
        if (!href || href === window.location.pathname.split('/').pop()) return;

        e.preventDefault();
        document.body.classList.remove('loaded');
        document.body.classList.add('exiting');
        
        setTimeout(() => {
            window.location.href = href;
        }, 500); // matches CSS transition duration
    });
});

// 3. Scroll Progress Indicator
const progressBar = document.querySelector('.scroll-progress-bar');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollHeight > 0 ? progress + '%' : '0%';
    });
}

// 4. Back to Top Button
const backToTopBtn = document.createElement('div');
backToTopBtn.className = 'back-to-top';
backToTopBtn.innerHTML = '⭡';
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
    if ((window.scrollY || document.documentElement.scrollTop) > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    if (typeof lenis !== 'undefined') {
        lenis.scrollTo(0, { duration: 1.5 });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

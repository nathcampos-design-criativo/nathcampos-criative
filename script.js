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
    lenis.stop();
}

function closeMenu() {
    isMenuOpen = false;
    menuTimeline.reverse();
    lenis.start();
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


// 4. Case Study Modal Logic
const caseData = {
    'trailing': {
        title: 'Bruna Campanha | Omoda',
        category: 'Brand Identity / Web Design',
        img: 'assets/Portifolio-Bruna-omoda-5.png',
        desc: 'Trailing Ahead is a technology company focused on delivering fast, secure, and modern web applications. The brand identity reflects their commitment to innovation, speed, and reliability. This project involved deep UX research, a robust web design system, and custom typography to establish a premium and modern tech aesthetic.'
    },
    'holiwork': {
        title: 'Holiwork Stays',
        category: 'Motion / Web',
        img: 'assets/holiwork_stays_1772659128653.png',
        desc: 'Holiwork Stays is a modern travel and accommodation platform for digital nomads. The goal was to provide an energetic and highly dynamic web experience that contrasts sharply with the premium dark background. Extensive motion graphics and micro-interactions ensure the user journey feels alive, inspiring the next remote work adventure.'
    },
    'smart': {
        title: 'SMART PT',
        category: 'Brand / UX',
        img: 'assets/smart_pt_1772659243955.png',
        desc: 'SMART PT is an advanced physical therapy application utilizing AI to monitor patient progress. A clinical yet extremely premium dark mode UI was devised, relying on glowing accent colors to guide users through the dashboard intuitively. The identity had to be highly professional, trustworthy, and technologically cutting-edge.'
    },
    'pizza': {
        title: 'Pizza Bros',
        category: 'Identity',
        img: 'assets/pizza_bros_1772659408670.png',
        desc: 'Pizza Bros needed an identity as bold and energetic as their street-style slice shop. We developed a packaging design system that pairs vibrant orange and red colors with an edgy, modern typographic approach, contrasting against a sleek dark aesthetic perfectly fitted for modern urban dining.'
    }
};

const caseModal = document.querySelector('.case-modal');
const caseClose = document.querySelector('.case-close');
const caseModalBg = document.querySelector('.case-modal-bg');
const caseModalContent = document.querySelector('.case-modal-content');
let modalLenis;

const extraImgs = [
    'assets/case_mockup_1_1772660671425.png',
    'assets/case_mockup_2_1772660683723.png'
];

const openCaseModal = (caseId) => {
    const data = caseData[caseId];
    if (!data) return;

    // Populate data
    document.querySelector('.case-title').innerHTML = data.title.split(' ').map(w => `<span class="line"><span class="word" style="transform:translateY(110%); display:inline-block;">${w}</span></span>`).join(' ');
    document.querySelector('.case-category').innerText = data.category;
    document.querySelector('#case-modal-img').src = data.img;
    document.querySelector('#case-modal-text').innerText = data.desc;

    // Inject extra images
    document.querySelector('.case-modal-extra-images').innerHTML = extraImgs.map(img => `<img src="${img}" style="width:100%; border-radius:12px; opacity:0; transform:translateY(40px);" class="case-extra-img">`).join('');

    // Reset scroll position of modal content
    document.querySelector('.case-modal-content-wrapper').scrollTop = 0;

    gsap.set(caseModal, { visibility: 'visible', pointerEvents: 'auto' });
    gsap.set(caseModalContent, { opacity: 1, y: 0 }); // Ensure parent container is visible!

    // Prepare animatable elements
    gsap.set('.case-category, .detail-box h3, .detail-box p, .case-modal-image', { y: 40, opacity: 0 });
    gsap.set('.case-back-btn-wrapper', { opacity: 0 });

    const tl = gsap.timeline();
    tl.to(caseModalBg, { opacity: 1, duration: 0.5, ease: 'power2.out' })
        .to(caseClose, { opacity: 1, duration: 0.3 }, "-=0.2")
        .to('.case-title .word', { y: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' }, "-=0.2")
        .to(['.case-category', '.detail-box h3', '.detail-box p', '.case-modal-image'], { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, "-=0.6")
        .to('.case-extra-img', { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out' }, "-=0.4")
        .to('.case-back-btn-wrapper', { opacity: 1, duration: 0.6 }, "-=0.2");

    lenis.stop(); // Stop main page scrolling
    if (window.bindCursorToModal) window.bindCursorToModal();
};

const closeCaseModal = () => {
    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(caseModal, { visibility: 'hidden', pointerEvents: 'none' });
            gsap.set('.case-title, .case-category', { y: 40 });
            lenis.start(); // Resume main page scrolling
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

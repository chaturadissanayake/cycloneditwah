document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Reading Progress Bar
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.style.width = (winScroll / height) * 100 + "%";
        }
    });

    // 2. STAGGERED METRICS COUNTER
    const metricsContainer = document.getElementById("metrics-container");
    if (metricsContainer) {
        ScrollTrigger.create({
            trigger: metricsContainer,
            start: "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(".metric-item", {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power2.out"
                });
                
                document.querySelectorAll('.counter').forEach(el => {
                    const target = parseFloat(el.getAttribute('data-target'));
                    const isFloat = target % 1 !== 0; 
                    let proxy = { val: 0 }; 
                    
                    gsap.to(proxy, {
                        val: target,
                        duration: 2.5, 
                        delay: 0.2, 
                        onUpdate: function() {
                            el.innerText = isFloat 
                                ? proxy.val.toFixed(1) 
                                : Math.floor(proxy.val).toLocaleString(); 
                        }
                    });
                });
            }
        });
    }

    // 3. SEAMLESS TIMELINE SEQUENCE (Pure Fade)
    function initUnifiedSequence(selector) {
        const container = document.querySelector(selector);
        if (!container) return;
        
        const images = container.querySelectorAll('.seq-img');
        
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top", 
                end: "+=6000",   
                scrub: 0.5,      
                pin: true,       
                anticipatePin: 1
            }
        });

        images.forEach((img, i) => {
            if (i > 0) {
                tl.to({}, { duration: 0.5 }) 
                  .to(images[i-1], { opacity: 0, duration: 1, ease: "power1.inOut" }, `phase${i}`)
                  .to(img, { opacity: 1, duration: 1, ease: "power1.inOut" }, `phase${i}`);
            }
        });
        
        tl.to({}, { duration: 1 }); 
    }
    
    // Always initialize sequence (allows portrait mobile to work)
    initUnifiedSequence('#unified-sequence');

    // 4. Comparison Slider
    const slider = document.getElementById('comparison-slider');
    const handle = document.getElementById('handle');
    const beforeLayer = document.getElementById('before-layer');
    let isDragging = false;

    if(slider && handle) {
        const moveSlider = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percent = (x / rect.width) * 100;
            beforeLayer.style.width = percent + "%";
            handle.style.left = percent + "%";
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            moveSlider(x);
        };

        handle.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', onMove);
        handle.addEventListener('touchstart', (e) => { isDragging = true; }, { passive: true });
        window.addEventListener('touchend', () => isDragging = false);
        window.addEventListener('touchmove', (e) => { if (isDragging) { onMove(e); } }, { passive: true });
    }

    // 5. Map Carousel
    const mapCarousel = document.getElementById('mapCarousel');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');

    if(mapCarousel && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            mapCarousel.scrollBy({ left: mapCarousel.clientWidth, behavior: 'smooth' });
        });
        prevBtn.addEventListener('click', () => {
            mapCarousel.scrollBy({ left: -mapCarousel.clientWidth, behavior: 'smooth' });
        });
    }

    // 6. Map Modal Lightbox Logic (NATIVE ZOOM/SCROLL FIX)
    const modal = document.getElementById("mapModal");
    const mapBtn = document.getElementById("openMapBtn");
    const span = document.getElementsByClassName("close-modal")[0];
    const fullMapImg = document.getElementById("fullMapImg");
    const panContainer = document.getElementById("pan-container");

    if (modal && mapBtn && span && fullMapImg && panContainer) {
        mapBtn.onclick = function() {
            modal.classList.add("show");
            document.body.style.overflow = "hidden"; // Prevent background scroll
            
            setTimeout(() => {
                panContainer.scrollTop = 0;
                panContainer.scrollLeft = 0;
            }, 10);
        }
        
        span.onclick = function() {
            modal.classList.remove("show");
            fullMapImg.classList.remove("zoomed"); 
            document.body.style.overflow = "auto";
        }
        
        fullMapImg.onclick = function() {
            fullMapImg.classList.toggle("zoomed");
            if (fullMapImg.classList.contains("zoomed")) {
                setTimeout(() => {
                    panContainer.scrollLeft = (panContainer.scrollWidth - panContainer.clientWidth) / 2;
                    panContainer.scrollTop = (panContainer.scrollHeight - panContainer.clientHeight) / 2;
                }, 50);
            }
        }
        
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.classList.remove("show");
                fullMapImg.classList.remove("zoomed");
                document.body.style.overflow = "auto";
            }
        }
    }

    // 7. Dynamic Parallax
    const parallaxImages = gsap.utils.toArray('.parallax-img');
    parallaxImages.forEach(img => {
        gsap.to(img, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true 
            }
        });
    });

    // 8. Narrative Reveal Animations
    const fadeElements = gsap.utils.toArray('.fade-up');
    fadeElements.forEach(el => {
        gsap.from(el, {
            y: 30, opacity: 0, duration: 1.2, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });

    // 9. BACK TO TOP BUTTON
    const bttBtn = document.getElementById('backToTop');
    if (bttBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 800) {
                bttBtn.classList.add('visible');
            } else {
                bttBtn.classList.remove('visible');
            }
        });
        
        bttBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
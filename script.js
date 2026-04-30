document.addEventListener("DOMContentLoaded", () => {
    // Restore scroll position when returning from the full map
    const restoreScroll = sessionStorage.getItem('restoreScroll');
    if (restoreScroll) {
        window.scrollTo(0, parseInt(restoreScroll));
        sessionStorage.removeItem('restoreScroll');
    }

    gsap.registerPlugin(ScrollTrigger);

    // Global Debounce Utility
    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            const later = () => { clearTimeout(timeout); func.apply(this, args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    window.addEventListener("resize", debounce(() => { ScrollTrigger.refresh(); }, 250));

    const isMobile = () => window.innerWidth <= 768;

    // Save scroll position before navigating to map
    document.querySelectorAll('a[href="map.html"]').forEach(el => {
        el.addEventListener('click', () => {
            sessionStorage.setItem('returnScroll', window.scrollY);
        });
    });

    // --- NEW: Citation Tabs Logic ---
    const citeTabs = document.querySelectorAll('.cite-tab');
    const citePanels = document.querySelectorAll('.cite-panel-content');

    if (citeTabs.length > 0) {
        citeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class & ARIA state from all tabs and panels
                citeTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                citePanels.forEach(p => p.classList.remove('active'));

                // Add active class & ARIA state to clicked tab
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                // Add active class to corresponding panel
                const targetId = tab.getAttribute('data-target');
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // Citation Copy Logic
    document.querySelectorAll('.cite-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (target) {
                navigator.clipboard.writeText(target.innerText).then(() => {
                    btn.innerHTML = 'Copied ✓';
                    btn.classList.add('copied');
                    setTimeout(() => { 
                        btn.innerHTML = 'Copy'; 
                        btn.classList.remove('copied'); 
                    }, 2000);
                });
            }
        });
    });

    // =========================================
    // 0. DESKTOP BANNER (Auto-dismiss Mobile Fix)
    // =========================================
    const banner = document.getElementById('desktop-warning-banner');
    
    const checkBannerVisibility = () => {
        if (banner) {
            if (window.innerWidth < 1024) { 
                banner.style.display = 'flex'; 
                // Auto-dismiss removed for accessibility compliance
            }
        }
    };
    checkBannerVisibility();
    window.addEventListener('resize', debounce(() => checkBannerVisibility(), 250));

    const dismissBtn = document.getElementById('dismiss-banner');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            if (banner) {
                // Instantly hide the banner overriding any ongoing fade animation
                banner.style.transition = 'none';
                banner.style.opacity = '0';
                banner.style.display = 'none';
            }
        });
    }

    // =========================================
    // 1. HERO RAIN P5 SKETCH (Desktop Only)
    // =========================================
    const heroSketch = (p) => {
        let lines = [];
        p.setup = () => {
            let canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.parent('hero-canvas-updated');
            // Increased density and visibility for desktop
            for(let i=0; i<85; i++) { 
                lines.push({
                    x: p.random(p.width), 
                    y: p.random(p.height), 
                    speed: p.random(2, 5.5), 
                    len: p.random(15, 35),
                    alpha: p.random(0.08, 0.25) // Boosted opacity so it reads clearly
                });
            }
        };
        p.draw = () => {
            p.clear();
            p.strokeWeight(1.2); // Slightly thicker stroke for visibility
            
            lines.forEach(l => {
                p.stroke(`rgba(19,17,16,${l.alpha})`); 
                p.line(l.x, l.y, l.x + l.len*0.08, l.y + l.len);
                l.y += l.speed;
                l.x += l.speed*0.08;
                if(l.y > p.height) { 
                    l.y = -l.len; 
                    l.x = p.random(p.width); 
                }
            });
        };
        p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
    };
    
    let heroP5 = null;
    if (document.getElementById('hero-canvas-updated') && !isMobile()) {
        heroP5 = new p5(heroSketch);
        ScrollTrigger.create({
            trigger: '.hero',
            start: 'bottom top',
            onLeave: () => { if(heroP5) { heroP5.remove(); heroP5 = null; } },
            onEnterBack: () => { if(!heroP5 && document.getElementById('hero-canvas-updated') && !isMobile()) { heroP5 = new p5(heroSketch); } }
        });
    }

    // =========================================
    // 2. READING PROGRESS BAR & DYNAMIC MARKERS
    // =========================================
    const calculateChapterMarkers = () => {
        const markers = document.querySelectorAll('.chapter-marker');
        const targets = [
            document.getElementById('intro-lane'),
            document.getElementById('sect-infra'),
            document.getElementById('sect-arc'),
            document.getElementById('sect-matrix'),
            document.getElementById('final-thoughts-section')
        ];
        
        markers.forEach((marker, i) => {
            const target = targets[i];
            if (target) {
                const rect = target.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const absoluteTop = rect.top + scrollTop;
                const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
                
                let pct = (absoluteTop / docHeight) * 100;
                pct = Math.max(2, Math.min(98, pct)); 
                marker.style.left = `${pct}%`;
            }
        });
    };

    window.addEventListener('load', calculateChapterMarkers);
    window.addEventListener('resize', debounce(calculateChapterMarkers, 250));

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.style.width = (winScroll / height) * 100 + "%";
        }
    }, { passive: true });

    // =========================================
    // 3. STAGGERED METRICS & FINAL COUNT-UP
    // =========================================
    const metricsContainerIntro = document.getElementById("metrics-container-intro");
    if (metricsContainerIntro) {
        ScrollTrigger.create({
            trigger: metricsContainerIntro,
            start: "top 85%", 
            once: true,
            onEnter: () => {
                gsap.to(".metric-item-intro", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" });
                metricsContainerIntro.querySelectorAll('.counter').forEach(el => {
                    const target = parseFloat(el.getAttribute('data-target'));
                    const floatCheck = target % 1 !== 0;
                    let proxy = { val: 0 };
                    gsap.to(proxy, {
                        val: target, duration: 2.2, delay: 0.2, ease: "power2.out",
                        onUpdate: function() { el.innerText = floatCheck ? proxy.val.toFixed(1) : Math.floor(proxy.val).toLocaleString(); }
                    });
                });
            }
        });
    }

    const finalCountEl = document.getElementById("final-homeless-count");
    if (finalCountEl) {
        let countProxy = { val: 0 };
        gsap.to(countProxy, {
            val: 149000, 
            duration: 3, 
            ease: "power2.out", 
            scrollTrigger: { trigger: ".closure-box", start: "top 80%" },
            onUpdate: function() { 
                finalCountEl.innerText = Math.round(countProxy.val).toLocaleString(); 
            }
        });
    }

    // =========================================
    // 4. COMPARISON SLIDER
    // =========================================
    if (!isMobile()) {
        gsap.to('.storm-phase-img', {
            yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: '.storm-phases-wrapper', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }

    const slider = document.getElementById('comparison-slider');
    const handle = document.getElementById('handle');
    const beforeLayer = document.getElementById('before-layer');
    let isDraggingSlider = false;

    if (slider && handle) {
        const moveSlider = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percent = (x / rect.width) * 100;
            beforeLayer.style.width = percent + "%";
            handle.style.left = percent + "%";
        };
        const onMove = (e) => {
            if (!isDraggingSlider) return;
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            moveSlider(x);
        };
        handle.addEventListener('mousedown', () => isDraggingSlider = true);
        window.addEventListener('mouseup', () => isDraggingSlider = false);
        window.addEventListener('mousemove', onMove);
        slider.addEventListener('touchstart', () => { isDraggingSlider = true; }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (isDraggingSlider) onMove(e); }, { passive: true });
        window.addEventListener('touchend', () => { isDraggingSlider = false; }, { passive: true });

        // Keyboard Accessibility for Slider
        let sliderPercent = 50;
        handle.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                sliderPercent += (e.key === 'ArrowRight') ? 5 : -5;
                sliderPercent = Math.max(0, Math.min(100, sliderPercent));
                beforeLayer.style.width = sliderPercent + "%";
                handle.style.left = sliderPercent + "%";
                handle.setAttribute('aria-valuenow', sliderPercent);
            }
        });
    }

    // =========================================
    // 5. EDITORIAL MAP CAROUSEL
    // =========================================
    const mapCarousel = document.getElementById('mapCarousel');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    if (mapCarousel && dots.length > 0) {
        mapCarousel.addEventListener('scroll', () => {
            const index = Math.round(mapCarousel.scrollLeft / mapCarousel.clientWidth);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }, { passive: true });
    }

    // =========================================
    // 7. NARRATIVE REVEAL ANIMATIONS
    // =========================================
    const fElements = gsap.utils.toArray('.fade-up');
    fElements.forEach(el => {
        gsap.to(el, {
            y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });

    // =========================================
    // 8. BACK TO TOP
    // =========================================
    const bttBtn = document.getElementById('backToTop');
    if (bttBtn) {
        window.addEventListener('scroll', () => {
            bttBtn.classList.toggle('visible', window.scrollY > 800);
        }, { passive: true });
        bttBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // =========================================
    // 9. CHARTS: Shared Tooltip & Mobile Sheet
    // =========================================
    const siteTooltip = document.getElementById('site-tooltip');
    const mobileTapSheet = document.getElementById('mobile-tap-sheet');
    const mobileTapSheetContent = document.getElementById('mobile-tap-sheet-content');
    const mobileTapOverlay = document.getElementById('mobile-tap-overlay');
    const tapSheetClose = document.getElementById('tapSheetClose');

    function setTooltipPosition(clientX, clientY) {
        siteTooltip.style.visibility = "visible";
        let x = clientX + 16;
        let y = clientY + 16;
        const ttRect = siteTooltip.getBoundingClientRect();
        
        if (x + ttRect.width > window.innerWidth - 8) { x = clientX - ttRect.width - 16; }
        if (y + ttRect.height > window.innerHeight - 8) { y = clientY - ttRect.height - 16; }
        
        // Final safety clamp so it never bleeds off the top/left edge on very narrow screens
        x = Math.max(8, x);
        y = Math.max(8, y);

        siteTooltip.style.left = x + "px";
        siteTooltip.style.top = y + "px";
    }

    function openMobileTapSheet(htmlContent) {
        mobileTapSheetContent.innerHTML = htmlContent;
        mobileTapSheet.classList.add('is-open');
        mobileTapOverlay.classList.add('is-open');
    }

    function closeMobileSheet() {
        mobileTapSheet.classList.remove('is-open');
        mobileTapOverlay.classList.remove('is-open');
        document.querySelectorAll('.data-group, .viz-container canvas').forEach(el => el.classList.remove('active-touch'));
        window.dispatchEvent(new CustomEvent('clearCharts'));
    }

    if (tapSheetClose && mobileTapOverlay) {
        tapSheetClose.addEventListener('click', closeMobileSheet);
        mobileTapOverlay.addEventListener('click', closeMobileSheet);
    }

    const dismissTooltip = () => {
        siteTooltip.style.visibility = 'hidden';
        document.querySelectorAll('.data-group, .viz-container canvas').forEach(el => el.classList.remove('active-touch'));
        window.dispatchEvent(new CustomEvent('clearCharts'));
    };

    document.addEventListener('click', (e) => {
        const isTooltipOpen = siteTooltip.style.visibility === 'visible';
        const tappedInsideTooltip = e.target.closest('#site-tooltip');
        const tappedInsideChart = e.target.closest('#sect-infra, #sect-matrix, #interaction-area, .funding-spread, #canvas-day1, #canvas-month3');
        const tappedInsideSheet = e.target.closest('.mobile-tap-sheet');
        
        if (!isMobile() && isTooltipOpen && !tappedInsideTooltip && !tappedInsideChart) {
            dismissTooltip();
        }
        
        if (isMobile() && !tappedInsideChart && !tappedInsideSheet && !e.target.closest('#tapSheetClose') && !e.target.closest('#mobile-tap-overlay')) {
            document.querySelectorAll('.data-group, .viz-container canvas').forEach(el => el.classList.remove('active-touch'));
            window.dispatchEvent(new CustomEvent('clearCharts'));
        }
    }, {passive: true});

    // =========================================
    // CHART 1: ECONOMIC INFRASTRUCTURE BREAKDOWN
    // =========================================
    (() => {
        const data = [
            { label: "Roads & Water",  val: 1735000000, share: "42%", detail: "Roads, bridges, and water networks.", color: "var(--ink)" },
            { label: "Homes",          val:  985000000, share: "24%", detail: "Houses and lost belongings.", color: "var(--ink)" },
            { label: "Farming",        val:  814000000, share: "20%", detail: "Crops, livestock, and fishing gear.", color: "var(--ink)" },
            { label: "Buildings",      val:  566000000, share: "14%", detail: "Schools, hospitals, and factories.", color: "var(--ink)" }
        ];
        const svg = document.getElementById('reuters-chart');
        if (!svg || !siteTooltip) return;

        const width = 800;
        const margin = { left: 160, right: 40, top: 40 };
        const chartWidth = width - margin.left - margin.right;
        const maxVal = 2000000000;

        for (let i = 0; i <= 4; i++) {
            const x = margin.left + (i * (chartWidth / 4));
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x); line.setAttribute("y1", 20);
            line.setAttribute("x2", x); line.setAttribute("y2", 320);
            line.setAttribute("class", "axis-line"); svg.appendChild(line);
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x); text.setAttribute("y", 10);
            text.setAttribute("class", "axis-text");
            text.textContent = i === 0 ? "0" : (i * 0.5) + "B";
            text.setAttribute("text-anchor", "middle"); svg.appendChild(text);
        }

        data.forEach((d, i) => {
            const y = 60 + (i * 75);
            const xEnd = (d.val / maxVal) * chartWidth;
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute("class", "data-group");

            const updateTT = (clientX, clientY) => {
                const contentHtml = `
                    <div class="tt-title">Economic Damage · ${d.label}</div>
                    <div class="tt-val-large" style="color: var(--crimson);">$${(d.val / 1e9).toFixed(2)} Billion</div>
                    <div class="tt-desc" style="font-weight:700; margin-bottom:6px;">${d.share} of total damage</div>
                    <div class="tt-desc" style="border-top:1px solid rgba(19, 17, 16, 0.1); padding-top:8px;">${d.detail}</div>
                `;

                if(isMobile()) {
                    openMobileTapSheet(contentHtml);
                } else {
                    siteTooltip.innerHTML = contentHtml;
                    setTooltipPosition(clientX, clientY);
                }
                group.classList.add('active-touch');
            };

            group.onmouseover = (e) => { if (!isMobile()) updateTT(e.clientX, e.clientY); };
            group.onmousemove = (e) => { if (!isMobile()) setTooltipPosition(e.clientX, e.clientY); };
            group.onmouseout = () => { if (!isMobile()) { siteTooltip.style.visibility = "hidden"; group.classList.remove('active-touch'); } };
            
            group.addEventListener('click', (e) => {
                if (isMobile()) {
                    document.querySelectorAll('.data-group').forEach(g => g.classList.remove('active-touch'));
                    updateTT(e.clientX, e.clientY);
                }
            });

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", margin.left); line.setAttribute("y1", y);
            line.setAttribute("x2", margin.left); line.setAttribute("y2", y); 
            line.setAttribute("data-target-x", margin.left + xEnd);
            line.setAttribute("class", "stem"); group.appendChild(line);

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", margin.left); circle.setAttribute("cy", y); 
            circle.setAttribute("data-target-cx", margin.left + xEnd);
            circle.setAttribute("r", "6"); circle.setAttribute("class", "head");
            group.appendChild(circle);

            const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            hitArea.setAttribute("x", 0); hitArea.setAttribute("y", y - 25);
            hitArea.setAttribute("width", width); hitArea.setAttribute("height", 50);
            hitArea.setAttribute("fill", "transparent"); hitArea.setAttribute("style", "pointer-events: all; cursor: pointer;");
            group.appendChild(hitArea);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", margin.left - 15); text.setAttribute("y", y + 4);
            text.setAttribute("text-anchor", "end"); text.setAttribute("class", "data-label");
            text.textContent = d.label.toUpperCase(); group.appendChild(text);
            svg.appendChild(group);
        });

        ScrollTrigger.create({
            trigger: "#sect-infra", start: "top 65%", once: true,
            onEnter: () => {
                svg.querySelectorAll('.stem').forEach(el => { gsap.to(el, { attr: { x2: el.getAttribute('data-target-x') }, duration: 1.5, ease: "power2.out" }); });
                svg.querySelectorAll('.head').forEach(el => { gsap.to(el, { attr: { cx: el.getAttribute('data-target-cx') }, duration: 1.5, ease: "power2.out" }); });
            }
        });
    })();

    // =========================================
    // CHART 2: ARC (Displacement)
    // =========================================
    (() => {
        const data = [
            { d: "Nov 29", sc: 120000, hf: 0 },
            { d: "Nov 30", sc: 180499, hf: 0 },
            { d: "Dec 01", sc: 218526, hf: 0 },
            { d: "Dec 03", sc: 201875, hf: 0 },
            { d: "Dec 06", sc: 100124, hf: 0 },
            { d: "Dec 16", sc: 70000,  hf: 0 },
            { d: "Dec 19", sc: 66000,  hf: 0 },
            { d: "Dec 23", sc: 66000,  hf: 0 },
            { d: "Dec 30", sc: 34175,  hf: 267700, note: "Shelters Close" },
            { d: "Jan 09", sc: 19000,  hf: 177000 },
            { d: "Jan 23", sc: 7100,   hf: 170000 },
            { d: "Feb 06", sc: 6680,   hf: 165000 },
            { d: "Feb 20", sc: 3400,   hf: 155000 },
            { d: "Mar 06", sc: 2700,   hf: 153000 },
            { d: "Mar 20", sc: 2700,   hf: 149000 },
            { d: "Apr 03", sc: 2274,   hf: 149000 },
            { d: "Apr 17", sc: 1404,   hf: 149000, note: "Latest Report" }
        ];

        const svg = document.getElementById('main-chart');
        const tracker = document.getElementById('tracker');
        const grid = document.getElementById('grid');
        const interactionArea = document.getElementById('interaction-area');
        if (!svg || !grid || !interactionArea) return;

        const width = 900, height = 450;
        const margin = { top: 40, right: 60, bottom: 50, left: 50 };
        const chartW = width - margin.left - margin.right;
        const chartH = height - margin.top - margin.bottom;
        const maxVal = 350000;
        const getX = (i) => margin.left + (i * (chartW / (data.length - 1)));
        const getY = (val) => margin.top + chartH - (val / maxVal * chartH);

        let gridHTML = '';
        for (let i = 0; i <= 3; i++) {
            const val = i * 100000;
            gridHTML += `<line x1="${margin.left}" y1="${getY(val)}" x2="${margin.left + chartW}" y2="${getY(val)}" stroke="var(--smoke)" stroke-width="1" />`;
            gridHTML += `<text x="${margin.left - 10}" y="${getY(val) + 4}" text-anchor="end" style="font-family:var(--font-ui); font-size:10px; fill:var(--dust)">${val / 1000}K</text>`;
        }
        grid.innerHTML = gridHTML;

        let hostPoints = `M ${margin.left} ${margin.top + chartH}`;
        let safetyPoints = `M ${margin.left} ${margin.top + chartH}`;
        data.forEach((pt, i) => {
            hostPoints += ` L ${getX(i)} ${getY(pt.hf)}`;
            safetyPoints += ` L ${getX(i)} ${getY(pt.hf + pt.sc)}`;
        });
        hostPoints += ` L ${margin.left + chartW} ${margin.top + chartH} Z`;
        safetyPoints += ` L ${margin.left + chartW} ${getY(data[data.length - 1].hf)}`;
        for (let i = data.length - 1; i >= 0; i--) { safetyPoints += ` L ${getX(i)} ${getY(data[i].hf)}`; }
        safetyPoints += ` Z`;
        document.getElementById('area-host').setAttribute('d', hostPoints);
        document.getElementById('area-safety').setAttribute('d', safetyPoints);

        const annGroup = document.getElementById('annotations');
        let annHTML = '';
        data.forEach((pt, i) => {
            if (pt.note) {
                const x = getX(i);
                const align = (i === data.length - 1) ? 'end' : 'start';
                const offset = (i === data.length - 1) ? -5 : 5;
                annHTML += `
                    <line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + chartH}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="4,2" />
                    <text x="${x + offset}" y="${margin.top + 10}" class="annotation-box" text-anchor="${align}">${pt.note}</text>
                    <text x="${x + offset}" y="${margin.top + 24}" class="annotation-sub" text-anchor="${align}">${pt.d}</text>
                `;
            }
            if (i % 2 === 0 || pt.note) {
                annHTML += `<text x="${getX(i)}" y="${margin.top + chartH + 25}" text-anchor="middle" style="font-family:var(--font-ui); font-size:10px; font-weight:500; fill:var(--dust)">${pt.d}</text>`;
            }
        });
        annGroup.innerHTML = annHTML;

        const handleInteraction = (clientX, clientY) => {
            const rect = svg.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const chartMouseX = (mouseX / rect.width) * width;
            if (chartMouseX >= margin.left && chartMouseX <= margin.left + chartW) {
                const i = Math.round(((chartMouseX - margin.left) / chartW) * (data.length - 1));
                const d = data[i]; const x = getX(i);
                tracker.setAttribute('x1', x); tracker.setAttribute('x2', x);
                tracker.style.visibility = "visible";

                const contentHtml = `
                    <div class="tt-title">People Displaced · ${d.d.toUpperCase()}</div>
                    <div class="tt-val-large" style="color: var(--ink);">${(d.sc + d.hf).toLocaleString()}</div>
                    <div class="tt-flex" style="margin-top:10px;">
                        <span><span style="color:var(--crimson)">●</span> Govt Shelters:</span>
                        <span style="font-weight:700">${d.sc.toLocaleString()}</span>
                    </div>
                    <div class="tt-flex">
                        <span><span style="color:var(--ink)">●</span> Staying with family:</span>
                        <span style="font-weight:700">${d.hf.toLocaleString()}</span>
                    </div>
                `;

                if(isMobile()) {
                    openMobileTapSheet(contentHtml);
                } else {
                    siteTooltip.innerHTML = contentHtml;
                    setTooltipPosition(clientX, clientY);
                }
            }
        };

        interactionArea.addEventListener('mousemove', (e) => { if (!isMobile()) handleInteraction(e.clientX, e.clientY); });
        interactionArea.addEventListener('click', (e) => { if (isMobile()) handleInteraction(e.clientX, e.clientY); });
        
        interactionArea.onmouseleave = () => {
            if (!isMobile()) {
                siteTooltip.style.visibility = "hidden";
                tracker.style.visibility = "hidden";
            }
        };
        
        window.addEventListener('clearCharts', () => { tracker.style.visibility = "hidden"; });
    })();

    // =========================================
    // CHART 3: MATRIX (Schools)
    // =========================================
    (() => {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const baseSchools = { total: 10076, damaged: 1339, shelters: 500, closed: 147, functioning: 8090 };
        let schools = { ...baseSchools };
        const ui = { gap: 3, radius: 4, activeCat: null };

        const colors = { damaged: '191, 45, 38', shelter: '19, 17, 16', closed:  '140, 124, 105', open: '122, 158, 184' };

        function init() {
            const dpr = window.devicePixelRatio || 1;
            const mob = isMobile();
            
            const matrixWrapper = document.querySelector('#sect-matrix .viz-container');
            const containerWidth = matrixWrapper ? matrixWrapper.clientWidth : (mob ? window.innerWidth - 40 : 1100);

            if (mob) {
                schools.damaged = Math.ceil(baseSchools.damaged / 10);
                schools.shelters = Math.ceil(baseSchools.shelters / 10);
                schools.closed = Math.ceil(baseSchools.closed / 10);
                schools.functioning = Math.ceil(baseSchools.functioning / 10);
                schools.total = schools.damaged + schools.shelters + schools.closed + schools.functioning;
                ui.radius = 5; ui.gap = 4;
            } else {
                schools = { ...baseSchools };
                ui.radius = 4; ui.gap = 3;
            }

            const cellSizeLocal = ui.radius + ui.gap;
            ui.cols = Math.max(10, Math.floor(containerWidth / cellSizeLocal));

            const internalWidth = ui.cols * cellSizeLocal;
            const internalHeight = Math.ceil(schools.total / ui.cols) * cellSizeLocal;
            
            canvas.width = internalWidth * dpr;
            canvas.height = internalHeight * dpr;
            
            canvas.style.width = internalWidth + 'px'; 
            canvas.style.height = internalHeight + 'px'; 
            
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.scale(dpr, dpr);
            render();
        }

        function getCategory(i) {
            if (i < schools.damaged) return 'damaged';
            if (i < schools.damaged + schools.shelters) return 'shelter';
            if (i < schools.damaged + schools.shelters + schools.closed) return 'closed';
            return 'open';
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cellSizeLocal = ui.radius + ui.gap;
            for (let i = 0; i < schools.total; i++) {
                const cat = getCategory(i);
                const x = (i % ui.cols) * cellSizeLocal;
                const y = Math.floor(i / ui.cols) * cellSizeLocal;
                let opacity = (ui.activeCat && ui.activeCat !== cat) ? 0.12 : 1;
                ctx.fillStyle = `rgba(${colors[cat]}, ${opacity})`;
                ctx.beginPath();
                ctx.arc(x + ui.radius / 2, y + ui.radius / 2, ui.radius / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const handleCanvasInteraction = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const scaleX = (canvas.width / dpr) / rect.width;
            const scaleY = (canvas.height / dpr) / rect.height;
            const mx = (clientX - rect.left) * scaleX;
            const my = (clientY - rect.top) * scaleY;
            const cellSizeLocal = ui.radius + ui.gap;
            const col = Math.floor(mx / cellSizeLocal);
            const row = Math.floor(my / cellSizeLocal);
            const index = (row * ui.cols) + col;

            if (index >= 0 && index < schools.total && col < ui.cols) {
                const cat = getCategory(index);
                if (ui.activeCat !== cat) { ui.activeCat = cat; render(); }
                
                const content = {
                    damaged: ["Damaged Buildings", "Schools structurally ruined during the storm.", "1,339", "var(--crimson)"],
                    shelter: ["Used as Shelters", "Schools turned into camps for homeless families.", "500", "var(--ink)"],
                    closed:  ["Roads Blocked", "Schools kept shut because roads were unsafe.", "147", "var(--dust)"],
                    open:    ["Open but Struggling", "Schools technically running, but missing supplies.", "8,090", "var(--open-blue)"]
                };
                
                const contentHtml = `
                    <div class="tt-title">Education System · ${content[cat][0]}</div>
                    <div class="tt-val-large" style="color: ${content[cat][3]};">${content[cat][2]}</div>
                    <div class="tt-desc">${content[cat][1]}</div>
                `;
                
                if(isMobile()) {
                    openMobileTapSheet(contentHtml);
                    canvas.classList.add('active-touch');
                } else {
                    siteTooltip.innerHTML = contentHtml;
                    setTooltipPosition(clientX, clientY);
                }
                
            } else {
                if (ui.activeCat !== null) { 
                    ui.activeCat = null; render(); 
                    if (!isMobile()) { siteTooltip.style.visibility = 'hidden'; canvas.classList.remove('active-touch'); }
                }
            }
        };

        canvas.addEventListener('mousemove', (e) => { if (!isMobile()) handleCanvasInteraction(e.clientX, e.clientY); });
        canvas.addEventListener('click', (e) => { if (isMobile()) handleCanvasInteraction(e.clientX, e.clientY); });
        canvas.addEventListener('mouseleave', () => { if (!isMobile()) { ui.activeCat = null; render(); siteTooltip.style.visibility = 'hidden'; } });
        
        window.addEventListener('clearCharts', () => { if (ui.activeCat !== null) { ui.activeCat = null; render(); } });
        window.addEventListener('resize', debounce(init, 250));
        
        setTimeout(init, 100);
    })();

    // =========================================
    // CHART 4: FUNDING VESSEL
    // =========================================
    (() => {
        const hpp = document.getElementById('hpp-vessel');
        const shadow = document.getElementById('shadow-flow');
        const mFunding = document.getElementById('mobile-funding-hit-area');

        const updateFundingTooltip = (clientX, clientY, type) => {
            let contentHtml = '';
            
            if (type === 'vessel' && hpp) {
                const rect = hpp.getBoundingClientRect();
                const pct = 100 - ((clientY - rect.top) / rect.height * 100);
                if (pct > 63.7 || isMobile()) {
                    contentHtml = `
                        <div class="tt-title">FUNDING STATUS · APRIL 2026</div>
                        <div class="tt-val-large" style="color:var(--ink);">$22.5M Raised</div>
                        <div class="tt-desc" style="margin-top: 8px;">
                            <strong style="color:var(--ink)">$35.3M</strong> Total Goal<br>
                            <span class="tt-val-red"><strong>$12.8M</strong> Still Needed</span>
                        </div>
                        <div class="tt-desc" style="margin-top: 12px; border-top: 1px solid rgba(19, 17, 16, 0.1); padding-top: 12px;">
                            Aid froze in February — the fund grew by less than $100K in its final two months. Data verified April 17, 2026.
                        </div>
                    `;
                } else {
                    contentHtml = `
                        <div class="tt-title">Official Aid Money</div>
                        <div class="tt-val-large" style="color:var(--ink);">$22.5M Raised</div>
                        <p class="tt-desc">Money officially tracked and delivered to emergency sites.</p>
                    `;
                }
            } else if (shadow) {
                contentHtml = `
                    <div class="tt-title">Outside Money</div>
                    <div class="tt-val-large" style="color:var(--dust)">Uncoordinated Cash</div>
                    <p class="tt-desc">Private donations and unorganized money that skipped the main recovery plan.</p>
                `;
            }
            
            if(isMobile()) {
                openMobileTapSheet(contentHtml);
            } else {
                siteTooltip.innerHTML = contentHtml;
                setTooltipPosition(clientX, clientY);
            }
        };

        if(hpp) {
            hpp.onmousemove = (e) => { if (!isMobile()) updateFundingTooltip(e.clientX, e.clientY, 'vessel'); };
            hpp.addEventListener('click', (e) => { if (isMobile()) updateFundingTooltip(e.clientX, e.clientY, 'vessel'); });
            hpp.onmouseleave = () => { if (!isMobile()) siteTooltip.style.visibility = 'hidden'; };
        }
        if (shadow) {
            shadow.onmousemove = (e) => { if (!isMobile()) updateFundingTooltip(e.clientX, e.clientY, 'shadow'); };
            shadow.addEventListener('click', (e) => { if (isMobile()) updateFundingTooltip(e.clientX, e.clientY, 'shadow'); });
            shadow.onmouseleave = () => { if (!isMobile()) siteTooltip.style.visibility = 'hidden'; };
        }
        if (mFunding) {
            mFunding.addEventListener('click', (e) => { if (isMobile()) updateFundingTooltip(e.clientX, e.clientY, 'vessel'); });
        }

        let animated = false;

        function animateValue(obj, start, end, duration, prefix = '', suffix = '') {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const currentVal = (ease * (end - start) + start).toFixed(1);
                obj.innerHTML = `${prefix}${currentVal}${suffix}`;
                if (progress < 1) window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        }

        const vesselTrigger = document.getElementById('sect-funding');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    if(document.getElementById('vessel-fill-anim')) document.getElementById('vessel-fill-anim').style.height = '63.7%';
                    if(document.getElementById('m-funding-fill-anim')) document.getElementById('m-funding-fill-anim').style.width = '63.7%';
                    if(document.getElementById('progress-fill-anim')) document.getElementById('progress-fill-anim').style.width = '44.2%';
                    document.querySelectorAll('.count-up-money').forEach(el =>
                        animateValue(el, 0, parseFloat(el.getAttribute('data-target')), 2200, '$', 'M')
                    );
                    document.querySelectorAll('.count-up-pct').forEach(el =>
                        animateValue(el, 0, parseFloat(el.getAttribute('data-target')), 2200)
                    );
                }
            });
        }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });

        if (vesselTrigger) observer.observe(vesselTrigger);
    })();

    // =========================================
    // SPIRAL VISUALIZATIONS
    // =========================================
    const PATH_SHELL = "M67.92,1.63c.39-.96,1.79-.78,1.92.24.89,6.91,2.28,15.58,4.53,25.45.99,4.35,4.66,19.9,12.5,40.17,2.2,5.69,5.91,13.96,13.33,30.5,7.83,17.46,10.07,21.8,13.83,31.83,4.55,12.11,6.84,18.35,8,27.33.81,6.26,1.93,15.65-1,27.33-3.38,13.48-10.21,22.34-12.83,25.5-3.2,3.86-8.17,9.76-16.67,14.17-8,4.15-15.23,4.95-24.67,6-5.26.58-10.27,1.14-16.83.5-4.2-.41-14.54-1.42-24.17-7.33-15.51-9.52-20.33-26.34-22.33-33.33-3.69-12.87-2.62-23.22-1.33-34.5,1.9-16.66,6.37-28.11,14.17-47.83,3.16-7.99,10.39-25.52,21.83-46.83,7.44-13.86,11-18.76,18.17-33.33,5.04-10.24,8.86-19.16,11.55-25.85Z";
    const PATH_DETAILS = [
        "M51.59,44.76c-4.48,11.83-9.95,24.61-16.67,38-8.17,16.3-16.74,30.64-24.99,43.02",
        "M65.14,20.98c.04,6.63.47,14.02,1.56,22,.67,4.9,1.51,9.5,2.44,13.78",
        "M72.75,22.07c-.13,5.9.15,14.43,2.17,24.47,1.85,9.18,4.41,15.8,7.56,24,3.15,8.2,5.92,14,11.33,25.33,4.47,9.35,9.56,19.56,9.56,19.56,3.79,7.6,5.65,11.15,8,17.11,1.28,3.24,2.92,7.45,4.44,13.11,2.35,8.75,2.95,15.62,3.56,23.11.36,4.47.69,10.52.6,17.74",
        "M78.26,87.65c1.88,4.73,4.57,11.54,7.78,19.78,4.42,11.34,6.49,16.86,8.22,21.56,4.26,11.56,6.41,17.45,7.56,22.67,1.36,6.17,2.71,12.33,2.22,20.44-.38,6.28-1.03,17.18-8.89,26.67-5.34,6.45-11.47,9.19-14.89,10.67-1.89.82-8.21,3.55-9.56,1.78-1.07-1.4,1.39-5.07,2.89-6.89,2.84-3.45,5.84-4.58,8.22-6,6.05-3.59,8.88-9.41,10.89-13.56,4.68-9.63,3.51-19.17,2.67-23.56",
        "M32.26,113.87c1.19.25,1.15,4.87,1.11,8.22-.13,10.61-2.09,14.8-3.33,24.89-1.08,8.8-1.62,13.19-.22,19.11,1.29,5.43,4.43,13.12,4.89,14.22.78,1.89,2.37,5.63,3.56,10.89,1.4,6.24.64,7.6,0,8.22-1.94,1.86-6.29.21-7.33-.22-8.55-3.54-11.44-14.78-12.44-18.67-2.46-9.56-1.28-17.05.67-29.33,1.75-11.03,4.32-18.07,6.89-25.11,1.6-4.38,4.59-12.56,6.22-12.22Z",
        "M1.43,162.93c1.98,14.39,6.2,25.18,9.5,32.05,5.21,10.88,9.55,14.97,12.22,17.11,1.78,1.43,5.35,4,14.22,7.11,8.47,2.97,18,6.3,30.44,6,17.38-.42,30.46-7.68,36.86-11.92",
        "M3.53,189.98c2.16,3.4,5.46,8.19,10.06,13.44,6.07,6.95,12.38,14.16,23.11,19.56,2.07,1.04,10.71,5.23,22.89,6.44,5.37.53,9.97.34,13.39,0"
    ];

    const createSpiralSketch = (containerId, configData, settings, titlePrefix) => {
        return (p) => {
            let shellPath2D, detailPaths2D = [], dropPositions = [], activeHoverId = null, staticBuffer, maxRadius = 0;

            p.setup = () => {
                const container = document.getElementById(containerId);
                p.createCanvas(container.clientWidth, container.clientWidth);
                shellPath2D = new Path2D(PATH_SHELL);
                PATH_DETAILS.forEach(d => detailPaths2D.push(new Path2D(d)));
                calculatePositions();
                renderStaticBuffer();
                window.addEventListener('clearCharts', () => { if (activeHoverId !== null) { activeHoverId = null; p.redraw(); } });
                p.noLoop();
                setTimeout(() => { p.windowResized(); }, 50);
            };

            const calculatePositions = () => {
                dropPositions = [];
                let i = settings.startIndex;
                configData.forEach(group => {
                    for (let j = 0; j < group.count; j++) {
                        const r = settings.spacing * p.sqrt(i);
                        const theta = i * settings.angle;
                        dropPositions.push({ x: r * p.cos(theta), y: r * p.sin(theta), r, theta, group });
                        i++;
                    }
                });
                maxRadius = settings.spacing * p.sqrt(settings.startIndex + dropPositions.length) + 50;
            };

            const renderStaticBuffer = () => {
                if (staticBuffer) staticBuffer.remove();
                staticBuffer = p.createGraphics(p.width, p.height);
                staticBuffer.clear();
                const viewScale = staticBuffer.width / 2000;
                staticBuffer.translate(staticBuffer.width / 2, staticBuffer.height / 2);
                staticBuffer.scale(viewScale);
                dropPositions.forEach(drop => {
                    staticBuffer.push();
                    staticBuffer.translate(drop.x, drop.y);
                    staticBuffer.rotate(staticBuffer.atan2(drop.y, drop.x) + staticBuffer.HALF_PI);
                    staticBuffer.scale(settings.scale);
                    staticBuffer.translate(-61.5, -115.5);
                    const ctx = staticBuffer.drawingContext;
                    ctx.fillStyle = drop.group.fill;
                    ctx.strokeStyle = drop.group.stroke;
                    ctx.lineWidth = 2; ctx.fill(shellPath2D); ctx.stroke(shellPath2D);
                    ctx.lineWidth = 0.5; detailPaths2D.forEach(path => ctx.stroke(path));
                    staticBuffer.pop();
                });
            };

            p.draw = () => {
                p.clear();
                if (activeHoverId) {
                    const viewScale = p.width / 2000;
                    p.push(); p.translate(p.width / 2, p.height / 2); p.scale(viewScale);
                    dropPositions.forEach(drop => {
                        p.push(); p.translate(drop.x, drop.y); p.rotate(p.atan2(drop.y, drop.x) + p.HALF_PI);
                        p.scale(settings.scale); p.translate(-61.5, -115.5);
                        const ctx = p.drawingContext;
                        ctx.globalAlpha = drop.group.id === activeHoverId ? 1.0 : 0.15;
                        ctx.fillStyle = drop.group.fill; ctx.strokeStyle = drop.group.stroke;
                        ctx.lineWidth = 2; ctx.fill(shellPath2D); ctx.stroke(shellPath2D);
                        ctx.lineWidth = 0.5; detailPaths2D.forEach(path => ctx.stroke(path));
                        p.pop();
                    });
                    p.pop();
                } else {
                    p.image(staticBuffer, 0, 0);
                }
            };

            const detectInteraction = (x, y) => {
                const viewScale = p.width / 2000;
                const localX = (x - p.width / 2) / viewScale;
                const localY = (y - p.height / 2) / viewScale;
                if (p.dist(0, 0, localX, localY) > maxRadius) return null;
                let foundHover = null;
                const hitRadius = 50; 
                for (let i = 0; i < dropPositions.length; i++) {
                    if (p.dist(localX, localY, dropPositions[i].x, dropPositions[i].y) < hitRadius) {
                        foundHover = dropPositions[i].group; break;
                    }
                }
                return foundHover;
            };

            const updateTooltipUI = (foundHover, pointerX, pointerY) => {
                if (foundHover && activeHoverId !== foundHover.id) {
                    activeHoverId = foundHover.id;
                    const contentHtml = `
                        <div class="tt-title">${titlePrefix} · ${foundHover.label}</div>
                        <div class="tt-val-large" style="color: ${foundHover.fill};">${foundHover.displayCount}</div>
                        <div class="tt-desc" style="font-weight: 500;">${foundHover.subLabel}</div>
                        <div class="tt-context">${foundHover.context}</div>
                    `;
                    
                    if (isMobile()) { openMobileTapSheet(contentHtml); } 
                    else { siteTooltip.innerHTML = contentHtml; setTooltipPosition(pointerX, pointerY); }
                    p.redraw();
                } else if (!foundHover && activeHoverId !== null) {
                    clearInteraction();
                }
                if (activeHoverId && !isMobile()) setTooltipPosition(pointerX, pointerY);
            };

            const clearInteraction = () => {
                activeHoverId = null;
                if (!isMobile()) siteTooltip.style.visibility = 'hidden';
                p.redraw();
            };

            p.mouseMoved = () => {
                if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
                    if (activeHoverId !== null) clearInteraction();
                    return;
                }
                if (!isMobile()) updateTooltipUI(detectInteraction(p.mouseX, p.mouseY), p.winMouseX, p.winMouseY);
            };

            p.mouseClicked = () => {
                if (isMobile()) {
                    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
                        const foundHover = detectInteraction(p.mouseX, p.mouseY);
                        if (foundHover) { updateTooltipUI(foundHover, p.winMouseX, p.winMouseY); } 
                        else { if (activeHoverId !== null) clearInteraction(); }
                    }
                }
            };

            p.windowResized = () => {
                const container = document.getElementById(containerId);
                p.resizeCanvas(container.clientWidth, container.clientWidth);
                calculatePositions(); renderStaticBuffer(); p.redraw();
            };
        };
    };

    const day1Data = [
        { id: 'missing',    count: 203,  fill: '#8C7C69', stroke: '#F6F3EC', label: 'Missing',    displayCount: '203',  subLabel: 'Many would never be found', context: "Mountain villages were unreachable — families could not be contacted." },
        { id: 'casualties', count: 159,  fill: '#BF2D26', stroke: '#F6F3EC', label: 'Lives Lost', displayCount: '159',  subLabel: 'A toll that would grow fourfold in 90 days', context: "Early count from hospitals still reachable by road." },
        { id: 'affected',   count: 800,  fill: '#131110', stroke: '#F6F3EC', label: 'Affected',   displayCount: '800k', subLabel: 'Roughly the entire population of Colombo', context: "Estimate made before power and phone lines went down." }
    ];
    const day1Settings = { spacing: 17.5, startIndex: 1, scale: 0.13, angle: 137.508 * (Math.PI / 180) };

    const month3Data = [
        { id: 'missing',    count: 173,  fill: '#8C7C69', stroke: '#F6F3EC', label: 'Missing',    displayCount: '173',  subLabel: 'Still lost, three months later', context: "173 people were never found. Most presumed in landslide zones." },
        { id: 'casualties', count: 646,  fill: '#BF2D26', stroke: '#F6F3EC', label: 'Lives Lost', displayCount: '646',  subLabel: 'Four times the count from the first day', context: "Four times the first-day figure. Most deaths were in the highlands." },
        { id: 'affected',   count: 2300, fill: '#131110', stroke: '#F6F3EC', label: 'Affected',   displayCount: '2.3M', subLabel: 'Nearly 1 in 10 Sri Lankans', context: "The confirmed number, once all roads were cleared." }
    ];
    const month3Settings = { spacing: 14.1, startIndex: 1, scale: 0.11, angle: 137.508 * (Math.PI / 180) };

    if (document.getElementById('canvas-day1')) {
        new p5(createSpiralSketch('canvas-day1', day1Data, day1Settings, 'Day 01 Impact'), 'canvas-day1');
        new p5(createSpiralSketch('canvas-month3', month3Data, month3Settings, '3 Months Later'), 'canvas-month3');
    }

    const spiralFadeElements = document.querySelectorAll('.canvas-wrapper');
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });
    
    if(document.getElementById('canvas-day1')) chartObserver.observe(document.getElementById('canvas-day1'));
    if(document.getElementById('canvas-month3')) chartObserver.observe(document.getElementById('canvas-month3'));
});

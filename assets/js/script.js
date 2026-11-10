// Wait for DOM ready
document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initThemeToggle();
    initProjects();
    initImageLightbox();
    initScrollReveal();
    initSmoothScroll();
    setCurrentYear();
});

// ===== NAVBAR =====
function initNavbar() {
    var menuToggle = document.getElementById('mobile-menu');
    var navMenu = document.getElementById('primary-menu') || document.querySelector('.nav-menu');
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var navbar = document.querySelector('.navbar');

    function setMenuState(isOpen) {
        if (!menuToggle || !navMenu) return;
        menuToggle.classList.toggle('active', isOpen);
        navMenu.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        navMenu.setAttribute('aria-hidden', String(!isOpen));
        document.body.classList.toggle('mobile-menu-open', isOpen);
    }

    if (menuToggle && navMenu) {
        setMenuState(false);

        menuToggle.addEventListener('click', function () {
            var isOpen = menuToggle.classList.contains('active');
            setMenuState(!isOpen);
        });

        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuState(false);
            });
        });

        document.addEventListener('click', function (event) {
            if (!menuToggle.classList.contains('active')) return;
            var target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('.nav-right')) return;
            setMenuState(false);
        });

        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setMenuState(false);
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                setMenuState(false);
            }
        });
    }

    if (navbar) {
        var updateNavbarState = function () {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        };
        updateNavbarState();
        window.addEventListener('scroll', updateNavbarState, { passive: true });
    }

    initActiveSectionHighlighting(navLinks);
}

function initActiveSectionHighlighting(navLinks) {
    var hashLinks = navLinks.filter(function (link) {
        var href = link.getAttribute('href') || '';
        return href.charAt(0) === '#' && href.length > 1;
    });

    if (!hashLinks.length) return;

    var sectionIds = hashLinks.map(function (link) {
        return (link.getAttribute('href') || '').slice(1);
    });

    var sections = sectionIds
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);

    if (!sections.length) return;

    function setActiveById(id) {
        hashLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    if ('IntersectionObserver' in window) {
        var visible = new Set();
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visible.add(entry.target.id);
                } else {
                    visible.delete(entry.target.id);
                }
            });

            for (var i = 0; i < sections.length; i += 1) {
                if (visible.has(sections[i].id)) {
                    setActiveById(sections[i].id);
                    break;
                }
            }
        }, {
            root: null,
            rootMargin: '-42% 0px -42% 0px',
            threshold: 0
        });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var icon = toggle.querySelector('i');
    var saved = localStorage.getItem('theme');
    var darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        var isDark = theme === 'dark';

        if (icon) {
            icon.classList.toggle('fa-sun', isDark);
            icon.classList.toggle('fa-moon', !isDark);
        }

        toggle.setAttribute('aria-pressed', String(isDark));
        toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
    } else {
        applyTheme('light');
    }

    toggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    darkMediaQuery.addEventListener('change', function (event) {
        if (!localStorage.getItem('theme')) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });
}

// ===== PROJECTS =====
function initProjects() {
    var accordionContainer = document.querySelector('.projects-accordion');
    if (!accordionContainer) return;

    var projects = [
        {
            title: 'Bangla Diarizz',
            shortDesc: 'Bengali speaker diarization for long-form audio.',
            problem: 'Exploring speaker diarization for Bengali long-form audio where off-the-shelf models encounter elevated error rates on conversational in-domain audio.',
            constraint: 'Limited labeled Bengali conversational data; evaluated under CPU execution conditions.',
            approach: 'Targeted domain adaptation on the speaker embedding layer while keeping segmentation stages stable. Applied knowledge distillation to produce a lightweight student model.',
            numbers: 'Reported DER 0.19 (dev) / 0.286 (private competition split) on test benchmarks · 3.4× real-time factor on CPU relative to uncompressed baseline',
            improve: 'Extend labeled data via semi-supervised bootstrapping using high-confidence outputs. Explore streaming inference for conversational audio.',
            impact: [
                { number: '3.4×', label: 'Real-Time CPU' },
                { number: '0.19', label: 'DER (dev)' },
                { number: 'Speech', label: 'Bengali Domain' }
            ],
            tags: ['PyTorch', 'pyannote', 'WeSpeaker', 'Knowledge Distillation'],
            paper: 'https://www.researchgate.net/publication/401194830_Bangla_Diarizz_Domain-Adapted_Speaker_Diarization_for_Bengali_Long-Form_Audio',
            code: 'https://github.com/AdilShamim8/Bangla-Diarizz',
            demo: null,
            badge: 'Speech AI'
        },
        {
            title: 'Agentic RAG Platform',
            shortDesc: 'A reference implementation of document retrieval with access controls and citation checks.',
            problem: 'Document retrieval systems risk retrieval degradation, uncited statements, and unauthorized cross-tenant document exposure.',
            constraint: 'Requires dynamic query decomposition, SQL-layer tenant filtering in integration test suite, citation verification against retrieved chunks, and structured telemetry.',
            approach: 'Reference implementation: Next.js + FastAPI with query planning, hybrid retrieval (dense pgvector + lexical Postgres full-text search fused via Reciprocal Rank Fusion), BGE cross-encoder reranking, and citation checks against retrieved evidence.',
            numbers: 'Hybrid RAG (Dense + BM25 via RRF) · Cross-Encoder Reranking · Pre-retrieval SQL filtering (tenant isolation tested in integration tests) · OpenTelemetry & Langfuse tracing',
            impact: [
                { number: 'RRF', label: 'Hybrid Fusion' },
                { number: 'SQL-layer', label: 'RBAC (Tested)' },
                { number: 'OTel', label: 'Telemetry' }
            ],
            tags: ['Agentic RAG', 'FastAPI', 'pgvector', 'PostgreSQL FTS', 'Cross-Encoder', 'OpenTelemetry', 'Langfuse', 'Docker'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/Agentic-RAG-Platform',
            badge: 'Reference Implementation'
        },
        {
            title: 'Agentic AI Eval Harness',
            shortDesc: 'Regression evaluation for multi-step AI agents.',
            problem: 'Multi-step AI agents can fail silently due to prompt adjustments and non-deterministic model responses, requiring systematic trajectory regression testing.',
            constraint: 'Must test agents across 280 hash-pinned golden cases across common agent patterns (ReAct, Plan-and-Execute), enforce fail-closed CI gates with statistical significance testing (McNemar), and minimize runtime dependencies.',
            approach: 'Evaluation & regression harness: Adapter layer for agent frameworks → Trajectory capture & runner → Multi-tier evaluators (deterministic exact-match + calibrated LLM-judge + behavioral verifiers) → Root-cause localization and CLI (agent-eval) for CI merge gates.',
            numbers: '280 hash-pinned golden cases · 89.3% ReAct pass rate (evaluated under deterministic mock/golden backend conditions) · McNemar significance testing · Single PyYAML dependency',
            impact: [
                { number: '280', label: 'Golden Cases' },
                { number: '89.3%*', label: 'Deterministic Backend' },
                { number: '1', label: 'Runtime Dep (PyYAML)' }
            ],
            tags: ['Agentic AI', 'AI Evaluation', 'LangGraph', 'pytest', 'CI/CD Gate', 'LLM-as-a-Judge', 'Python'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/Agentic-AI-Eval-Harness',
            badge: 'AI Evaluation'
        },
        {
            title: 'QuantScope',
            shortDesc: 'Stock analysis with replaceable LLM providers and fallback handling.',
            problem: 'Financial analysis tools relying on a single LLM API risk disruption when that provider encounters downtime or rate limits.',
            constraint: 'Core analysis modules must function independently of any single LLM vendor, with automated tests covering calculations and provider fallbacks.',
            approach: 'Separation of concerns: core calculation layer (indicators, risk metrics, data) has zero LLM dependencies. Built an orchestration layer with provider fallback chains and template-based fallback handling.',
            numbers: 'Multi-provider LLM fallback chain · 33 automated tests · Decoupled quantitative core',
            impact: [
                { number: '6', label: 'LLM Fallbacks' },
                { number: '33', label: 'Automated Tests' },
                { number: 'Core', label: 'Decoupled' }
            ],
            tags: ['Python', 'FastAPI', 'LangChain', 'Docker', 'pytest', 'Multi-LLM'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/QuantScope',
            badge: 'AI and Finance'
        },
        {
            title: 'Production ML Pipeline',
            shortDesc: 'A reproducible price-prediction pipeline with experiment tracking and API serving.',
            problem: 'Machine learning workflows kept solely in notebooks lack automated stage transitions, reproducible runs, and versioned experiment tracking.',
            constraint: 'Must implement structured pipeline stages: data ingestion, preprocessing, training, validation, experiment tracking, and containerized serving.',
            approach: 'ZenML orchestration across ingest → preprocess → train → evaluate → register → serve stages. MLflow for experiment versioning and hyperparameter logging. Dockerized FastAPI inference service with structured request validation.',
            numbers: 'Reproducible pipeline stages · MLflow experiment tracking · Cross-validation · Dockerized FastAPI serving',
            impact: [
                { number: '6', label: 'Pipeline Stages' },
                { number: 'MLflow', label: 'Experiment Tracking' },
                { number: 'Docker', label: 'FastAPI Serving' }
            ],
            tags: ['ZenML', 'MLflow', 'XGBoost', 'Docker', 'FastAPI'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/Prices_Predictor_System',
            badge: 'MLOps'
        },
        {
            title: 'Training Data Bot',
            shortDesc: 'Document processing for fine-tuning dataset preparation.',
            problem: 'Preparing fine-tuning datasets from varied source formats requires parsing, chunking, and formatting into instruction-response pairs.',
            constraint: 'Ingests PDF, plain text, and web URLs and outputs structured JSONL datasets formatted for LLM fine-tuning runs.',
            approach: 'Automated document pipeline: raw file ingestion, text extraction, rule-based filtering heuristics, and structured schema formatting for fine-tuning datasets.',
            numbers: 'Multi-format document parsing · Rule-based heuristic filtering · JSONL dataset formatting',
            impact: [
                { number: '3', label: 'Input Formats' },
                { number: 'JSONL', label: 'Dataset Format' },
                { number: 'Rules', label: 'Heuristic Filters' }
            ],
            tags: ['LLM Engineering', 'Fine-Tuning', 'PDF Ingestion', 'Quality Scoring', 'Python'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/Training-Data-Bot',
            badge: 'Data Preparation'
        },
        {
            title: 'NeuroBridge',
            shortDesc: 'Middleware connecting language models with application APIs.',
            problem: 'Direct connection between language model outputs and external APIs requires intermediate translation, schema validation, and error recovery.',
            constraint: 'Must parse structured tool calls, map them to external API endpoints, and handle malformed outputs gracefully.',
            approach: 'Middleware routing layer standardizing schema translation between LLM function calls and REST application endpoints with structured error handling.',
            numbers: 'API schema translation · Tool dispatching · Structured error recovery',
            impact: [
                { number: 'REST', label: 'API Dispatch' },
                { number: 'Schema', label: 'Translation' },
                { number: 'Modular', label: 'Architecture' }
            ],
            tags: ['LangGraph', 'Agentic AI', 'API Integration', 'Middleware'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/NeuroBridge',
            badge: 'Agent Tooling'
        },
        {
            title: 'Transformer Architecture',
            shortDesc: 'A PyTorch reproduction of GPT-2 based on nanoGPT.',
            problem: 'Using LLMs exclusively through APIs abstracts away fundamental architecture, limiting low-level inspection and custom model training.',
            constraint: 'Reconstruct core transformer blocks from first principles in PyTorch, referencing Andrej Karpathy\'s educational nanoGPT implementation.',
            approach: 'Step-by-step educational reproduction: implemented custom multi-head causal self-attention, layer normalization, residual connections, and training loop in PyTorch.',
            numbers: 'GPT-2 architecture (124M parameter configuration) · Educational reproduction · Credited to Andrej Karpathy\'s nanoGPT',
            impact: [
                { number: 'PyTorch', label: 'From Scratch' },
                { number: '124M', label: 'Param Config' },
                { number: 'nanoGPT', label: 'Original Source' }
            ],
            tags: ['PyTorch', 'Transformers', 'Deep Learning', 'Custom Training'],
            paper: null,
            demo: null,
            code: 'https://github.com/AdilShamim8/GPT-2-Rebuild-nanoGPT',
            badge: 'Learning Project'
        }
    ];

    accordionContainer.innerHTML = '';
    var fragment = document.createDocumentFragment();

    projects.forEach(function (project, index) {
        var item = document.createElement('div');
        item.className = 'accordion-item reveal';
        
        var projectNum = (index + 1).toString().padStart(2, '0');

        // Build Links
        var linksHtml = '';
        if (project.paper) {
            linksHtml += '<a href="' + project.paper + '" class="accordion-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-file-alt"></i> View manuscript <i class="fas fa-arrow-up-right-from-square link-arrow"></i></a>';
        }
        if (project.demo) {
            linksHtml += '<a href="' + project.demo + '" class="accordion-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Live Demo <i class="fas fa-arrow-up-right-from-square link-arrow"></i></a>';
        }
        linksHtml += '<a href="' + project.code + '" class="accordion-link" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> Code <i class="fas fa-arrow-up-right-from-square link-arrow"></i></a>';

        // Build Impact Metrics
        var impactHtml = '';
        if (project.impact && project.impact.length) {
            impactHtml = '<div class="accordion-metrics">';
            project.impact.forEach(function(stat) {
                impactHtml += '<div class="metric-item"><span class="metric-number">' + stat.number + '</span><span class="metric-label">' + stat.label + '</span></div>';
            });
            impactHtml += '</div>';
        }

        var badgeHtml = project.badge ? '<span class="accordion-badge">' + project.badge + '</span>' : '';

        // Display standardized short description
        var headerDescription = project.shortDesc || project.problem.split('—')[0] || project.problem;

        item.innerHTML = 
            '<button class="accordion-header" id="acc-btn-' + index + '" aria-expanded="false" aria-controls="acc-panel-' + index + '">' +
                '<span class="accordion-num">' + projectNum + '</span>' +
                '<div class="accordion-title-wrap">' +
                    '<h3 class="accordion-title">' + project.title + '</h3>' +
                    badgeHtml +
                '</div>' +
                '<span class="accordion-desc-short">' + headerDescription + '</span>' +
                '<span class="accordion-icon"><i class="fas fa-chevron-down"></i></span>' +
            '</button>' +
            '<div class="accordion-body" id="acc-panel-' + index + '" role="region" aria-labelledby="acc-btn-' + index + '">' +
                '<div class="accordion-body-inner">' +
                    '<div class="accordion-col-left">' +
                        '<div class="accordion-section">' +
                            '<h4 class="accordion-section-title">Problem</h4>' +
                            '<p>' + project.problem + '</p>' +
                        '</div>' +
                        '<div class="accordion-section">' +
                            '<h4 class="accordion-section-title">Constraint</h4>' +
                            '<p>' + project.constraint + '</p>' +
                        '</div>' +
                        '<div class="accordion-section">' +
                            '<h4 class="accordion-section-title">Approach</h4>' +
                            '<p>' + project.approach + '</p>' +
                        '</div>' +
                        '<div class="accordion-section">' +
                            '<h4 class="accordion-section-title">Result</h4>' +
                            '<p>' + project.numbers + '</p>' +
                        '</div>' +
                        (project.improve ? '<div class="accordion-section"><h4 class="accordion-section-title">What I\'d Improve Next</h4><p>' + project.improve + '</p></div>' : '') +
                        (project.thesis ? '<div class="accordion-section accordion-thesis"><p class="accordion-thesis-text"><i class="fas fa-lightbulb" aria-hidden="true"></i> ' + project.thesis + '</p></div>' : '') +
                        '<div class="accordion-tags">' +
                            project.tags.map(function(tag) { return '<span class="accordion-tag">' + tag + '</span>'; }).join('') +
                        '</div>' +
                        '<div class="accordion-links">' + linksHtml + '</div>' +
                    '</div>' +
                    '<div class="accordion-col-right">' +
                        '<h4 class="accordion-section-title">Impact</h4>' +
                        impactHtml +
                    '</div>' +
                '</div>' +
            '</div>';

        var header = item.querySelector('.accordion-header');
        header.addEventListener('click', function() {
            var isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other accordions
            var allItems = accordionContainer.querySelectorAll('.accordion-item');
            allItems.forEach(function(otherItem) {
                if (otherItem !== item) {
                    var otherBody = otherItem.querySelector('.accordion-body');
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    if (otherBody) {
                        otherBody.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(function(el) {
                            el.setAttribute('tabindex', '-1');
                        });
                    }
                    var icon = otherItem.querySelector('.accordion-icon i');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });

            // Toggle current accordion
            var body = item.querySelector('.accordion-body');
            if (!isExpanded) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
                if (body) {
                    body.querySelectorAll('[tabindex="-1"]').forEach(function(el) {
                        el.removeAttribute('tabindex');
                    });
                }
                var icon = this.querySelector('.accordion-icon i');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                item.classList.remove('active');
                this.setAttribute('aria-expanded', 'false');
                if (body) {
                    body.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(function(el) {
                        el.setAttribute('tabindex', '-1');
                    });
                }
                var icon = this.querySelector('.accordion-icon i');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });

        // Ensure focusable children in closed panels start hidden
        var initialBody = item.querySelector('.accordion-body');
        if (initialBody) {
            initialBody.querySelectorAll('a, button, input, select, textarea').forEach(function(el) {
                el.setAttribute('tabindex', '-1');
            });
        }

        fragment.appendChild(item);
    });

    accordionContainer.appendChild(fragment);
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    var elements = Array.prototype.slice.call(document.querySelectorAll('.reveal, .exp-item, .skill-group, .blog-item, .cert-item, .philosophy-content, .sj-kaggle-cta'));
    if (!elements.length) return;

    elements.forEach(function (element) {
        if (!element.classList.contains('reveal')) {
            element.classList.add('reveal');
        }
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach(function (element) {
            element.classList.add('visible');
        });
        return;
    }

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -30px 0px'
        });

        elements.forEach(function (element) {
            revealObserver.observe(element);
        });
        return;
    }

    function revealByScroll() {
        elements.forEach(function (element) {
            var rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', revealByScroll, { passive: true });
    revealByScroll();
}

// ===== YEAR =====
function setCurrentYear() {
    var element = document.getElementById('current-year');
    if (element) {
        element.textContent = new Date().getFullYear();
    }
}

// ===== IMAGE LIGHTBOX =====
function initImageLightbox() {
    var selector = '.hero-photo, .project-card-image, .story-photo';
    if (document.querySelector('.image-lightbox')) return;

    var overlay = document.createElement('div');
    overlay.className = 'image-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-label', 'Expanded image viewer');
    overlay.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close expanded image">&times;</button>' +
        '<img class="lightbox-image" alt="Expanded image">';

    document.body.appendChild(overlay);

    var lightboxImage = overlay.querySelector('.lightbox-image');
    var closeButton = overlay.querySelector('.lightbox-close');
    var lastFocusedElement = null;

    function openLightbox(sourceImage) {
        lastFocusedElement = document.activeElement;
        lightboxImage.src = sourceImage.getAttribute('src') || '';
        lightboxImage.alt = sourceImage.getAttribute('alt') || 'Expanded image';
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeButton.focus();
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    document.addEventListener('click', function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;
        if (target.matches(selector)) {
            openLightbox(target);
        }
    });

    document.querySelectorAll(selector).forEach(function (image) {
        image.setAttribute('tabindex', '0');
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', 'Open image in full screen');
        image.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    closeButton.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && overlay.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            var hash = anchor.getAttribute('href') || '';
            if (hash.length < 2) return;

            var target = document.getElementById(hash.slice(1));
            if (!target) return;

            event.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 80,
                behavior: 'smooth'
            });
            history.replaceState(null, '', hash);
        });
    });
}

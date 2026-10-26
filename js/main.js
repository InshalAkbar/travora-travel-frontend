document.addEventListener('DOMContentLoaded', () => {
    
    // ============================================
    // 1. CUSTOM CURSOR
    // ============================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    const glassCards = document.querySelectorAll('.glass-card');
    const categoryCards = document.querySelectorAll('.category-card');

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });

            // 3D PARALLAX
            const parallaxLayers = document.querySelectorAll('.parallax-layer');
            const xAxis = (window.innerWidth / 2 - e.clientX) / 25;
            const yAxis = (window.innerHeight / 2 - e.clientY) / 25;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.05;
                const xOffset = xAxis * speed * 10;
                const yOffset = yAxis * speed * 10;
                
                layer.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) rotateX(${yAxis * 0.3}deg) rotateY(${xAxis * 0.3}deg)`;
            });
        });

        // CURSOR HOVER
        const hoverElements = [...magneticBtns, ...glassCards, ...categoryCards];
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '70px';
                cursorOutline.style.height = '70px';
                cursorOutline.style.backgroundColor = 'rgba(64, 224, 208, 0.1)';
                cursorOutline.style.borderColor = 'transparent';
            });

            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorOutline.style.borderColor = 'rgba(64, 224, 208, 0.5)';
            });
        });
    }

    // ============================================
    // 2. MAGNETIC BUTTONS
    // ============================================
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });

    // ============================================
    // 3. NAVBAR SCROLL
    // ============================================
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ============================================
    // 4. FADE-IN ON SCROLL
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Only observe elements NOT on planner page (to avoid conflicts)
    if (!document.getElementById('plannerSection')) {
        document.querySelectorAll('.section-padding, .glass-card, .category-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
    }

    // ============================================
    // 5. EXPLORE PAGE: Search + Filter
    // ============================================
    const searchInput = document.getElementById('searchInput');
    const categoryFilters = document.getElementById('categoryFilters');
    const destinationsGrid = document.getElementById('destinationsGrid');
    const resultCount = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');

    if (destinationsGrid) {
        const items = destinationsGrid.querySelectorAll('.destination-item');
        let activeCategory = 'All';

        function filterDestinations() {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            let visibleCount = 0;

            items.forEach(item => {
                const category = item.getAttribute('data-category');
                const title = item.getAttribute('data-title');
                
                const matchesCategory = (activeCategory === 'All' || category === activeCategory);
                const matchesSearch = (searchTerm === '' || title.includes(searchTerm));

                if (matchesCategory && matchesSearch) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (resultCount) resultCount.textContent = visibleCount;
            if (noResults) {
                if (visibleCount === 0) {
                    noResults.classList.remove('d-none');
                } else {
                    noResults.classList.add('d-none');
                }
            }
        }

        if (categoryFilters) {
            categoryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-chip')) {
                    categoryFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    activeCategory = e.target.getAttribute('data-category');
                    filterDestinations();
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', filterDestinations);
        }
    }

    // ============================================
    // 6. GUIDES PAGE: Filter
    // ============================================
    const guideFilters = document.getElementById('guideFilters');
    const guidesGrid = document.getElementById('guidesGrid');

    if (guideFilters && guidesGrid) {
        const guideItems = guidesGrid.querySelectorAll('.guide-item');

        guideFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-chip')) {
                guideFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                const cat = e.target.getAttribute('data-category');

                guideItems.forEach(item => {
                    const itemCat = item.getAttribute('data-category');
                    if (cat === 'All' || itemCat === cat) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    // ============================================
    // 7. FAVORITES + TOAST NOTIFICATION
    // ============================================
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    function showToast(message, isRemoved = false) {
        const existing = document.querySelector('.travora-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'travora-toast' + (isRemoved ? ' removed' : '');
        toast.innerHTML = `
            <i class="fas ${isRemoved ? 'fa-heart-broken' : 'fa-heart'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    function handleFavoriteClick(btn) {
        const id = btn.getAttribute('data-id');
        if (!id) return;

        fetch('/favorites/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ id: id })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            const navCount = document.getElementById('navFavCount');
            if (navCount) {
                navCount.textContent = data.count;
                if (data.count > 0) {
                    navCount.classList.remove('d-none');
                } else {
                    navCount.classList.add('d-none');
                }
            }

            document.querySelectorAll(`.favorite-btn[data-id="${id}"], .favorite-btn-large[data-id="${id}"]`).forEach(b => {
                const icon = b.querySelector('i');
                if (data.action === 'added') {
                    b.classList.add('active');
                    if (icon) icon.className = 'fas fa-heart';
                } else {
                    b.classList.remove('active');
                    if (icon) icon.className = 'far fa-heart';
                }
            });

            const favText = document.querySelector('.favorite-btn-large .fav-text');
            if (favText) {
                favText.textContent = data.action === 'added' ? 'Saved to Favorites' : 'Add to Favorites';
            }

            if (data.action === 'added') {
                showToast('Added to favorites', false);
            } else {
                showToast('Removed from favorites', true);

                const favPageItem = document.querySelector(`[data-fav-id="${id}"]`);
                if (favPageItem) {
                    favPageItem.style.transition = 'all 0.4s ease';
                    favPageItem.style.opacity = '0';
                    favPageItem.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        favPageItem.remove();
                        
                        const countEl = document.getElementById('favPageCount');
                        if (countEl) {
                            const newCount = document.querySelectorAll('[data-fav-id]').length;
                            countEl.textContent = newCount;
                            
                            if (newCount === 0) {
                                setTimeout(() => window.location.reload(), 300);
                            }
                        }
                    }, 400);
                }
            }
        })
        .catch(err => console.error('Favorite error:', err));
    }

    document.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.favorite-btn, .favorite-btn-large');
        if (favBtn) {
            e.preventDefault();
            e.stopPropagation();
            handleFavoriteClick(favBtn);
        }
    });

    // Clear all favorites
    const clearFavBtn = document.getElementById('clearFavoritesBtn');
    if (clearFavBtn) {
        clearFavBtn.addEventListener('click', () => {
            if (!confirm('Are you sure you want to remove all favorites?')) return;

            fetch('/favorites/clear', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                }
            });
        });
    }

    // ============================================
    // 8. PLANNER PAGE — 4 STEP WIZARD + AI GENERATION
    // ============================================
    const plannerSection = document.getElementById('plannerSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (plannerSection && nextBtn && prevBtn) {
        
        let currentStep = 1;
        const totalSteps = 4;

        const plannerData = {
            destination: '',
            style: '',
            days: 0,
            budget: 2000,
            interests: []
        };

        // ===== NAVIGATION =====
        function updateProgress() {
            document.querySelectorAll('.progress-step').forEach((step, i) => {
                const n = i + 1;
                step.classList.remove('active', 'completed');
                if (n === currentStep) step.classList.add('active');
                else if (n < currentStep) step.classList.add('completed');
            });

            const pct = ((currentStep - 1) / (totalSteps - 1)) * 90;
            if (progressFill) progressFill.style.width = pct + '%';

            prevBtn.disabled = currentStep === 1;
            
            if (currentStep === totalSteps) {
                nextBtn.innerHTML = 'Generate Trip <i class="fas fa-magic ms-2"></i>';
            } else {
                nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right ms-2"></i>';
            }
        }

        function showStep(step) {
            document.querySelectorAll('.planner-step').forEach(s => {
                s.classList.remove('active');
                if (parseInt(s.getAttribute('data-step')) === step) {
                    s.classList.add('active');
                }
            });
            updateProgress();
        }

        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
            } else {
                generateAITrip();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });

        // ===== STEP 1: DESTINATION & STYLE =====
        const destInput = document.getElementById('destinationInput');
        if (destInput) {
            destInput.addEventListener('input', (e) => {
                plannerData.destination = e.target.value.trim();
            });
        }

        document.querySelectorAll('.style-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.style-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                plannerData.style = chip.querySelector('span')?.textContent || '';
            });
        });

        // ===== STEP 2: DATES & DAYS =====
        const startDateEl = document.getElementById('startDate');
        const endDateEl = document.getElementById('endDate');
        
        if (startDateEl && endDateEl) {
            startDateEl.addEventListener('change', () => {
                endDateEl.min = startDateEl.value;
            });
        }

        document.querySelectorAll('.day-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                plannerData.days = parseInt(chip.getAttribute('data-days'));
            });
        });

        // ===== STEP 3: BUDGET =====
        const budgetSlider = document.getElementById('budgetSlider');
        const budgetAmount = document.getElementById('budgetAmount');

        if (budgetSlider && budgetAmount) {
            budgetSlider.addEventListener('input', (e) => {
                plannerData.budget = parseInt(e.target.value);
                budgetAmount.textContent = plannerData.budget.toLocaleString();
            });
        }

        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const val = parseInt(chip.getAttribute('data-budget'));
                plannerData.budget = val;
                if (budgetSlider) budgetSlider.value = val;
                if (budgetAmount) budgetAmount.textContent = val.toLocaleString();
            });
        });

        // ===== STEP 4: INTERESTS =====
        document.querySelectorAll('.interest-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('active');
                const interest = chip.querySelector('span')?.textContent;
                if (!interest) return;
                
                if (chip.classList.contains('active')) {
                    if (!plannerData.interests.includes(interest)) {
                        plannerData.interests.push(interest);
                    }
                } else {
                    plannerData.interests = plannerData.interests.filter(i => i !== interest);
                }
            });
        });

        // ===== AI GENERATION =====
        const loadingMessages = [
            'Analyzing your preferences...',
            'Researching destinations...',
            'Crafting day-by-day itinerary...',
            'Optimizing for your budget...',
            'Adding insider tips...',
            'Finalizing your journey...'
        ];

        function startLoadingAnimation() {
            const loadingText = document.getElementById('loadingText');
            if (!loadingText) return null;
            
            let idx = 0;
            loadingText.textContent = loadingMessages[0];
            
            return setInterval(() => {
                idx = (idx + 1) % loadingMessages.length;
                loadingText.textContent = loadingMessages[idx];
            }, 1200);
        }

        function generateAITrip() {
            const payload = {
                destination: plannerData.destination || 'Anywhere interesting',
                style: plannerData.style || 'Explorer',
                days: plannerData.days || 7,
                budget: plannerData.budget || 2000,
                interests: plannerData.interests.length > 0 ? plannerData.interests : ['General']
            };

            plannerSection.classList.add('d-none');
            resultSection.classList.add('d-none');
            loadingSection.classList.remove('d-none');

            const loadingInterval = startLoadingAnimation();

            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const url = window.travoraRoutes?.plannerGenerate || '/planner/generate';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then(result => {
                clearInterval(loadingInterval);

                setTimeout(() => {
                    loadingSection.classList.add('d-none');
                    renderAIResult(result);
                }, 900);
            })
            .catch(err => {
                clearInterval(loadingInterval);
                console.error('AI error:', err);
                loadingSection.classList.add('d-none');
                plannerSection.classList.remove('d-none');
                alert('Something went wrong. Please try again.');
            });
        }

        function renderAIResult(result) {
            if (!result || !result.success) {
                plannerSection.classList.remove('d-none');
                return;
            }

            resultSection.classList.remove('d-none');

            const aiSource = document.getElementById('aiSource');
            if (aiSource) {
                aiSource.textContent = result.source === 'ai' ? 'OpenAI GPT' : 'Travora AI';
            }

            const s = result.summary || {};
            const setText = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };

            setText('summaryDestination', s.destination || '—');
            setText('summaryDays', (s.days || 0) + ' Days');
            setText('summaryBudget', '$' + (s.budget || 0).toLocaleString());
            setText('summaryStyle', s.style || '—');
            setText('summaryInterests', (s.interests || []).join(', ') || '—');

            const c = result.costs || {};
            setText('costFlights', '$' + (c.flights || 0).toLocaleString());
            setText('costStay', '$' + (c.accommodation || 0).toLocaleString());
            setText('costFood', '$' + (c.food || 0).toLocaleString());
            setText('costActivities', '$' + (c.activities || 0).toLocaleString());
            setText('costTotal', '$' + (c.total || 0).toLocaleString());

            const wrapper = document.getElementById('itineraryWrapper');
            if (!wrapper) return;

            wrapper.innerHTML = '';
            const itinerary = result.itinerary || [];

            itinerary.forEach((day, index) => {
                const el = document.createElement('div');
                el.className = 'itinerary-day';
                el.style.animationDelay = (index * 0.1) + 's';
                
                el.innerHTML = `
                    <div class="itinerary-day-header">
                        <div class="itinerary-day-number">
                            <small>DAY</small>
                            <strong>${String(day.day).padStart(2, '0')}</strong>
                        </div>
                        <h4 class="itinerary-day-title">${day.title || 'Day ' + day.day}</h4>
                    </div>
                    
                    <div class="itinerary-slot">
                        <div class="itinerary-slot-icon"><i class="fas fa-sun"></i></div>
                        <div>
                            <p class="itinerary-slot-label">Morning</p>
                            <p class="itinerary-slot-text">${day.morning || '—'}</p>
                        </div>
                    </div>
                    
                    <div class="itinerary-slot">
                        <div class="itinerary-slot-icon"><i class="fas fa-cloud-sun"></i></div>
                        <div>
                            <p class="itinerary-slot-label">Afternoon</p>
                            <p class="itinerary-slot-text">${day.afternoon || '—'}</p>
                        </div>
                    </div>
                    
                    <div class="itinerary-slot">
                        <div class="itinerary-slot-icon"><i class="fas fa-moon"></i></div>
                        <div>
                            <p class="itinerary-slot-label">Evening</p>
                            <p class="itinerary-slot-text">${day.evening || '—'}</p>
                        </div>
                    </div>
                    
                    ${day.tip ? `
                    <div class="itinerary-tip">
                        <i class="fas fa-lightbulb"></i>
                        <p>${day.tip}</p>
                    </div>
                    ` : ''}
                `;
                
                wrapper.appendChild(el);
            });

            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }

        // Regenerate button
        const regenerateBtn = document.getElementById('regenerateBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                resultSection.classList.add('d-none');
                generateAITrip();
            });
        }

        // Reset planner
        const resetPlannerBtn = document.getElementById('resetPlannerBtn');
        if (resetPlannerBtn) {
            resetPlannerBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        // Init
        updateProgress();
    }

    // ============================================
    // 9. BOOKING: Live Price Calculator
    // ============================================
    const travelersInput = document.getElementById('travelersInput');
    const totalPriceEl = document.getElementById('totalPrice');
    const travelersCountEl = document.getElementById('travelersCount');
    const basePriceEl = document.getElementById('basePrice');

    if (travelersInput && totalPriceEl && basePriceEl) {
        travelersInput.addEventListener('input', () => {
            const basePriceText = basePriceEl.textContent.replace(/[$,]/g, '');
            const basePrice = parseFloat(basePriceText) || 0;
            const travelers = parseInt(travelersInput.value) || 1;
            const total = basePrice * travelers;

            totalPriceEl.textContent = '$' + total.toLocaleString();
            if (travelersCountEl) travelersCountEl.textContent = '× ' + travelers;
        });
    }
 
        // ============================================
    // 10. AI ASSISTANT CHAT
    // ============================================
    const aiChatForm = document.getElementById('aiChatForm');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatMessages = document.getElementById('aiChatMessages');
    const aiTyping = document.getElementById('aiTyping');

    if (aiChatForm && aiChatInput && aiChatMessages) {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        const chatUrl = '/ai-assistant/chat';

        function scrollToBottom() {
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }

        function appendMessage(role, text) {
            const msg = document.createElement('div');
            msg.className = 'ai-message ai-message-' + (role === 'user' ? 'user' : 'bot');

            if (role === 'user') {
                msg.innerHTML = `<div class="ai-message-bubble">${escapeHtml(text)}</div>`;
            } else {
                msg.innerHTML = `
                    <div class="ai-message-avatar"><i class="fas fa-wand-magic-sparkles"></i></div>
                    <div class="ai-message-bubble">${text}</div>
                `;
            }

            aiChatMessages.appendChild(msg);
            scrollToBottom();
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function sendMessage(message) {
            if (!message.trim()) return;

            appendMessage('user', message);
            aiChatInput.value = '';

            // Show typing
            if (aiTyping) aiTyping.classList.remove('d-none');
            scrollToBottom();

            fetch(chatUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message: message })
            })
            .then(res => res.json())
            .then(data => {
                if (aiTyping) aiTyping.classList.add('d-none');

                if (data.success) {
                    // Convert \n to <br> and **bold** to <strong>
                    let formatted = data.response
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

                    appendMessage('bot', formatted);
                } else {
                    appendMessage('bot', 'Sorry, something went wrong. Please try again.');
                }
            })
            .catch(err => {
                console.error('AI error:', err);
                if (aiTyping) aiTyping.classList.add('d-none');
                appendMessage('bot', 'Sorry, I couldn\'t process that. Please try again.');
            });
        }

        // Form submit
        aiChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage(aiChatInput.value);
        });

        // Quick action buttons
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                if (prompt) {
                    sendMessage(prompt);
                }
            });
        });

        // Scroll to bottom on load
        scrollToBottom();
    }
});
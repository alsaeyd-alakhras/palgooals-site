$(document).ready(function () {
    // Initialize direction and language from localStorage or default to LTR/EN
    const storedDir = localStorage.getItem('dir') || 'ltr';
    const storedLang = localStorage.getItem('lang') || 'en';

    $('html').attr('dir', storedDir);
    $('html').attr('lang', storedLang);


    // ========================================
    // Mobile Menu Functionality
    // ========================================
    const mobileMenuToggle = $('#mobile-menu-toggle');
    const mobileMenu = $('#mobile-menu');
    const mobileMenuContainer = $('#mobile-menu-container');
    const menuSpans = mobileMenuToggle.find('span');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;

        if (isMenuOpen) {
            // Show Overlay
            mobileMenu.removeClass('invisible opacity-0').addClass('visible opacity-100');
            mobileMenuContainer.removeClass('ltr:translate-x-full rtl:-translate-x-full').addClass('translate-x-0');

            // Animate Hamburger to X
            menuSpans.eq(0).css('transform', 'translateY(7px) rotate(45deg)');
            menuSpans.eq(1).css('opacity', '0');
            menuSpans.eq(2).css('transform', 'translateY(-7px) rotate(-45deg)');

            $('body').addClass('overflow-hidden');
        } else {
            // Hide Overlay
            mobileMenu.removeClass('visible opacity-100').addClass('invisible opacity-0');
            mobileMenuContainer.addClass($('html').attr('dir') === 'rtl' ? '-translate-x-full' : 'ltr:translate-x-full');

            // Animate X to Hamburger
            menuSpans.eq(0).css('transform', 'none');
            menuSpans.eq(1).css('opacity', '1');
            menuSpans.eq(2).css('transform', 'none');

            $('body').removeClass('overflow-hidden');
        }
    }

    mobileMenuToggle.on('click', toggleMenu);

    // Close on overlay click
    mobileMenu.on('click', function (e) {
        if (e.target === this) toggleMenu();
    });

    // Close on link click
    mobileMenuContainer.find('a').on('click', function () {
        toggleMenu();
    });

    // Language Toggle Click Handler
    $('#lang-toggle').on('click', function () {
        const currentDir = $('html').attr('dir');

        // Toggle direction
        const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
        const newLang = newDir === 'rtl' ? 'ar' : 'en';

        // Update HTML attributes
        $('html').attr('dir', newDir);
        $('html').attr('lang', newLang);

        // Save to localStorage
        localStorage.setItem('dir', newDir);
        localStorage.setItem('lang', newLang);

        // Optional: Reload if needed for deep structure changes, but CSS should handle it
        // location.reload(); 
    });

    // ========================================
    // Dynamic Slider Functionality
    // ========================================

    function initSliderTemplates(selector) {
        const slider = $(selector);
        if (slider.length === 0) return;

        const indicatorsContainer = slider.closest('section').find('.flex.justify-center.gap-2');

        let isScrolling;
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;
        let lastX;
        let lastTime;
        let velocity = 0;

        slider.css('scroll-behavior', 'smooth');

        function initializeSlider() {
            const cards = slider.find('.snap-center');
            const cardCount = cards.length;

            indicatorsContainer.empty();
            for (let i = 0; i < cardCount; i++) {
                const indicator = $('<div></div>')
                    .addClass('indicator-dot h-1 rounded-full transition-all duration-300 cursor-pointer')
                    .addClass(i === 0 ? 'w-32 bg-purple-brand' : 'w-12 bg-gray-300')
                    .attr('data-index', i);
                indicatorsContainer.append(indicator);
            }
            bindIndicatorClicks();
        }

        function getCardWidthWithGap() {
            const cards = slider.find('.snap-center');
            const cardCount = cards.length;

            if (cardCount === 0) return 0;
            if (cardCount === 1) return cards.first().outerWidth(true);

            const sliderLeft = slider.offset().left;
            const scrollLeftVal = slider.scrollLeft();
            const firstCard = cards.eq(0);
            const secondCard = cards.eq(1);
            const firstCardPos = firstCard.offset().left - sliderLeft + scrollLeftVal;
            const secondCardPos = secondCard.offset().left - sliderLeft + scrollLeftVal;

            return secondCardPos - firstCardPos;
        }

        function updateActiveIndicator() {
            const currentScrollLeft = slider.scrollLeft();
            const indicators = indicatorsContainer.find('.indicator-dot');
            const cards = slider.find('.snap-center');

            if (cards.length === 0) return;

            const maxScroll = slider[0].scrollWidth - slider.outerWidth();
            const isAtEnd = currentScrollLeft >= maxScroll - 10;

            if (isAtEnd) {
                indicators.each(function (index) {
                    if (index === cards.length - 1) {
                        $(this).removeClass('w-12 bg-gray-300').addClass('w-32 bg-purple-brand');
                    } else {
                        $(this).removeClass('w-32 bg-purple-brand').addClass('w-12 bg-gray-300');
                    }
                });
                return;
            }

            const sliderLeft = slider.offset().left;
            let closestIndex = 0;
            let minDistance = Infinity;

            cards.each(function (index) {
                const card = $(this);
                const cardLeft = card.offset().left - sliderLeft + currentScrollLeft;
                const distance = Math.abs(cardLeft - currentScrollLeft);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            indicators.each(function (index) {
                if (index === closestIndex) {
                    $(this).removeClass('w-12 bg-gray-300').addClass('w-32 bg-purple-brand');
                } else {
                    $(this).removeClass('w-32 bg-purple-brand').addClass('w-12 bg-gray-300');
                }
            });
        }

        function bindIndicatorClicks() {
            const indicators = indicatorsContainer.find('.indicator-dot');

            indicators.off('click').on('click', function () {
                const index = parseInt($(this).attr('data-index'));
                const cards = slider.find('.snap-center');
                if (index >= cards.length) return;

                const targetCard = cards.eq(index);
                const sliderLeft = slider.offset().left;
                const currentScrollLeft = slider.scrollLeft();
                let cardLeft = targetCard.offset().left - sliderLeft + currentScrollLeft;
                const maxScroll = slider[0].scrollWidth - slider.outerWidth();

                if (index === cards.length - 1) {
                    cardLeft = Math.min(cardLeft, maxScroll);
                }

                slider.css('scroll-behavior', 'smooth');
                slider[0].scrollTo({ left: cardLeft, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            });
        }

        slider.on('scroll', function () {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                updateActiveIndicator();
            }, 100);
        });

        slider.on('mousedown', function (e) {
            isDown = true;
            hasDragged = false;
            slider.addClass('cursor-grabbing');
            slider.css('scroll-behavior', 'auto');
            slider.css('scroll-snap-type', 'none');
            
            startX = e.pageX - slider.offset().left;
            scrollLeft = slider.scrollLeft();
            lastX = e.pageX;
            lastTime = Date.now();
            velocity = 0;
        });

        slider.on('mouseleave', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
            slider.css('scroll-behavior', 'smooth');
        });

        slider.on('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
            slider.css('scroll-behavior', 'smooth');

            if (hasDragged && Math.abs(velocity) > 0.5) {
                const cardWidthWithGap = getCardWidthWithGap();
                const currentScroll = slider.scrollLeft();
                const momentumScroll = currentScroll - (velocity * 200);
                const nearestIndex = Math.round(momentumScroll / cardWidthWithGap);
                const targetScroll = Math.max(0, Math.min(nearestIndex * cardWidthWithGap, slider[0].scrollWidth - slider.outerWidth()));

                slider[0].scrollTo({ left: targetScroll, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            } else if (hasDragged) {
                const cardWidthWithGap = getCardWidthWithGap();
                const currentScroll = slider.scrollLeft();
                const nearestIndex = Math.round(currentScroll / cardWidthWithGap);
                const targetScroll = nearestIndex * cardWidthWithGap;

                slider[0].scrollTo({ left: targetScroll, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            }
        });

        slider.on('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            hasDragged = true;

            const now = Date.now();
            const dt = now - lastTime;
            const dx = e.pageX - lastX;
            
            if (dt > 0) {
                velocity = dx / dt;
            }
            
            lastX = e.pageX;
            lastTime = now;

            const x = e.pageX - slider.offset().left;
            const walk = (x - startX) * 1.5;
            slider.scrollLeft(scrollLeft - walk);
        });

        slider.addClass('cursor-grab');

        initializeSlider();
        updateActiveIndicator();

        $(window).on('resize', function () {
            updateActiveIndicator();
        });
    }


    // Initialize Sliders

    function initSliderOurWork(selector, indicatorSelector) {
        const slider = $(selector);
        if (slider.length === 0) return;

        const indicatorsContainer = indicatorSelector ? $(indicatorSelector) : slider.closest('section').find('.flex.justify-center.gap-2');

        let isScrolling;
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;
        let lastX;
        let lastTime;
        let velocity = 0;

        slider.css('scroll-behavior', 'smooth');

        function initializeSlider() {
            const cards = slider.children();
            const cardCount = cards.length;

            indicatorsContainer.empty();
            for (let i = 0; i < cardCount; i++) {
                const indicator = $('<div></div>')
                    .addClass('indicator-dot h-2 rounded-full transition-all duration-300 cursor-pointer')
                    .addClass(i === 0 ? 'w-32 bg-purple-brand' : 'w-12 bg-gray-300')
                    .attr('data-index', i);
                indicatorsContainer.append(indicator);
            }
            bindIndicatorClicks();
        }

        function updateActiveIndicator() {
            const currentScrollLeft = slider.scrollLeft();
            const indicators = indicatorsContainer.find('.indicator-dot');
            const cards = slider.children();

            if (cards.length === 0) return;

            const maxScroll = slider[0].scrollWidth - slider.outerWidth();
            const isAtEnd = currentScrollLeft >= maxScroll - 10;

            if (isAtEnd) {
                indicators.each(function (index) {
                    if (index === cards.length - 1) {
                        $(this).removeClass('w-12 bg-gray-300').addClass('w-32 bg-purple-brand');
                    } else {
                        $(this).removeClass('w-32 bg-purple-brand').addClass('w-12 bg-gray-300');
                    }
                });
                return;
            }

            const sliderLeft = slider.offset().left;
            let closestIndex = 0;
            let minDistance = Infinity;

            cards.each(function (index) {
                const card = $(this);
                const cardLeft = card.offset().left - sliderLeft + currentScrollLeft;
                const distance = Math.abs(cardLeft - currentScrollLeft);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            indicators.each(function (index) {
                if (index === closestIndex) {
                    $(this).removeClass('w-12 bg-gray-300').addClass('w-32 bg-purple-brand');
                } else {
                    $(this).removeClass('w-32 bg-purple-brand').addClass('w-12 bg-gray-300');
                }
            });
        }

        function bindIndicatorClicks() {
            const indicators = indicatorsContainer.find('.indicator-dot');

            indicators.off('click').on('click', function () {
                const index = parseInt($(this).attr('data-index'));
                const cards = slider.children();
                if (index >= cards.length) return;

                const targetCard = cards.eq(index);
                const sliderLeft = slider.offset().left;
                const currentScrollLeft = slider.scrollLeft();
                let cardLeft = targetCard.offset().left - sliderLeft + currentScrollLeft;
                const maxScroll = slider[0].scrollWidth - slider.outerWidth();

                if (index === cards.length - 1) {
                    cardLeft = Math.min(cardLeft, maxScroll);
                }

                slider.css('scroll-behavior', 'smooth');
                slider[0].scrollTo({ left: cardLeft, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            });
        }

        slider.on('scroll', function () {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                updateActiveIndicator();
            }, 100);
        });

        slider.on('mousedown', function (e) {
            isDown = true;
            hasDragged = false;
            slider.addClass('cursor-grabbing');
            slider.css('scroll-behavior', 'auto');
            slider.css('scroll-snap-type', 'none');

            startX = e.pageX;
            scrollLeft = slider.scrollLeft();
            lastX = e.pageX;
            lastTime = Date.now();
            velocity = 0;
        });

        slider.on('mouseleave', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
            slider.css('scroll-behavior', 'smooth');
        });

        slider.on('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
            slider.css('scroll-behavior', 'smooth');

            if (hasDragged && Math.abs(velocity) > 0.5) {
                const currentScroll = slider.scrollLeft();
                const momentumDistance = velocity * 300;
                const targetScroll = Math.max(0, Math.min(
                    currentScroll - momentumDistance,
                    slider[0].scrollWidth - slider.outerWidth()
                ));

                slider[0].scrollTo({ left: targetScroll, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            }
        });

        slider.on('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            hasDragged = true;

            const now = Date.now();
            const dt = now - lastTime;
            const dx = e.pageX - lastX;
            
            if (dt > 0) {
                velocity = dx / dt;
            }
            
            lastX = e.pageX;
            lastTime = now;

            const x = e.pageX;
            const walk = (x - startX) * 1.5;
            slider.scrollLeft(scrollLeft - walk);
        });

        slider.addClass('cursor-grab');

        initializeSlider();
        updateActiveIndicator();
        $(window).on('resize', function () {
            updateActiveIndicator();
        });
    }

    // Initialize Sliders
    initSliderTemplates('#templates-slider');
    initSliderOurWork('#our-work-slider', '#our-work-indicators');

    // ========================================
    // Reviews Slider Functionality (Independent)
    // ========================================

    function initSliderReviews(selector, indicatorSelector) {
        const slider = $(selector);
        if (slider.length === 0) return;

        const indicatorsContainer = $(indicatorSelector);
        let isScrolling;
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;
        let lastX;
        let lastTime;
        let velocity = 0;

        slider.css('scroll-behavior', 'smooth');

        function initializeSlider() {
            const cards = slider.children();
            indicatorsContainer.empty();
            cards.each(function (i) {
                const indicator = $('<div></div>')
                    .addClass('indicator-dot h-2 rounded-full transition-all duration-300 cursor-pointer')
                    .addClass(i === 0 ? 'w-32 bg-purple-brand' : 'w-12 bg-gray-300')
                    .attr('data-index', i);
                indicatorsContainer.append(indicator);
            });
            bindIndicatorClicks();
            slider.scrollLeft(0);
        }

        function updateActiveIndicator() {
            const indicators = indicatorsContainer.find('.indicator-dot');
            const cards = slider.children();
            if (cards.length === 0) return;

            const currentScrollLeft = slider.scrollLeft();
            const maxScroll = slider[0].scrollWidth - slider.outerWidth();
            const isAtEnd = currentScrollLeft >= maxScroll - 10;

            if (isAtEnd) {
                indicators.each(function (index) {
                    if (index === cards.length - 1) {
                        $(this).removeClass('w-12 bg-gray-300').addClass('w-32 bg-purple-brand');
                    } else {
                        $(this).removeClass('w-32 bg-purple-brand').addClass('w-12 bg-gray-300');
                    }
                });
                return;
            }

            let closestIndex = 0;
            let minDistance = Infinity;

            cards.each(function (index) {
                const card = $(this);
                const cardOffsetLeft = card[0].offsetLeft;
                const distance = Math.abs(cardOffsetLeft - currentScrollLeft);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            indicators.each(function (index) {
                if (index === closestIndex) {
                    $(this).removeClass('w-12 bg-gray-300').addClass('w-32 bg-purple-brand');
                } else {
                    $(this).removeClass('w-32 bg-purple-brand').addClass('w-12 bg-gray-300');
                }
            });
        }

        function bindIndicatorClicks() {
            indicatorsContainer.find('.indicator-dot').on('click', function () {
                const index = parseInt($(this).attr('data-index'));
                const cards = slider.children();
                const targetCard = cards.eq(index);
                let targetScroll = targetCard[0].offsetLeft;

                const maxScroll = slider[0].scrollWidth - slider.outerWidth();
                if (index === cards.length - 1) {
                    targetScroll = maxScroll;
                }

                slider.css('scroll-behavior', 'smooth');
                slider[0].scrollTo({ left: targetScroll, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            });
        }

        slider.on('scroll', function () {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                updateActiveIndicator();
            }, 100);
        });

        slider.on('mousedown', function (e) {
            isDown = true;
            hasDragged = false;
            slider.addClass('cursor-grabbing');
            slider.css('scroll-behavior', 'auto');
            slider.css('scroll-snap-type', 'none');
            
            startX = e.pageX;
            scrollLeft = slider.scrollLeft();
            lastX = e.pageX;
            lastTime = Date.now();
            velocity = 0;
        });

        $(window).on('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
            slider.css('scroll-behavior', 'smooth');

            if (hasDragged && Math.abs(velocity) > 0.5) {
                const currentScroll = slider.scrollLeft();
                const momentumDistance = velocity * 300;
                const targetScroll = Math.max(0, Math.min(
                    currentScroll - momentumDistance,
                    slider[0].scrollWidth - slider.outerWidth()
                ));

                slider[0].scrollTo({ left: targetScroll, behavior: 'smooth' });
                setTimeout(updateActiveIndicator, 600);
            }
        });

        slider.on('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            hasDragged = true;

            const now = Date.now();
            const dt = now - lastTime;
            const dx = e.pageX - lastX;
            
            if (dt > 0) {
                velocity = dx / dt;
            }
            
            lastX = e.pageX;
            lastTime = now;

            const x = e.pageX;
            const walk = (x - startX) * 1.5;
            slider.scrollLeft(scrollLeft - walk);
        });

        slider.addClass('cursor-grab');

        initializeSlider();
        updateActiveIndicator();
        
        $(window).on('resize', function () {
            updateActiveIndicator();
        });
    }

    // Initialize Reviews Slider
    setTimeout(function() {
        initSliderReviews('#reviews-slider', '#reviews-indicators');
    }, 100);


    // ========================================
    // Tech Stack Drag-to-Scroll Functionality
    // ========================================

    const techSlider = $('#tech-stack-container');
    if (techSlider.length > 0) {
        let isDown = false;
        let startX;
        let scrollLeft;

        techSlider.on('mousedown', (e) => {
            isDown = true;
            techSlider.addClass('cursor-grabbing').removeClass('cursor-grab');
            startX = e.pageX - techSlider.offset().left;
            scrollLeft = techSlider.scrollLeft();
        });

        techSlider.on('mouseleave', () => {
            isDown = false;
            techSlider.removeClass('cursor-grabbing').addClass('cursor-grab');
        });

        techSlider.on('mouseup', () => {
            isDown = false;
            techSlider.removeClass('cursor-grabbing').addClass('cursor-grab');
        });

        techSlider.on('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - techSlider.offset().left;
            const walk = (x - startX) * 2; // Scroll speed
            techSlider.scrollLeft(scrollLeft - walk);
        });
    }


    // ========================================
    // Pricing Plans Category Filter
    // ========================================

    const categoryTabs = $('.category-tab');
    const pricingCards = $('.pricing-card');
    const tabIndicator = $('#tab-indicator');
    let activeCategory = 'shared'; // Track active category

    // Function to move the indicator to the active tab
    function moveIndicator(tab) {
        const tabOffset = tab.position().left;
        const tabWidth = tab.outerWidth();
        
        tabIndicator.css({
            'left': tabOffset + 'px',
            'width': tabWidth + 'px'
        });
    }

    // Function to filter pricing cards by category
    function filterPricingCards(category) {
        activeCategory = category;

        // 1. STOP any running animations immediately to prevent queue buildup (Fixes the lag)
        pricingCards.stop(true, true);

        // 2. Fade out visible cards
        const visibleCards = pricingCards.filter(':visible');

        if (visibleCards.length > 0) {
            // Use .promise().done() to run this logic ONCE after all elements fade out
            visibleCards.fadeOut(200).promise().done(function () {
                // Hide all cards explicitly to ensure clean slate
                pricingCards.hide();

                // Select and Fade In only the requested category
                const targetCards = pricingCards.filter(`[data-category="${category}"]`);
                targetCards.fadeIn(300);
            });
        } else {
            // If nothing is visible (first load or fast switch), just show target
            pricingCards.hide();
            pricingCards.filter(`[data-category="${category}"]`).fadeIn(300);
        }
    }

    function updateActiveTab(clickedTab) {
        categoryTabs.each(function() {
            const tab = $(this);
            if (tab.is(clickedTab)) {
                tab.removeClass('text-gray-400 border-transparent font-bold')
                   .addClass('text-purple-brand border-purple-brand font-bold');
            } else {
                tab.removeClass('text-purple-brand border-purple-brand font-bold')
                   .addClass('text-gray-400 border-transparent');
            }
        });

        moveIndicator(clickedTab);
    }

    // Bind click events to category tabs
    categoryTabs.on('click', function () {
        const clickedTab = $(this);
        const selectedCategory = clickedTab.attr('data-category');

        // Don't do anything if clicking the already active tab (Optimizes performance)
        if (clickedTab.hasClass('text-purple-brand')) return;

        // Update active tab styling
        updateActiveTab(clickedTab);

        // Filter cards by selected category
        filterPricingCards(selectedCategory);
    });

    let hoverTimeout;
    
    categoryTabs.on('mouseenter', function () {
        const hoveredTab = $(this);
        clearTimeout(hoverTimeout);
        
        if (!hoveredTab.hasClass('text-purple-brand')) {
            const tabOffset = hoveredTab.position().left;
            const tabWidth = hoveredTab.outerWidth();
            
            tabIndicator.css({
                'left': tabOffset + 'px',
                'width': tabWidth + 'px',
                'opacity': '0.5'
            });
        }
    });

    categoryTabs.on('mouseleave', function () {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(function() {
            const activeTab = categoryTabs.filter('.text-purple-brand');
            if (activeTab.length > 0) {
                tabIndicator.css('opacity', '1');
                moveIndicator(activeTab);
            }
        }, 150);
    });

    // Initialize with 'shared' category visible on page load
    pricingCards.hide();
    filterPricingCards('shared');
    
    // Set initial indicator position
    const initialTab = categoryTabs.filter('[data-category="shared"]');
    moveIndicator(initialTab);
});

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

        // Find indicators container within the same section
        // Uses the specific classes existing in the DOM structure
        const indicatorsContainer = slider.closest('section').find('.flex.justify-center.gap-2');

        let isScrolling;
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;

        // Initialize slider dynamically
        function initializeSlider() {
            const cards = slider.find('.snap-center');
            const cardCount = cards.length;

            // Generate indicators dynamically based on card count
            indicatorsContainer.empty();
            for (let i = 0; i < cardCount; i++) {
                const indicator = $('<div></div>')
                    .addClass('indicator-dot h-1 rounded-full transition-all duration-300 cursor-pointer')
                    .addClass(i === 0 ? 'w-32 bg-purple-brand' : 'w-12 bg-gray-300')
                    .attr('data-index', i);
                indicatorsContainer.append(indicator);
            }

            // Re-bind click events to new indicators
            bindIndicatorClicks();
        }

        // Function to get width of ONE card including gap
        function getCardWidthWithGap() {
            const cards = slider.find('.snap-center');
            const cardCount = cards.length;

            if (cardCount === 0) {
                return 0;
            }

            if (cardCount === 1) {
                return cards.first().outerWidth(true);
            }

            // Calculate distance between first and second card
            const sliderLeft = slider.offset().left;
            const scrollLeftVal = slider.scrollLeft();

            const firstCard = cards.eq(0);
            const secondCard = cards.eq(1);

            const firstCardPos = firstCard.offset().left - sliderLeft + scrollLeftVal;
            const secondCardPos = secondCard.offset().left - sliderLeft + scrollLeftVal;

            return secondCardPos - firstCardPos;
        }

        // Function to update active indicator based on scroll position
        function updateActiveIndicator() {
            const currentScrollLeft = slider.scrollLeft();
            const indicators = indicatorsContainer.find('.indicator-dot');
            const cards = slider.find('.snap-center');

            if (cards.length === 0) return;

            // Check if we're at the end of scroll
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

        // Bind click events to indicators
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

                slider.animate({
                    scrollLeft: cardLeft
                }, 500, 'swing', function () {
                    updateActiveIndicator();
                });
            });
        }

        // Listen to scroll events
        slider.on('scroll', function () {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                updateActiveIndicator();
            }, 100);
        });

        // Mouse Drag Functionality
        slider.on('mousedown', function (e) {
            isDown = true;
            hasDragged = false;
            slider.addClass('cursor-grabbing');
            startX = e.pageX - slider.offset().left;
            scrollLeft = slider.scrollLeft();
        });

        slider.on('mouseleave', function () {
            isDown = false;
            slider.removeClass('cursor-grabbing');
        });

        slider.on('mouseup', function () {
            isDown = false;
            slider.removeClass('cursor-grabbing');

            if (hasDragged) {
                const cardWidthWithGap = getCardWidthWithGap();
                const currentScroll = slider.scrollLeft();
                const nearestIndex = Math.round(currentScroll / cardWidthWithGap);
                const targetScroll = nearestIndex * cardWidthWithGap;

                slider.animate({
                    scrollLeft: targetScroll
                }, 300, 'swing', function () {
                    updateActiveIndicator();
                });
            }
        });

        slider.on('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            hasDragged = true;

            const x = e.pageX - slider.offset().left;
            const walk = (x - startX) * 1.5;
            slider.scrollLeft(scrollLeft - walk);
        });

        slider.addClass('cursor-grab');

        // Initial setup
        initializeSlider();
        updateActiveIndicator();

        // Handle window resize
        $(window).on('resize', function () {
            updateActiveIndicator();
        });
    }


    // Initialize Sliders

    function initSliderOurWork(selector, indicatorSelector) {
        const slider = $(selector);
        if (slider.length === 0) return;

        // Use provided ID or fallback
        const indicatorsContainer = indicatorSelector ? $(indicatorSelector) : slider.closest('section').find('.flex.justify-center.gap-2');

        let isScrolling;
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;

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
            const cards = slider.children(); // Robust selector

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
                const cards = slider.children(); // Robust selector
                if (index >= cards.length) return;

                const targetCard = cards.eq(index);
                const sliderLeft = slider.offset().left;
                const currentScrollLeft = slider.scrollLeft();

                let cardLeft = targetCard.offset().left - sliderLeft + currentScrollLeft;
                const maxScroll = slider[0].scrollWidth - slider.outerWidth();

                if (index === cards.length - 1) {
                    cardLeft = Math.min(cardLeft, maxScroll);
                }

                slider.animate({ scrollLeft: cardLeft }, 500, 'swing', function () {
                    updateActiveIndicator();
                });
            });
        }

        slider.on('scroll', function () {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                updateActiveIndicator();
            }, 100);
        });

        // OPTIMIZED MOUSE DRAG
        slider.on('mousedown', function (e) {
            isDown = true;
            hasDragged = false;
            slider.addClass('cursor-grabbing');

            // Disable scroll snap while dragging to prevent fighting
            slider.css('scroll-snap-type', 'none');

            startX = e.pageX; // Absolute coordinates
            scrollLeft = slider.scrollLeft();
        });

        slider.on('mouseleave', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
        });

        slider.on('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');

            // Re-enable snap immediately
            slider.css('scroll-snap-type', '');
        });

        slider.on('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            hasDragged = true;

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
        }

        function updateActiveIndicator() {
            const indicators = indicatorsContainer.find('.indicator-dot');
            const cards = slider.children();
            if (cards.length === 0) return;

            const sliderWidth = slider.outerWidth();
            const sliderCenter = slider.offset().left + (sliderWidth / 2);

            let closestIndex = 0;
            let minDistance = Infinity;

            cards.each(function (index) {
                const card = $(this);
                const cardCenter = card.offset().left + (card.outerWidth() / 2);
                const distance = Math.abs(cardCenter - sliderCenter);

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
                const targetCard = slider.children().eq(index);
                const sliderWidth = slider.outerWidth();
                const cardWidth = targetCard.outerWidth();

                // Calculate scroll position to center the card
                // offsetLeft is relative to the scroll container
                const targetScroll = targetCard[0].offsetLeft - (sliderWidth / 2) + (cardWidth / 2);

                slider.animate({
                    scrollLeft: targetScroll
                }, 500, 'swing', function () {
                    updateActiveIndicator();
                });
            });
        }

        slider.on('scroll', function () {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(function () {
                updateActiveIndicator();
            }, 100);
        });

        // Mouse Drag
        slider.on('mousedown', function (e) {
            isDown = true;
            slider.addClass('cursor-grabbing');
            slider.css('scroll-snap-type', 'none');
            startX = e.pageX;
            scrollLeft = slider.scrollLeft();
        });

        $(window).on('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            slider.removeClass('cursor-grabbing');
            slider.css('scroll-snap-type', '');
        });

        slider.on('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX;
            const walk = (x - startX) * 1.5;
            slider.scrollLeft(scrollLeft - walk);
        });

        initializeSlider();
        updateActiveIndicator();

        $(window).on('resize', function () {
            updateActiveIndicator();
        });
    }

    // Initialize Reviews Slider
    initSliderReviews('#reviews-slider', '#reviews-indicators');


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

    // Function to update active tab styling
    function updateActiveTab(clickedTab) {
        // Remove active state from all tabs
        categoryTabs.removeClass('text-purple-brand');
        categoryTabs.addClass('text-gray-400');

        // Add active state to clicked tab
        clickedTab.removeClass('text-gray-400');
        clickedTab.addClass('text-purple-brand');

        // Move the indicator to the active tab
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

    // Add hover effect - preview indicator on hover (only for non-active tabs)
    categoryTabs.on('mouseenter', function () {
        const hoveredTab = $(this);
        
        // Only show preview if it's not the active tab
        if (!hoveredTab.hasClass('text-purple-brand')) {
            const tabOffset = hoveredTab.position().left;
            const tabWidth = hoveredTab.outerWidth();
            
            // Temporarily move indicator to hovered tab with faster animation
            tabIndicator.css({
                'left': tabOffset + 'px',
                'width': tabWidth + 'px',
                'opacity': '0.5'
            });
        }
    });

    // Return indicator to active tab when mouse leaves
    categoryTabs.on('mouseleave', function () {
        const activeTab = categoryTabs.filter('.text-purple-brand');
        
        // Return indicator to active tab
        tabIndicator.css('opacity', '1');
        moveIndicator(activeTab);
    });

    // Initialize with 'shared' category visible on page load
    pricingCards.hide();
    filterPricingCards('shared');
    
    // Set initial indicator position
    const initialTab = categoryTabs.filter('[data-category="shared"]');
    moveIndicator(initialTab);
});

/* ============================================================
   MONEY EXPENSE TRACKER — Main JavaScript
   Particles · Counter Animations · Chart.js · Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCounterAnimations();
    initCharts();
    initFlashDismiss();
});

/* ============================================================
   FLOATING PARTICLES (Canvas)
   ============================================================ */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 50;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.5 ? 186 : 263; // cyan or purple
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================================
   COUNTER ANIMATIONS
   ============================================================ */
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        el.textContent = prefix + formatCurrency(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = prefix + formatCurrency(target);
        }
    }

    requestAnimationFrame(update);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/* ============================================================
   CHART.JS — Category Doughnut & Monthly Trend
   ============================================================ */
function initCharts() {
    const chartDataUrl = document.getElementById('chart-data-url');
    if (!chartDataUrl) return;

    fetch(chartDataUrl.value)
        .then(res => res.json())
        .then(data => {
            renderCategoryChart(data.categories);
            renderMonthlyChart(data.monthly);
        })
        .catch(err => console.warn('Chart data fetch failed:', err));
}

function renderCategoryChart(data) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    if (!data.labels.length) {
        canvas.parentElement.innerHTML = `
            <div class="chart-empty">
                <span class="empty-icon">📊</span>
                <span>No expense data yet</span>
            </div>`;
        return;
    }

    const colors = [
        '#8b5cf6', '#06b6d4', '#ec4899', '#f97316',
        '#10b981', '#eab308', '#3b82f6', '#ef4444',
        '#14b8a6', '#a855f7', '#f43f5e', '#22c55e',
    ];

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: colors.slice(0, data.labels.length),
                borderColor: 'rgba(10, 14, 26, 0.8)',
                borderWidth: 3,
                hoverBorderWidth: 0,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: "'Inter', sans-serif", size: 12 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 8,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')} (${pct}%)`;
                        },
                    },
                },
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart',
            },
        },
    });
}

function renderMonthlyChart(data) {
    const canvas = document.getElementById('monthlyChart');
    if (!canvas) return;

    if (!data.labels.length) {
        canvas.parentElement.innerHTML = `
            <div class="chart-empty">
                <span class="empty-icon">📈</span>
                <span>No trend data yet</span>
            </div>`;
        return;
    }

    const monthLabels = data.labels.map(m => {
        const [y, mo] = m.split('-');
        return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
    });

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Income',
                    data: data.income,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#0a0e1a',
                    pointBorderWidth: 2,
                    borderWidth: 2.5,
                },
                {
                    label: 'Expenses',
                    data: data.expense,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#0a0e1a',
                    pointBorderWidth: 2,
                    borderWidth: 2.5,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 11 } },
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 },
                        callback: v => '₹' + v.toLocaleString('en-IN'),
                    },
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8',
                        font: { family: "'Inter', sans-serif", size: 12 },
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        padding: 16,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
                    },
                },
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
            },
        },
    });
}

/* ============================================================
   FLASH MESSAGE AUTO-DISMISS
   ============================================================ */
function initFlashDismiss() {
    document.querySelectorAll('.flash').forEach(el => {
        setTimeout(() => {
            el.style.transition = 'all 0.4s ease-out';
            el.style.opacity = '0';
            el.style.transform = 'translateX(30px)';
            setTimeout(() => el.remove(), 400);
        }, 4000);
    });
}

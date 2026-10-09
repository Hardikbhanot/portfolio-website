// --- CONFIGURATION ---
const GITHUB_USERNAME = 'hardikbhanot'; // Change this to your actual GitHub username
const TERMINAL_USER = 'guest';
const TERMINAL_HOST = 'portfolio';
const EMAIL_ADDRESS = 'hardik.bhanot1@gmail.com';
// ---------------------

// DOM Elements - Toggle
const modeToggleBtn = document.getElementById('mode-toggle');
const guiReturnBtn = document.getElementById('gui-return-btn');
const toggleText = document.getElementById('toggle-text');
const normalView = document.getElementById('normal-view');
const terminalView = document.getElementById('terminal-view');
const githubLink = document.getElementById('github-link');
const projectsGrid = document.getElementById('projects-grid');
const copyEmailBtn = document.getElementById('copy-email-btn');
const copyTooltip = document.getElementById('copy-tooltip');

// DOM Elements - Terminal
const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const promptSpan = document.getElementById('prompt');
const terminalContainer = document.getElementById('terminal-container');
const cmdPills = document.querySelectorAll('.cmd-pill');

let isGeekMode = false;
let githubProjectsCache = null;

// Initialize
if(githubLink) githubLink.href = `https://github.com/${GITHUB_USERNAME}`;
promptSpan.textContent = `${TERMINAL_USER}@${TERMINAL_HOST}:~$`;
fetchGitHubProjects();

// Intersection Observer for Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(section => {
    observer.observe(section);
});

// Scroll Spy for Navbar
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('header, section, footer');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Copy Email Logic
if (copyEmailBtn) {
    const iconEl = copyEmailBtn.querySelector('i');
    const textEl = copyEmailBtn.querySelector('span');
    const originalIcon = iconEl.className;
    const originalText = textEl.textContent;
    
    copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(EMAIL_ADDRESS).then(() => {
            iconEl.className = 'fas fa-check-circle';
            iconEl.style.color = 'var(--c-green)';
            textEl.textContent = 'Copied to clipboard!';
            copyEmailBtn.style.borderColor = 'var(--c-green)';
            
            setTimeout(() => {
                iconEl.className = originalIcon;
                iconEl.style.color = '';
                textEl.textContent = originalText;
                copyEmailBtn.style.borderColor = '';
            }, 2000);
        });
    });
}

// Toggle Logic
function switchToTerminal() {
    isGeekMode = true;
    document.body.classList.add('terminal-mode-active');
    normalView.classList.remove('active');
    normalView.classList.add('hidden');
    terminalView.classList.remove('hidden');
    terminalView.classList.add('active');
    
    if (outputDiv.innerHTML === '') {
        printLine(banner);
    }
    setTimeout(() => commandInput.focus(), 100);
}

function switchToGUI() {
    isGeekMode = false;
    document.body.classList.remove('terminal-mode-active');
    terminalView.classList.remove('active');
    terminalView.classList.add('hidden');
    normalView.classList.remove('hidden');
    normalView.classList.add('active');
}

modeToggleBtn.addEventListener('click', switchToTerminal);
guiReturnBtn.addEventListener('click', switchToGUI);

// Fetch GitHub Projects
async function fetchGitHubProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
        if (!response.ok) throw new Error('Network response was not ok');
        const repos = await response.json();
        
        githubProjectsCache = repos;
        renderNormalProjects(repos);
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        projectsGrid.innerHTML = `<p style="color:red; grid-column: 1 / -1; text-align: center; font-family: 'Space Mono', monospace;">Failed to load projects. Please check the GITHUB_USERNAME configuration.</p>`;
    }
}

// Render Projects in Normal View (Creative Dev Bento Style)
function renderNormalProjects(repos) {
    if (repos.length === 0) {
        projectsGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; font-family: 'Space Mono', monospace;">No public repositories found.</p>`;
        return;
    }

    projectsGrid.innerHTML = '';
    repos.forEach((repo, index) => {
        const card = document.createElement('div');
        card.className = 'bento-card animate-on-scroll'; 
        card.style.transitionDelay = `${index * 0.1}s`; 
        
        card.innerHTML = `
            <div class="project-content">
                <h3>${repo.name} ${repo.language ? `<span class="lang-badge">${repo.language}</span>` : ''}</h3>
                <p>${repo.description || 'No description provided.'}</p>
                <div class="card-links">
                    <a href="${repo.html_url}" target="_blank"><i class="fab fa-github"></i> Source Code</a>
                    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                </div>
            </div>
        `;
        projectsGrid.appendChild(card);
        observer.observe(card);
    });
}


// --- TERMINAL LOGIC ---

const banner = `
  _   _      _ _        __        __         _     _ 
 | | | | ___| | | ___   \\ \\      / /__  _ __| | __| |
 | |_| |/ _ \\ | |/ _ \\   \\ \\ /\\ / / _ \\| '__| |/ _\` |
 |  _  |  __/ | | (_) |   \\ V  V / (_) | |  | | (_| |
 |_| |_|\\___|_|_|\\___/     \\_/\\_/ \\___/|_|  |_|\\__,_|
                                                     
Welcome to the Terminal Portfolio.
Type 'help' to see available commands.
`;

const availableCommands = ['help', 'about', 'skills', 'contact', 'clear', 'whoami', 'projects', 'gui', 'exit'];
let commandHistory = [];
let historyIndex = -1;

terminalView.addEventListener('click', (e) => {
    if (isGeekMode && e.target !== guiReturnBtn) {
        commandInput.focus();
    }
});

// Suggestion Pills
cmdPills.forEach(pill => {
    pill.addEventListener('click', () => {
        const cmd = pill.getAttribute('data-cmd');
        commandInput.value = cmd;
        commandInput.focus();
    });
});

// Input handling (History & Tab Completion)
commandInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim();
        if (command) {
            printLine(`${promptSpan.textContent} ${command}`);
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            processCommand(command);
        } else {
            printLine(`${promptSpan.textContent}`);
        }
        this.value = '';
        scrollToBottom();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            this.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            this.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentVal = this.value.trim().toLowerCase();
        const match = availableCommands.find(cmd => cmd.startsWith(currentVal));
        if (match) {
            this.value = match;
        }
    }
});

function printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    
    if (className === 'html') {
        line.innerHTML = text;
    } else {
        line.textContent = text;
    }
    
    outputDiv.appendChild(line);
    scrollToBottom();
}

function printHTML(html) {
    printLine(html, 'html');
}

function scrollToBottom() {
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
}

const commands = {
    help: () => {
        const helpText = `
Available commands:
  about      - Display information about me
  projects   - Show my GitHub projects
  skills     - List my technical skills
  contact    - How to reach me
  clear      - Clear the terminal screen
  whoami     - Print current user
  gui        - Return to GUI Mode
`;
        printLine(helpText);
    },
    
    about: () => {
        printLine(`
I am a software engineer dedicated to crafting elegant, high-performance web 
applications and solving complex problems. With a deep love for open-source 
and clean architecture, I thrive at the intersection of design and robust engineering.
`);
    },
    
    skills: () => {
        printLine(`
[+] Languages : JavaScript, Python, Go, Java, C++
[+] Frameworks: React, Node.js, Express
[+] Tools     : Git, Docker, Linux, Bash, AWS
`);
    },
    
    contact: () => {
        printHTML(`
Reach out to me:
Email    : <a class="term-link" href="mailto:${EMAIL_ADDRESS}">${EMAIL_ADDRESS}</a>
LinkedIn : <a class="term-link" href="https://linkedin.com/in/hardik-bhanot" target="_blank">linkedin.com/in/hardik-bhanot</a>
GitHub   : <a class="term-link" href="https://github.com/${GITHUB_USERNAME}" target="_blank">github.com/${GITHUB_USERNAME}</a>
`);
    },
    
    clear: () => {
        outputDiv.innerHTML = '';
    },
    
    whoami: () => {
        printLine(TERMINAL_USER);
    },

    gui: () => {
        printLine('Exiting terminal mode...', 'term-highlight');
        setTimeout(() => switchToGUI(), 500);
    },
    exit: () => commands.gui(),
    
    projects: () => {
        if (!githubProjectsCache) {
            printLine('Projects are still loading or failed to load.', 'term-error');
            return;
        }
        
        if (githubProjectsCache.length === 0) {
            printLine(`No public repositories found for user '${GITHUB_USERNAME}'.`, 'term-error');
            return;
        }

        let projectHTML = '<br>--- My GitHub Projects ---<br><br>';
        githubProjectsCache.forEach(repo => {
            projectHTML += `
<div>
  <span class="term-highlight">${repo.name}</span> 
  ${repo.language ? `<span style="color:#aaa;">[${repo.language}]</span>` : ''}
  <br>
  > ${repo.description || 'No description provided.'}<br>
  > <a class="term-link" href="${repo.html_url}" target="_blank">View Source</a>
  ${repo.homepage ? ` | <a class="term-link" href="${repo.homepage}" target="_blank">Live Demo</a>` : ''}
  <br><br>
</div>`;
        });
        
        printHTML(projectHTML);
    }
};

function processCommand(rawCommand) {
    const args = rawCommand.split(' ');
    const cmd = args.shift().toLowerCase();
    
    if (cmd === 'echo') {
        printLine(args.join(' '));
    } else if (commands[cmd]) {
        commands[cmd]();
    } else {
        printLine(`bash: ${cmd}: command not found`, 'term-error');
        printLine(`Type 'help' for a list of available commands.`);
    }
}


// --- ADVANCED BACKGROUND SYSTEM ---

// 1. Interactive Mouse Spotlight
const spotlight = document.getElementById('mouse-spotlight');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let spotlightX = mouseX;
let spotlightY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (spotlight.style.opacity === '0' || spotlight.style.opacity === '') {
        spotlight.style.opacity = '1';
    }
});

function animateSpotlight() {
    // Lerp for smooth tracking
    spotlightX += (mouseX - spotlightX) * 0.1;
    spotlightY += (mouseY - spotlightY) * 0.1;
    
    spotlight.style.setProperty('--mouse-x', `${spotlightX}px`);
    spotlight.style.setProperty('--mouse-y', `${spotlightY}px`);
    
    requestAnimationFrame(animateSpotlight);
}
animateSpotlight();

// 2. Interactive Particle Mesh
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        
        // Mouse interaction (slight repulsion)
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
            this.x -= (dx / dist) * 0.5;
            this.y -= (dy / dist) * 0.5;
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.5)';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? Math.floor(Math.random() * 6 + 20) : Math.floor(Math.random() * 6 + 45);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(167, 139, 250, ${0.1 * (1 - dist / 150)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    animationFrameId = requestAnimationFrame(animateParticles);
}

// Prefers reduced motion check
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches) {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 250);
    });
    resizeCanvas();
    animateParticles();
}

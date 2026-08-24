// --- CONFIGURATION ---
const GITHUB_USERNAME = 'hardikbhanot'; // Change this to your actual GitHub username
const TERMINAL_USER = 'guest';
const TERMINAL_HOST = 'portfolio';
// ---------------------

// DOM Elements - Toggle
const modeToggleBtn = document.getElementById('mode-toggle');
const toggleText = document.getElementById('toggle-text');
const normalView = document.getElementById('normal-view');
const terminalView = document.getElementById('terminal-view');
const githubLink = document.getElementById('github-link');
const projectsGrid = document.getElementById('projects-grid');

// DOM Elements - Terminal
const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const promptSpan = document.getElementById('prompt');
const terminalContainer = document.getElementById('terminal-container');

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

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(section => {
    observer.observe(section);
});

// Toggle Logic
modeToggleBtn.addEventListener('click', () => {
    isGeekMode = !isGeekMode;
    if (isGeekMode) {
        normalView.classList.remove('active');
        normalView.classList.add('hidden');
        terminalView.classList.remove('hidden');
        terminalView.classList.add('active');
        toggleText.textContent = 'Normal';
        
        if (outputDiv.innerHTML === '') {
            printLine(banner);
        }
        setTimeout(() => commandInput.focus(), 100);
    } else {
        terminalView.classList.remove('active');
        terminalView.classList.add('hidden');
        normalView.classList.remove('hidden');
        normalView.classList.add('active');
        toggleText.textContent = 'Terminal';
    }
});

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
            <h3>${repo.name} ${repo.language ? `<span class="lang-badge">${repo.language}</span>` : ''}</h3>
            <p>${repo.description || 'No description provided.'}</p>
            <div class="card-links">
                <a href="${repo.html_url}" target="_blank">Code</a>
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank">Live</a>` : ''}
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

terminalView.addEventListener('click', () => {
    if (isGeekMode) {
        commandInput.focus();
    }
});

commandInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim();
        if (command) {
            printLine(`${promptSpan.textContent} ${command}`);
            processCommand(command);
        } else {
            printLine(`${promptSpan.textContent}`);
        }
        this.value = '';
        scrollToBottom();
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
  exit       - Return to Normal Mode
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
Email    : <a class="term-link" href="mailto:hardik.bhanot1@gmail.com">hardik.bhanot1@gmail.com</a>
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

    exit: () => {
        printLine('Exiting terminal mode...', 'term-highlight');
        setTimeout(() => {
            modeToggleBtn.click();
        }, 500);
    },
    
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

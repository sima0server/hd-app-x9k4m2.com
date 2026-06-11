// External user blocking script for HD™ Market
// Blocks specific users from viewing page content while keeping header and nav

(function() {
    // Configuration - users to block
    const BLOCKED_USERS = [
        { username: "Ochurhino", uid: "485020" },
        // Add more users: { username: "username", uid: "uid" }
    ];

    const CHECK_INTERVAL_MS = 500;

    // Block overlay styles
    const STYLES = `
        .hd-blocked-content {
            filter: blur(20px) !important;
            pointer-events: none !important;
            user-select: none !important;
            opacity: 0.3 !important;
        }
        
        .hd-block-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        
        .hd-block-message {
            text-align: center;
            padding: 40px 24px;
            max-width: 380px;
            color: white;
            font-family: 'Inter', sans-serif;
        }
        
        .hd-block-icon {
            font-size: 64px;
            margin-bottom: 24px;
            color: #ef4444;
        }
        
        .hd-block-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #fff;
        }
        
        .hd-block-text {
            font-size: 14px;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        
        .hd-block-btn {
            background: #dcb95e;
            color: #0a0c10;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            transition: opacity 0.2s;
        }
        
        .hd-block-btn:hover {
            opacity: 0.9;
        }
        
        .hd-block-btn.outline {
            background: transparent;
            border: 1px solid #4b5563;
            color: #9ca3af;
            margin-left: 12px;
        }
    `;

    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'hd-block-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    function isUserBlocked(username, uid) {
        if (!username && !uid) return false;
        const usernameLower = username ? username.toLowerCase() : '';
        
        return BLOCKED_USERS.some(blocked => {
            if (blocked.username && usernameLower === blocked.username.toLowerCase()) return true;
            if (blocked.uid && uid && String(uid).includes(String(blocked.uid))) return true;
            return false;
        });
    }

    function getSessionUser() {
        try {
            const session = JSON.parse(localStorage.getItem('naf_session') || '{}');
            return session.docId ? { docId: session.docId } : null;
        } catch {
            return null;
        }
    }

    function extractUserFromDOM() {
        let username = null;
        let uid = null;
        
        // Try multiple selectors for username
        const displayUsername = document.getElementById('displayUsername');
        const headerUsername = document.getElementById('headerUsername');
        
        if (displayUsername && displayUsername.textContent !== 'Loading...') {
            username = displayUsername.textContent.trim();
        }
        if (!username && headerUsername) {
            const match = headerUsername.textContent.match(/Welcome\s+(.+?)\s*👋/);
            if (match) username = match[1].trim();
        }
        
        // Try multiple selectors for UID
        const userIdEl = document.getElementById('userId');
        if (userIdEl && userIdEl.textContent !== 'UID: Loading...') {
            const uidMatch = userIdEl.textContent.match(/UID:\s*(.+)/);
            if (uidMatch) uid = uidMatch[1].replace('...', '').trim();
        }
        
        return { username, uid };
    }

    function createBlockUI() {
        // Remove existing overlay if any
        const existing = document.querySelector('.hd-block-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.className = 'hd-block-overlay';
        overlay.innerHTML = `
            <div class="hd-block-message">
                <div class="hd-block-icon">🚫</div>
                <div class="hd-block-title">Account Restricted</div>
                <div class="hd-block-text">
                    Your account has been restricted due to inactivity.<br>
                    No deposit has been made since registration.<br><br>
                    Please contact support for assistance.
                </div>
                <button class="hd-block-btn" onclick="window.location.href='more.html'">
                    Contact Support
                </button>
                <button class="hd-block-btn outline" onclick="localStorage.removeItem('naf_session'); window.location.href='login.html'">
                    Sign Out
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function blockContent() {
        // Don't block if already done
        if (document.querySelector('.hd-block-overlay')) return;
        
        console.log('[User Blocker] Blocking content for restricted user');
        
        // Find all main content sections to blur
        const contentSelectors = [
            '.main-content',
            '.market-grid',
            '.signal-banner',
            '.activity-panel',
            '.section-header',
            '.market-ticker',
            '.user-panel',
            '.package-card',
            '#marketGrid',
            '.modal',
            '.fullpage-loader'
        ];
        
        contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.closest('.top-bar') && !el.closest('.bottom-nav')) {
                    el.classList.add('hd-blocked-content');
                }
            });
        });
        
        // Also catch any other divs that might be content
        document.querySelectorAll('.app-container > *').forEach(child => {
            if (!child.classList.contains('top-bar') && 
                !child.classList.contains('bottom-nav') &&
                !child.classList.contains('hd-block-overlay')) {
                child.classList.add('hd-blocked-content');
            }
        });
        
        // Create overlay but keep header and nav above it
        createBlockUI();
        
        // Ensure header and nav stay above overlay
        const topBar = document.querySelector('.top-bar');
        const bottomNav = document.querySelector('.bottom-nav');
        if (topBar) topBar.style.position = 'relative';
        if (topBar) topBar.style.zIndex = '9999';
        if (bottomNav) bottomNav.style.zIndex = '9999';
    }

    function unblockContent() {
        document.querySelectorAll('.hd-blocked-content').forEach(el => {
            el.classList.remove('hd-blocked-content');
        });
        const overlay = document.querySelector('.hd-block-overlay');
        if (overlay) overlay.remove();
    }

    let wasBlocked = false;

    function checkAndBlock() {
        const { username, uid } = extractUserFromDOM();
        const blocked = isUserBlocked(username, uid);
        
        if (blocked && !wasBlocked) {
            wasBlocked = true;
            blockContent();
        } else if (!blocked && wasBlocked) {
            wasBlocked = false;
            unblockContent();
        }
    }

    // Initialize
    function init() {
        injectStyles();
        checkAndBlock();
        
        // Watch for DOM changes (Firebase async loading)
        const observer = new MutationObserver(() => {
            checkAndBlock();
        });
        
        const targetNode = document.getElementById('displayUsername') || 
                           document.getElementById('headerUsername') || 
                           document.body;
        
        if (targetNode) {
            observer.observe(targetNode, { 
                childList: true, 
                characterData: true, 
                subtree: true 
            });
        }
        
        // Backup periodic check
        setInterval(checkAndBlock, CHECK_INTERVAL_MS);
        
        console.log('[User Blocker] Active - Monitoring for user: Ochurhino (UID: 485020)');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
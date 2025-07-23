/**
 * Ustaz Radhi AI Chatbox for Iqra Learning Pages
 * Context-aware Islamic learning assistant
 */

class UstazRadhiIqraChatbox {
    constructor(config = {}) {
        this.config = {
            iqraModule: config.iqraModule || 1,
            pageNumber: config.pageNumber || 1,
            totalPages: config.totalPages || 35,
            focus: config.focus || 'Basic Arabic Letters',
            position: config.position || 'top-right', // top-left, top-right, bottom-left, bottom-right
            autoOpen: config.autoOpen || false,
            ...config
        };

        // Secure Gemini AI Configuration - API key moved to server-side proxy
        this.GEMINI_CONFIG = {
            // API_KEY removed for security - now handled by server proxy
            PROXY_URL: this.getProxyURL(), // Dynamic URL based on current location
            MAX_TOKENS: 1000,
            TEMPERATURE: 0.7,
            RETRY_ATTEMPTS: 2,
            TIMEOUT: 10000
        };

        // Initialize chatbox
        this.isOpen = false;
        this.messageHistory = [];
        this.init();
    }

    getProxyURL() {
        // Get the base URL for the current site
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';
        
        // For local development vs production
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//${hostname}${port}/api/gemini-proxy`;
        }
        
        // Always use Cloudflare Pages domain for API (where the function is deployed)
        // GitHub Pages doesn't support server-side functions
        return 'https://digital.zikirnurani.com/api/gemini-proxy';
    }

    init() {
        this.createChatboxHTML();
        this.attachEventListeners();
        this.loadDefaultResponses();
        
        if (this.config.autoOpen) {
            setTimeout(() => this.openChatbox(), 2000);
        }
    }

    createChatboxHTML() {
        const chatboxHTML = `
            <!-- Ustaz Radhi AI Chatbox -->
            <div id="ustazChatbox" class="ustaz-chatbox ustaz-chatbox-${this.config.position}">
                <!-- Chat Toggle Button -->
                <button id="chatToggle" class="chat-toggle" aria-label="Chat dengan Ustaz Radhi">
                    <div class="chat-icon">
                        <span class="chat-emoji">🧠</span>
                        <div class="notification-dot"></div>
                    </div>
                    <div class="chat-text">
                        <div class="chat-title">Ustaz Radhi</div>
                        <div class="chat-subtitle">AI Learning Assistant</div>
                    </div>
                </button>

                <!-- Chat Window -->
                <div id="chatWindow" class="chat-window">
                    <!-- Chat Header -->
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <div class="ustaz-avatar">🧠</div>
                            <div class="ustaz-info">
                                <div class="ustaz-name">Ustaz Radhi</div>
                                <div class="ustaz-status">
                                    <span class="status-dot"></span>
                                    Membantu Iqra ${this.config.iqraModule}
                                </div>
                            </div>
                        </div>
                        <button id="chatClose" class="chat-close" aria-label="Tutup chat">✕</button>
                    </div>

                    <!-- Chat Messages -->
                    <div id="chatMessages" class="chat-messages">
                        <!-- Welcome message will be inserted here -->
                    </div>

                    <!-- Chat Input -->
                    <div class="chat-input-container">
                        <div class="chat-input-wrapper">
                            <input type="text" id="chatInput" placeholder="Tanya tentang halaman ini..." maxlength="300">
                            <button id="chatSend" class="chat-send" aria-label="Hantar">
                                <span>📤</span>
                            </button>
                        </div>
                        <div class="chat-help-text">
                            Tekan Enter untuk hantar • Maksimum 300 aksara
                        </div>
                    </div>
                </div>

                <!-- Quick Actions - Now Outside Chatbox -->
                <div id="quickActionsExternal" class="quick-actions-external">
                    <div class="quick-actions-title">💡 Soalan Pantas:</div>
                    <div id="quickButtons" class="quick-buttons">
                        <!-- Quick action buttons will be inserted here -->
                    </div>
                </div>
            </div>

            <!-- Chatbox Styles -->
            <style>
                .ustaz-chatbox {
                    position: fixed;
                    z-index: 9999;
                    font-family: 'Sora', 'Segoe UI', system-ui, sans-serif;
                }

                .ustaz-chatbox-top-right {
                    top: 20px;
                    right: 20px;
                }

                .ustaz-chatbox-top-left {
                    top: 20px;
                    left: 20px;
                }

                .ustaz-chatbox-bottom-right {
                    bottom: 20px;
                    right: 20px;
                }

                .ustaz-chatbox-bottom-left {
                    bottom: 20px;
                    left: 20px;
                }

                .chat-toggle {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    padding: 12px 20px;
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(5, 150, 105, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                    max-width: 200px;
                    animation: gentle-bounce 3s ease-in-out infinite;
                }

                .chat-toggle:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 40px rgba(5, 150, 105, 0.4);
                }

                .chat-icon {
                    position: relative;
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .notification-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid white;
                    animation: pulse-dot 2s ease-in-out infinite;
                }

                .chat-text {
                    text-align: left;
                    line-height: 1.2;
                }

                .chat-title {
                    font-weight: bold;
                    font-size: 14px;
                }

                .chat-subtitle {
                    font-size: 11px;
                    opacity: 0.9;
                }

                .chat-window {
                    position: absolute;
                    bottom: 70px;
                    right: 0;
                    width: 420px;
                    height: 550px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid rgba(5, 150, 105, 0.2);
                }

                .ustaz-chatbox-top-right .chat-window,
                .ustaz-chatbox-top-left .chat-window {
                    bottom: auto;
                    top: 70px;
                }

                .ustaz-chatbox-top-left .chat-window,
                .ustaz-chatbox-bottom-left .chat-window {
                    right: auto;
                    left: 0;
                }

                .chat-header {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .chat-header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .ustaz-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .ustaz-name {
                    font-weight: bold;
                    font-size: 16px;
                }

                .ustaz-status {
                    font-size: 12px;
                    opacity: 0.9;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse-status 2s ease-in-out infinite;
                }

                .chat-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 50%;
                    transition: background 0.2s ease;
                }

                .chat-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .chat-messages {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    background: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .message {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .message-ustaz {
                    align-self: flex-start;
                }

                .message-user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .message-ustaz .message-avatar {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                }

                .message-user .message-avatar {
                    background: #6b7280;
                    color: white;
                }

                .message-content {
                    background: white;
                    padding: 14px 18px;
                    border-radius: 16px;
                    max-width: 85%;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    word-wrap: break-word;
                    text-align: left;
                }

                .message-user .message-content {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                    border-color: #059669;
                }

                .message-text {
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                    text-align: left;
                    direction: ltr;
                    unicode-bidi: plaintext;
                }

                .message-time {
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                .quick-actions {
                    padding: 12px 16px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                }

                .quick-actions-external {
                    position: absolute;
                    bottom: -80px;
                    right: 0;
                    left: 0;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border: 1px solid rgba(5, 150, 105, 0.2);
                    border-radius: 16px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    display: none;
                }

                .quick-actions-title {
                    font-size: 13px;
                    font-weight: bold;
                    color: #059669;
                    margin-bottom: 10px;
                    text-align: center;
                }

                .quick-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                }

                .quick-btn {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    border: none;
                    color: white;
                    padding: 8px 14px;
                    border-radius: 20px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
                }

                .quick-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
                }

                .chat-input-container {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                }

                .chat-input-wrapper {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .chat-input-wrapper input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 20px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s ease;
                }

                .chat-input-wrapper input:focus {
                    border-color: #059669;
                    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
                }

                .chat-send {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }

                .chat-send:hover {
                    transform: scale(1.05);
                }

                .chat-help-text {
                    font-size: 10px;
                    color: #6b7280;
                    text-align: center;
                    margin-top: 8px;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    font-style: italic;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #6b7280;
                    border-radius: 50%;
                    animation: typing-bounce 1.4s ease-in-out infinite;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                /* Mobile Responsiveness */
                @media (max-width: 600px) {
                    .ustaz-chatbox {
                        position: fixed !important;
                        bottom: 20px !important;
                        right: 20px !important;
                        top: auto !important;
                        left: auto !important;
                    }

                    .chat-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 140px);
                        bottom: 70px;
                        right: 0;
                        left: 0;
                        margin: 0 auto;
                    }

                    .chat-toggle {
                        padding: 10px 16px;
                        max-width: 160px;
                    }

                    .chat-title {
                        font-size: 13px;
                    }

                    .chat-subtitle {
                        font-size: 10px;
                    }
                }

                /* Animations */
                @keyframes gentle-bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-3px);
                    }
                }

                @keyframes pulse-dot {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.2);
                    }
                }

                @keyframes pulse-status {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                @keyframes typing-bounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }

                /* Scrollbar styling */
                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', chatboxHTML);
    }

    attachEventListeners() {
        const chatToggle = document.getElementById('chatToggle');
        const chatClose = document.getElementById('chatClose');
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');

        chatToggle.addEventListener('click', () => this.toggleChatbox());
        chatClose.addEventListener('click', () => this.closeChatbox());
        chatSend.addEventListener('click', () => this.sendMessage());
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Auto-resize for mobile
        window.addEventListener('resize', () => this.adjustForMobile());
    }

    toggleChatbox() {
        if (this.isOpen) {
            this.closeChatbox();
        } else {
            this.openChatbox();
        }
    }

    openChatbox() {
        const chatWindow = document.getElementById('chatWindow');
        const quickActionsExternal = document.getElementById('quickActionsExternal');
        const notificationDot = document.querySelector('.notification-dot');
        
        chatWindow.style.display = 'flex';
        chatWindow.style.animation = 'slideIn 0.3s ease-out';
        
        // Show external quick actions
        if (quickActionsExternal) {
            quickActionsExternal.style.display = 'block';
            quickActionsExternal.style.animation = 'slideIn 0.3s ease-out 0.2s both';
        }
        
        this.isOpen = true;
        
        // Hide notification dot
        if (notificationDot) {
            notificationDot.style.display = 'none';
        }

        // Show welcome message if first time
        if (this.messageHistory.length === 0) {
            this.showWelcomeMessage();
        }
    }

    closeChatbox() {
        const chatWindow = document.getElementById('chatWindow');
        const quickActionsExternal = document.getElementById('quickActionsExternal');
        
        chatWindow.style.animation = 'slideOut 0.3s ease-in';
        
        // Hide external quick actions
        if (quickActionsExternal) {
            quickActionsExternal.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                quickActionsExternal.style.display = 'none';
            }, 300);
        }
        
        setTimeout(() => {
            chatWindow.style.display = 'none';
            this.isOpen = false;
        }, 300);
    }

    loadDefaultResponses() {
        const quickButtons = document.getElementById('quickButtons');
        const responses = this.getContextualResponses();
        
        responses.forEach(response => {
            const btn = document.createElement('button');
            btn.className = 'quick-btn';
            btn.textContent = response.text;
            btn.onclick = () => this.handleQuickResponse(response);
            quickButtons.appendChild(btn);
        });

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(20px) scale(0.9);
                }
            }
        `;
        document.head.appendChild(style);
    }

    getContextualResponses() {
        const moduleContext = this.getModuleContext();
        const pageContext = this.getPageContext();
        
        return [
            {
                text: `Apa itu ${moduleContext.title}?`,
                response: `**${moduleContext.title}** adalah ${moduleContext.description}\n\n**📖 Pada halaman ${this.config.pageNumber}:**\n${pageContext.content}\n\n**🎯 Tips Pembelajaran:**\n${pageContext.tips.join('\n')}\n\nAdakah saudara/saudari mahu saya terangkan lebih lanjut tentang aspek tertentu?`
            },
            {
                text: 'Cara baca betul?',
                response: `**🔤 Panduan Membaca Halaman ${this.config.pageNumber}:**\n\n${pageContext.pronunciation}\n\n**📚 Teknik Pembelajaran:**\n• **Lihat** - Perhatikan bentuk huruf dengan teliti\n• **Dengar** - Gunakan butang audio untuk mendengar sebutan\n• **Ulang** - Baca berulang kali hingga lancar\n• **Praktis** - Cuba baca tanpa melihat teks\n\n**⭐ Ingat:** ${moduleContext.reminder}\n\nMahu saya tunjukkan teknik khusus untuk huruf-huruf tertentu?`
            },
            {
                text: 'Contoh bacaan halaman ini',
                response: this.getPageSpecificExamples()
            },
            {
                text: 'Apa ada dalam buku Iqra?',
                response: this.getIqraBookContentResponse()
            },
            {
                text: 'Cara belajar Iqra betul?',
                response: this.getIqraLearningMethodResponse()
            },
            {
                text: 'Adab baca Al-Quran',
                response: `**🕌 Adab Membaca Al-Quran:**\n\n**Sebelum Membaca:**\n• Berwudhu terlebih dahulu\n• Duduk menghadap kiblat jika boleh\n• Baca "A'udzu billahi..." dan "Bismillah..."\n• Niat untuk belajar dan beribadah\n\n**Ketika Membaca:**\n• Baca dengan tartil (perlahan-lahan)\n• Hayati maksud yang dibaca\n• Elakkan tergesa-gesa\n• Jaga tajwid dengan betul\n\n**Selepas Membaca:**\n• Baca doa khatam Al-Quran\n• Bersyukur kepada Allah\n• Amalkan apa yang dipelajari\n\n**🌟 Untuk Iqra:** Walaupun masih belajar, tetap jaga adab ini untuk membentuk kebiasaan baik.`
            },
            {
                text: 'Doa belajar',
                response: `**🤲 Doa Sebelum Belajar:**\n\n**رَبِّ اشْرَحْ لِيْ صَدْرِيْ وَيَسِّرْ لِيْ أَمْرِيْ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِيْ يَفْقَهُوْا قَوْلِيْ**\n\n*"Rabbish rahli sadri wa yassirli amri wahlul uqdatan min lisani yafqahu qauli"*\n\n**Maksud:** "Ya Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan lidahku supaya mereka memahami perkataanku."\n\n**🌟 Doa Selepas Belajar:**\n\n**اللَّهُمَّ انْفَعْنِيْ بِمَا عَلَّمْتَنِيْ وَعَلِّمْنِيْ مَا يَنْفَعُنِيْ وَزِدْنِيْ عِلْمًا**\n\n*"Allahummanfa'ni bima alamtani wa allimni ma yanfa'uni wa zidni ilma"*\n\n**Maksud:** "Ya Allah, berilah manfaat kepadaku dengan apa yang Engkau ajarkan kepadaku, dan ajarkanlah kepadaku apa yang bermanfaat bagiku, dan tambahkanlah ilmu kepadaku."`
            },
            {
                text: 'Motivasi belajar',
                response: `**💪 Motivasi Belajar Al-Quran:**\n\n**🌟 Sabda Rasulullah ﷺ:**\n*"Sebaik-baik kamu adalah yang mempelajari Al-Quran dan mengajarkannya."* (Bukhari)\n\n**📈 Kelebihan Belajar Al-Quran:**\n• Setiap huruf bernilai 10 pahala\n• Menjadi syafaat di akhirat\n• Meningkatkan keimanan\n• Menenangkan hati dan fikiran\n• Membuka pintu hidayah\n\n**🚀 Tips Istiqamah:**\n• Tetapkan masa tetap setiap hari\n• Mulakan dengan target kecil\n• Buat kumpulan belajar\n• Ingat niat kerana Allah\n• Bersabar dengan proses\n\n**${this.config.pageNumber}/${this.config.totalPages}** - Teruskan! Setiap langkah kecil membawa kepada kejayaan besar! 🌈\n\nAllah sentiasa bersama orang yang berusaha! 💚`
            }
        ];
    }

    getModuleContext() {
        const modules = {
            1: {
                title: 'Huruf Hijaiyyah',
                description: 'pembelajaran asas 29 huruf Arab yang menjadi asas kepada bacaan Al-Quran.',
                reminder: 'Setiap huruf mempunyai bentuk yang berbeza. Fokus pada satu huruf setiap masa.'
            },
            2: {
                title: 'Baris dan Fathah',
                description: 'pembelajaran tanda baca fathah (  َ ) yang menghasilkan bunyi "a".',
                reminder: 'Fathah dibaca dengan suara terbuka seperti "ba", "ta", "sa".'
            },
            3: {
                title: 'Kasrah dan Dhammah', 
                description: 'pembelajaran tanda kasrah (  ِ ) dan dhammah (  ُ ) untuk bunyi "i" dan "u".',
                reminder: 'Kasrah seperti "bi", dhammah seperti "bu". Latih perbezaan bunyi.'
            },
            4: {
                title: 'Tanwin dan Sukun',
                description: 'pembelajaran tanwin (dobel harakat) dan sukun (tanda mati).',
                reminder: 'Tanwin dibaca dengan bunyi "an", "in", "un". Sukun tidak berbunyi.'
            },
            5: {
                title: 'Mad dan Waqaf',
                description: 'pembelajaran memanjangkan bacaan (mad) dan cara berhenti (waqaf).',
                reminder: 'Mad dipanjangkan 2-6 harakat. Waqaf mengikut tanda berhenti.'
            },
            6: {
                title: 'Tajwid Asas',
                description: 'pembelajaran rules tajwid asas untuk bacaan yang betul dan indah.',
                reminder: 'Tajwid menjadikan bacaan betul dan indah. Praktis mengikut kaidah.'
            }
        };
        
        return modules[this.config.iqraModule] || modules[1];
    }

    getPageContext() {
        const progress = Math.round((this.config.pageNumber / this.config.totalPages) * 100);
        const module = this.config.iqraModule;
        const page = this.config.pageNumber;
        
        // Module-specific content guidance
        let moduleSpecificContent = this.getModuleSpecificContent(module, page);
        
        // General context based on page position within module
        if (this.config.pageNumber <= 5) {
            return {
                content: `Ini adalah halaman permulaan yang memperkenalkan ${moduleSpecificContent.focus}. Anda berada pada ${progress}% kemajuan modul ini.`,
                pronunciation: `Pada halaman ini, fokus kepada ${moduleSpecificContent.technique}. Baca perlahan-lahan dan perhatikan setiap detail.`,
                tips: [
                    `• ${moduleSpecificContent.tips[0]}`,
                    '• Gunakan jari untuk mengikut setiap huruf/tanda', 
                    '• Ulang sekurang-kurangnya 3 kali setiap baris',
                    '• Jangan tergesa-gesa untuk ke halaman seterusnya',
                    `• ${moduleSpecificContent.tips[1]}`
                ]
            };
        } else if (this.config.pageNumber <= this.config.totalPages * 0.7) {
            return {
                content: `Anda kini berada di bahagian pertengahan pembelajaran ${moduleSpecificContent.focus}. Kemajuan: ${progress}%. Ini masa untuk mengukuhkan pemahaman.`,
                pronunciation: `Halaman ini menggabungkan ${moduleSpecificContent.combination}. Baca dengan yakin dan betulkan jika terdapat kesilapan.`,
                tips: [
                    `• ${moduleSpecificContent.tips[2]}`,
                    '• Praktis bacaan tanpa melihat jika sudah hafal',
                    '• Minta bantuan jika ada bahagian yang tidak jelas',
                    '• Mulakan meningkatkan kelajuan bacaan',
                    `• ${moduleSpecificContent.tips[3]}`
                ]
            };
        } else {
            return {
                content: `Tahniah! Anda hampir menyelesaikan modul ini (${progress}%). Halaman lanjutan ini menguji pemahaman keseluruhan ${moduleSpecificContent.focus}.`,
                pronunciation: `Pada peringkat ini, baca dengan lebih lancar dan yakin. Gabungkan semua teknik ${moduleSpecificContent.mastery} yang telah dipelajari.`,
                tips: [
                    `• ${moduleSpecificContent.tips[4]}`,
                    '• Ulangkaji halaman yang masih tidak jelas',
                    '• Bersedia untuk modul seterusnya',
                    '• Banggakan pencapaian anda setakat ini!',
                    `• ${moduleSpecificContent.tips[5] || 'Pastikan semua huruf/tanda dibaca dengan betul'}`
                ]
            };
        }
    }

    getModuleSpecificContent(module, page) {
        const specificContent = {
            1: { // Huruf Hijaiyyah
                focus: 'huruf-huruf Arab asas',
                technique: 'bentuk dan nama setiap huruf',
                combination: 'huruf-huruf yang telah dipelajari dalam kombinasi mudah',
                mastery: 'pengenalan huruf',
                tips: [
                    'Kenali bentuk huruf dari kanan ke kiri',
                    'Sebut nama huruf dengan jelas: Alif, Ba, Ta, dll',
                    'Hubungkan huruf yang serupa seperti ب، ت، ث',
                    'Latih menulis huruf di udara sambil menyebut',
                    'Baca semua huruf dengan lancar tanpa tersekat',
                    'Pastikan dapat bezakan huruf yang mirip'
                ]
            },
            2: { // Baris dan Fathah
                focus: 'tanda baca fathah',
                technique: 'bunyi "a" pada setiap huruf',
                combination: 'huruf dengan fathah dalam perkataan mudah',
                mastery: 'fathah',
                tips: [
                    'Baca fathah dengan bunyi "a" yang jelas: ba, ta, sa',
                    'Lihat tanda fathah (َ) di atas huruf',
                    'Sambungkan huruf berfathah: ba-ta = بَتَ',
                    'Latih perbezaan huruf dengan dan tanpa fathah',
                    'Baca suku kata berfathah dengan lancar',
                    'Praktis perkataan mudah dengan fathah'
                ]
            },
            3: { // Kasrah dan Dhammah
                focus: 'tanda kasrah dan dhammah',
                technique: 'bunyi "i" (kasrah) dan "u" (dhammah)',
                combination: 'ketiga-tiga tanda baca: fathah, kasrah, dhammah',
                mastery: 'kasrah dan dhammah',
                tips: [
                    'Kasrah (ِ) di bawah huruf = bunyi "i": bi, ti, si',
                    'Dhammah (ُ) di atas huruf = bunyi "u": bu, tu, su',
                    'Bezakan bunyi "a", "i", "u" dengan jelas',
                    'Latih menukar-nukar tanda baca pada huruf sama',
                    'Baca suku kata dengan ketiga-tiga tanda',
                    'Gabungkan dalam perkataan pendek'
                ]
            },
            4: { // Tanwin dan Sukun
                focus: 'tanwin dan sukun',
                technique: 'bunyi dobel (tanwin) dan berhenti (sukun)',
                combination: 'tanda tanwin dengan huruf dan sukun',
                mastery: 'tanwin dan sukun',
                tips: [
                    'Tanwin = dobel bunyi: "an", "in", "un"',
                    'Sukun (ْ) = huruf tidak bersuara/berhenti',
                    'Latih perbezaan antara tanda biasa dan tanwin',
                    'Praktis cara berhenti pada sukun',
                    'Baca tanwin dengan bunyi nasal yang jelas',
                    'Gabungkan sukun dalam suku kata'
                ]
            },
            5: { // Mad dan Waqaf
                focus: 'mad (panjang) dan waqaf (berhenti)',
                technique: 'memanjangkan bunyi dan cara berhenti yang betul',
                combination: 'mad dengan huruf dan tanda waqaf',
                mastery: 'mad dan waqaf',
                tips: [
                    'Mad = panjangkan bunyi 2-6 harakat',
                    'Kenali huruf mad: Alif, Waw, Ya',
                    'Latih perbezaan bunyi pendek dan panjang',
                    'Ikut tanda waqaf untuk berhenti',
                    'Baca dengan irama yang betul',
                    'Praktis ayat pendek dengan mad dan waqaf'
                ]
            },
            6: { // Tajwid Asas
                focus: 'kaidah tajwid asas',
                technique: 'bacaan yang betul mengikut kaidah tajwid',
                combination: 'semua kaidah tajwid dalam bacaan Al-Quran',
                mastery: 'tajwid',
                tips: [
                    'Ikut kaidah tajwid untuk bacaan yang betul',
                    'Latih izhar, idgham, iqlab, ikhfa',
                    'Praktis qalqalah pada huruf ق ط ب ج د',
                    'Baca dengan tartil (perlahan dan jelas)',
                    'Gabungkan semua ilmu Iqra sebelum ini',
                    'Siap untuk membaca Al-Quran dengan betul'
                ]
            }
        };

        return specificContent[module] || specificContent[1];
    }

    handleQuickResponse(response) {
        // Add user message
        this.addMessage(response.text, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Add AI response after delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage(response.response, 'ustaz');
        }, 1500);
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Try Gemini AI first
            const response = await this.callGeminiAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ustaz');
        } catch (error) {
            this.hideTypingIndicator();
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'ustaz');
        }
    }

    async callGeminiAPI(message) {
        const prompt = this.buildContextualPrompt(message);
        
        try {
            console.log('🔍 DEBUG: Calling API proxy at:', this.GEMINI_CONFIG.PROXY_URL);
            console.log('🔍 DEBUG: Current location:', window.location.href);
            console.log('🔍 DEBUG: Request payload:', { 
                prompt: prompt.substring(0, 100) + '...', 
                temperature: this.GEMINI_CONFIG.TEMPERATURE, 
                maxTokens: this.GEMINI_CONFIG.MAX_TOKENS 
            });
            
            // Use secure proxy endpoint instead of direct API call
            const response = await fetch(this.GEMINI_CONFIG.PROXY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    temperature: this.GEMINI_CONFIG.TEMPERATURE,
                    maxTokens: this.GEMINI_CONFIG.MAX_TOKENS
                })
            });

            console.log('🔍 DEBUG: Response status:', response.status, response.statusText);
            console.log('🔍 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Proxy response not OK:', response.status, response.statusText, errorText);
                
                // More specific error messages
                if (response.status === 404) {
                    throw new Error(`API endpoint not found (404). Check if proxy is deployed correctly.`);
                } else if (response.status === 500) {
                    throw new Error(`Server error (500). Check API key configuration.`);
                } else if (response.status === 403) {
                    throw new Error(`Access forbidden (403). Check CORS settings.`);
                }
                
                throw new Error(`Proxy API failed: ${response.status} - ${errorText}`);
            }

            let data;
            try {
                const responseText = await response.text();
                console.log('🔍 DEBUG: Raw response:', responseText);
                
                // Check for null or empty responses
                if (!responseText || responseText === 'null' || responseText.trim() === '') {
                    throw new Error('Empty or null response from server');
                }
                
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('❌ Failed to parse JSON response:', jsonError);
                throw new Error(`Invalid JSON response from proxy: ${jsonError.message}`);
            }
            
            console.log('✅ DEBUG: Parsed response data:', data);
            
            if (data && data.success && data.response) {
                return data.response;
            }
            
            console.error('❌ API returned error or invalid structure:', data);
            throw new Error(data?.error || 'No valid response from API');
            
        } catch (fetchError) {
            console.error('❌ Fetch error:', fetchError);
            
            // Add more specific error handling
            if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
                throw new Error('Network error: Could not connect to proxy server. Check if server is running.');
            }
            
            throw fetchError;
        }
    }

    buildContextualPrompt(message) {
        const moduleContext = this.getModuleContext();
        const pageContext = this.getPageContext();
        
        return `Anda adalah Ustaz Radhi, AI assistant untuk pembelajaran Iqra di dalam halaman interaktif.

KONTEKS PEMBELAJARAN SEMASA:
- Modul: Iqra ${this.config.iqraModule} - ${moduleContext.title}
- Halaman: ${this.config.pageNumber} daripada ${this.config.totalPages}
- Fokus: ${this.config.focus}
- Kemajuan: ${Math.round((this.config.pageNumber / this.config.totalPages) * 100)}%

PERANAN ANDA:
1. Membantu pengguna memahami kandungan halaman ini khususnya
2. Memberikan panduan praktis untuk pembelajaran Iqra
3. Menjawab soalan berkaitan bacaan Al-Quran
4. Memberikan motivasi dan semangat untuk teruskan belajar

GAYA JAWAPAN:
- Pendek dan fokus (maksimum 300 perkataan)
- Gunakan emoji yang sesuai
- Berikan tips praktis
- Hubungkan dengan konteks halaman semasa
- Gunakan Bahasa Malaysia yang mudah difahami

SOALAN PENGGUNA: "${message}"

Sila berikan jawapan yang berguna untuk pembelajaran mereka di halaman ${this.config.pageNumber} Iqra ${this.config.iqraModule}.`;
    }

    getFallbackResponse(message) {
        const currentUrl = this.GEMINI_CONFIG.PROXY_URL;
        const timestamp = new Date().toLocaleTimeString();
        
        const responses = [
            `**🔄 AI Connection Issue (${timestamp})** \n\n**Debug Info:**\n• Trying: ${currentUrl}\n• Location: ${window.location.href}\n\n**Sementara itu, untuk halaman ${this.config.pageNumber}:**\n\n• Gunakan butang "Soalan Pantas" di bawah untuk panduan\n• Baca perlahan-lahan dan ulang 3-5 kali\n• Fokus pada pembelajaran halaman ini\n\nSaya akan cuba jawab dengan AI sebaik mungkin! 🌟`,
            
            `**⚡ Network Error (${timestamp})** 🤲\n\n**Troubleshooting:**\n• Proxy URL: ${currentUrl}\n• Status: Connection failed\n\n**Tips untuk halaman ${this.config.pageNumber} Iqra ${this.config.iqraModule}:**\n\n• Baca dengan tartil (perlahan dan jelas)\n• Gunakan audio untuk dengar sebutan betul\n• Ulang hingga lancar sebelum sambung\n\nCuba tanya lagi - mungkin AI sudah boleh sambung! 📚`,
            
            `**🛠️ Server Issue (${timestamp})** 🌟\n\n**System Info:**\n• Endpoint: ${currentUrl}\n• Page: ${window.location.pathname}\n\n**Untuk pembelajaran berkesan:**\n• Pastikan faham halaman sebelum ini\n• Praktis bacaan ikut contoh\n• Jangan tergesa-gesa ke halaman seterusnya\n\nTeruskan usaha! Setiap huruf yang dipelajari adalah pahala! 💚`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    showWelcomeMessage() {
        const moduleContext = this.getModuleContext();
        const pageContext = this.getPageContext();
        const progress = Math.round((this.config.pageNumber / this.config.totalPages) * 100);
        
        const welcomeMessage = `**Assalamualaikum! Selamat datang ke halaman ${this.config.pageNumber}!** 🌟

📖 **Anda sedang belajar:**
• **Modul:** Iqra ${this.config.iqraModule} - ${moduleContext.title}
• **Kemajuan:** ${this.config.pageNumber}/${this.config.totalPages} (${progress}%)
• **Fokus:** ${this.config.focus}

**📚 Tentang Halaman Ini:**
${pageContext.content}

**🎯 Yang Anda Akan Pelajari:**
${pageContext.tips.join('\n')}

💡 **Saya boleh membantu dengan:**
• Menerangkan kandungan halaman ini khususnya
• Tips bacaan yang betul dan teknik pembelajaran
• Info lengkap tentang apa ada dalam buku Iqra
• Kaedah pembelajaran Iqra yang berkesan
• Motivasi dan semangat belajar
• Doa dan adab membaca Al-Quran

**🌟 Tips Halaman ${this.config.pageNumber}:**
${moduleContext.reminder}

Gunakan butang di bawah untuk soalan pantas, atau taip soalan anda! 🤲`;

        this.addMessage(welcomeMessage, 'ustaz');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;">🧠</div>
            <span>Ustaz Radhi sedang menaip...</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;
        
        const time = new Date().toLocaleTimeString('ms-MY', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const avatarEmoji = sender === 'ustaz' ? '🧠' : '👤';
        const avatarBg = sender === 'ustaz' 
            ? 'background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;'
            : 'background: #6b7280; color: white;';
        
        messageDiv.innerHTML = `
            <div class="message-avatar" style="${avatarBg}">${avatarEmoji}</div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to history
        this.messageHistory.push({ text, sender, time });
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '•');
    }

    getIqraBookContentResponse() {
        const allModules = {
            1: { title: 'Huruf Hijaiyyah', pages: 35, content: 'Pengenalan 29 huruf Arab asas', focus: 'Bentuk dan nama huruf' },
            2: { title: 'Baris dan Fathah', pages: 32, content: 'Tanda baca fathah (َ)', focus: 'Bunyi "a" pada huruf' },
            3: { title: 'Kasrah dan Dhammah', pages: 32, content: 'Tanda kasrah (ِ) dan dhammah (ُ)', focus: 'Bunyi "i" dan "u"' },
            4: { title: 'Tanwin dan Sukun', pages: 32, content: 'Tanwin dobel dan sukun mati', focus: 'Bacaan "an, in, un" dan berhenti' },
            5: { title: 'Mad dan Waqaf', pages: 32, content: 'Memanjangkan bacaan dan cara berhenti', focus: 'Panjang pendek bunyi' },
            6: { title: 'Tajwid Asas', pages: 33, content: 'Kaidah tajwid asas', focus: 'Bacaan yang betul dan indah' }
        };

        let response = `**📚 Kandungan Lengkap Buku Iqra (6 Modul):**\n\n`;
        
        Object.entries(allModules).forEach(([num, module]) => {
            const current = (parseInt(num) === this.config.iqraModule) ? ' 👈 **ANDA DI SINI**' : '';
            response += `**Iqra ${num}:** ${module.title}${current}\n`;
            response += `• ${module.pages} halaman - ${module.content}\n`;
            response += `• Fokus: ${module.focus}\n\n`;
        });

        response += `**🎯 Anda Sekarang:**\n`;
        response += `• **Modul:** Iqra ${this.config.iqraModule} - ${allModules[this.config.iqraModule].title}\n`;
        response += `• **Halaman:** ${this.config.pageNumber}/${this.config.totalPages}\n`;
        response += `• **Kemajuan:** ${Math.round((this.config.pageNumber / this.config.totalPages) * 100)}%\n\n`;

        response += `**✨ Setelah Tamat 6 Modul Iqra:**\n`;
        response += `• Boleh baca Al-Quran dengan asas yang kuat\n`;
        response += `• Faham tajwid asas untuk bacaan yang betul\n`;
        response += `• Siap untuk belajar bacaan yang lebih lanjutan\n`;
        response += `• Boleh mengajar orang lain dengan yakin\n\n`;

        response += `Teruskan dengan tekun! Setiap halaman membawa anda lebih dekat kepada matlamat! 🌟`;

        return response;
    }

    getPageSpecificExamples() {
        const module = this.config.iqraModule;
        const page = this.config.pageNumber;
        
        let response = `**📋 Contoh Bacaan untuk Halaman ${page} - Iqra ${module}:**\n\n`;

        // Module-specific examples
        switch (module) {
            case 1: // Huruf Hijaiyyah
                if (page <= 10) {
                    response += `**🔤 Huruf-huruf Asas:**\n`;
                    response += `• **أ** - Alif (bunyi "a" panjang)\n`;
                    response += `• **ب** - Ba (bunyi "b")\n`;
                    response += `• **ت** - Ta (bunyi "t")\n`;
                    response += `• **ث** - Sa (bunyi "ts")\n\n`;
                    response += `**✏️ Latihan Baca:**\n`;
                    response += `• Sebut nama huruf: "Alif... Ba... Ta... Sa..."\n`;
                    response += `• Lihat bentuk dan ingat nama\n`;
                    response += `• Tulis huruf di udara sambil sebut\n`;
                } else if (page <= 25) {
                    response += `**🔤 Huruf Lanjutan:**\n`;
                    response += `• **ج** - Jim (bunyi "j")\n`;
                    response += `• **ح** - Ha (bunyi "h" nafas)\n`;
                    response += `• **خ** - Kha (bunyi "kh")\n`;
                    response += `• **د** - Dal (bunyi "d")\n\n`;
                    response += `**🎯 Fokus:** Bezakan huruf yang serupa seperti ج، ح، خ\n`;
                } else {
                    response += `**🔤 Huruf Akhir:**\n`;
                    response += `• **ذ** - Zal, **ر** - Ra, **ز** - Zay\n`;
                    response += `• **س** - Sin, **ش** - Syin\n`;
                    response += `• **ص** - Sad, **ض** - Dad\n\n`;
                    response += `**🏆 Ujian:** Bolehkah anda sebut semua 29 huruf dengan lancar?\n`;
                }
                break;

            case 2: // Baris dan Fathah
                response += `**📖 Contoh Bacaan dengan Fathah (َ):**\n\n`;
                response += `• **بَ** - "Ba" (ba)\n`;
                response += `• **تَ** - "Ta" (ta)\n`;
                response += `• **سَ** - "Sa" (sa)\n`;
                response += `• **دَ** - "Da" (da)\n\n`;
                response += `**🔗 Gabungan Suku Kata:**\n`;
                response += `• **بَتَ** - "Ba-ta" (beta)\n`;
                response += `• **سَدَ** - "Sa-da" (sada)\n`;
                response += `• **جَمَ** - "Ja-ma" (jama)\n\n`;
                response += `**⚡ Tips:** Fathah sentiasa bunyi "a" yang jelas!\n`;
                break;

            case 3: // Kasrah dan Dhammah
                response += `**📖 Contoh Tiga Tanda Baca:**\n\n`;
                response += `**Fathah (َ):** بَ (ba), تَ (ta), سَ (sa)\n`;
                response += `**Kasrah (ِ):** بِ (bi), تِ (ti), سِ (si)\n`;
                response += `**Dhammah (ُ):** بُ (bu), تُ (tu), سُ (su)\n\n`;
                response += `**🔄 Latihan Variasi:**\n`;
                response += `• **بَبِبُ** - "ba-bi-bu"\n`;
                response += `• **تَتِتُ** - "ta-ti-tu"\n`;
                response += `• **سَسِسُ** - "sa-si-su"\n\n`;
                response += `**🎯 Fokus:** Bezakan ketiga-tiga bunyi dengan jelas!\n`;
                break;

            case 4: // Tanwin dan Sukun
                response += `**📖 Contoh Tanwin dan Sukun:**\n\n`;
                response += `**Tanwin (Dobel):**\n`;
                response += `• **بً** - "ban" (fathah tanwin)\n`;
                response += `• **بٍ** - "bin" (kasrah tanwin)\n`;
                response += `• **بٌ** - "bun" (dhammah tanwin)\n\n`;
                response += `**Sukun (ْ):**\n`;
                response += `• **بْ** - "b" (berhenti/mati)\n`;
                response += `• **تْ** - "t" (berhenti/mati)\n\n`;
                response += `**🔗 Contoh Gabungan:**\n`;
                response += `• **كِتَابٌ** - "kitaabun" (sebuah buku)\n`;
                response += `• **مِنْ** - "min" (dari)\n`;
                break;

            case 5: // Mad dan Waqaf
                response += `**📖 Contoh Mad (Panjang):**\n\n`;
                response += `**Mad Alif:** بَا (baa - panjang)\n`;
                response += `**Mad Waw:** بُوْ (buu - panjang)\n`;
                response += `**Mad Ya:** بِي (bii - panjang)\n\n`;
                response += `**⏸️ Tanda Waqaf (Berhenti):**\n`;
                response += `• **ۘ** - Boleh berhenti\n`;
                response += `• **ۗ** - Elok berhenti\n`;
                response += `• **ۖ** - Mesti berhenti\n\n`;
                response += `**🎵 Contoh Ayat Pendek:**\n`;
                response += `**مَا شَاءَ اللهُ** - "Maa syaa Allah" (dengan mad)\n`;
                break;

            case 6: // Tajwid Asas
                response += `**📖 Contoh Kaidah Tajwid:**\n\n`;
                response += `**Qalqalah (ق ط ب ج د):**\n`;
                response += `• **قَد** - "qad" (bunyi pantulan)\n`;
                response += `• **طَبَ** - "taba" (pantulan pada ط)\n\n`;
                response += `**Izhar (ء ه ع ح غ خ):**\n`;
                response += `• **مِنْ خَيْرٍ** - "min khayr" (jelas)\n\n`;
                response += `**Idgham:**\n`;
                response += `• **مِنْ مَّا** - "mimma" (masuk)\n\n`;
                response += `**🎯 Fokus:** Bacaan yang betul mengikut kaidah tajwid\n`;
                break;

            default:
                response += `**📖 Contoh Umum untuk Halaman ${page}:**\n\n`;
                response += `• Lihat kandungan halaman dengan teliti\n`;
                response += `• Kenali huruf atau tanda baca yang dipelajari\n`;
                response += `• Praktis bacaan mengikut contoh yang diberikan\n`;
                response += `• Ulang hingga lancar sebelum ke halaman seterusnya\n`;
        }

        response += `\n**💡 Kaedah Pembelajaran Berkesan:**\n`;
        response += `• **Baca perlahan** - Kualiti lebih penting dari kelajuan\n`;
        response += `• **Ulang 3-5 kali** - Supaya melekat di ingatan\n`;
        response += `• **Gunakan jari** - Ikut bacaan supaya fokus\n`;
        response += `• **Minta bantuan** - Jika ada yang tidak jelas\n\n`;

        response += `Selamat belajar! Semoga Allah permudahkan perjalanan pembelajaran anda! 🤲✨`;

        return response;
    }

    getIqraLearningMethodResponse() {
        const currentModule = this.config.iqraModule;
        const currentPage = this.config.pageNumber;

        let response = `**📖 Kaedah Pembelajaran Iqra Yang Betul:**\n\n`;

        response += `**🔄 Langkah-Langkah Asas:**\n\n`;
        
        response += `**1. Persediaan Sebelum Belajar** 🤲\n`;
        response += `• Berwudhu dan bersihkan tempat belajar\n`;
        response += `• Hadap kiblat jika boleh\n`;
        response += `• Baca doa sebelum belajar\n`;
        response += `• Niat untuk mendapat keredaan Allah\n\n`;

        response += `**2. Teknik Pembelajaran Iqra** 📚\n`;
        response += `• **IQRA** = اقرأ (Bacalah!) - ikut perintah Allah\n`;
        response += `• Guru tunjuk, murid ikut (Talaqqi)\n`;
        response += `• Baca berulang hingga lancar\n`;
        response += `• Jangan beralih halaman jika belum lancar\n`;
        response += `• Gunakan jari untuk ikut bacaan\n\n`;

        response += `**3. Kaedah "CBSA" (Cara Belajar Siswa Aktif)** 🎯\n`;
        response += `• **C**uba baca sendiri dahulu\n`;
        response += `• **B**etulkan jika ada silap\n`;
        response += `• **S**ampai lancar baru proceed\n`;
        response += `• **A**malkan dengan istiqamah\n\n`;

        response += `**4. Untuk Halaman ${currentPage} Iqra ${currentModule}:** 📍\n`;
        if (currentPage <= 5) {
            response += `• Anda di peringkat permulaan - **perlahan tapi pasti**\n`;
            response += `• Fokus pada satu huruf pada satu masa\n`;
            response += `• Ulang sekurang-kurangnya 3 kali setiap baris\n`;
            response += `• Pastikan sebutan betul sebelum ke huruf seterusnya\n`;
        } else if (currentPage <= (this.config.totalPages * 0.7)) {
            response += `• Anda di peringkat pertengahan - **kuatkan asas**\n`;
            response += `• Sambungkan dengan pembelajaran sebelum ini\n`;
            response += `• Mula tingkatkan kelajuan secara beransur\n`;
            response += `• Ulangkaji halaman yang tidak jelas\n`;
        } else {
            response += `• Anda hampir tamat - **mantapkan kemahiran**\n`;
            response += `• Baca dengan lebih yakin dan lancar\n`;
            response += `• Bersedia untuk modul seterusnya\n`;
            response += `• Review keseluruhan modul jika perlu\n`;
        }

        response += `\n**5. Tips Kekal Istiqamah** 💪\n`;
        response += `• Tetapkan masa belajar tetap setiap hari\n`;
        response += `• Minimum 15-30 minit sehari\n`;
        response += `• Cari partner belajar untuk motivasi\n`;
        response += `• Ingat pahala setiap huruf yang dibaca\n`;
        response += `• Bersabar - "fastaqimo kama umirtum"\n\n`;

        response += `**6. Tanda-Tanda Berjaya** ✅\n`;
        response += `• Boleh baca dengan lancar tanpa tersekat\n`;
        response += `• Sebutan huruf jelas dan betul\n`;
        response += `• Tidak bertukar-tukar huruf\n`;
        response += `• Yakin untuk ke halaman seterusnya\n\n`;

        response += `**🌟 Ingat:** Iqra bukan sekadar belajar membaca, tetapi membina hubungan dengan Al-Quran untuk seumur hidup!\n\n`;

        response += `Semoga Allah permudahkan pembelajaran anda! Barakallahu feek! 🤲`;

        return response;
    }

    adjustForMobile() {
        if (window.innerWidth <= 600) {
            const chatWindow = document.getElementById('chatWindow');
            if (chatWindow && this.isOpen) {
                chatWindow.style.width = 'calc(100vw - 40px)';
                chatWindow.style.height = 'calc(100vh - 140px)';
            }
        }
    }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Ustaz Radhi Chatbox: DOM loaded, initializing...');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Current pathname:', window.location.pathname);
    
    // Extract context from page URL and content
    const urlParts = window.location.pathname.split('/');
    const pageFile = urlParts[urlParts.length - 1];
    
    // Extract module and page number from URL
    let iqraModule = 1;
    let pageNumber = 1;
    let totalPages = 35;
    
    // Try to get module from URL path
    const iqraMatch = window.location.pathname.match(/iqra-(\d+)/);
    if (iqraMatch) {
        iqraModule = parseInt(iqraMatch[1]);
        console.log('📚 Detected Iqra module from URL:', iqraModule);
    }
    
    // Try to get page number from filename
    const pageMatch = pageFile.match(/page-(\d+)/);
    if (pageMatch) {
        pageNumber = parseInt(pageMatch[1]);
        console.log('📄 Detected page from filename:', pageNumber);
    }
    
    // Set total pages based on module
    const totalPagesMap = {
        1: 35, 2: 32, 3: 32, 4: 15, 5: 28, 6: 30
    };
    totalPages = totalPagesMap[iqraModule] || 35;
    
    // Get focus from page title or default
    const focus = document.title.includes('Huruf Hijaiyyah') ? 'Basic Arabic Letters' :
                  document.title.includes('Baris') ? 'Fathah and Baris' :
                  document.title.includes('Kasrah') ? 'Kasrah and Dhammah' :
                  document.title.includes('Tanwin') ? 'Tanwin and Sukun' :
                  document.title.includes('Mad') ? 'Mad and Waqaf' :
                  document.title.includes('Tajwid') ? 'Basic Tajwid Rules' :
                  'Al-Quran Reading';
    
    console.log('🎯 Final configuration:', { iqraModule, pageNumber, totalPages, focus });
    
    // Initialize chatbox
    try {
        const chatbox = new UstazRadhiIqraChatbox({
            iqraModule: iqraModule,
            pageNumber: pageNumber,
            totalPages: totalPages,
            focus: focus,
            position: 'top-right',
            autoOpen: false
        });
        
        console.log(`✅ Ustaz Radhi AI initialized successfully for Iqra ${iqraModule}, Page ${pageNumber}/${totalPages}`);
        console.log('🔗 Proxy URL configured as:', chatbox.GEMINI_CONFIG.PROXY_URL);
        
        // Make the chatbox globally accessible for debugging
        window.ustazChatbox = chatbox;
        
        // Add a test function for debugging
        window.testUstazAPI = async function(testMessage = "Hello, test message") {
            console.log('🧪 Testing Ustaz API connection...');
            try {
                const response = await chatbox.callGeminiAPI(testMessage);
                console.log('✅ API Test Success:', response);
                return response;
            } catch (error) {
                console.error('❌ API Test Failed:', error);
                return error.message;
            }
        };
        
        console.log('🧪 Use window.testUstazAPI() in console to test the API connection');
        
    } catch (initError) {
        console.error('❌ Failed to initialize Ustaz Radhi chatbox:', initError);
    }
});

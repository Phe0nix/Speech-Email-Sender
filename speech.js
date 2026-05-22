(function() {
    // DOM Elements
    const msg = document.querySelector('.main');
    const startBtn = document.querySelector('#startBtn');
    const stopBtn = document.querySelector('#stopBtn');
    const clearBtn = document.querySelector('#clearBtn');
    const instructionBtn = document.querySelector('#instructionBtn');
    const previewBtn = document.querySelector('#previewBtn');
    const instructionContainer = document.querySelector('#instructionContainer');
    const instructionClose = document.querySelector('#instructionClose');
    const previewContainer = document.querySelector('#previewContainer');
    const previewClose = document.querySelector('#previewClose');
    const defaultEmailInput = document.querySelector('#defaultEmail');
    const gmailEmailInput = document.querySelector('#gmailEmail');
    const interimDisplay = document.querySelector('#interimDisplay');
    const charCountSpan = document.querySelector('#charCount');
    const wordCountSpan = document.querySelector('#wordCount');
    const copyBtn = document.querySelector('#copyBtn');
    const undoBtn = document.querySelector('#undoBtn');
    const redoBtn = document.querySelector('#redoBtn');
    const sendEmailBtn = document.querySelector('#sendEmailBtn');
    const sendGmailBtn = document.querySelector('#sendGmailBtn');
    const statusDot = document.querySelector('.statusDot');
    const statusText = document.querySelector('.statusText');
    const notSupport = document.querySelector('.notSupport');
    const quickRefHeader = document.querySelector('.quickRefHeader');
    const quickRefContent = document.querySelector('#quickRefContent');
    const toggleQuickRef = document.querySelector('#toggleQuickRef');

    // History management
    let history = [''];
    let historyIndex = 0;
    let activeSection = 'subject';

    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        notSupport.classList.add('show');
        startBtn.disabled = true;
        return;
    }
    
    notSupport.classList.add('hide');

    let recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Commands configuration
    const textCommands = {
        'full stop': '.',
        'comma': ',',
        'exclamation sign': '!',
        'question mark': '?'
    };

    // Helper Functions
    const updateCharCount = () => {
        const text = msg.innerText;
        charCountSpan.textContent = text.length;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        wordCountSpan.textContent = text.trim().length > 0 ? words : 0;
    };

    const updateStatus = (status, statusClass) => {
        statusText.textContent = status;
        statusDot.className = `statusDot ${statusClass}`;
    };

    const saveHistory = () => {
        history = history.slice(0, historyIndex + 1);
        history.push(msg.innerHTML);
        historyIndex++;
        updateUndoRedoButtons();
    };

    const updateUndoRedoButtons = () => {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
    };

    const createTextSpan = (text) => {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
    };

    const createBreakSpan = (type) => {
        const span = document.createElement('span');
        span.dataset.break = type;
        span.innerHTML = type === 'line' ? '<p></p>' : '<br><br>';
        return span;
    };

    const normalizeSubject = (text) => {
        return text.replace(/\s+/g, ' ').trim();
    };

    const normalizeBody = (text) => {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .trim();
    };

    const renderDraft = ({ subject, body }) => {
        msg.innerHTML = '';

        const cleanSubject = normalizeSubject(subject);
        const cleanBody = normalizeBody(body);

        if (cleanSubject) {
            msg.appendChild(createTextSpan(cleanSubject));
        }

        if (!cleanBody) {
            return;
        }

        msg.appendChild(createBreakSpan('line'));

        cleanBody.split(/(\n+)/).forEach((token) => {
            if (!token) {
                return;
            }

            if (/^\n+$/.test(token)) {
                token.split('').forEach(() => {
                    msg.appendChild(createBreakSpan('paragraph'));
                });
                return;
            }

            const cleanToken = token.trim();
            if (cleanToken) {
                msg.appendChild(createTextSpan(cleanToken));
            }
        });
    };

    const setActiveSection = (section, label = null) => {
        activeSection = section;
        if (label) {
            updateStatus(label, 'ready');
        }
    };

    const appendToSection = (section, text) => {
        const cleanText = text.trim();
        if (!cleanText) {
            return;
        }

        const draft = extractSubjectAndBody();

        if (section === 'subject') {
            draft.subject = draft.subject ? `${draft.subject} ${cleanText}` : cleanText;
            draft.subject = normalizeSubject(draft.subject);
        } else {
            draft.body = draft.body
                ? (draft.body.endsWith('\n') ? `${draft.body}${cleanText}` : `${draft.body} ${cleanText}`)
                : cleanText;
            draft.body = normalizeBody(draft.body);
        }

        renderDraft(draft);
        saveHistory();
        updateCharCount();
    };

    const replaceSection = (section) => {
        const draft = extractSubjectAndBody();
        draft[section] = '';
        renderDraft(draft);
        saveHistory();
        updateCharCount();
    };

    const insertBodyBreak = (type) => {
        const draft = extractSubjectAndBody();
        setActiveSection('body');

        if (draft.body) {
            draft.body = `${draft.body}${type === 'paragraph' ? '\n\n' : '\n'}`;
            renderDraft(draft);
            saveHistory();
            updateCharCount();
        }
    };

    const deleteFromActiveSection = () => {
        const draft = extractSubjectAndBody();
        const currentText = activeSection === 'subject' ? draft.subject : draft.body;
        const trimmedText = currentText.replace(/\s+$/, '');

        if (!trimmedText) {
            return;
        }

        draft[activeSection] = trimmedText.endsWith('\n')
            ? trimmedText.replace(/\n+$/, '').trimEnd()
            : trimmedText.replace(/\s*\S+$/, '').trimEnd();

        if (activeSection === 'subject') {
            draft.subject = normalizeSubject(draft.subject);
        } else {
            draft.body = normalizeBody(draft.body);
        }

        renderDraft(draft);
        saveHistory();
        updateCharCount();
    };

    const copyToClipboard = () => {
        const text = msg.innerText;
        if (text.trim() === '') {
            alert('Nothing to copy! Please record some text first.');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            alert('Failed to copy. Please try again.');
        });
    };

    const undo = () => {
        if (historyIndex > 0) {
            historyIndex--;
            msg.innerHTML = history[historyIndex];
            updateUndoRedoButtons();
            updateCharCount();
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            msg.innerHTML = history[historyIndex];
            updateUndoRedoButtons();
            updateCharCount();
        }
    };

    const extractSubjectAndBody = () => {
        const spans = Array.from(document.querySelectorAll('.main span'));
        const breakIndex = spans.findIndex((span) => span.dataset.break === 'line');

        const toPlainText = (items) => {
            return items.map((item) => {
                if (item.dataset.break === 'paragraph') {
                    return '\n';
                }

                if (item.dataset.break === 'line') {
                    return '\n';
                }

                return item.textContent;
            }).join(' ').replace(/\s*\n\s*/g, '\n').trim();
        };

        if (breakIndex === -1) {
            return {
                subject: normalizeSubject(toPlainText(spans)),
                body: ''
            };
        }

        return {
            subject: normalizeSubject(toPlainText(spans.slice(0, breakIndex))),
            body: normalizeBody(toPlainText(spans.slice(breakIndex + 1)))
        };
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const showEmailPreview = (recipient) => {
        if (msg.innerText.trim() === '') {
            alert('No text to preview! Please record some content first.');
            return;
        }

        if (!isValidEmail(recipient)) {
            alert('Invalid recipient email: ' + recipient);
            return;
        }

        const { subject, body } = extractSubjectAndBody();
        
        document.querySelector('#previewTo').value = recipient;
        document.querySelector('#previewSubject').textContent = subject || '(No subject)';
        document.querySelector('#previewBody').textContent = body || '(No body)';
        
        previewContainer.classList.remove('hide');
        previewContainer.classList.add('show');
        previewClose.focus();
    };

    const sendEmail = (recipient = defaultEmailInput.value || 'name@domain.com', isGmail = false) => {
        if (msg.innerText.trim() === '') {
            alert('No text to send! Please record your message first.');
            return;
        }

        if (!isValidEmail(recipient)) {
            alert('Invalid email address: ' + recipient + '\nPlease update the email address.');
            return;
        }

        const { subject, body } = extractSubjectAndBody();
        
        try {
            if (isGmail) {
                window.open(
                    `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
                    '_blank'
                );
            } else {
                window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        } catch (err) {
            alert('Error opening email client. Please check your email address.');
        }
    };

    // Speech Recognition Event Handlers
    recognition.onstart = () => {
        updateStatus('🎤 Listening...', 'listening');
        startBtn.classList.add('disable');
        stopBtn.classList.remove('disable');
    };

    recognition.onresult = (e) => {
        let interimTranscript = '';
        
        for (let i = e.resultIndex; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript;
            
            if (e.results[i].isFinal) {
                let span = document.createElement('span');
                let transcriptLower = transcript.toLowerCase().trim();
                
                // Process text replacements
                let processedText = transcript;
                
                Object.entries(textCommands).forEach(([command, replacement]) => {
                    processedText = processedText.replace(new RegExp(command, 'gi'), replacement);
                });
                
                span.textContent = processedText;
                
                // Handle special commands
                if (transcriptLower.includes('replace subject')) {
                    replaceSection('subject');
                    setActiveSection('subject', '✏️ Replacing subject');
                    return;
                } else if (transcriptLower.includes('replace body')) {
                    replaceSection('body');
                    setActiveSection('body', '✏️ Replacing body');
                    return;
                } else if (transcriptLower.includes('subject mode')) {
                    setActiveSection('subject', '✏️ Subject mode');
                    return;
                } else if (transcriptLower.includes('body mode')) {
                    setActiveSection('body', '✏️ Body mode');
                    return;
                } else if (transcriptLower.includes('line break')) {
                    insertBodyBreak('line');
                    updateStatus('✏️ Body mode', 'ready');
                    return;
                } else if (transcriptLower.includes('paragraph break')) {
                    insertBodyBreak('paragraph');
                    updateStatus('✏️ Body paragraph', 'ready');
                    return;
                } else if (transcriptLower.includes('delete now')) {
                    deleteFromActiveSection();
                    return;
                } else if (transcriptLower.includes('send email')) {
                    sendEmail(defaultEmailInput.value || 'name@domain.com', false);
                    return;
                } else if (transcriptLower.includes('send gmail')) {
                    sendEmail(gmailEmailInput.value || 'someone@gmail.com', true);
                    return;
                } else {
                    appendToSection(activeSection, processedText);
                    return;
                }
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Show interim results
        if (interimTranscript) {
            interimDisplay.textContent = '🔤 ' + interimTranscript;
            interimDisplay.classList.add('active');
        } else {
            interimDisplay.classList.remove('active');
        }
    };

    recognition.onend = () => {
        updateStatus('✓ Ready', 'ready');
        startBtn.classList.remove('disable');
        stopBtn.classList.add('disable');
        interimDisplay.classList.remove('active');
    };

    recognition.onerror = (e) => {
        switch(e.error) {
            case 'no-speech':
                updateStatus('⚠️ No speech detected', 'ready');
                alert('No speech detected. Please try again.');
                break;
            case 'audio-capture':
                alert('No microphone found. Please check your microphone connection.');
                updateStatus('❌ No microphone', 'ready');
                break;
            case 'network':
                alert('Network error. Please check your internet connection.');
                updateStatus('❌ Network error', 'ready');
                break;
            case 'permission-denied':
                alert('Microphone permission denied. Please enable microphone access.');
                updateStatus('❌ Permission denied', 'ready');
                break;
            default:
                if (e.error !== 'aborted') {
                    alert(`Error: ${e.error}. Please try again.`);
                    updateStatus('❌ Error: ' + e.error, 'ready');
                }
        }
        startBtn.classList.remove('disable');
        stopBtn.classList.add('disable');
    };

    // Button Event Listeners
    startBtn.addEventListener('click', () => {
        recognition.start();
    });

    stopBtn.addEventListener('click', () => {
        recognition.stop();
    });

    clearBtn.addEventListener('click', () => {
        if (msg.innerText.trim() !== '') {
            if (confirm('Are you sure you want to clear all text?')) {
                msg.innerHTML = '';
                history = [''];
                historyIndex = 0;
                updateCharCount();
                updateUndoRedoButtons();
            }
        }
    });

    copyBtn.addEventListener('click', copyToClipboard);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    sendEmailBtn.addEventListener('click', () => {
        showEmailPreview(defaultEmailInput.value || 'name@domain.com');
    });

    sendGmailBtn.addEventListener('click', () => {
        showEmailPreview(gmailEmailInput.value || 'someone@gmail.com');
    });

    // Instructions Modal
    instructionBtn.addEventListener('click', () => {
        instructionContainer.classList.remove('hide');
        instructionContainer.classList.add('show');
        instructionClose.focus();
    });

    instructionClose.addEventListener('click', () => {
        instructionContainer.classList.add('hide');
        instructionContainer.classList.remove('show');
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (instructionContainer.classList.contains('show')) {
                instructionContainer.classList.add('hide');
                instructionContainer.classList.remove('show');
            }
            if (previewContainer.classList.contains('show')) {
                previewContainer.classList.add('hide');
                previewContainer.classList.remove('show');
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === msg) {
            // Allow default copy behavior
        }
    });

    // Preview Modal
    previewBtn.addEventListener('click', () => {
        showEmailPreview(defaultEmailInput.value || 'name@domain.com');
    });

    previewClose.addEventListener('click', () => {
        previewContainer.classList.add('hide');
        previewContainer.classList.remove('show');
        previewBtn.focus();
    });

    document.querySelector('#previewConfirm').addEventListener('click', () => {
        const recipient = document.querySelector('#previewTo').value;
        previewContainer.classList.add('hide');
        previewContainer.classList.remove('show');
        sendEmail(recipient, recipient.includes('gmail.com'));
    });

    document.querySelector('#previewCancel').addEventListener('click', () => {
        previewContainer.classList.add('hide');
        previewContainer.classList.remove('show');
        previewBtn.focus();
    });

    // Quick Reference Toggle
    quickRefHeader.addEventListener('click', () => {
        quickRefContent.classList.toggle('collapsed');
        toggleQuickRef.textContent = quickRefContent.classList.contains('collapsed') ? '+' : '−';
    });

    // Click outside modals to close
    instructionContainer.addEventListener('click', (e) => {
        if (e.target === instructionContainer) {
            instructionContainer.classList.add('hide');
            instructionContainer.classList.remove('show');
        }
    });

    previewContainer.addEventListener('click', (e) => {
        if (e.target === previewContainer) {
            previewContainer.classList.add('hide');
            previewContainer.classList.remove('show');
        }
    });

    // Initialize
    updateStatus('✓ Ready', 'ready');
    updateUndoRedoButtons();
})();

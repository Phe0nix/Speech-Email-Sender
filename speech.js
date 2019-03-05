!(function() {
    var speech = document.querySelector('.speech'),
        startBtn = document.querySelector('.start'),
        stopBtn = document.querySelector('.stop'),
        msg = document.querySelector('.main'),
        status = document.querySelector('.statusBar'),
        //email = document.querySelector('.email'),
        instructionBtn = document.querySelector('.instructionBtn'),
        close = document.querySelector('.instructionClose'),
        small = document.querySelector('.smallText'),
        marked = document.querySelectorAll('.markText'),
        clearText = document.querySelector('.clear'),
        notSupport = document.querySelector('.notSupport');

    (window.SpeechRecognition || window.webkitSpeechRecognition) ? ((window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition), notSupport.classList.add('hide')) : notSupport.classList.add('show');

    var recognition = new SpeechRecognition();
    recognition.interimResults = true;
    //recognition.continuous = false;
    //recognition.maxAlternatives = 10;

    recognition.onresult = (e) => {
        var colors = ['green', 'purple', 'yellow', 'white', 'tomato', 'tan', 'thistle', 'wheat', 'lime'];
        //console.log(e.results[0][0].transcript);
        if (e.results[0].isFinal) {
            var span = document.createElement('span'),
                span2 = document.createElement('p');
            span.innerHTML = span2.innerHTML = e.results[0][0].transcript;
            if (span.innerHTML.includes('open alert')) {
                alert('alert box open!');
            }
            if (span.innerHTML.includes('line break')) {
                span.innerHTML = '<p></p>';
                console.log(span.innerHTML);
            }
            if (span.innerHTML.includes('paragraph break')) {
                span.innerHTML = '<br><br>';
                console.log(span.innerHTML);
            }
            if (span.innerHTML.includes('full stop')) {
                span.innerHTML = span.innerHTML.replace(/(full stop)/g, '. ');
            }

            if (span.innerHTML.includes('comma')) {
                span.innerHTML = ', ';
            }
            if (span.innerHTML.includes('exclamation sign')) {
                span.innerHTML = span.innerHTML.replace(/(exclamation sign)/g, '! ');
            }

            colors.map(d => {
                var f = span.innerHTML;
                if (f.toLowerCase().trim() === d) {
                    document.body.style.background = d;
                } else {
                    console.log('no match!');
                }
            });

            var sendEmail = () => {
                if (msg.innerText === '') {
                    alert('No text is there for sending email!\nPlease click \'Start\' button to speak.\nYou\'re great. You can do it. Just Yell !');
                } else {
                    var dam = Array.from(document.querySelectorAll('.main span')),
                        p1, p2, index, subject, body;

                    dam.map((d, i) => {
                        if (d.innerHTML === '<p></p>') {
                            index = i;
                        }
                        p1 = dam.slice(0, index), p2 = dam.slice(index + 1, dam.length);

                        subject = p1.map(d => d.innerHTML);
                        body = p2.map(d => d.innerHTML);
                    });
                    window.open('mailto:name@domain.com?subject=' + subject.join(' ') + '&body=' + body.join(' ').replace(/(<br><br>)/g, '%0D'), '_self');
                }
            }

            var sendGmail = () => {
                if (msg.innerText === '') {
                    alert('No text is there for sending email!\nPlease click \'Start\' button to speak.\nYou\'re great. You can do it. Just Yell !');
                } else {
                    var dam = Array.from(document.querySelectorAll('.main span')),
                        p1, p2, index, subject, body;

                    dam.map((d, i) => {
                        if (d.innerHTML === '<p></p>') {
                            index = i;
                        }
                        p1 = dam.slice(0, index), p2 = dam.slice(index + 1, dam.length);

                        subject = p1.map(d => d.innerHTML);
                        body = p2.map(d => d.innerHTML);
                    });
                    window.open('https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=someone@gmail.com&su=' + subject.join(' ') + '&body=' + body.join(' ').replace(/(<br><br>)/g, '%0D') + '&cc=cc@mail.com&bcc=bcc@mail.com', '_blank');
                }
            }

            //email.onclick = sendEmail;

            if (span2.innerHTML.includes('delete now')) {
                var g = Array.from(document.querySelectorAll('.main span'));
                var f = g.splice(this.length - 1, 2);
                msg.innerHTML = '';
                g.map(d => {
                    (d.innerHTML === '') ? console.log(d): msg.appendChild(d)
                });
            } else if (span2.innerHTML.includes('send email')) {
                sendEmail();
            } else if (span2.innerHTML.includes('send Gmail')) {
                sendGmail();
            } else {
                msg.appendChild(span);
            }
        }
    }

    recognition.onend = () => {
        stopBtn.classList.contains('speechEnd') ? recognition.stop() : recognition.start();
    }

    recognition.onnomatch = () => {
        console.log('Not Match!! Louder');
    }

    startBtn.onclick = () => {
        recognition.start();
        speech.innerHTML = '';
        startBtn.classList.add('disable');
        startBtn.tabIndex = '-1';
        stopBtn.classList.remove('speechEnd');
    }

    stopBtn.onclick = () => {
        recognition.stop();
        speech.innerHTML = '( Click start button & talk )';
        startBtn.classList.remove('disable');
        startBtn.tabIndex = '0';
        stopBtn.classList.add('speechEnd');
    }

    clearText.onclick = () => msg.innerHTML = '';

    recognition.onspeechstart = () => {
        console.log('speech start');
        status.classList.add('statusActive');
    }

    recognition.onspeechend = () => {
        console.log('speech start');
        status.classList.remove('statusActive');
    }

    recognition.onaudiostart = () => {
        console.log('audio start');
    }

    small.onmouseover = () => {
        Array.from(marked).map(d => d.style.outline = '2px solid red')
    }
    small.onmouseout = () => {
        Array.from(marked).map(d => d.style.outline = '0')
    }

    instructionBtn.onclick = () => {
        document.querySelector('.instructionContainer').classList.add('show');
        document.querySelector('.instructionContainer').classList.remove('hide');
        close.tabIndex = 0;
    }

    close.onclick = () => {
        document.querySelector('.instructionContainer').classList.add('hide');
        document.querySelector('.instructionContainer').classList.remove('show');
        close.tabIndex = -1;
    }
})();

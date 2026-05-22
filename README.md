# Speech-Email-Sender

Send emails with speech recognition using the Web Speech API. Speak naturally, format your draft with voice commands, preview it, then send through your default mail app or Gmail.

## Demo

[Speech Email Sender](https://phe0nix.github.io/Speech-Email-Sender/)

## Latest Features

- Modern responsive UI with improved layout and accessibility
- Real-time interim speech transcript while dictating
- Subject/body-aware draft parsing
- Subject and body edit mode commands
- Replace subject or replace body by voice
- Undo and redo controls
- Copy draft to clipboard
- Email preview modal before sending
- Send using default mail client or Gmail compose URL
- Character and word count

## Voice Commands

### Punctuation and Text

| Action | Command |
| --- | --- |
| Comma (,) | `comma` |
| Full stop (.) | `full stop` |
| Exclamation (!) | `exclamation sign` |
| Question mark (?) | `question mark` |
| Delete last word in active section | `delete now` |

### Draft Structure

| Action | Command |
| --- | --- |
| Switch from subject to body | `line break` |
| Add paragraph break in body | `paragraph break` |

### Subject/Body Edit Mode

| Action | Command |
| --- | --- |
| Start dictating into subject | `subject mode` |
| Start dictating into body | `body mode` |
| Clear and re-dictate subject | `replace subject` |
| Clear and re-dictate body | `replace body` |

### Send Actions

| Action | Command |
| --- | --- |
| Open default mail app/client compose | `send email` |
| Open Gmail compose | `send gmail` |

## How To Use

1. Open the app in a supported browser (Chrome/Edge/Safari recommended).
2. Click `Start Listening` and allow microphone access.
3. Dictate your subject.
4. Say `line break` to move into body content.
5. Use edit commands (`subject mode`, `body mode`, `replace subject`, `replace body`) whenever needed.
6. Use `Preview Email` or voice send commands (`send email` / `send gmail`).

## Notes

- This project is a Web Speech API demo/practice app.
- Speech recognition quality depends on browser support, microphone quality, and background noise.

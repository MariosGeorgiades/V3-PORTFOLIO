/*
    M.A.R.I.O.S. AI Logic
    (Machine Automated Response & Intelligent Operating System)
*/

(function ($) {

    var $widget = $('#ai-widget'),
        $toggle = $('#ai-toggle'),
        $chatWindow = $('#ai-chat-window'),
        $close = $('#ai-close'),
        $messages = $('#ai-messages'),
        $input = $('#ai-input'),
        $send = $('#ai-send');

    // Knowledge Base
    var knowledge = {
        'greetings': {
            keywords: ['hi', 'hello', 'hey', 'greetings', 'hola', 'yo'],
            responses: [] // Dynamic response handled in processInput
        },
        'who': {
            keywords: ['who', 'name', 'marios', 'bio', 'about'],
            responses: [
                "Marios Georgiades is a high school student from Strovolos, Lefkosia. He is a coder, gamer, and fitness enthusiast.",
                "Target identified: Marios Georgiades. Aspiring software engineer, competitive programmer, and athlete."
            ]
        },
        'skills': {
            keywords: ['skills', 'stack', 'tech', 'languages', 'code', 'programming'],
            responses: [
                "Marios is proficient in: C++, Python, JavaScript, HTML/CSS. He also has networking skills (CCNA).",
                "Detected skills: Algorithms, Data Structures, Web Development, and Network Engineering."
            ]
        },
        'projects': {
            keywords: ['projects', 'work', 'portfolio', 'github', 'app', 'game'],
            responses: [
                "Key projects include: Competitive Programming solutions, Apology App, Quota, Football Pong, and the Snake Game.",
                "Accessing project database... Found: Apology App, Quota, and various game implementations. Check the main page for details."
            ]
        },
        'contact': {
            keywords: ['contact', 'email', 'reach', 'social', 'linkedin'],
            responses: [
                "You can contact Marios via the social links in the footer, or find him on GitHub.",
                "Communication channels: GitHub, LinkedIn. See the footer for secure uplinks."
            ]
        },
        'joke': {
            keywords: ['joke', 'funny', 'laugh'],
            responses: [
                "Why do programmers prefer dark mode? Because light attracts bugs.",
                "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
                "I would tell you a UDP joke, but you might not get it."
            ]
        },
        'cyberpunk': {
            keywords: ['cyberpunk', 'neon', 'theme', 'design'],
            responses: [
                "I am running on the latest Cyberpunk aesthetics protocol. Do you like the neon?",
                "System visual interface: OPTIMIZED. Neon levels: MAXIMUM."
            ]
        },
        'time': {
            keywords: ['time', 'clock', 'hour'],
            action: 'getTime'
        },
        'date': {
            keywords: ['date', 'day', 'today'],
            action: 'getDate'
        },
        'weather': {
            keywords: ['weather', 'temp', 'temperature', 'forecast'],
            action: 'getWeather'
        },
        'quote': {
            keywords: ['quote', 'inspire', 'motivation'],
            action: 'getQuote'
        },
        'briefing': {
            keywords: ['briefing', 'status', 'report', 'daily'],
            action: 'getBriefing'
        },
        'default': {
            responses: [
                "Command not recognized. Try 'daily briefing', 'weather', 'time', or ask about Marios.",
                "I am limited to specific queries. Please rephrase.",
                "Input unclear. Accessing help files... Try 'who is marios' or 'contact info'."
            ]
        }
    };

    // Toggle Chat
    $toggle.on('click', function () {
        $chatWindow.toggleClass('hidden');
        if (!$chatWindow.hasClass('hidden')) {
            $input.focus();
        }
    });

    $close.on('click', function () {
        $chatWindow.addClass('hidden');
    });

    // Send Message
    function sendMessage() {
        var text = $input.val().trim();
        if (text === "") return;

        // Add User Message
        addMessage(text, 'user');
        $input.val('');

        // Process Response
        processInput(text);
    }

    $send.on('click', sendMessage);
    $input.on('keypress', function (e) {
        if (e.which === 13) sendMessage();
    });

    function addMessage(text, sender) {
        var $msg = $('<div class="message ' + sender + '"><p>' + text + '</p></div>');
        $messages.append($msg);
        $messages.scrollTop($messages[0].scrollHeight);
    }

    function showTyping() {
        var $typing = $('<div class="message system typing"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>');
        $messages.append($typing);
        $messages.scrollTop($messages[0].scrollHeight);
        return $typing;
    }

    async function processInput(text) {
        var lowerText = text.toLowerCase();
        var response = null;
        var action = null;

        // Check keywords
        for (var key in knowledge) {
            if (key === 'default') continue;
            var topic = knowledge[key];
            for (var i = 0; i < topic.keywords.length; i++) {
                if (lowerText.includes(topic.keywords[i])) {
                    if (topic.action) {
                        action = topic.action;
                    } else if (key === 'greetings') {
                        response = getGreeting();
                    } else {
                        var possibleResponses = topic.responses;
                        response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
                    }
                    break;
                }
            }
            if (response || action) break;
        }

        // Default response
        if (!response && !action) {
            var defaults = knowledge['default'].responses;
            response = defaults[Math.floor(Math.random() * defaults.length)];
        }

        // Simulate typing delay
        var $typing = showTyping();

        if (action) {
            response = await executeAction(action);
        }

        setTimeout(function () {
            $typing.remove();
            addMessage(response, 'system');
        }, 1000 + Math.random() * 500);
    }

    function getGreeting() {
        var hour = new Date().getHours();
        if (hour < 12) return "Good morning! Systems operational.";
        if (hour < 18) return "Good afternoon. How can I assist?";
        return "Good evening. Cyberpunk city never sleeps.";
    }

    async function executeAction(action) {
        switch (action) {
            case 'getTime':
                return "Current System Time: " + new Date().toLocaleTimeString();
            case 'getDate':
                return "Current Date: " + new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'getWeather':
                return await fetchWeather();
            case 'getQuote':
                return await fetchQuote();
            case 'getBriefing':
                var time = new Date().toLocaleTimeString();
                var date = new Date().toLocaleDateString();
                var weather = await fetchWeather();
                var quote = await fetchQuote();
                return `Daily Briefing:<br>Time: ${time}<br>Date: ${date}<br>Weather: ${weather}<br><br>Quote of the day:<br>"${quote}"`;
            default:
                return "Error: Action not found.";
        }
    }

    async function fetchWeather() {
        try {
            // Nicosia coordinates: 35.1856, 33.3823
            var res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.1856&longitude=33.3823&current=temperature_2m,weather_code');
            var data = await res.json();
            var temp = data.current.temperature_2m;
            var code = data.current.weather_code;
            var condition = getWeatherCondition(code);
            return `${condition}, ${temp}°C in Nicosia.`;
        } catch (e) {
            return "Unable to fetch weather data. Atmosphere interference detected.";
        }
    }

    function getWeatherCondition(code) {
        if (code === 0) return "Clear sky";
        if (code < 3) return "Partly cloudy";
        if (code < 50) return "Foggy";
        if (code < 60) return "Drizzle";
        if (code < 80) return "Rain";
        if (code < 95) return "Snow";
        return "Thunderstorm";
    }

    async function fetchQuote() {
        try {
            var res = await fetch('https://api.quotable.io/random?maxLength=100');
            var data = await res.json();
            return `${data.content} - ${data.author}`;
        } catch (e) {
            return "The only true wisdom is in knowing you know nothing. - Socrates";
        }
    }

})(jQuery);

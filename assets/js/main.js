/*
    Marios Georgiades — Portfolio main.js
    - Top nav: scroll state, smooth scroll, mobile toggle, scroll-spy
    - Hero: typed-role effect
    - Reveal on scroll
    - Project card mouse-follow glow
    - FX (motion) toggle, copyright year
    - Konami code -> hidden terminal
*/
(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// ---------- Page ready ----------
	function ready(fn) {
		if (document.readyState !== 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	}

	ready(function () {
		document.body.classList.remove('is-preload');
		initBootSplash();
		initNav();
		initSmoothScroll();
		initScrollSpy();
		initHeroTyped();
		initReveal();
		initProjectCardGlow();
		initFXToggle();
		initCopyrightYear();
		initKonami();
	});

	// ---------- Nav ----------
	function initNav() {
		var nav = document.getElementById('topnav');
		var toggle = document.querySelector('.nav-toggle');
		var list = document.getElementById('nav-list');
		if (!nav) return;

		var setScrolled = function () {
			if (window.scrollY > 12) nav.classList.add('scrolled');
			else nav.classList.remove('scrolled');
		};
		setScrolled();
		window.addEventListener('scroll', setScrolled, { passive: true });

		if (toggle && list) {
			toggle.addEventListener('click', function () {
				var open = list.classList.toggle('open');
				toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
			list.querySelectorAll('a').forEach(function (a) {
				a.addEventListener('click', function () {
					list.classList.remove('open');
					toggle.setAttribute('aria-expanded', 'false');
				});
			});
		}
	}

	// ---------- Smooth scroll for in-page anchors ----------
	function initSmoothScroll() {
		document.querySelectorAll('a[href^="#"]').forEach(function (a) {
			a.addEventListener('click', function (e) {
				var id = a.getAttribute('href');
				if (!id || id === '#') return;
				var target = document.querySelector(id);
				if (!target) return;
				e.preventDefault();
				target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
				history.replaceState(null, '', id);
			});
		});
	}

	// ---------- Scroll spy ----------
	function initScrollSpy() {
		var links = document.querySelectorAll('#nav-list a[href^="#"]');
		if (!links.length || typeof IntersectionObserver === 'undefined') return;
		var map = {};
		links.forEach(function (a) {
			var id = a.getAttribute('href').slice(1);
			if (id) map[id] = a;
		});
		var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					links.forEach(function (l) { l.classList.remove('is-active'); });
					if (map[entry.target.id]) map[entry.target.id].classList.add('is-active');
				}
			});
		}, { rootMargin: '-45% 0% -50% 0%' });
		sections.forEach(function (s) { io.observe(s); });
	}

	// ---------- Hero typed effect ----------
	function initHeroTyped() {
		var el = document.getElementById('hero-typed');
		if (!el) return;
		var roles = [
			'Software engineer in training.',
			'Linux homelabber.',
			'Local-LLM tinkerer.',
			'Competitive programmer.',
			'Ultramarathoner.'
		];
		if (prefersReducedMotion) {
			el.textContent = roles[0];
			return;
		}
		var i = 0, j = 0, deleting = false;
		(function tick() {
			var word = roles[i];
			el.textContent = word.slice(0, j);
			if (!deleting && j < word.length) {
				j++; setTimeout(tick, 55);
			} else if (!deleting && j === word.length) {
				deleting = true; setTimeout(tick, 1600);
			} else if (deleting && j > 0) {
				j--; setTimeout(tick, 25);
			} else {
				deleting = false; i = (i + 1) % roles.length; setTimeout(tick, 280);
			}
		})();
	}

	// ---------- Reveal on scroll ----------
	function initReveal() {
		var targets = document.querySelectorAll('.section, .project-card, .skill-cluster, .endurance-card, .cert-card, .stat');
		if (!targets.length || prefersReducedMotion) {
			targets.forEach(function (t) { t.classList.add('reveal', 'is-visible'); });
			return;
		}
		if (typeof IntersectionObserver === 'undefined') {
			targets.forEach(function (t) { t.classList.add('reveal', 'is-visible'); });
			return;
		}
		targets.forEach(function (t) { t.classList.add('reveal'); });
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.08 });
		targets.forEach(function (t) { io.observe(t); });
	}

	// ---------- Project card mouse-follow glow ----------
	function initProjectCardGlow() {
		if (prefersReducedMotion) return;
		document.querySelectorAll('.project-card').forEach(function (card) {
			card.addEventListener('mousemove', function (e) {
				var r = card.getBoundingClientRect();
				card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
				card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
			});
		});
	}

	// ---------- FX toggle (canvas + scanlines) ----------
	function initFXToggle() {
		var btn = document.getElementById('motion-toggle');
		if (!btn) return;
		var stored = null;
		try { stored = localStorage.getItem('mg-fx'); } catch (e) {}
		if (stored === 'off' || prefersReducedMotion) {
			document.body.classList.add('no-fx');
			btn.innerHTML = '<i class="fa-solid fa-wave-square" aria-hidden="true"></i> FX off';
		}
		btn.addEventListener('click', function () {
			var off = document.body.classList.toggle('no-fx');
			btn.innerHTML = '<i class="fa-solid fa-wave-square" aria-hidden="true"></i> FX ' + (off ? 'off' : 'on');
			try { localStorage.setItem('mg-fx', off ? 'off' : 'on'); } catch (e) {}
		});
	}

	// ---------- Copyright year ----------
	function initCopyrightYear() {
		var el = document.getElementById('copyright-year');
		if (el) el.textContent = new Date().getFullYear();
	}

	// ---------- Konami terminal ----------
	function initKonami() {
		var terminal = document.getElementById('hidden-terminal');
		if (!terminal) return;
		var body = terminal.querySelector('.terminal-body');
		var closeBtn = terminal.querySelector('.terminal-close');
		var konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
		var idx = 0;
		var open = false;
		var inputBuf = '';
		var inputLine = null;

		function openTerm() {
			if (open) return;
			open = true;
			terminal.classList.remove('hidden');
			terminal.setAttribute('aria-hidden', 'false');
			createInputLine();
		}
		function closeTerm() {
			if (!open) return;
			open = false;
			terminal.classList.add('hidden');
			terminal.setAttribute('aria-hidden', 'true');
			if (inputLine) { inputLine.remove(); inputLine = null; }
		}
		function createInputLine() {
			if (inputLine) inputLine.remove();
			inputLine = document.createElement('p');
			inputLine.className = 'terminal-input-line';
			inputLine.innerHTML = 'C:\\Users\\Guest&gt; <span class="input-text"></span><span class="cursor"></span>';
			body.appendChild(inputLine);
			body.scrollTop = body.scrollHeight;
			inputBuf = '';
		}
		function process(cmd) {
			cmd = cmd.trim().toLowerCase();
			var out = '';
			switch (cmd) {
				case 'help':     out = "Available: about, projects, skills, contact, clear, exit"; break;
				case 'about':    out = "Marios Georgiades — high-school dev, ultramarathoner. Strovolos, Nicosia."; break;
				case 'projects': out = "Featured: Home Linux Server, Local AI & LLMs, Scout Journey. Plus 6 more on GitHub."; break;
				case 'skills':   out = "C++, Python, JS, Linux, Docker, Networks (CCNA), local LLMs."; break;
				case 'contact':  out = "GitHub: github.com/MariosGeorgiades  |  scroll to the contact section."; break;
				case 'exit':     closeTerm(); return;
				case 'clear':    body.querySelectorAll('p').forEach(function (p, i) { if (i > 11) p.remove(); }); createInputLine(); return;
				case '':         break;
				default:         out = "'" + cmd + "' is not a recognized command. Try 'help'.";
			}
			if (out) {
				var p = document.createElement('p');
				p.textContent = out;
				body.insertBefore(p, inputLine);
			}
			body.scrollTop = body.scrollHeight;
		}

		document.addEventListener('keydown', function (e) {
			if (open) {
				if (e.key === 'Escape') { closeTerm(); return; }
				if (e.key === 'Enter') {
					process(inputBuf);
					if (open) createInputLine();
					return;
				}
				if (e.key === 'Backspace') {
					inputBuf = inputBuf.slice(0, -1);
					if (inputLine) inputLine.querySelector('.input-text').textContent = inputBuf;
					return;
				}
				if (e.key.length === 1) {
					inputBuf += e.key;
					if (inputLine) inputLine.querySelector('.input-text').textContent = inputBuf;
					return;
				}
				return;
			}
			if (e.key === konami[idx]) {
				idx++;
				if (idx === konami.length) { idx = 0; openTerm(); }
			} else {
				idx = (e.key === konami[0]) ? 1 : 0;
			}
		});

		if (closeBtn) closeBtn.addEventListener('click', closeTerm);
	}


	// ---------- Boot splash ----------
	function initBootSplash() {
		var splash = document.getElementById('boot-splash');
		if (!splash) { document.body.classList.remove('booting'); return; }

		var seen = false;
		try { seen = sessionStorage.getItem('mg-booted') === '1'; } catch (e) {}

		if (seen || prefersReducedMotion) {
			splash.classList.add('boot-skip');
			document.body.classList.remove('booting');
			return;
		}

		var dismissed = false;
		function dismiss() {
			if (dismissed) return;
			dismissed = true;
			try { sessionStorage.setItem('mg-booted', '1'); } catch (e) {}
			splash.classList.add('boot-out');
			document.body.classList.remove('booting');
			window.setTimeout(function () { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 520);
			document.removeEventListener('keydown', dismiss);
			splash.removeEventListener('click', dismiss);
			splash.removeEventListener('touchstart', dismissTouch);
		}
		function dismissTouch(e) { dismiss(); }

		document.addEventListener('keydown', dismiss);
		splash.addEventListener('click', dismiss);
		splash.addEventListener('touchstart', dismissTouch, { passive: true });

		// Auto-dismiss
		window.setTimeout(dismiss, 1700);
	}

})();

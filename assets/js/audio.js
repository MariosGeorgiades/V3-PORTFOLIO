/*
    Cyberpunk audio system (Web Audio API)
    - Defaults to MUTED (better first-load UX for recruiters/embedded views)
    - Lazy-initializes AudioContext on first user gesture (avoids warnings)
    - Hover blip + click confirmation only on .btn / nav links / project cards
*/
var AudioSys = (function () {
	var ctx = null;
	var masterGain = null;
	var isMuted = true;
	var initialized = false;

	function ensureCtx() {
		if (ctx) return ctx;
		try {
			ctx = new (window.AudioContext || window.webkitAudioContext)();
			masterGain = ctx.createGain();
			masterGain.connect(ctx.destination);
			masterGain.gain.value = 0.08;
		} catch (e) { ctx = null; }
		return ctx;
	}

	function playTone(freq, type, duration, vol) {
		if (isMuted) return;
		var c = ensureCtx();
		if (!c) return;
		if (c.state === 'suspended') c.resume();
		var osc = c.createOscillator();
		var g = c.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, c.currentTime);
		g.gain.setValueAtTime(vol, c.currentTime);
		g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
		osc.connect(g);
		g.connect(masterGain);
		osc.start();
		osc.stop(c.currentTime + duration);
	}

	function hoverSound() { playTone(880, 'sine', 0.05, 0.4); }
	function clickSound() { playTone(420, 'square', 0.08, 0.5); playTone(220, 'sawtooth', 0.12, 0.4); }

	function setMuted(next) {
		isMuted = !!next;
		var btn = document.getElementById('mute-toggle');
		if (btn) {
			if (isMuted) {
				btn.innerHTML = '<i class="fa-solid fa-volume-xmark" aria-hidden="true"></i> Sound off';
			} else {
				btn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> Sound on';
				clickSound();
			}
		}
		try { localStorage.setItem('mg-sound', isMuted ? 'off' : 'on'); } catch (e) {}
	}

	function toggleMute() { setMuted(!isMuted); }

	function init() {
		if (initialized) return;
		initialized = true;

		var stored = null;
		try { stored = localStorage.getItem('mg-sound'); } catch (e) {}
		isMuted = (stored !== 'on');

		var btn = document.getElementById('mute-toggle');
		if (btn) {
			if (isMuted) {
				btn.innerHTML = '<i class="fa-solid fa-volume-xmark" aria-hidden="true"></i> Sound off';
			} else {
				btn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> Sound on';
			}
			btn.addEventListener('click', function (e) { e.stopImmediatePropagation(); toggleMute(); });
		}

		// Limit interactables so hover sounds aren't constant.
		var hoverTargets = document.querySelectorAll('.btn, #nav-list a, .project-card, .icons a, #ai-toggle');
		hoverTargets.forEach(function (el) {
			el.addEventListener('mouseenter', hoverSound);
			el.addEventListener('click', clickSound);
		});
	}

	if (document.readyState !== 'loading') init();
	else document.addEventListener('DOMContentLoaded', init);

	return { playHover: hoverSound, playClick: clickSound, setMuted: setMuted };
})();

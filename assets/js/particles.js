/*
    Particle network background.
    - Honors prefers-reduced-motion (no-op).
    - Pauses when tab hidden or body.no-fx.
*/
(function () {
	var canvas = document.getElementById('bg-canvas');
	if (!canvas || !canvas.getContext) return;
	if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	// Skip on phones (saves battery, fixes scroll jank)
	if (window.matchMedia && (window.matchMedia('(max-width: 640px)').matches || window.matchMedia('(hover: none) and (pointer: coarse)').matches)) {
		canvas.style.display = 'none';
		return;
	}

	var ctx = canvas.getContext('2d');
	var width, height;
	var particles = [];
	var mouse = { x: null, y: null };
	var rafId = null;

	var connectionDistance = 140;
	var mouseDistance = 180;
	var particleSpeed = 0.4;
	var colors = ['#39ff14', '#ff2bd6', '#00f0ff'];

	function resize() {
		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		width  = canvas.width  = window.innerWidth  * dpr;
		height = canvas.height = window.innerHeight * dpr;
		canvas.style.width  = window.innerWidth  + 'px';
		canvas.style.height = window.innerHeight + 'px';
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(1, 1);
		init();
	}
	function init() {
		particles = [];
		var w = canvas.clientWidth, h = canvas.clientHeight;
		var density = (w < 768) ? 32000 : 20000;
		var n = Math.max(30, Math.floor((w * h) / density));
		for (var i = 0; i < n; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * particleSpeed,
				vy: (Math.random() - 0.5) * particleSpeed,
				size: Math.random() * 1.6 + 0.6,
				color: colors[Math.floor(Math.random() * colors.length)]
			});
		}
	}
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var len = particles.length;
		for (var i = 0; i < len; i++) {
			var p = particles[i];
			p.x += p.vx; p.y += p.vy;
			if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
			if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
			if (mouse.x != null) {
				var dx = mouse.x - p.x, dy = mouse.y - p.y;
				var d = Math.sqrt(dx * dx + dy * dy);
				if (d < mouseDistance) {
					var f = (mouseDistance - d) / mouseDistance;
					p.vx -= (dx / d) * f * 0.04;
					p.vy -= (dy / d) * f * 0.04;
				}
			}
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fillStyle = p.color;
			ctx.fill();
		}
		for (var a = 0; a < len; a++) {
			for (var b = a + 1; b < len; b++) {
				var p1 = particles[a], p2 = particles[b];
				var dx2 = p1.x - p2.x, dy2 = p1.y - p2.y;
				var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
				if (d2 < connectionDistance * (window.devicePixelRatio || 1)) {
					ctx.beginPath();
					ctx.strokeStyle = 'rgba(0, 240, 255, ' + (1 - d2 / (connectionDistance * (window.devicePixelRatio || 1))) * 0.18 + ')';
					ctx.lineWidth = 1;
					ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
					ctx.stroke();
				}
			}
		}
		rafId = requestAnimationFrame(draw);
	}
	function start() { if (rafId == null) rafId = requestAnimationFrame(draw); }
	function stop()  { if (rafId != null) cancelAnimationFrame(rafId); rafId = null; }

	window.addEventListener('resize', resize);
	window.addEventListener('mousemove', function (e) {
		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
	});
	window.addEventListener('mouseout', function () { mouse.x = null; mouse.y = null; });
	document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

	// React to FX toggle
	var mo = new MutationObserver(function () {
		if (document.body.classList.contains('no-fx')) stop();
		else start();
	});
	mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

	resize();
	if (!document.body.classList.contains('no-fx')) start();
})();

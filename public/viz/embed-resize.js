// Shared by every public/viz/*.html page. Reports content height to the parent
// frame so <Viz> (app/components/viz-embed.tsx) can size its <iframe> with no
// internal scrollbar. Convention: give the page's outermost visible element id="app".
(function () {
    if (window.parent === window) return; // opened directly, not embedded

    document.documentElement.style.margin = '0';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    var root = document.getElementById('app') || document.body;

    function report() {
        try {
            window.parent.postMessage(
                { type: 'viz-resize', height: Math.ceil(root.getBoundingClientRect().height) },
                '*',
            );
        } catch (e) {}
    }

    report();
    window.addEventListener('load', report);
    window.addEventListener('resize', report);
    if (window.ResizeObserver) new ResizeObserver(report).observe(root);
    else setInterval(report, 500);
})();

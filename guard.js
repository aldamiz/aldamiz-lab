// lab.aldamiz.com auth guard
// Include this in every page: <script src="/guard.js"></script>
// If no auth cookie, redirects to auth.html with return URL
(function() {
    if (document.cookie.indexOf('lab_auth=1') === -1) {
        var returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace('/auth.html?r=' + returnUrl);
    }
})();

(function() {
    function createAlert() {
        if (document.getElementById("customAlertOverlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "customAlertOverlay";

        overlay.innerHTML = `
            <div id="customAlertBox">
                <div id="customAlertText"></div>
                <button id="customAlertBtn">OK</button>
            </div>
        `;

        overlay.style.cssText = `
            display:none;
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.5);
            z-index:999999;
        `;

        document.body.appendChild(overlay);

        const box = document.getElementById("customAlertBox");
        box.style.cssText = `
            position:absolute;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            background:#fff;
            padding:20px;
            border-radius:8px;
            text-align:center;
            min-width:250px;
        `;

        document.getElementById("customAlertBtn").onclick = function() {
            overlay.style.display = "none";
        };
    }

    function init() {
        createAlert();

        window.alert = function(message) {
            document.getElementById("customAlertText").textContent = message;
            document.getElementById("customAlertOverlay").style.display = "block";
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();


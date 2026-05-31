(function () {

    function createPopup() {
        if (document.getElementById("customAlertOverlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "customAlertOverlay";

        overlay.innerHTML = `
            <div style="
                position:fixed;
                inset:0;
                background:rgba(0,0,0,.6);
                display:flex;
                justify-content:center;
                align-items:center;
                z-index:999999;
            ">
                <div style="
                    background:#11141a;
                    padding:20px;
                    border-radius:14px;
                    min-width:260px;
                    text-align:center;
                    color:white;
                    border:1px solid #2a303a;
                ">
                    <div id="customAlertText" style="margin-bottom:15px; white-space:pre-wrap;"></div>
                    <button id="customAlertBtn" style="
                        padding:10px 20px;
                        border:none;
                        border-radius:10px;
                        background:#dcb95e;
                        color:#0a0c10;
                        font-weight:600;
                    ">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("customAlertBtn").onclick = () => {
            overlay.remove();
        };
    }

    function showAlert(msg) {
        createPopup();

        // wait 1 frame so DOM is ready
        requestAnimationFrame(() => {
            const el = document.getElementById("customAlertText");
            if (el) {
                el.textContent = msg ?? "";
            }
        });
    }

    window.alert = showAlert;

})();
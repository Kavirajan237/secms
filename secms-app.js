document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INITIAL SETUP ---
    const updateDateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
        const dtEl = document.getElementById('current-date-time');
        if (dtEl) dtEl.textContent = now.toLocaleDateString('en-US', options);
    };
    updateDateTime();
    setInterval(updateDateTime, 60000);

    // --- 2. VIEW SWITCHING ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('current-page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(view => view.classList.remove('active'));
            
            // Add active to clicked
            item.classList.add('active');
            const viewId = item.getAttribute('data-view');
            const targetView = document.getElementById(`view-${viewId}`);
            if(targetView) targetView.classList.add('active');
            
            // Update Title
            if(pageTitle) pageTitle.textContent = item.querySelector('span').textContent;
        });
    });


    // --- 3. UI TOGGLES ---
    // Notifications
    const notifBtn = document.getElementById('notifications-btn');
    const notifPanel = document.getElementById('notifications-panel');
    if(notifBtn && notifPanel) {
        notifBtn.addEventListener('click', () => {
            notifPanel.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notifBtn.contains(e.target) && !notifPanel.contains(e.target)) {
                notifPanel.classList.remove('show');
            }
        });
    }

    // Mobile AI Panel Toggle
    const aiPanel = document.querySelector('.ai-panel');
    const floatChatBtn = document.getElementById('floating-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');

    if(floatChatBtn && aiPanel) {
        floatChatBtn.addEventListener('click', () => aiPanel.classList.add('open'));
    }
    if(closeChatBtn && aiPanel) {
        closeChatBtn.addEventListener('click', () => aiPanel.classList.remove('open'));
    }


    // --- 4. TNEB TARIFF LOGIC ---
    function calculateTNEBBill(units) {
        let cost = 0;
        let breakdown = [];
        let slabName = "";

        if (units <= 500) {
            slabName = "Consumption Up to 500 Units";
            if (units > 0) {
                let u = Math.min(units, 200);
                cost += u * 0;
                breakdown.push(`1-200 units: ${u} x ₹0 = ₹0`);
            }
            if (units > 200) {
                let u = Math.min(units - 200, 200);
                let c = u * 4.70;
                cost += c;
                breakdown.push(`201-400 units: ${u} x ₹4.70 = ₹${c.toFixed(2)}`);
            }
            if (units > 400) {
                let u = units - 400;
                let c = u * 6.30;
                cost += c;
                breakdown.push(`401-500 units: ${u} x ₹6.30 = ₹${c.toFixed(2)}`);
            }
        } else {
            slabName = "Consumption Above 500 Units";
            if (units > 0) {
                let u = Math.min(units, 100);
                cost += u * 0;
                breakdown.push(`1-100 units: ${u} x ₹0 = ₹0`);
            }
            if (units > 100) {
                let u = Math.min(units - 100, 300);
                let c = u * 4.70;
                cost += c;
                breakdown.push(`101-400 units: ${u} x ₹4.70 = ₹${c.toFixed(2)}`);
            }
            if (units > 400) {
                let u = Math.min(units - 400, 100);
                let c = u * 6.30;
                cost += c;
                breakdown.push(`401-500 units: ${u} x ₹6.30 = ₹${c.toFixed(2)}`);
            }
            if (units > 500) {
                let u = Math.min(units - 500, 100);
                let c = u * 8.40;
                cost += c;
                breakdown.push(`501-600 units: ${u} x ₹8.40 = ₹${c.toFixed(2)}`);
            }
            if (units > 600) {
                let u = Math.min(units - 600, 200);
                let c = u * 9.45;
                cost += c;
                breakdown.push(`601-800 units: ${u} x ₹9.45 = ₹${c.toFixed(2)}`);
            }
            if (units > 800) {
                let u = Math.min(units - 800, 200);
                let c = u * 10.50;
                cost += c;
                breakdown.push(`801-1000 units: ${u} x ₹10.50 = ₹${c.toFixed(2)}`);
            }
            if (units > 1000) {
                let u = units - 1000;
                let c = u * 11.55;
                cost += c;
                breakdown.push(`Above 1000 units: ${u} x ₹11.55 = ₹${c.toFixed(2)}`);
            }
        }

        return { cost: cost, breakdown: breakdown, slab: slabName };
    }

    // Calculator Events
    const btnCalcCost = document.getElementById('btn-calc-cost');
    if (btnCalcCost) {
        btnCalcCost.addEventListener('click', () => {
            const units = parseFloat(document.getElementById('calc-units').value);
            if(isNaN(units) || units < 0) return;
            
            const result = calculateTNEBBill(units);
            document.getElementById('calc-res-cost').textContent = result.cost.toFixed(2);
            
            const breakdownHtml = result.breakdown.map(b => `<span>${b}</span>`).join('');
            document.getElementById('calc-res-breakdown').innerHTML = breakdownHtml;
            document.getElementById('cost-result-box').style.display = 'block';
        });
    }

    // Cost to Unit Estimator Logic
    const btnCalcUnits = document.getElementById('btn-calc-units');
    if (btnCalcUnits) {
        btnCalcUnits.addEventListener('click', () => {
            const targetCost = parseFloat(document.getElementById('calc-cost').value);
            if(isNaN(targetCost) || targetCost < 0) return;
            
            let estUnits = 0;
            if (targetCost > 0) {
                // Binary search for approximate units
                let low = 0, high = 50000;
                while (high - low > 0.5) {
                    let mid = (low + high) / 2;
                    if (calculateTNEBBill(mid).cost < targetCost) low = mid;
                    else high = mid;
                }
                estUnits = Math.round(low);
            }
            document.getElementById('calc-res-units').textContent = estUnits;
            document.getElementById('units-result-box').style.display = 'block';
        });
    }


    // --- 5. DEVICE SIMULATION ---
    const devices = [
        { id: 'dev-1', name: 'Air Conditioner', icon: 'bx-wind', minP: 1000, maxP: 1500, status: true },
        { id: 'dev-2', name: 'Refrigerator', icon: 'bx-fridge', minP: 150, maxP: 250, status: true },
        { id: 'dev-3', name: 'Smart TV', icon: 'bx-tv', minP: 60, maxP: 120, status: true },
        { id: 'dev-4', name: 'Washing Machine', icon: 'bx-water', minP: 400, maxP: 600, status: false },
        { id: 'dev-5', name: 'Microwave', icon: 'bx-food-menu', minP: 700, maxP: 900, status: false },
        { id: 'dev-6', name: 'Ceiling Fan (Hall)', icon: 'bx-aperture', minP: 50, maxP: 75, status: true },
        { id: 'dev-7', name: 'Water Heater', icon: 'bx-shower', minP: 1500, maxP: 2000, status: false },
        { id: 'dev-8', name: 'Laptop Charger', icon: 'bx-laptop', minP: 45, maxP: 65, status: true },
        { id: 'dev-9', name: 'LED Lights (All)', icon: 'bx-bulb', minP: 40, maxP: 100, status: true },
        { id: 'dev-10', name: 'Induction Stove', icon: 'bx-dish', minP: 1200, maxP: 1800, status: false }
    ];

    let totalUnitsConsumed = 245.5; // Starting units for demo
    let currentTotalPower = 0;
    
    const devicesListEl = document.getElementById('devices-list');
    
    // Render Devices
    function renderDevices() {
        if(!devicesListEl) return;
        devicesListEl.innerHTML = '';
        devices.forEach(dev => {
            const el = document.createElement('div');
            el.className = `device-card ${dev.status ? 'active' : ''}`;
            el.id = `card-${dev.id}`;
            
            el.innerHTML = `
                <div class="device-info">
                    <div class="device-icon"><i class='bx ${dev.icon}'></i></div>
                    <div>
                        <div class="device-name">${dev.name}</div>
                        <div class="device-status">${dev.status ? 'ON - Active' : 'OFF - Standby'}</div>
                    </div>
                </div>
                <div class="device-stats">
                    <div class="device-power" id="pwr-${dev.id}">${dev.status ? dev.minP : 0} W</div>
                    <label class="switch">
                        <input type="checkbox" id="toggle-${dev.id}" ${dev.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            devicesListEl.appendChild(el);
            
            // Toggle listener
            document.getElementById(`toggle-${dev.id}`).addEventListener('change', (e) => {
                dev.status = e.target.checked;
                const card = document.getElementById(`card-${dev.id}`);
                const statusTxt = card.querySelector('.device-status');
                const pwrTxt = document.getElementById(`pwr-${dev.id}`);
                
                if(dev.status) {
                    card.classList.add('active');
                    statusTxt.textContent = 'ON - Active';
                } else {
                    card.classList.remove('active');
                    statusTxt.textContent = 'OFF - Standby';
                    pwrTxt.textContent = '0 W';
                }
                updateTotalPower();
            });
        });
    }

    renderDevices();


    // --- 6. SMART ALERTS ---
    const alertsListEl = document.getElementById('alerts-list');
    const alertBadge = document.getElementById('alert-badge');
    let alerts = [];

    function addAlert(msg, type='warning') {
        if(alerts.includes(msg) || !alertsListEl) return; // prevent duplicates
        alerts.push(msg);
        if(alertBadge) alertBadge.textContent = alerts.length;
        
        const li = document.createElement('li');
        li.className = `alert-item ${type}`;
        const icon = type === 'danger' ? 'bx-error' : 'bx-error-circle';
        li.innerHTML = `<i class='bx ${icon}'></i> ${msg}`;
        alertsListEl.prepend(li);
    }

    function checkAlerts(power, active) {
        if(power > 4000) {
            addAlert('High power consumption detected! (>4kW)', 'danger');
        }
        const dev7 = document.getElementById('toggle-dev-7');
        const dev1 = document.getElementById('toggle-dev-1');
        if(dev7 && dev1 && dev7.checked && dev1.checked) {
            addAlert('AC and Water Heater ON simultaneously. Risk of surge.', 'warning');
        }
    }


    // --- 7. AI CHATBOT ---
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionChips = document.querySelectorAll('.chat-suggestions .chip');

    function appendMessage(text, sender) {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        console.log(`Appended message from ${sender}: ${text}`);
    }

    function processAiResponse(query) {
        const q = query.toLowerCase();
        let reply = "I'm analyzing your data... I don't have a specific insight for that yet.";
        
        setTimeout(() => {
            const billEl = document.getElementById('est-bill');
            const estBill = billEl ? billEl.textContent : "0";
            
            if (q.includes('bill') || q.includes('high')) {
                reply = `Your estimated bill is currently ₹${estBill}. Try turning off the Air Conditioner or Water Heater to lower it.`;
            } else if (q.includes('tariff') || q.includes('rate')) {
                reply = "You are currently being billed under the TNEB 'Up to 500 Units' slab. The rate goes up to ₹6.30/unit if you exceed 400 units.";
                if(totalUnitsConsumed > 500) reply = "You have exceeded 500 units. You are now billed under the higher TNEB tariff slab (up to ₹11.55/unit).";
            } else if (q.includes('highest') || q.includes('consume') || q.includes('most')) {
                reply = "The Air Conditioner (1000-1500W) and Water Heater (1500-2000W) are your highest consuming appliances.";
            } else if (q.includes('save') || q.includes('tips')) {
                reply = "1. Set AC to 24°C.<br>2. Turn off appliances instead of standby.<br>3. Shift washing machine usage to non-peak hours.";
            }
            
            appendMessage(reply, 'ai');
        }, 1000);
    }

    function handleChat() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if(!text) return;
        
        console.log(`Sending chat: ${text}`);
        appendMessage(text, 'user');
        chatInput.value = '';
        
        // Typist indicator could go here
        processAiResponse(text);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleChat();
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                handleChat();
            }
        });
    }

    if (suggestionChips) {
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                const chipText = chip.textContent.trim();
                console.log(`Chip clicked: ${chipText}`);
                if (chatInput) chatInput.value = chipText;
                handleChat();
            });
        });
    }


    // --- 8. REAL-TIME CHART ---
    const ctx = document.getElementById('livePowerChart');
    let liveChart = null;
    
    if (ctx && typeof Chart !== 'undefined') {
        try {
            liveChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(15).fill(''), // 15 data points
                    datasets: [{
                        label: 'Power Demand (W)',
                        data: Array(15).fill(0),
                        borderColor: '#00d2ff',
                        backgroundColor: 'rgba(0, 210, 255, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { display: false },
                        y: {
                            display: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#a0aab2' },
                            suggestedMin: 0,
                            suggestedMax: 3000
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    },
                    animation: { duration: 0 } // faster updates
                }
            });
        } catch (e) {
            console.error('Error initializing chart:', e);
        }
    }

    function updateChart(newVal) {
        if(!liveChart) return;
        const data = liveChart.data.datasets[0].data;
        data.push(newVal);
        data.shift(); // remove oldest
        liveChart.update();
    }


    // --- 9. SIMULATION LOOP INITIALIZATION ---
    function simulatePower() {
        currentTotalPower = 0;
        let activeCount = 0;
        
        devices.forEach(dev => {
            if(dev.status) {
                activeCount++;
                // Fluctuate power
                const pwr = Math.floor(Math.random() * (dev.maxP - dev.minP + 1)) + dev.minP;
                const pwrEl = document.getElementById(`pwr-${dev.id}`);
                if(pwrEl) pwrEl.textContent = `${pwr} W`;
                currentTotalPower += pwr;
            }
        });
        
        const totWattsEl = document.getElementById('total-watts');
        const actDevEl = document.getElementById('active-devices-count');
        if(totWattsEl) totWattsEl.textContent = currentTotalPower;
        if(actDevEl) actDevEl.textContent = activeCount;
        
        // Accumulate units (kWh) -> (W * hours) / 1000
        const simulatedHoursPassed = 0.005; 
        totalUnitsConsumed += (currentTotalPower * simulatedHoursPassed) / 1000;
        
        const totUnitsEl = document.getElementById('total-units');
        if(totUnitsEl) totUnitsEl.textContent = totalUnitsConsumed.toFixed(2);
        
        // Update Bill
        const billResult = calculateTNEBBill(totalUnitsConsumed);
        const estBillEl = document.getElementById('est-bill');
        if(estBillEl) estBillEl.textContent = billResult.cost.toFixed(2);
        
        // Update Chart
        updateChart(currentTotalPower);

        // Smart Alerts check
        checkAlerts(currentTotalPower, activeCount);
    }
    
    // We start the simulation loop at the end of the script
    // to ensure all variables (like liveChart) are initialized.
    
    function updateTotalPower() {
        // Immediate update on toggle
        simulatePower();
    }
    
    simulatePower();
    setInterval(simulatePower, 2000);

});

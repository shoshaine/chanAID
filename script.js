document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const config = {
        mcapStart: 6.53, // k
        mcapTarget: 25.0, // k (arbitrary target for simulation)
        feesStart: 0.2,
        feesEnd: 0.8,
        feesDuration: 25000, // 25 seconds in ms
        timerDuration: 120, // 2 minutes in seconds
    };

    // --- Elements ---
    const mcapEl = document.getElementById('mcap');
    const feesEl = document.getElementById('creator-fees');
    const timerEl = document.getElementById('timer');
    const holderListEl = document.getElementById('holder-list');
    const progressFillEl = document.querySelector('.progress-fill');

    // --- State ---
    let startTime = Date.now();
    let mcapCurrent = config.mcapStart;

    // --- 1. Timer Logic ---
    let timeLeft = config.timerDuration;
    
    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
            setTimeout(updateTimer, 1000);
        } else {
            timerEl.textContent = "00:00";
            timerEl.style.color = "#10b981"; // Emerald green
            // Optional: Trigger some 'Distribution Complete' visual state here
        }
    }
    updateTimer();

    // --- 2. Creator Fees Logic (0.2 to 0.8 in 25s) ---
    function updateFees() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / config.feesDuration, 1);
        
        // Linear interpolation
        const currentFee = config.feesStart + (config.feesEnd - config.feesStart) * progress;
        
        feesEl.textContent = `${currentFee.toFixed(3)} SOL`;
        
        // Update progress bar width
        if (progressFillEl) {
            // We want the bar to fill up as fees increase. 
            // Let's map 0.2 -> 0% and 0.8 -> 100% relative to the start/end
            // Actually, just mapping time progress is smoother
            progressFillEl.style.width = `${progress * 100}%`;
            // Remove the infinite animation if we are controlling it manually, 
            // or just let the CSS animation do its thing if it's an "indeterminate" loader.
            // The CSS I wrote has an infinite animation. Let's override it to be a determinate bar.
            progressFillEl.style.animation = 'none';
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateFees);
        }
    }
    updateFees();

    // --- 3. Mcap Logic (Random Volatility) ---
    function updateMcap() {
        // Random jump between -0.8k and +1.2k to simulate volatility with slight upward bias
        // (Math.random() * 2.0) gives 0 to 2.0. Subtracting 0.8 gives -0.8 to +1.2.
        const change = (Math.random() * 2.0) - 0.8; 
        mcapCurrent += change;
        
        // Ensure it doesn't drop below a realistic floor
        if (mcapCurrent < 4) mcapCurrent = 4 + Math.random();

        mcapEl.textContent = `$${mcapCurrent.toFixed(2)}k`;
        
        // Update trend indicator color/text based on the move
        const trendEl = document.querySelector('.stat-trend');
        if (trendEl) {
            const isPositive = change >= 0;
            const percentChange = Math.abs((change / (mcapCurrent - change)) * 100);
            trendEl.textContent = `${isPositive ? '▲' : '▼'} ${percentChange.toFixed(1)}%`;
            trendEl.style.color = isPositive ? '#10b981' : '#ef4444'; // Green or Red
        }

        // Schedule next update (random interval between 0.5-2.5 seconds)
        const nextUpdate = Math.random() * 2000 + 500;
        setTimeout(updateMcap, nextUpdate);
    }
    // Initial call
    updateMcap();

    // --- 4. Mock Leaderboard ---
    const holders = [
        { addr: "8xHt...9jK2", amt: "4.5%" },
        { addr: "3mPq...L9s1", amt: "3.2%" },
        { addr: "9nRr...k2M4", amt: "2.8%" },
        { addr: "2bVc...7hN9", amt: "2.1%" },
        { addr: "5kLp...1qW3", amt: "1.9%" },
        { addr: "7jHy...8xZ5", amt: "1.5%" },
        { addr: "4fRd...6tY8", amt: "1.2%" },
        { addr: "1wQs...3eA7", amt: "1.0%" },
        { addr: "6gBt...5rD2", amt: "0.9%" },
        { addr: "0mNu...4iO6", amt: "0.8%" },
    ];

    holders.forEach((h, index) => {
        const li = document.createElement('li');
        li.className = 'holder-item';
        li.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span class="address">${h.addr}</span>
            <span class="amount">${h.amt}</span>
        `;
        holderListEl.appendChild(li);
    });
});
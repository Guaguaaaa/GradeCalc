const translations = {
    en: {
        title: "Grade Calculator",
        subtitle: "Plan your academic goals with precision.",
        colItem: "ITEM", colWeight: "WEIGHT%", colScore: "SCORE%",
        btnAdd: "+ Add Item", btnCalc: "Analyze Performance →",
        errNoWeight: "Please enter at least one weight.",
        errNot100: "Total weight is {val}%. Calculation will proceed.",
        finalResultTitle: "Course Finalized",
        finalResultSub: "Your final calculated score is:",

        // Bento Grid Labels
        lblTotal: "Current Secured",
        lblPass: "To Pass (50%)",
        lblPassDone: "PASSED",
        lblPassImp: "IMPOSSIBLE",

        chartTitle: "Grade Composition Analysis",
        legendSecured: "Secured",
        legendLost: "Lost",
        legendPotential: "Potential",
        markerPass: "Pass (50%)",

        customTitle: "Goal Simulator",
        lblDesired: "Target Goal:",
        lblRequired: "Required Average Grade in Remaining exam:",
        advice: {
            impossible: ["Mathematically impossible without extra credit.", "Unless there's a bonus, this score is unreachable."],
            hugeGap: ["Requires massive improvement from your average ({curr}). A significant challenge.", "Do or die. You need to perform significantly better than usual."],
            gap: ["You need to step up slightly above your average.", "Tough but possible if you focus on weak spots."],
            normal: ["Matches your current performance level ({curr}). Keep it up!", "Consistent with your usual performance."],
            safe: ["You have a safety buffer. Minor mistakes allowed.", "Safe zone based on your strong history."],
            done: ["Grade secured! 🎉", "You've already hit this target."]
        }
    },
    zh: {
        title: "成绩计算器",
        subtitle: "科学规划你的学术目标。",
        colItem: "项目", colWeight: "权重%", colScore: "得分%",
        btnAdd: "+ 添加项目", btnCalc: "分析成绩 →",
        errNoWeight: "请至少填写一项权重。",
        errNot100: "当前总权重为 {val}%，计算继续。",
        finalResultTitle: "课程已结课",
        finalResultSub: "你的最终总成绩是：",

        lblTotal: "目前已拿分 (Secured)",
        lblPass: "及格 (50%) 需要",
        lblPassDone: "已及格",
        lblPassImp: "已挂科",

        chartTitle: "成绩构成分析",
        legendSecured: "已拿到",
        legendLost: "已丢失",
        legendPotential: "剩余空间",
        markerPass: "及格线",

        customTitle: "目标模拟沙盒",
        lblDesired: "我想要总分:",
        lblRequired: "剩余考试需要考平均:",
        advice: {
            impossible: ["理论上已无法达到... 除非有额外加分。", "数学上已无可能。"],
            hugeGap: ["需要远超平时的发挥（平时均分 {curr}）。这是一场硬仗。", "目标非常高，需奇迹般的表现。"],
            gap: ["需要比平时更努力一点。跳一跳能够得着。", "并非不可能，但绝对不能掉以轻心。"],
            normal: ["这就是你的正常水平（均分 {curr}）。保持状态即可。", "稳住心态，与平时表现吻合。"],
            safe: ["你的容错率很高，即使发挥稍差也能达标。", "安全区，积累了足够优势。"],
            done: ["恭喜！分数已到手，躺赢！🎉", "毫无压力，目标已达成。"]
        }
    }
};

let currentLang = 'en';
let globalState = {
    currentTotalScore: 0, remainingWeight: 0, currentNormalizedAvg: 0, stdDev: 0, hasResults: false
};

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();

    const itemsList = document.getElementById('items-list');
    const addBtn = document.getElementById('add-btn');
    const calcBtn = document.getElementById('calc-btn');
    const langBtn = document.getElementById('lang-toggle');

    // 初始化默认数据
    addRow('Assignment', 20, '');
    addRow('Quiz', 10, '');
    addRow('Midterm', 30, '');
    addRow('Final', 40, '');

    addBtn.addEventListener('click', () => addRow());
    calcBtn.addEventListener('click', () => calculateGrades());
    langBtn.addEventListener('click', toggleLanguage);

    function initLanguage() {
        const savedLang = localStorage.getItem('gradeCalcLang');
        if (savedLang) currentLang = savedLang;
        else {
            const browserLang = navigator.language || navigator.userLanguage;
            currentLang = browserLang.toLowerCase().includes('zh') ? 'zh' : 'en';
        }
        applyLanguage();
    }

    function toggleLanguage() {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        localStorage.setItem('gradeCalcLang', currentLang);
        applyLanguage();
        if (globalState.hasResults) calculateGrades();
    }

    function applyLanguage() {
        const t = translations[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    }

    function addRow(name = '', weight = '', score = '') {
        const row = document.createElement('div');
        row.className = 'input-row';
        row.innerHTML = `
            <input type="text" placeholder="..." value="${name}" class="input-name">
            <input type="number" placeholder="0" value="${weight}" class="input-weight">
            <input type="number" placeholder="-" value="${score}" class="input-score">
            <button class="delete-btn" onclick="this.parentElement.remove()">×</button>
        `;
        itemsList.appendChild(row);
    }

    // === 统计学辅助 ===
    function calculateStandardDeviation(scores) {
        if (scores.length === 0) return 0;
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((total, num) => total + Math.pow(num - mean, 2), 0) / scores.length;
        return Math.sqrt(variance);
    }

    function calculateGrades() {
        const t = translations[currentLang];
        const weights = document.querySelectorAll('.input-weight');
        const scores = document.querySelectorAll('.input-score');
        const errorMsg = document.getElementById('error-msg');
        const resultsPlaceholder = document.getElementById('results-placeholder');
        const resultsContent = document.getElementById('results-content');

        let totalWeight = 0;
        let currentTotalScore = 0;
        let achievedWeight = 0;
        let validScores = [];

        weights.forEach((wInput, index) => {
            const weightVal = parseFloat(wInput.value);
            const scoreVal = parseFloat(scores[index].value);
            if (isNaN(weightVal)) return;

            totalWeight += weightVal;
            if (!isNaN(scoreVal)) {
                currentTotalScore += (scoreVal * weightVal) / 100;
                achievedWeight += weightVal;
                validScores.push(scoreVal);
            }
        });

        if (totalWeight === 0) { errorMsg.textContent = t.errNoWeight; return; }
        errorMsg.textContent = Math.abs(totalWeight - 100) > 0.1 ? t.errNot100.replace('{val}', totalWeight) : "";

        const remainingWeight = totalWeight - achievedWeight;
        const lostScore = achievedWeight - currentTotalScore;

        let currentNormalizedAvg = 0;
        if (achievedWeight > 0) currentNormalizedAvg = (currentTotalScore / achievedWeight) * 100;

        let stdDev = 0;
        if (validScores.length >= 2) stdDev = calculateStandardDeviation(validScores);

        globalState = {
            currentTotalScore, remainingWeight, currentNormalizedAvg, stdDev, hasResults: true
        };

        // 切换视图
        resultsPlaceholder.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // === 渲染 Bento Grid ===
        if (remainingWeight <= 0) {
            resultsContent.innerHTML = renderFinalResult(currentTotalScore, t);
            return;
        }

        // 1. Pass 计算
        const passRequired = ((50 - currentTotalScore) / remainingWeight) * 100;
        let passHtml = '';
        if (passRequired <= 0) passHtml = `<span class="stat-sub col-safe">${t.lblPassDone}</span>`;
        else if (passRequired > 100) passHtml = `<span class="stat-sub col-danger">${t.lblPassImp}</span>`;
        else {
            let colClass = passRequired > 80 ? 'col-danger' : 'col-neutral';
            passHtml = `<span class="stat-sub ${colClass}">${passRequired.toFixed(1)}%</span>`;
        }

        // 2. 堆叠图数据
        const securedPct = currentTotalScore;
        const lostPct = lostScore;
        const potentialPct = remainingWeight;

        // 3. 注入 HTML
        resultsContent.innerHTML = `
            <div class="card-box box-sm">
                <div class="stat-title">${t.lblTotal}</div>
                <div class="stat-big">${currentTotalScore.toFixed(2)}</div>
            </div>

            <div class="card-box box-sm">
                <div class="stat-title">${t.lblPass}</div>
                <div class="stat-big" style="font-size:32px">
                    ${passHtml}
                </div>
            </div>

            <div class="card-box box-wide">
                <div class="stat-title">${t.chartTitle}</div>
                
                <div class="stack-track">
                    <div class="seg seg-secured" style="width: ${securedPct}%"></div>
                    <div class="seg seg-potential" style="width: ${potentialPct}%"></div>
                    <div class="seg seg-lost" style="width: ${lostPct}%"></div>
                    <div class="marker-pin" style="left: 50%"></div>
                </div>
                <div class="marker-label" style="left: 50%">${t.markerPass}</div>


                <div class="legend-row">
                    <div class="legend-pill"><div class="dot" style="background:var(--color-safe)"></div>${t.legendSecured}: ${securedPct.toFixed(1)}</div>
                    <div class="legend-pill"><div class="dot" style="background:var(--accent)"></div>${t.legendPotential}: ${potentialPct.toFixed(1)}</div>
                    <div class="legend-pill"><div class="dot" style="background:#D1D1D1"></div>${t.legendLost}: ${lostPct.toFixed(1)}</div>
                </div>
            </div>

            <div class="card-box box-tall">
                <div>
                    <div class="stat-title">${t.customTitle}</div>
                    
                    <div class="slider-group">
                        <div class="slider-header">
                            <span style="font-size:13px; font-weight:600; color:var(--text-muted)">${t.lblDesired}</span>
                            <div class="input-stepper">
                                <input type="number" id="custom-number" value="75" min="50" max="100">
                                <span>%</span>
                            </div>
                        </div>
                        <input type="range" id="custom-slider" min="50" max="100" value="75">
                    </div>
                </div>

                <div class="custom-result-area" style="margin-top:20px">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px">
                        <span style="font-size:12px; font-weight:700; color:var(--text-muted)">${t.lblRequired}</span>
                        <span id="custom-required-val" style="font-size:32px; font-weight:800; line-height:1">--</span>
                    </div>
                    <div id="custom-advice-box" class="advice-block"></div>
                </div>
            </div>
        `;

        bindSliderEvents();
        calculateCustom();
    }

    function renderFinalResult(finalScore, t) {
        return `
            <div class="card-box" style="grid-column:span 2; text-align:center; padding:60px 20px;">
                <div style="font-size:14px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px">${t.finalResultTitle}</div>
                <div style="font-size:64px; font-weight:800; color:var(--text-main); line-height:1">${finalScore.toFixed(2)}%</div>
                <div style="margin-top:20px; font-weight:600; color:var(--accent)">Course Complete</div>
            </div>
        `;
    }

    function bindSliderEvents() {
        const slider = document.getElementById('custom-slider');
        const numberInput = document.getElementById('custom-number');
        if(!slider) return;

        const updateFill = (val) => {
            const min = 50, max = 100;
            const pct = ((val - min) / (max - min)) * 100;
            slider.style.setProperty('--progress', `${pct}%`);
        };
        updateFill(slider.value);

        slider.addEventListener('input', (e) => {
            numberInput.value = e.target.value;
            updateFill(e.target.value);
            calculateCustom();
        });

        numberInput.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (val > 100) val = 100;
            if (isNaN(val) || val < 50) slider.value = 50;
            else slider.value = val;

            updateFill(slider.value);
            if (!isNaN(val)) calculateCustom();
        });
    }

    function calculateCustom() {
        if (!globalState.hasResults) return;
        const t = translations[currentLang];
        const target = parseFloat(document.getElementById('custom-number').value) || 0;
        const required = ((target - globalState.currentTotalScore) / globalState.remainingWeight) * 100;

        const valEl = document.getElementById('custom-required-val');
        const adviceBox = document.getElementById('custom-advice-box');

        // 获取建议 (Z-Score + Gap 混合逻辑)
        const adviceData = getAdvice(required, globalState.currentNormalizedAvg, globalState.stdDev, t);

        // 设置数值和颜色
        if (required > 100) {
            valEl.textContent = "> 100%"; valEl.style.color = "var(--color-impossible)";
        } else if (required <= 0) {
            valEl.textContent = "DONE"; valEl.style.color = "var(--color-safe)";
        } else {
            valEl.textContent = required.toFixed(1) + "%";
            // 颜色跟随难度评级
            if (adviceData.styleClass === 'hard') valEl.style.color = "var(--color-danger)";
            else if (adviceData.styleClass === 'warn') valEl.style.color = "var(--color-warn)";
            else if (adviceData.styleClass === 'safe') valEl.style.color = "var(--color-safe)";
            else valEl.style.color = "var(--text-main)";
        }

        adviceBox.textContent = adviceData.text;
        adviceBox.className = `advice-block ${adviceData.styleClass}`;
    }

    function getAdvice(required, currentAvg, sd, t) {
        const gap = required - currentAvg;
        // 如果数据不够计算SD，或者SD极小，给予一个保底值防止除以0
        const safeSD = (sd && sd > 1) ? sd : 2;
        const zScore = gap / safeSD;

        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const currStr = currentAvg.toFixed(1);

        if (required > 100) return { text: pick(t.advice.impossible), styleClass: 'impossible' };
        if (required <= 0) return { text: pick(t.advice.done), styleClass: 'safe' };

        // 混合判定逻辑 (Gap + Z-Score)
        if (gap > 10 || zScore > 1.5) return { text: pick(t.advice.hugeGap).replace('{curr}', currStr), styleClass: 'hard' };
        if (gap > 2 || zScore > 0.8) return { text: pick(t.advice.gap), styleClass: 'warn' };
        if (gap >= -5) return { text: pick(t.advice.normal).replace('{curr}', currStr), styleClass: 'safe' };

        return { text: pick(t.advice.safe), styleClass: 'safe' };
    }
});
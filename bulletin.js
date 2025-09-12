// 이번 주 일요일 계산 (월-토: 다가오는 일요일, 일: 오늘)
function getThisSunday() {
    const today = new Date();
    const day = today.getDay();
    
    if (day === 0) {
        // 일요일이면 오늘
        return today;
    } else {
        // 월-토면 다가오는 일요일
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + (7 - day));
        return sunday;
    }
}

// 지난주 일요일 계산
function getLastSunday() {
    const thisSunday = getThisSunday();
    const lastSunday = new Date(thisSunday);
    lastSunday.setDate(thisSunday.getDate() - 7);
    return lastSunday;
}

// YYYY-MM-DD 형식 변환
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// PDF 존재 확인
async function checkPdfExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// 메시지 업데이트
function updateMessage(text, type = 'normal') {
    const element = document.getElementById('message');
    element.textContent = text;
    element.className = type === 'error' ? 'error-message' : 
                       type === 'fallback' ? 'fallback-message' : 'message';
}

// 날짜 표시 업데이트
function updateDateDisplay(date, isLastWeek = false) {
    const dateStr = date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    
    const prefix = isLastWeek ? '지난주 주일 예배: ' : '주일 예배: ';
    document.getElementById('sunday-date').textContent = prefix + dateStr;
}

// 메인 로직
async function loadBulletin() {
    const cache = new Date().getTime();
    
    // 1. 이번 주 일요일 시도
    const thisSunday = getThisSunday();
    const thisWeekFile = `./archive/${formatDate(thisSunday)}.pdf`;
    
    updateMessage('이번 주 주보를 불러오고 있습니다...');
    updateDateDisplay(thisSunday);
    
    if (await checkPdfExists(thisWeekFile)) {
        updateMessage('이번 주 주보를 찾았습니다. 잠시만 기다려 주세요.');
        const fileWithCache = `${thisWeekFile}?v=${cache}`;
        document.getElementById('manual-link').href = fileWithCache;
        setTimeout(() => window.location.href = fileWithCache, 2000);
        return;
    }
    
    // 2. 지난주 일요일 시도
    updateMessage('이번 주 주보가 없습니다. 지난주 주보를 확인하고 있습니다...');
    
    const lastSunday = getLastSunday();
    const lastWeekFile = `./archive/${formatDate(lastSunday)}.pdf`;
    
    if (await checkPdfExists(lastWeekFile)) {
        updateMessage('지난주 주보를 불러옵니다.', 'fallback');
        updateDateDisplay(lastSunday, true);
        const fileWithCache = `${lastWeekFile}?v=${cache}`;
        document.getElementById('manual-link').href = fileWithCache;
        setTimeout(() => window.location.href = fileWithCache, 2000);
        return;
    }
    
    // 3. 둘 다 실패
    updateMessage('주보를 찾을 수 없습니다. 관리자에게 문의해 주세요.', 'error');
    document.getElementById('manual-link').style.display = 'none';
}

// 초기화
window.onload = function() {
    // 현재 날짜 표시
    const today = new Date();
    const dateStr = today.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    });
    document.getElementById('current-date').textContent = dateStr;
    
    // 주보 로드
    loadBulletin();
};
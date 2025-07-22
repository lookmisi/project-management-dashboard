// 專案管理視覺化工具 - 主要 JavaScript 程式碼

class ProjectManagementDashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.timeRange = { start: null, end: null };
        this.draggedElement = null; // 用於拖放功能
        this.isEditMode = false;
        this.isTableView = false; // 用於表格顯示模式
        this.init();
    }

    // 初始化
    init() {
        // 清除瀏覽器可能的表單記憶
        this.clearBrowserFormMemory();
        
        this.loadData(); // 從LocalStorage載入資料，如果沒有則載入範例資料
        this.calculateTimeRange(); // 計算時間範圍
        this.filteredData = [...this.data]; // 初始化時顯示全部資料
        this.setupEventListeners();
        this.populateFilterOptions(); // 初始化篩選器選項
        this.clearFilters(); // 重置篩選器狀態，確保顯示全部資料
        this.isEditMode = false;
    }
    
    clearBrowserFormMemory() {
        // 清除所有可能的存儲
        if (typeof Storage !== "undefined") {
            sessionStorage.clear();
            // 僅清除表單相關的 localStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('form') || key.includes('input') || key.includes('field'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // 設置所有表單欄位為不自動填入
        setTimeout(() => {
            document.querySelectorAll('form').forEach(form => {
                form.setAttribute('autocomplete', 'off');
                form.setAttribute('data-lpignore', 'true');
                form.querySelectorAll('input, select, textarea').forEach(field => {
                    field.setAttribute('autocomplete', 'off');
                    field.setAttribute('data-lpignore', 'true');
                    field.setAttribute('data-form-type', 'other');
                });
            });
        }, 100);
    }

    // 載入資料（優先從LocalStorage，否則載入範例資料）
    loadData() {
        const savedData = this.loadFromLocalStorage();
        if (savedData && savedData.length > 0) {
            this.data = savedData;
            console.log('已從瀏覽器儲存載入資料');
            this.renderDashboard();
        } else {
            // 嘗試載入 my-data.json，如果不存在則載入 sample-data.json
            this.loadMyData()
                .then(() => {
                    console.log('載入自訂資料成功');
                    this.renderDashboard();
                })
                .catch(() => {
                    this.loadSampleData();
                    console.log('載入預設範例資料');
                    this.renderDashboard();
                });
        }
    }

    // 從LocalStorage載入資料
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('projectManagementData');
            return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
            console.error('載入儲存資料時發生錯誤:', error);
            return null;
        }
    }

    // 儲存資料到LocalStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('projectManagementData', JSON.stringify(this.data));
            console.log('資料已儲存到瀏覽器');
        } catch (error) {
            console.error('儲存資料時發生錯誤:', error);
            alert('儲存失敗，請檢查瀏覽器設定');
        }
    }

    // 載入範例資料
    // 載入自訂資料
    async loadMyData() {
        try {
            const response = await fetch('my-data.json');
            if (!response.ok) {
                throw new Error('無法載入自訂資料');
            }
            const data = await response.json();
            this.data = data;
            return Promise.resolve();
        } catch (error) {
            console.log('自訂資料檔案不存在，使用預設資料');
            return Promise.reject(error);
        }
    }

    loadSampleData() {
        this.data = [
            {
                projectName: "智慧城市平台",
                projectManager: "張經理",
                projectStartDate: "2024-01-01",
                projectEndDate: "2024-12-31",
                systems: [
                    {
                        systemName: "交通監控系統",
                        administrators: ["李工程師", "王技師"],
                        technicians: ["陳開發", "林測試"],
                        status: "開發中",
                        progress: 75,
                        startDate: "2024-01-15",
                        endDate: "2024-06-30",
                        milestones: [
                            { label: "需求分析完成", date: "2024-02-15", completed: true },
                            { label: "系統設計完成", date: "2024-03-30", completed: true },
                            { label: "POC 完成", date: "2024-05-15", completed: true },
                            { label: "系統交付", date: "2024-06-30", completed: false }
                        ]
                    },
                    {
                        systemName: "環境監測系統",
                        administrators: ["黃主管"],
                        technicians: ["劉開發", "吳測試", "蔡分析"],
                        status: "優化中",
                        progress: 60,
                        startDate: "2024-02-01",
                        endDate: "2024-08-31",
                        milestones: [
                            { label: "系統部署", date: "2024-04-01", completed: true },
                            { label: "效能調優", date: "2024-06-15", completed: false },
                            { label: "正式上線", date: "2024-08-31", completed: false }
                        ]
                    }
                ]
            },
            {
                projectName: "電子商務平台",
                projectManager: "李經理",
                projectStartDate: "2024-03-01",
                projectEndDate: "2024-11-30",
                systems: [
                    {
                        systemName: "購物車系統",
                        administrators: ["趙主管", "錢負責"],
                        technicians: ["孫開發"],
                        status: "維護中",
                        progress: 100,
                        startDate: "2024-03-01",
                        endDate: "2024-07-31",
                        milestones: [
                            { label: "系統上線", date: "2024-06-01", completed: true },
                            { label: "功能擴充", date: "2024-07-31", completed: true }
                        ]
                    },
                    {
                        systemName: "支付系統",
                        administrators: ["周技術長"],
                        technicians: ["吳架構師", "鄭開發", "王測試"],
                        status: "開發中",
                        progress: 40,
                        startDate: "2024-04-01",
                        endDate: "2024-10-31",
                        milestones: [
                            { label: "安全評估", date: "2024-05-15", completed: true },
                            { label: "第三方整合", date: "2024-07-30", completed: false },
                            { label: "壓力測試", date: "2024-09-15", completed: false },
                            { label: "正式發布", date: "2024-10-31", completed: false }
                        ]
                    },
                    {
                        systemName: "庫存管理系統",
                        administrators: ["馮主管"],
                        technicians: ["衛開發", "蔣測試"],
                        status: "優化中",
                        progress: 85,
                        startDate: "2024-05-01",
                        endDate: "2024-09-30",
                        milestones: [
                            { label: "基礎功能完成", date: "2024-07-01", completed: true },
                            { label: "進階功能開發", date: "2024-08-15", completed: false },
                            { label: "系統優化", date: "2024-09-30", completed: false }
                        ]
                    }
                ]
            },
            {
                projectName: "企業資源規劃系統",
                projectManager: "陳經理",
                projectStartDate: "2024-02-15",
                projectEndDate: "2025-01-31",
                systems: [
                    {
                        systemName: "人力資源模組",
                        administrators: ["韓主管", "魏負責"],
                        technicians: ["姚開發", "邵測試", "卜分析"],
                        status: "開發中",
                        progress: 30,
                        startDate: "2024-03-01",
                        endDate: "2024-12-31",
                        milestones: [
                            { label: "需求確認", date: "2024-04-01", completed: true },
                            { label: "原型開發", date: "2024-06-30", completed: false },
                            { label: "Alpha 測試", date: "2024-09-30", completed: false },
                            { label: "Beta 測試", date: "2024-11-30", completed: false },
                            { label: "正式發布", date: "2024-12-31", completed: false }
                        ]
                    }
                ]
            }
        ];

        this.calculateTimeRange();
        this.filteredData = [...this.data];
    }

    // 計算時間範圍
    calculateTimeRange() {
        if (!this.data || this.data.length === 0) {
            // 如果沒有資料，設置預設時間範圍
            const now = new Date();
            this.timeRange.start = new Date(now.getFullYear(), 0, 1); // 今年1月1日
            this.timeRange.end = new Date(now.getFullYear(), 11, 31); // 今年12月31日
            return;
        }

        let allDates = [];
        
        this.data.forEach(project => {
            allDates.push(new Date(project.projectStartDate));
            allDates.push(new Date(project.projectEndDate));
            
            project.systems.forEach(system => {
                allDates.push(new Date(system.startDate));
                allDates.push(new Date(system.endDate));
            });
        });

        if (allDates.length === 0) {
            // 如果沒有有效日期，設置預設時間範圍
            const now = new Date();
            this.timeRange.start = new Date(now.getFullYear(), 0, 1);
            this.timeRange.end = new Date(now.getFullYear(), 11, 31);
        } else {
            this.timeRange.start = new Date(Math.min(...allDates));
            this.timeRange.end = new Date(Math.max(...allDates));
        }
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 篩選器事件
        document.getElementById('project-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('system-filter').addEventListener('input', () => this.applyFilters());
        document.getElementById('staff-filter').addEventListener('input', () => this.applyFilters());
        document.getElementById('status-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('incomplete-only').addEventListener('change', () => this.applyFilters());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // 管理功能事件
        document.getElementById('add-project-btn').addEventListener('click', () => this.showAddProjectModal());
        document.getElementById('add-system-btn').addEventListener('click', () => this.showAddSystemModal());
        document.getElementById('edit-mode-btn').addEventListener('click', () => this.toggleEditMode());
        document.getElementById('table-view-btn').addEventListener('click', () => this.toggleTableView());
        document.getElementById('export-my-data-btn').addEventListener('click', () => this.exportMyData());

        // 模態框事件
        this.setupModalEventListeners();

        // 詳細面板關閉
        document.getElementById('close-detail').addEventListener('click', () => this.hideDetailPanel());

        // 點擊背景關閉詳細面板
        document.addEventListener('click', (e) => {
            const detailPanel = document.getElementById('detail-panel');
            if (!detailPanel.classList.contains('hidden') && !detailPanel.contains(e.target) && !e.target.closest('.timeline-bar')) {
                this.hideDetailPanel();
            }
        });

        // 初始化篩選器選項
        this.populateFilterOptions();
    }

    // 填充篩選器選項
    populateFilterOptions() {
        const projectFilter = document.getElementById('project-filter');
        const statusFilter = document.getElementById('status-filter');

        // 清空現有選項（保留"全部"選項）
        projectFilter.innerHTML = '<option value="">全部專案</option>';
        
        // 添加專案選項
        const projects = [...new Set(this.data.map(p => p.projectName))];
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            projectFilter.appendChild(option);
        });
    }

    // 應用篩選器
    applyFilters() {
        const projectFilter = Array.from(document.getElementById('project-filter').selectedOptions).map(o => o.value).filter(v => v);
        const systemFilter = document.getElementById('system-filter').value.toLowerCase();
        const staffFilter = document.getElementById('staff-filter').value.toLowerCase();
        const statusFilter = Array.from(document.getElementById('status-filter').selectedOptions).map(o => o.value).filter(v => v);
        const incompleteOnly = document.getElementById('incomplete-only').checked;

        this.filteredData = [];

        this.data.forEach(project => {
            // 專案名稱篩選
            if (projectFilter.length > 0 && !projectFilter.includes(project.projectName)) {
                return;
            }

            // 過濾系統
            const filteredSystems = project.systems.filter(system => {
                // 系統名稱篩選
                if (systemFilter && !system.systemName.toLowerCase().includes(systemFilter)) {
                    return false;
                }

                // 人員篩選
                if (staffFilter) {
                    const allStaff = [...system.administrators, ...system.technicians];
                    if (!allStaff.some(staff => staff.toLowerCase().includes(staffFilter))) {
                        return false;
                    }
                }

                // 狀態篩選
                if (statusFilter.length > 0 && !statusFilter.includes(system.status)) {
                    return false;
                }

                // 未完成系統篩選 - 新邏輯：檢查是否有任一時間節點未完成
                if (incompleteOnly) {
                    // 如果系統沒有里程碑，則根據進度和狀態判斷
                    if (system.milestones.length === 0) {
                        if (system.status === '維護中' || system.progress === 100) {
                            return false;
                        }
                    } else {
                        // 如果有里程碑，檢查是否有任一未完成
                        const hasIncompleteMilestone = system.milestones.some(milestone => !milestone.completed);
                        if (!hasIncompleteMilestone) {
                            return false;
                        }
                    }
                }

                return true;
            });

            // 如果有符合條件的系統，則只顯示該專案的符合條件系統
            if (filteredSystems.length > 0) {
                this.filteredData.push({
                    ...project,
                    systems: filteredSystems
                });
            }
        });

        this.renderDashboard();
        this.updateFilterStatus();
    }

    // 清除篩選器
    clearFilters() {
        document.getElementById('project-filter').selectedIndex = 0;
        document.getElementById('system-filter').value = '';
        document.getElementById('staff-filter').value = '';
        document.getElementById('status-filter').selectedIndex = 0;
        document.getElementById('incomplete-only').checked = false;
        
        this.filteredData = [...this.data];
        this.renderDashboard();
        this.updateFilterStatus();
    }

    // 渲染儀表板
    renderDashboard() {
        this.updateStatistics();
        this.renderGanttChart();
    }

    // 更新統計資訊
    updateStatistics() {
        const totalProjects = this.filteredData.length;
        let totalSystems = 0;
        let developingSystems = 0;
        let optimizingSystems = 0;
        let maintainingSystems = 0;

        this.filteredData.forEach(project => {
            totalSystems += project.systems.length;
            project.systems.forEach(system => {
                switch (system.status) {
                    case '開發中':
                        developingSystems++;
                        break;
                    case '優化中':
                        optimizingSystems++;
                        break;
                    case '維護中':
                        maintainingSystems++;
                        break;
                }
            });
        });

        document.getElementById('total-projects').textContent = totalProjects;
        document.getElementById('total-systems').textContent = totalSystems;
        document.getElementById('developing-systems').textContent = developingSystems;
        document.getElementById('optimizing-systems').textContent = optimizingSystems;
        document.getElementById('maintaining-systems').textContent = maintainingSystems;
    }

    // 渲染甘特圖
    renderGanttChart() {
        const chartContainer = document.getElementById('gantt-chart');
        
        if (this.filteredData.length === 0) {
            chartContainer.innerHTML = `
                <div class="empty-state">
                    <h3>沒有符合條件的資料</h3>
                    <p>請調整篩選條件或重新載入資料</p>
                </div>
            `;
            return;
        }

        chartContainer.innerHTML = '';

        const ganttContainer = document.createElement('div');
        ganttContainer.className = 'gantt-container';
        ganttContainer.style.position = 'relative'; // 確保網格線相對定位

        // 計算時間軸
        const timelineWidth = 800;
        const totalDays = Math.ceil((this.timeRange.end - this.timeRange.start) / (1000 * 60 * 60 * 24));

        // 添加時間軸標記
        const timeAxisContainer = document.createElement('div');
        timeAxisContainer.className = 'time-axis-container';
        
        const timeAxisHeader = document.createElement('div');
        timeAxisHeader.className = 'time-axis-header';
        timeAxisHeader.textContent = '時間軸';
        
        const timeAxisTimeline = document.createElement('div');
        timeAxisTimeline.className = 'time-axis-timeline';
        
        // 生成網格背景線容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'time-grid-container';
        
        // 生成月份標記和網格線
        let currentDate = new Date(this.timeRange.start);
        currentDate.setDate(1); // 設定為月初
        let previousYear = currentDate.getFullYear();
        
        while (currentDate <= this.timeRange.end) {
            const offset = (currentDate - this.timeRange.start) / (1000 * 60 * 60 * 24);
            const percent = (offset / totalDays) * 100;
            const currentYear = currentDate.getFullYear();
            const isNewYear = currentYear !== previousYear;
            
            // 月份標記
            const timeMark = document.createElement('div');
            timeMark.className = `time-mark ${isNewYear ? 'new-year-mark' : ''}`;
            timeMark.style.left = `${percent}%`;
            timeMark.innerHTML = `
                <div class="time-mark-month">${currentDate.getFullYear()}</div>
                <div class="time-mark-date">${String(currentDate.getMonth() + 1).padStart(2, '0')}月</div>
            `;
            
            // 垂直網格線
            const gridLine = document.createElement('div');
            gridLine.className = `grid-line ${isNewYear ? 'year-line' : ''}`;
            gridLine.style.left = `${percent}%`;
            
            timeAxisTimeline.appendChild(timeMark);
            gridContainer.appendChild(gridLine);
            
            // 更新前一年
            previousYear = currentYear;
            
            // 移到下個月
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // 添加今日標記
        const today = new Date();
        if (today >= this.timeRange.start && today <= this.timeRange.end) {
            const todayOffset = (today - this.timeRange.start) / (1000 * 60 * 60 * 24);
            const todayPercent = (todayOffset / totalDays) * 100;
            
            const todayMark = document.createElement('div');
            todayMark.className = 'today-mark';
            todayMark.style.left = `${todayPercent}%`;
            todayMark.innerHTML = `
                <div class="today-label">今日</div>
                <div class="today-date">${today.getMonth() + 1}/${today.getDate()}</div>
            `;
            
            const todayLine = document.createElement('div');
            todayLine.className = 'today-line';
            todayLine.style.left = `${todayPercent}%`;
            
            timeAxisTimeline.appendChild(todayMark);
            gridContainer.appendChild(todayLine);
        }
        
        timeAxisContainer.appendChild(timeAxisHeader);
        timeAxisContainer.appendChild(timeAxisTimeline);
        ganttContainer.appendChild(timeAxisContainer);
        
        // 建立專案內容容器
        const projectsContainer = document.createElement('div');
        projectsContainer.className = 'projects-container';
        projectsContainer.style.position = 'relative';
        projectsContainer.appendChild(gridContainer);

        this.filteredData.forEach((project, projectIndex) => {
            const projectGroup = document.createElement('div');
            projectGroup.className = 'project-group';
            projectGroup.draggable = false; // 初始禁用，只有通過拖拽手把才啟用
            projectGroup.dataset.projectId = project.projectName;
            projectGroup.dataset.projectIndex = projectIndex;

            // 專案標題
            const projectHeader = document.createElement('div');
            projectHeader.className = 'project-header';
            
            // 在編輯模式下添加拖拽圖示
            if (this.isEditMode) {
                const dragHandle = document.createElement('span');
                dragHandle.className = 'drag-handle';
                dragHandle.textContent = '⋮⋮';
                dragHandle.style.cursor = 'grab';
                
                // 防止點擊事件冒泡
                dragHandle.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                
                // 拖拽手把的mousedown事件，啟用父元素的拖拽
                dragHandle.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    projectGroup.draggable = true;
                });
                
                projectHeader.appendChild(dragHandle);
            }
            
            const projectTitle = document.createElement('span');
            projectTitle.innerHTML = `
                ${project.projectName} 
                <span style="font-weight: normal; color: #666;">
                    (PM: ${project.projectManager}, ${project.projectStartDate} ~ ${project.projectEndDate})
                </span>
            `;
            projectHeader.appendChild(projectTitle);
            
            // 編輯模式下的專案操作
            if (this.isEditMode) {
                projectHeader.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn')) {
                        this.showEditProjectModal(project);
                    }
                });
                
                projectHeader.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showDeleteConfirmation('project', project.projectName, () => {
                        this.deleteProject(project.projectName);
                    });
                });
                
                // 添加編輯按鈕
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.innerHTML = '✏';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEditProjectModal(project);
                });
                projectHeader.appendChild(editBtn);
                
                // 添加刪除按鈕
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showDeleteConfirmation('project', project.projectName, () => {
                        this.deleteProject(project.projectName);
                    });
                });
                projectHeader.appendChild(deleteBtn);
            }
            
            projectGroup.appendChild(projectHeader);
            
            // 在mouseup時禁用拖拽，防止意外拖拽
            projectGroup.addEventListener('mouseup', () => {
                if (this.isEditMode) {
                    projectGroup.draggable = false;
                }
            });

            // 系統列表
            project.systems.forEach((system, systemIndex) => {
                const systemRow = document.createElement('div');
                systemRow.className = 'system-row';
                systemRow.draggable = false; // 初始禁用，只有通過拖拽手把才啟用
                systemRow.dataset.systemId = system.systemName;
                systemRow.dataset.systemIndex = systemIndex;
                systemRow.dataset.projectId = project.projectName;

                // 系統標籤
                const systemLabel = document.createElement('div');
                systemLabel.className = 'system-label';
                
                // 在編輯模式下添加拖拽圖示
                if (this.isEditMode) {
                    const dragHandle = document.createElement('span');
                    dragHandle.className = 'drag-handle';
                    dragHandle.textContent = '⋮⋮';
                    dragHandle.style.cursor = 'grab';
                    
                    // 防止點擊事件冒泡
                    dragHandle.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                    
                    // 拖拽手把的mousedown事件，啟用父元素的拖拽
                    dragHandle.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        systemRow.draggable = true;
                    });
                    
                    systemLabel.appendChild(dragHandle);
                } else {
                    systemRow.draggable = false;
                }
                
                const systemName = document.createElement('span');
                systemName.textContent = system.systemName;
                systemLabel.appendChild(systemName);

                // 時間軸
                const systemTimeline = document.createElement('div');
                systemTimeline.className = 'system-timeline';

                // 計算時間條位置和寬度
                const systemStart = new Date(system.startDate);
                const systemEnd = new Date(system.endDate);
                const startOffset = (systemStart - this.timeRange.start) / (1000 * 60 * 60 * 24);
                const systemDuration = (systemEnd - systemStart) / (1000 * 60 * 60 * 24);
                
                const leftPercent = (startOffset / totalDays) * 100;
                const widthPercent = (systemDuration / totalDays) * 100;

                // 時間條
                const timelineBar = document.createElement('div');
                timelineBar.className = `timeline-bar ${system.status === '開發中' ? 'developing' : system.status === '優化中' ? 'optimizing' : 'maintaining'}`;
                timelineBar.style.left = `${leftPercent}%`;
                timelineBar.style.width = `${widthPercent}%`;

                // 進度覆蓋層（僅用於開發中和優化中）
                if (system.status === '開發中' || system.status === '優化中') {
                    const progressOverlay = document.createElement('div');
                    progressOverlay.className = 'progress-overlay';
                    progressOverlay.style.width = `${system.progress}%`;
                    timelineBar.appendChild(progressOverlay);
                }

                // 里程碑標記
                system.milestones.forEach(milestone => {
                    const milestoneDate = new Date(milestone.date);
                    const milestoneOffset = (milestoneDate - this.timeRange.start) / (1000 * 60 * 60 * 24);
                    const milestonePercent = (milestoneOffset / totalDays) * 100;

                    const milestoneElement = document.createElement('div');
                    milestoneElement.className = `milestone ${milestone.completed ? 'milestone-completed' : 'milestone-pending'}`;
                    // 讓時間點對應圓形的右邊緣：需要往左偏移整個圓形的寬度(14px)
                    milestoneElement.style.left = `calc(${milestonePercent}% - 14px)`;
                    milestoneElement.setAttribute('data-milestone', milestone.label);
                    milestoneElement.setAttribute('data-date', milestone.date);
                    milestoneElement.setAttribute('data-completed', milestone.completed);

                    // 里程碑 Tooltip 事件
                    milestoneElement.addEventListener('mouseenter', (e) => {
                        this.showMilestoneTooltip(e, milestone);
                    });
                    milestoneElement.addEventListener('mouseleave', () => {
                        this.hideTooltip();
                    });

                    // 點擊切換完成狀態
                    milestoneElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleMilestoneStatus(project.projectName, system.systemName, milestone);
                    });

                    systemTimeline.appendChild(milestoneElement);
                });

                systemTimeline.appendChild(timelineBar);

                // 事件監聽器
                timelineBar.addEventListener('click', () => this.showSystemDetail(project, system));
                
                // 編輯模式下的右鍵選單
                if (this.isEditMode) {
                    systemRow.addEventListener('click', (e) => {
                        // 避免與拖放功能衝突
                        if (!e.target.classList.contains('edit-btn') && 
                            !e.target.classList.contains('delete-btn') &&
                            !e.target.classList.contains('drag-handle') &&
                            !systemRow.hasAttribute('draggable')) {
                            this.showEditSystemModal(project, system);
                        }
                    });
                    
                    systemRow.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.showDeleteConfirmation('system', system.systemName, () => {
                            this.deleteSystem(project.projectName, system.systemName);
                        });
                    });
                    
                    // 添加編輯按鈕
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-btn';
                    editBtn.innerHTML = '✏';
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showEditSystemModal(project, system);
                    });
                    systemRow.appendChild(editBtn);
                    
                    // 添加刪除按鈕
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showDeleteConfirmation('system', system.systemName, () => {
                            this.deleteSystem(project.projectName, system.systemName);
                        });
                    });
                    systemRow.appendChild(deleteBtn);
                }
                
                // Tooltip 事件
                systemRow.addEventListener('mouseenter', (e) => this.showTooltip(e, system));
                systemRow.addEventListener('mouseleave', () => this.hideTooltip());

                systemRow.appendChild(systemLabel);
                systemRow.appendChild(systemTimeline);
                
                // 在mouseup時禁用拖拽，防止意外拖拽
                systemRow.addEventListener('mouseup', () => {
                    if (this.isEditMode) {
                        systemRow.draggable = false;
                    }
                });
                
                projectGroup.appendChild(systemRow);
            });

            projectsContainer.appendChild(projectGroup);
            
            // 在編輯模式下為專案組添加拖放事件
            if (this.isEditMode) {
                this.setupProjectDragAndDrop(projectGroup);
                
                // 為系統行添加拖放事件
                projectGroup.querySelectorAll('.system-row').forEach(systemRow => {
                    this.setupSystemDragAndDrop(systemRow);
                });
            }
        });

        // 將專案容器添加到甘特圖容器
        ganttContainer.appendChild(projectsContainer);

        // 時間軸
        const timeAxis = document.createElement('div');
        timeAxis.className = 'time-axis';
        
        const months = this.generateTimeLabels();
        months.forEach(month => {
            const timeLabel = document.createElement('div');
            timeLabel.textContent = month;
            timeAxis.appendChild(timeLabel);
        });

        ganttContainer.appendChild(timeAxis);
        chartContainer.appendChild(ganttContainer);

        // 設置編輯模式樣式
        if (this.isEditMode) {
            chartContainer.classList.add('edit-mode');
        } else {
            chartContainer.classList.remove('edit-mode');
        }
    }

    // 產生時間標籤
    generateTimeLabels() {
        const labels = [];
        const start = new Date(this.timeRange.start);
        const end = new Date(this.timeRange.end);
        
        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        
        while (current <= end) {
            labels.push(`${current.getFullYear()}/${String(current.getMonth() + 1).padStart(2, '0')}`);
            current.setMonth(current.getMonth() + 1);
        }
        
        return labels;
    }

    // 顯示系統詳細資訊
    showSystemDetail(project, system) {
        const detailPanel = document.getElementById('detail-panel');
        const detailTitle = document.getElementById('detail-title');
        const basicInfo = document.getElementById('basic-info');
        const staffInfo = document.getElementById('staff-info');
        const milestonesInfo = document.getElementById('milestones-info');

        detailTitle.textContent = `${system.systemName} - ${project.projectName}`;

        // 基本資訊
        basicInfo.innerHTML = `
            <div class="info-row">
                <div class="info-label">專案PM：</div>
                <div class="info-value">${project.projectManager}</div>
            </div>
            <div class="info-row">
                <div class="info-label">系統狀態：</div>
                <div class="info-value">${system.status}</div>
            </div>
            <div class="info-row">
                <div class="info-label">開始日期：</div>
                <div class="info-value">${system.startDate}</div>
            </div>
            <div class="info-row">
                <div class="info-label">結束日期：</div>
                <div class="info-value">${system.endDate}</div>
            </div>
            ${(system.status === '開發中' || system.status === '優化中') ? `
                <div class="info-row">
                    <div class="info-label">進度：</div>
                    <div class="info-value">
                        <div class="progress-info">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${system.progress}%"></div>
                            </div>
                            <div class="progress-text">${system.progress}%</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        // 人員資訊
        staffInfo.innerHTML = `
            <div class="info-row">
                <div class="info-label">承辦人員：</div>
                <div class="info-value">
                    <div class="staff-list">
                        ${system.administrators.map(admin => `<span class="staff-tag">${admin}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">技術人員：</div>
                <div class="info-value">
                    <div class="staff-list">
                        ${system.technicians.map(tech => `<span class="staff-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        // 里程碑資訊
        milestonesInfo.innerHTML = system.milestones.map(milestone => `
            <div class="milestone-item">
                <div class="milestone-label">${milestone.label}</div>
                <div class="milestone-date">${milestone.date}</div>
            </div>
        `).join('');

        detailPanel.classList.remove('hidden');
    }

    // 隱藏詳細面板
    hideDetailPanel() {
        document.getElementById('detail-panel').classList.add('hidden');
    }

    // 顯示 Tooltip
    showTooltip(event, system) {
        const tooltip = document.getElementById('tooltip');
        const allStaff = [...system.administrators, ...system.technicians];
        
        let content = `
            <strong>${system.systemName}</strong><br>
            狀態：${system.status}<br>
            負責人：${allStaff.join(', ')}
        `;
        
        if (system.status === '開發中' || system.status === '優化中') {
            content += `<br>進度：${system.progress}%`;
        }
        
        tooltip.innerHTML = content;
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
        tooltip.classList.remove('hidden');
    }

    // 隱藏 Tooltip
    hideTooltip() {
        document.getElementById('tooltip').classList.add('hidden');
    }

    // 格式化里程碑日期顯示
    formatDateForMilestone(dateString) {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}/${day}`;
    }

    // 顯示里程碑 Tooltip
    showMilestoneTooltip(event, milestone) {
        const tooltip = document.getElementById('tooltip');
        
        const statusText = milestone.completed ? '已完成' : '未完成';
        const content = `
            <strong>${milestone.label}</strong><br>
            日期：${milestone.date}<br>
            狀態：${statusText}<br>
            <small>點擊可切換完成狀態</small>
        `;
        
        tooltip.innerHTML = content;
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
        tooltip.classList.remove('hidden');
    }

    // 切換里程碑完成狀態
    toggleMilestoneStatus(projectName, systemName, milestone) {
        const project = this.data.find(p => p.projectName === projectName);
        if (project) {
            const system = project.systems.find(s => s.systemName === systemName);
            if (system) {
                const targetMilestone = system.milestones.find(m => 
                    m.label === milestone.label && m.date === milestone.date
                );
                if (targetMilestone) {
                    targetMilestone.completed = !targetMilestone.completed;
                    this.filteredData = [...this.data];
                    this.renderDashboard();
                    
                    // 自動儲存到LocalStorage
                    this.saveToLocalStorage();
                }
            }
        }
    }

    // 設置模態框事件監聽器
    setupModalEventListeners() {
        // 關閉模態框事件
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });

        // 點擊背景關閉模態框
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });

        // 新增專案表單提交
        document.getElementById('add-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProject();
        });

        // 新增系統表單提交
        document.getElementById('add-system-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddSystem();
        });

        // 編輯專案表單提交
        document.getElementById('edit-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditProject();
        });

        // 編輯系統表單提交
        document.getElementById('edit-system-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSystem();
        });

        // 新增里程碑按鈕
        document.getElementById('add-milestone-btn').addEventListener('click', () => {
            this.addMilestoneInput();
        });

        // 編輯模式的新增里程碑按鈕
        document.getElementById('edit-add-milestone-btn').addEventListener('click', () => {
            this.addEditMilestoneInput();
        });

        // 確認刪除按鈕
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            if (this.deleteCallback) {
                this.deleteCallback();
                this.hideAllModals();
            }
        });

        // 關閉篩選狀態顯示
        document.getElementById('close-filter-status').addEventListener('click', () => {
            document.getElementById('filter-status').classList.add('hidden');
        });
    }

    // 切換編輯模式
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const btn = document.getElementById('edit-mode-btn');
        const hint = document.getElementById('drag-drop-hint');
        
        btn.textContent = this.isEditMode ? '退出編輯' : '編輯模式';
        btn.className = this.isEditMode ? 'btn btn-danger' : 'btn btn-warning';
        
        // 顯示或隱藏拖放提示
        if (this.isEditMode) {
            hint.classList.remove('hidden');
        } else {
            hint.classList.add('hidden');
        }
        
        this.renderDashboard();
    }

    // 顯示新增專案模態框
    showAddProjectModal() {
        document.getElementById('add-project-modal').classList.remove('hidden');
        this.resetForm('add-project-form');
    }

    // 顯示新增系統模態框
    showAddSystemModal() {
        // 清理可能的瀏覽器表單數據記憶
        if (typeof Storage !== "undefined") {
            sessionStorage.removeItem('add-system-form');
            localStorage.removeItem('add-system-form');
        }
        
        document.getElementById('add-system-modal').classList.remove('hidden');
        this.resetForm('add-system-form');
        this.populateProjectSelect();
        
        // 完全重建里程碑容器，避免瀏覽器記憶
        this.rebuildMilestonesContainer();
        
        // 多次重置，確保清除
        setTimeout(() => {
            this.rebuildMilestonesContainer();
        }, 50);
        
        setTimeout(() => {
            this.rebuildMilestonesContainer();
        }, 100);
        
        // 最後確保所有欄位都是空的
        setTimeout(() => {
            document.getElementById('add-system-form').querySelectorAll('input, select').forEach(field => {
                if (field.type === 'checkbox') {
                    field.checked = false;
                } else {
                    field.value = '';
                }
            });
        }, 150);
    }

    // 完全重建里程碑容器
    rebuildMilestonesContainer() {
        const container = document.getElementById('milestones-container');
        
        // 完全移除容器內容
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // 創建全新的里程碑輸入，使用隨機ID防止瀏覽器記憶
        const uniqueId = Date.now() + Math.random();
        const milestoneInput = document.createElement('div');
        milestoneInput.className = 'milestone-input';
        milestoneInput.innerHTML = `
            <input type="text" 
                   placeholder="里程碑名稱" 
                   class="milestone-label" 
                   autocomplete="off" 
                   name="milestone_label_${uniqueId}"
                   id="milestone_label_${uniqueId}">
            <input type="date" 
                   class="milestone-date" 
                   autocomplete="off"
                   name="milestone_date_${uniqueId}"
                   id="milestone_date_${uniqueId}">
            <label class="milestone-checkbox">
                <input type="checkbox" 
                       class="milestone-completed"
                       name="milestone_completed_${uniqueId}"
                       id="milestone_completed_${uniqueId}">
                已完成
            </label>
            <button type="button" class="btn btn-danger btn-small remove-milestone">移除</button>
        `;
        
        container.appendChild(milestoneInput);
        this.setupMilestoneEvents();
        
        // 強制清除任何可能的值
        setTimeout(() => {
            container.querySelectorAll('input').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
                // 觸發change事件確保清除
                input.dispatchEvent(new Event('change'));
            });
        }, 10);
    }

    // 隱藏所有模態框
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            // 清理表單數據
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => {
                form.reset();
                // 清除所有input值
                form.querySelectorAll('input, select, textarea').forEach(field => {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = false;
                    } else {
                        field.value = '';
                    }
                    // 移除可能的自動填入屬性
                    field.removeAttribute('data-lpignore');
                    field.removeAttribute('data-form-type');
                    field.setAttribute('autocomplete', 'off');
                });
            });
        });
        
        // 清理瀏覽器存儲
        if (typeof Storage !== "undefined") {
            sessionStorage.removeItem('add-system-form');
            sessionStorage.removeItem('edit-system-form');
            localStorage.removeItem('add-system-form');
            localStorage.removeItem('edit-system-form');
        }
        
        // 清理里程碑容器，防止數據殘留
        const milestonesContainer = document.getElementById('milestones-container');
        if (milestonesContainer) {
            milestonesContainer.querySelectorAll('input').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }
        
        // 重建里程碑容器以確保完全清空
        setTimeout(() => {
            this.rebuildMilestonesContainer();
        }, 100);
    }

    // 重置表單
    resetForm(formId) {
        const form = document.getElementById(formId);
        form.reset();
        
        // 強制清除所有輸入欄位的值
        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = false;
            } else {
                field.value = '';
            }
        });
    }

    // 填充專案選擇器
    populateProjectSelect() {
        const select = document.getElementById('system-project');
        select.innerHTML = '<option value="">請選擇專案</option>';
        
        this.data.forEach(project => {
            const option = document.createElement('option');
            option.value = project.projectName;
            option.textContent = project.projectName;
            select.appendChild(option);
        });
    }

    // 重置里程碑輸入區域
    resetMilestones() {
        // 使用新的重建方法
        this.rebuildMilestonesContainer();
    }

    // 新增里程碑輸入
    addMilestoneInput() {
        const container = document.getElementById('milestones-container');
        const uniqueId = Date.now() + Math.random();
        const milestoneInput = document.createElement('div');
        milestoneInput.className = 'milestone-input';
        milestoneInput.innerHTML = `
            <input type="text" 
                   placeholder="里程碑名稱" 
                   class="milestone-label" 
                   autocomplete="off"
                   name="milestone_label_${uniqueId}"
                   id="milestone_label_${uniqueId}">
            <input type="date" 
                   class="milestone-date" 
                   autocomplete="off"
                   name="milestone_date_${uniqueId}"
                   id="milestone_date_${uniqueId}">
            <label class="milestone-checkbox">
                <input type="checkbox" 
                       class="milestone-completed"
                       name="milestone_completed_${uniqueId}"
                       id="milestone_completed_${uniqueId}">
                已完成
            </label>
            <button type="button" class="btn btn-danger btn-small remove-milestone">移除</button>
        `;
        container.appendChild(milestoneInput);
        this.setupMilestoneEvents();
        
        // 確保新輸入是空的
        setTimeout(() => {
            milestoneInput.querySelectorAll('input').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }, 10);
    }

    // 設置里程碑事件
    setupMilestoneEvents() {
        // 移除所有現有的事件監聽器，避免重複綁定
        document.querySelectorAll('.remove-milestone').forEach(btn => {
            // 移除舊的事件監聽器
            btn.replaceWith(btn.cloneNode(true));
        });
        
        // 重新綁定事件監聽器
        document.querySelectorAll('.remove-milestone').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const milestoneInputs = document.querySelectorAll('.milestone-input');
                if (milestoneInputs.length > 1) {
                    // 如果有多個里程碑，直接移除
                    btn.closest('.milestone-input').remove();
                } else {
                    // 如果只有一個里程碑，清空內容而不是移除元素
                    const milestoneInput = btn.closest('.milestone-input');
                    milestoneInput.querySelector('.milestone-label').value = '';
                    milestoneInput.querySelector('.milestone-date').value = '';
                    milestoneInput.querySelector('.milestone-completed').checked = false;
                }
            });
        });
    }

    // 處理新增專案
    handleAddProject() {
        const formData = {
            projectName: document.getElementById('project-name').value,
            projectManager: document.getElementById('project-manager').value,
            projectStartDate: document.getElementById('project-start-date').value,
            projectEndDate: document.getElementById('project-end-date').value,
            systems: []
        };

        // 驗證日期
        if (new Date(formData.projectStartDate) >= new Date(formData.projectEndDate)) {
            alert('專案結束日期必須晚於開始日期');
            return;
        }

        // 檢查專案名稱是否重複
        if (this.data.some(p => p.projectName === formData.projectName)) {
            alert('專案名稱已存在');
            return;
        }

        this.data.push(formData);
        this.calculateTimeRange();
        this.filteredData = [...this.data];
        this.populateFilterOptions();
        this.renderDashboard();
        this.hideAllModals();
        
        // 自動儲存到LocalStorage
        this.saveToLocalStorage();
        
        alert('專案新增成功！');
    }

    // 處理新增系統
    handleAddSystem() {
        const projectName = document.getElementById('system-project').value;
        const systemData = {
            systemName: document.getElementById('system-name').value,
            administrators: document.getElementById('system-administrators').value.split(',').map(s => s.trim()).filter(s => s),
            technicians: document.getElementById('system-technicians').value.split(',').map(s => s.trim()).filter(s => s),
            status: document.getElementById('system-status').value,
            progress: parseInt(document.getElementById('system-progress').value) || 0,
            startDate: document.getElementById('system-start-date').value,
            endDate: document.getElementById('system-end-date').value,
            milestones: []
        };

        // 收集里程碑資料
        document.querySelectorAll('.milestone-input').forEach(input => {
            const label = input.querySelector('.milestone-label').value;
            const date = input.querySelector('.milestone-date').value;
            const completed = input.querySelector('.milestone-completed') ? 
                input.querySelector('.milestone-completed').checked : false;
            if (label && date) {
                systemData.milestones.push({ label, date, completed });
            }
        });

        // 驗證資料
        if (!projectName) {
            alert('請選擇所屬專案');
            return;
        }

        if (new Date(systemData.startDate) >= new Date(systemData.endDate)) {
            alert('系統結束日期必須晚於開始日期');
            return;
        }

        // 找到專案並新增系統
        const project = this.data.find(p => p.projectName === projectName);
        if (!project) {
            alert('找不到指定的專案');
            return;
        }

        // 檢查系統名稱是否重複
        if (project.systems.some(s => s.systemName === systemData.systemName)) {
            alert('該專案中已存在相同名稱的系統');
            return;
        }

        project.systems.push(systemData);
        this.calculateTimeRange();
        this.filteredData = [...this.data];
        this.renderDashboard();
        this.hideAllModals();
        
        // 自動儲存到LocalStorage
        this.saveToLocalStorage();
        
        alert('系統新增成功！');
    }

    // 顯示刪除確認
    showDeleteConfirmation(type, name, callback) {
        const modal = document.getElementById('confirm-delete-modal');
        const message = document.getElementById('delete-message');
        
        message.textContent = `確定要刪除${type === 'project' ? '專案' : '系統'} "${name}" 嗎？`;
        if (type === 'project') {
            message.textContent += ' 這將同時刪除該專案下的所有系統。';
        }
        
        this.deleteCallback = callback;
        modal.classList.remove('hidden');
    }

    // 刪除專案
    deleteProject(projectName) {
        this.data = this.data.filter(p => p.projectName !== projectName);
        this.calculateTimeRange();
        this.filteredData = [...this.data];
        this.populateFilterOptions();
        this.renderDashboard();
        
        // 自動儲存到LocalStorage
        this.saveToLocalStorage();
        
        alert('專案刪除成功！');
    }

    // 刪除系統
    deleteSystem(projectName, systemName) {
        const project = this.data.find(p => p.projectName === projectName);
        if (project) {
            project.systems = project.systems.filter(s => s.systemName !== systemName);
            this.calculateTimeRange();
            this.filteredData = [...this.data];
            this.renderDashboard();
            
            // 自動儲存到LocalStorage
            this.saveToLocalStorage();
            
            alert('系統刪除成功！');
        }
    }

    // 顯示編輯專案模態框
    showEditProjectModal(project) {
        document.getElementById('edit-project-modal').classList.remove('hidden');
        
        // 填充表單資料
        document.getElementById('edit-project-original-name').value = project.projectName;
        document.getElementById('edit-project-name').value = project.projectName;
        document.getElementById('edit-project-manager').value = project.projectManager;
        document.getElementById('edit-project-start-date').value = project.projectStartDate;
        document.getElementById('edit-project-end-date').value = project.projectEndDate;
    }

    // 顯示編輯系統模態框
    showEditSystemModal(project, system) {
        // 清理可能的瀏覽器表單數據記憶
        if (typeof Storage !== "undefined") {
            sessionStorage.removeItem('edit-system-form');
            localStorage.removeItem('edit-system-form');
        }
        
        document.getElementById('edit-system-modal').classList.remove('hidden');
        
        // 填充表單資料
        document.getElementById('edit-system-project-name').value = project.projectName;
        document.getElementById('edit-system-original-name').value = system.systemName;
        document.getElementById('edit-system-name').value = system.systemName;
        document.getElementById('edit-system-administrators').value = system.administrators.join(', ');
        document.getElementById('edit-system-technicians').value = system.technicians.join(', ');
        document.getElementById('edit-system-status').value = system.status;
        document.getElementById('edit-system-progress').value = system.progress;
        document.getElementById('edit-system-start-date').value = system.startDate;
        document.getElementById('edit-system-end-date').value = system.endDate;
        
        // 填充里程碑
        this.populateEditMilestones(system.milestones || []);
    }

    // 填充編輯模式的里程碑
    populateEditMilestones(milestones) {
        const container = document.getElementById('edit-milestones-container');
        container.innerHTML = '';
        
        // 只有當 milestones 有實際內容時才顯示，不要強制建立空的里程碑
        if (milestones && milestones.length > 0) {
            milestones.forEach(milestone => {
                // 只有當里程碑有內容時才建立
                if (milestone.label || milestone.date) {
                    const milestoneInput = document.createElement('div');
                    milestoneInput.className = 'milestone-input';
                    milestoneInput.innerHTML = `
                        <input type="text" placeholder="里程碑名稱" class="milestone-label" value="${milestone.label || ''}" autocomplete="off" data-lpignore="true">
                        <input type="date" class="milestone-date" value="${milestone.date || ''}" autocomplete="off" data-lpignore="true">
                        <label class="milestone-checkbox">
                            <input type="checkbox" class="milestone-completed" ${milestone.completed ? 'checked' : ''}>
                            已完成
                        </label>
                        <button type="button" class="btn btn-danger btn-small remove-edit-milestone">移除</button>
                    `;
                    container.appendChild(milestoneInput);
                }
            });
        }
        
        this.setupEditMilestoneEvents();
    }

    // 新增編輯模式的里程碑輸入
    addEditMilestoneInput() {
        const container = document.getElementById('edit-milestones-container');
        const milestoneInput = document.createElement('div');
        const timestamp = Date.now();
        milestoneInput.className = 'milestone-input';
        milestoneInput.innerHTML = `
            <input type="text" placeholder="里程碑名稱" class="milestone-label" 
                   id="edit-milestone-label-${timestamp}" 
                   name="edit-milestone-label-${timestamp}"
                   autocomplete="off" data-lpignore="true" data-form-type="other">
            <input type="date" class="milestone-date" 
                   id="edit-milestone-date-${timestamp}" 
                   name="edit-milestone-date-${timestamp}"
                   autocomplete="off" data-lpignore="true" data-form-type="other">
            <label class="milestone-checkbox">
                <input type="checkbox" class="milestone-completed" 
                       id="edit-milestone-completed-${timestamp}" 
                       name="edit-milestone-completed-${timestamp}">
                已完成
            </label>
            <button type="button" class="btn btn-danger btn-small remove-edit-milestone">移除</button>
        `;
        container.appendChild(milestoneInput);
        this.setupEditMilestoneEvents();
    }

    // 設置編輯模式里程碑事件
    setupEditMilestoneEvents() {
        document.querySelectorAll('.remove-edit-milestone').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                // 允許移除任何里程碑，包括最後一個
                btn.closest('.milestone-input').remove();
                console.log('已移除里程碑，剩餘數量:', document.querySelectorAll('#edit-milestones-container .milestone-input').length);
            };
        });
    }

    // 處理編輯專案
    handleEditProject() {
        const originalName = document.getElementById('edit-project-original-name').value;
        const formData = {
            projectName: document.getElementById('edit-project-name').value,
            projectManager: document.getElementById('edit-project-manager').value,
            projectStartDate: document.getElementById('edit-project-start-date').value,
            projectEndDate: document.getElementById('edit-project-end-date').value
        };

        // 驗證日期
        if (new Date(formData.projectStartDate) >= new Date(formData.projectEndDate)) {
            alert('專案結束日期必須晚於開始日期');
            return;
        }

        // 檢查專案名稱是否重複（除了自己）
        if (formData.projectName !== originalName && 
            this.data.some(p => p.projectName === formData.projectName)) {
            alert('專案名稱已存在');
            return;
        }

        // 更新專案資料
        const project = this.data.find(p => p.projectName === originalName);
        if (project) {
            project.projectName = formData.projectName;
            project.projectManager = formData.projectManager;
            project.projectStartDate = formData.projectStartDate;
            project.projectEndDate = formData.projectEndDate;
            
            this.calculateTimeRange();
            this.filteredData = [...this.data];
            this.populateFilterOptions();
            this.renderDashboard();
            this.hideAllModals();
            
            alert('專案更新成功！');
        }
    }

    // 處理編輯系統
    handleEditSystem() {
        const projectName = document.getElementById('edit-system-project-name').value;
        const originalName = document.getElementById('edit-system-original-name').value;
        const systemData = {
            systemName: document.getElementById('edit-system-name').value,
            administrators: document.getElementById('edit-system-administrators').value.split(',').map(s => s.trim()).filter(s => s),
            technicians: document.getElementById('edit-system-technicians').value.split(',').map(s => s.trim()).filter(s => s),
            status: document.getElementById('edit-system-status').value,
            progress: parseInt(document.getElementById('edit-system-progress').value) || 0,
            startDate: document.getElementById('edit-system-start-date').value,
            endDate: document.getElementById('edit-system-end-date').value,
            milestones: []
        };

        // 收集里程碑資料 - 只保存有實際內容的里程碑
        document.querySelectorAll('#edit-milestones-container .milestone-input').forEach(input => {
            const label = input.querySelector('.milestone-label').value.trim();
            const date = input.querySelector('.milestone-date').value.trim();
            const completed = input.querySelector('.milestone-completed') ? 
                input.querySelector('.milestone-completed').checked : false;
            
            // 只有當里程碑名稱和日期都有值時，才加入到系統資料中
            if (label && date) {
                systemData.milestones.push({ label, date, completed });
            }
        });

        console.log('儲存的里程碑數量:', systemData.milestones.length);

        // 驗證資料
        if (new Date(systemData.startDate) >= new Date(systemData.endDate)) {
            alert('系統結束日期必須晚於開始日期');
            return;
        }

        // 找到專案並更新系統
        const project = this.data.find(p => p.projectName === projectName);
        if (!project) {
            alert('找不到指定的專案');
            return;
        }

        // 檢查系統名稱是否重複（除了自己）
        if (systemData.systemName !== originalName &&
            project.systems.some(s => s.systemName === systemData.systemName)) {
            alert('該專案中已存在相同名稱的系統');
            return;
        }

        // 更新系統資料
        const system = project.systems.find(s => s.systemName === originalName);
        if (system) {
            Object.assign(system, systemData);
            
            this.calculateTimeRange();
            this.filteredData = [...this.data];
            this.renderDashboard();
            this.hideAllModals();
            
            alert('系統更新成功！');
        }
    }

    // 更新篩選狀態顯示
    updateFilterStatus() {
        const filterStatus = document.getElementById('filter-status');
        const activeFilters = document.getElementById('active-filters');
        
        const projectFilter = Array.from(document.getElementById('project-filter').selectedOptions).map(o => o.value).filter(v => v);
        const systemFilter = document.getElementById('system-filter').value.trim();
        const staffFilter = document.getElementById('staff-filter').value.trim();
        const statusFilter = Array.from(document.getElementById('status-filter').selectedOptions).map(o => o.value).filter(v => v);
        const incompleteOnly = document.getElementById('incomplete-only').checked;

        const filters = [];

        if (projectFilter.length > 0) {
            filters.push(`專案: ${projectFilter.join(', ')}`);
        }
        if (systemFilter) {
            filters.push(`系統: ${systemFilter}`);
        }
        if (staffFilter) {
            filters.push(`人員: ${staffFilter}`);
        }
        if (statusFilter.length > 0) {
            filters.push(`狀態: ${statusFilter.join(', ')}`);
        }
        if (incompleteOnly) {
            filters.push(`僅顯示有未完成時間節點的系統`);
        }

        if (filters.length > 0) {
            activeFilters.innerHTML = filters.map(filter => 
                `<span class="filter-tag">${filter}</span>`
            ).join('');
            filterStatus.classList.remove('hidden');
        } else {
            filterStatus.classList.add('hidden');
        }
    }

    // 設置專案拖放功能
    setupProjectDragAndDrop(projectElement) {
        projectElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            projectElement.classList.add('dragging');
            this.draggedElement = {
                type: 'project',
                element: projectElement,
                projectId: projectElement.dataset.projectId,
                originalIndex: parseInt(projectElement.dataset.projectIndex)
            };
        });

        projectElement.addEventListener('dragend', (e) => {
            projectElement.classList.remove('dragging');
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('drop-zone');
            });
            this.draggedElement = null;
        });

        projectElement.addEventListener('dragover', (e) => {
            if (this.draggedElement && this.draggedElement.type === 'project') {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                projectElement.classList.add('drop-zone');
            }
        });

        projectElement.addEventListener('dragleave', (e) => {
            projectElement.classList.remove('drop-zone');
        });

        projectElement.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedElement && this.draggedElement.type === 'project') {
                const targetIndex = parseInt(projectElement.dataset.projectIndex);
                this.reorderProjects(this.draggedElement.originalIndex, targetIndex);
            }
            projectElement.classList.remove('drop-zone');
        });
    }

    // 設置系統拖放功能
    setupSystemDragAndDrop(systemElement) {
        console.log('設置系統拖放:', systemElement.dataset.systemId);
        
        systemElement.addEventListener('dragstart', (e) => {
            console.log('系統拖拽開始:', systemElement.dataset.systemId);
            console.log('systemElement.dataset:', systemElement.dataset);
            e.stopPropagation(); // 阻止事件冒泡到專案層
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            systemElement.classList.add('dragging');
            this.draggedElement = {
                type: 'system',
                element: systemElement,
                systemId: systemElement.dataset.systemId,
                projectId: systemElement.dataset.projectId,
                originalIndex: parseInt(systemElement.dataset.systemIndex)
            };
            console.log('設置 draggedElement:', this.draggedElement);
        });

        systemElement.addEventListener('dragend', (e) => {
            console.log('系統拖拽結束');
            e.stopPropagation(); // 阻止事件冒泡
            systemElement.classList.remove('dragging');
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('drop-zone');
            });
            this.draggedElement = null;
        });

        systemElement.addEventListener('dragover', (e) => {
            if (this.draggedElement && this.draggedElement.type === 'system' && 
                this.draggedElement.projectId === systemElement.dataset.projectId) {
                e.preventDefault();
                e.stopPropagation(); // 阻止事件冒泡
                e.dataTransfer.dropEffect = 'move';
                systemElement.classList.add('drop-zone');
            }
        });

        systemElement.addEventListener('dragleave', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            systemElement.classList.remove('drop-zone');
        });

        systemElement.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation(); // 阻止事件冒泡
            console.log('系統放置');
            console.log('draggedElement:', this.draggedElement);
            console.log('target systemElement projectId:', systemElement.dataset.projectId);
            console.log('target systemElement systemId:', systemElement.dataset.systemId);
            console.log('target systemElement systemIndex:', systemElement.dataset.systemIndex);
            
            if (this.draggedElement && this.draggedElement.type === 'system') {
                console.log('拖拽元素類型正確');
                if (this.draggedElement.projectId === systemElement.dataset.projectId) {
                    console.log('專案ID匹配');
                    const targetIndex = parseInt(systemElement.dataset.systemIndex);
                    console.log('重新排序系統:', this.draggedElement.originalIndex, '->', targetIndex);
                    this.reorderSystems(this.draggedElement.projectId, this.draggedElement.originalIndex, targetIndex);
                } else {
                    console.log('專案ID不匹配:', this.draggedElement.projectId, '!=', systemElement.dataset.projectId);
                }
            } else {
                console.log('拖拽元素類型不正確或為null');
            }
            systemElement.classList.remove('drop-zone');
        });
    }

    // 重新排序專案
    reorderProjects(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        const projects = [...this.data];
        const [movedProject] = projects.splice(fromIndex, 1);
        projects.splice(toIndex, 0, movedProject);
        
        this.data = projects;
        this.filteredData = [...this.data];
        
        // 保存到 localStorage
        this.saveToLocalStorage();
        
        // 重新渲染
        this.renderDashboard();
        
        console.log(`專案 "${movedProject.projectName}" 已從位置 ${fromIndex} 移動到位置 ${toIndex}`);
    }

    // 重新排序系統
    reorderSystems(projectId, fromIndex, toIndex) {
        console.log('執行 reorderSystems:', { projectId, fromIndex, toIndex });
        
        if (fromIndex === toIndex) {
            console.log('來源和目標索引相同，跳過排序');
            return;
        }
        
        const project = this.data.find(p => p.projectName === projectId);
        if (!project) {
            console.log('找不到專案:', projectId);
            return;
        }
        
        console.log('找到專案:', project.projectName, '系統數量:', project.systems.length);
        console.log('原始系統順序:', project.systems.map(s => s.systemName));
        
        const systems = [...project.systems];
        const [movedSystem] = systems.splice(fromIndex, 1);
        systems.splice(toIndex, 0, movedSystem);
        
        project.systems = systems;
        this.filteredData = [...this.data];
        
        console.log('新系統順序:', project.systems.map(s => s.systemName));
        
        // 保存到 localStorage
        this.saveToLocalStorage();
        
        // 重新渲染
        this.renderDashboard();
        
        console.log(`系統 "${movedSystem.systemName}" 已從位置 ${fromIndex} 移動到位置 ${toIndex}`);
    }

    // 切換表格視圖
    toggleTableView() {
        this.isTableView = !this.isTableView;
        const btn = document.getElementById('table-view-btn');
        const ganttSection = document.querySelector('.gantt-section');
        const tableSection = document.getElementById('table-section');
        
        btn.textContent = this.isTableView ? '甘特圖顯示' : '表格化顯示';
        btn.className = this.isTableView ? 'btn btn-success' : 'btn btn-info';
        
        if (this.isTableView) {
            ganttSection.classList.add('hidden');
            tableSection.classList.remove('hidden');
            this.renderTableView();
        } else {
            ganttSection.classList.remove('hidden');
            tableSection.classList.add('hidden');
        }
    }

    // 渲染表格視圖
    renderTableView() {
        const tableBody = document.getElementById('project-table-body');
        tableBody.innerHTML = '';

        if (this.filteredData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="7" class="empty-cell" style="text-align: center; padding: 40px;">
                    沒有符合條件的資料
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }

        this.filteredData.forEach(project => {
            // 專案標題行
            const projectRow = document.createElement('tr');
            projectRow.className = 'project-row';
            projectRow.innerHTML = `
                <td><strong>${project.projectName}</strong></td>
                <td><strong>${project.projectStartDate} ~ ${project.projectEndDate}</strong></td>
                <td class="empty-cell">—</td>
                <td class="empty-cell">—</td>
                <td class="empty-cell">—</td>
                <td class="empty-cell">PM: ${project.projectManager}</td>
                <td class="empty-cell">—</td>
            `;
            tableBody.appendChild(projectRow);

            // 系統行
            project.systems.forEach(system => {
                if (system.milestones && system.milestones.length > 0) {
                    // 有里程碑的系統，第一個里程碑與系統資訊在同一行
                    system.milestones.forEach((milestone, index) => {
                        const row = document.createElement('tr');
                        if (index === 0) {
                            // 第一行顯示系統資訊
                            row.className = 'system-row-table';
                            row.innerHTML = `
                                <td class="empty-cell">—</td>
                                <td class="empty-cell">—</td>
                                <td><strong>${system.systemName}</strong><br>
                                    <span class="status-badge status-${system.status === '開發中' ? 'developing' : system.status === '優化中' ? 'optimizing' : 'maintaining'}">
                                        ${system.status}
                                    </span>
                                </td>
                                <td>${milestone.date}</td>
                                <td><span class="milestone-${milestone.completed ? 'completed' : 'pending'}">
                                    ${milestone.completed ? '✓' : '●'} ${milestone.label}
                                </span></td>
                                <td>${system.administrators.join(', ')}</td>
                                <td>${system.technicians.join(', ')}</td>
                            `;
                        } else {
                            // 後續行只顯示里程碑
                            row.className = 'milestone-row';
                            row.innerHTML = `
                                <td class="empty-cell">—</td>
                                <td class="empty-cell">—</td>
                                <td class="empty-cell">—</td>
                                <td>${milestone.date}</td>
                                <td><span class="milestone-${milestone.completed ? 'completed' : 'pending'}">
                                    ${milestone.completed ? '✓' : '●'} ${milestone.label}
                                </span></td>
                                <td class="empty-cell">—</td>
                                <td class="empty-cell">—</td>
                            `;
                        }
                        tableBody.appendChild(row);
                    });
                } else {
                    // 沒有里程碑的系統
                    const systemRow = document.createElement('tr');
                    systemRow.className = 'system-row-table';
                    systemRow.innerHTML = `
                        <td class="empty-cell">—</td>
                        <td class="empty-cell">—</td>
                        <td><strong>${system.systemName}</strong><br>
                            <span class="status-badge status-${system.status === '開發中' ? 'developing' : system.status === '優化中' ? 'optimizing' : 'maintaining'}">
                                ${system.status}
                            </span>
                        </td>
                        <td class="empty-cell">—</td>
                        <td class="empty-cell">無里程碑</td>
                        <td>${system.administrators.join(', ')}</td>
                        <td>${system.technicians.join(', ')}</td>
                    `;
                    tableBody.appendChild(systemRow);
                }
            });

            // 專案間分隔行
            if (this.filteredData.indexOf(project) < this.filteredData.length - 1) {
                const separatorRow = document.createElement('tr');
                separatorRow.innerHTML = `
                    <td colspan="7" style="height: 10px; background-color: #f8f9fa; border: none;"></td>
                `;
                tableBody.appendChild(separatorRow);
            }
        });
    }

    // 匯出我的資料為 my-data.json
    exportMyData() {
        const dataToExport = this.data;
        const jsonString = JSON.stringify(dataToExport, null, 2);
        
        // 建立下載連結
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-data.json';
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('您的資料已匯出為 my-data.json\n請將此檔案上傳到您的 GitHub 儲存庫根目錄，並推送更新。\n這樣網站就會使用您的資料作為預設資料。');
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ProjectManagementDashboard();
});

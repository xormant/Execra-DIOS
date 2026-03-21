let currentTable = '';
let currentColumn = '';
let allTables = [];

async function loadTables() {
    try {
        const tables = window.execraData?.tables || [];
        allTables = tables;
        displayTables(tables);
    } catch(e) {
        console.error('Error loading tables:', e);
        document.getElementById('data').innerHTML = '<div class="error">Error loading tables</div>';
    }
}

function displayTables(tables) {
    let html = `
        <div class="stats">
            <span>📊 ${tables.length} tables found</span>
        </div>
        <table>
            <thead>
                <tr><th>Table Name</th><th>Columns</th><th>Actions</th></tr>
            </thead>
            <tbody>
    `;
    
    tables.forEach(table => {
        html += `
            <tr>
                <td><strong>${escapeHtml(table.name)}</strong></td>
                <td>${table.columnCount || '?'}</td>
                <td>
                    <button class="btn" onclick="loadColumns('${escapeHtml(table.name)}')">📋 Columns</button>
                    <button class="btn" onclick="browseTable('${escapeHtml(table.name)}')">🔍 Browse</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    document.getElementById('data').innerHTML = html;
}

async function loadColumns(tableName) {
    currentTable = tableName;
    try {
        const columns = window.execraData?.columns?.[tableName] || [];
        displayColumns(columns, tableName);
    } catch(e) {
        console.error('Error loading columns:', e);
        document.getElementById('data').innerHTML = '<div class="error">Error loading columns</div>';
    }
}

function displayColumns(columns, tableName) {
    let html = `
        <div class="header-actions">
            <button class="btn" onclick="loadTables()">← Back to Tables</button>
            <h3>📋 ${escapeHtml(tableName)} - Columns</h3>
        </div>
        <table>
            <thead>
                <tr><th>Column Name</th><th>Type</th><th>Null</th><th>Key</th><th>Actions</th></tr>
            </thead>
            <tbody>
    `;
    
    columns.forEach(col => {
        html += `
            <tr>
                <td><strong>${escapeHtml(col.name)}</strong></td>
                <td><span class="type-badge">${escapeHtml(col.type)}</span></td>
                <td>${col.nullable ? 'YES' : 'NO'}</td>
                <td>${col.key || ''}</td>
                <td>
                    <button class="btn-small" onclick="viewColumnData('${escapeHtml(tableName)}', '${escapeHtml(col.name)}')">📊 View Data</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    document.getElementById('data').innerHTML = html;
}

async function browseTable(tableName) {
    currentTable = tableName;
    try {
        const data = window.execraData?.tableData?.[tableName] || [];
        displayTableData(data, tableName, 'All Columns');
    } catch(e) {
        console.error('Error browsing table:', e);
        document.getElementById('data').innerHTML = '<div class="error">Error loading table data</div>';
    }
}

async function viewColumnData(tableName, columnName) {
    currentTable = tableName;
    currentColumn = columnName;
    try {
        const data = window.execraData?.columnData?.[tableName]?.[columnName] || [];
        displayColumnData(data, tableName, columnName);
    } catch(e) {
        console.error('Error loading column data:', e);
        document.getElementById('data').innerHTML = '<div class="error">Error loading column data</div>';
    }
}

function displayTableData(data, tableName, title) {
    if (!data || data.length === 0) {
        document.getElementById('data').innerHTML = `
            <div class="header-actions">
                <button class="btn" onclick="loadColumns('${escapeHtml(tableName)}')">← Back to Columns</button>
                <h3>📊 ${escapeHtml(tableName)}</h3>
                <div class="empty-state">No data found in this table</div>
            </div>
        `;
        return;
    }
    
    const headers = Object.keys(data[0]);
    
    let html = `
        <div class="header-actions">
            <button class="btn" onclick="loadColumns('${escapeHtml(tableName)}')">← Back to Columns</button>
            <h3>📊 ${escapeHtml(tableName)} - ${escapeHtml(title)}</h3>
            <div class="stats">📈 ${data.length} rows</div>
            <input type="text" id="dataFilter" class="search-input" placeholder="Filter data..." onkeyup="filterData()">
            <button class="btn" onclick="exportToCSV()">💾 Export CSV</button>
        </div>
        <div class="table-wrapper">
            <table id="dataTable">
                <thead>
                    <tr>
    `;
    
    headers.forEach(header => {
        html += `<th onclick="sortTable('${escapeHtml(header)}')">${escapeHtml(header)} ↕</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    data.forEach(row => {
        html += `<tr>`;
        headers.forEach(header => {
            let value = row[header];
            if (value === null) value = '<span class="null-value">NULL</span>';
            else if (typeof value === 'object') value = JSON.stringify(value);
            else if (String(value).length > 100) value = String(value).substring(0, 100) + '...';
            html += `<td>${escapeHtml(String(value))}</td>`;
        });
        html += `</tr>`;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('data').innerHTML = html;
}

function displayColumnData(data, tableName, columnName) {
    if (!data || data.length === 0) {
        document.getElementById('data').innerHTML = `
            <div class="header-actions">
                <button class="btn" onclick="loadColumns('${escapeHtml(tableName)}')">← Back to Columns</button>
                <h3>📊 ${escapeHtml(tableName)}.${escapeHtml(columnName)}</h3>
                <div class="empty-state">No data in this column</div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="header-actions">
            <button class="btn" onclick="loadColumns('${escapeHtml(tableName)}')">← Back to Columns</button>
            <h3>🔍 ${escapeHtml(tableName)}.${escapeHtml(columnName)}</h3>
            <div class="stats">📈 ${data.length} unique values</div>
            <input type="text" id="dataFilter" class="search-input" placeholder="Filter values..." onkeyup="filterColumnData()">
            <button class="btn" onclick="exportColumnToCSV()">💾 Export CSV</button>
        </div>
        <div class="table-wrapper">
            <table id="dataTable">
                <thead><tr><th>${escapeHtml(columnName)}</th><th>Count</th></tr></thead>
                <tbody>
    `;
    
    const freq = {};
    data.forEach(val => {
        const key = String(val);
        freq[key] = (freq[key] || 0) + 1;
    });
    
    Object.entries(freq).sort((a,b) => b[1] - a[1]).forEach(([value, count]) => {
        let displayValue = value;
        if (value === 'null' || value === 'NULL') displayValue = '<span class="null-value">NULL</span>';
        else if (value.length > 100) displayValue = value.substring(0, 100) + '...';
        html += `<tr><td>${escapeHtml(displayValue)}</td><td>${count}</td></tr>`;
    });
    
    html += `</tbody></table></div>`;
    document.getElementById('data').innerHTML = html;
}

function filterData() {
    const filter = document.getElementById('dataFilter')?.value.toLowerCase() || '';
    const table = document.getElementById('dataTable');
    if (!table) return;
    
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
        let show = false;
        const cells = rows[i].getElementsByTagName('td');
        for (let cell of cells) {
            if (cell.textContent.toLowerCase().includes(filter)) {
                show = true;
                break;
            }
        }
        rows[i].style.display = show ? '' : 'none';
    }
}

function filterColumnData() {
    const filter = document.getElementById('dataFilter')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#dataTable tbody tr');
    rows.forEach(row => {
        const text = row.cells[0].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

let sortDirection = {};
function sortTable(column) {
    const table = document.getElementById('dataTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    
    sortDirection[column] = !sortDirection[column];
    const direction = sortDirection[column] ? 1 : -1;
    
    const colIndex = Array.from(table.rows[0].cells).findIndex(cell => 
        cell.textContent.replace('↕', '').trim() === column
    );
    
    rows.sort((a, b) => {
        const aVal = a.cells[colIndex].textContent;
        const bVal = b.cells[colIndex].textContent;
        return aVal.localeCompare(bVal) * direction;
    });
    
    tbody.append(...rows);
}

function exportToCSV() {
    const table = document.getElementById('dataTable');
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('th, td');
        cells.forEach(cell => {
            let text = cell.textContent.replace('↕', '').trim();
            text = text.replace(/,/g, ';');
            rowData.push(`"${text}"`);
        });
        csv.push(rowData.join(','));
    });
    
    downloadCSV(csv.join('\n'), 'execra_export.csv');
}

function exportColumnToCSV() {
    const rows = document.querySelectorAll('#dataTable tbody tr');
    let csv = [`"${currentTable}.${currentColumn}","Count"`];
    
    rows.forEach(row => {
        const cells = row.cells;
        csv.push(`"${cells[0].textContent}","${cells[1].textContent}"`);
    });
    
    downloadCSV(csv.join('\n'), `${currentTable}_${currentColumn}.csv`);
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('execra_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('execra_theme') === 'light') {
        document.body.classList.add('light-mode');
    }
    
    if (window.execraData) {
        loadTables();
    }
});

window.loadTables = loadTables;
window.loadColumns = loadColumns;
window.browseTable = browseTable;
window.viewColumnData = viewColumnData;
window.filterData = filterData;
window.filterColumnData = filterColumnData;
window.sortTable = sortTable;
window.exportToCSV = exportToCSV;
window.exportColumnToCSV = exportColumnToCSV;
window.toggleTheme = toggleTheme;
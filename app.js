import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    updateDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const itemsCollection = collection(db, "portfolio_db");
let allData = [];

// Seed Default Initial Items automatically into Firebase if empty
const DEFAULT_ITEMS = [
    { category: 'projects', title: 'Pet Papa 🐱', description: 'Full-featured mobile application for pet owners with automated nutrition tracking and health telemetry.' },
    { category: 'projects', title: 'Smart Traffic Management 🚸', description: 'Intelligent 4-way intersection coordinator featuring vehicle queue prediction and emergency green-wave overrides.' },
    { category: 'projects', title: 'FocusFlow 🛸', description: 'Futuristic browser extension offering Pomodoro timers, distraction deflection shields, and soundscapes.' },
    { category: 'projects', title: 'Ratio & Iconic Academy Hub 🎓', description: 'Comprehensive educational portals empowering thousands of students across Bangladesh.' },
    
    { category: 'skills', title: 'Basic Programming & C', description: 'Logic structures, algorithm design, and core programming paradigms.' },
    { category: 'skills', title: 'HTML & CSS', description: 'Semantic markup, accessibility, modern Flexbox & Grid layouts.' },
    { category: 'skills', title: 'Java & Python', description: 'Object-oriented programming, data structures, and script automation.' },
    { category: 'skills', title: 'Web Development & Lovable', description: 'Building interactive web solutions and low-code AI rapid prototypes.' },
    { category: 'skills', title: 'Teaching & Mentorship', description: 'Instruction experience across Iconic Academy, Prime Cadet, Charupath, and Mirza Coaching.' },

    { category: 'education', title: 'JSC · Adamjee Cantonment School', description: 'Junior School Certificate completed at Adamjee Cantonment School, Dhaka.' },
    { category: 'education', title: 'SSC & HSC · Ispahani Public School', description: 'Secondary & Higher Secondary Certificates from Ispahani Public School and College, Comilla.' },
    { category: 'education', title: 'Undergraduate CSE · IUB', description: '4th year BSc in Computer Science and Engineering at Independent University, Bangladesh.' },
    { category: 'education', title: 'Foundation Courses', description: 'Completed non-CSE courses including Sociology and BDS Bangladesh 1971.' }
];

async function initDatabase() {
    try {
        const snapshot = await getDocs(itemsCollection);
        if (snapshot.empty) {
            for (const item of DEFAULT_ITEMS) {
                await addDoc(itemsCollection, { ...item, createdAt: Date.now() });
            }
        }
    } catch (err) {
        console.error("Firestore Init Error: ", err);
    }
}
initDatabase();

// 1. REALTIME FIREBASE SYNC & LISTENERS
onSnapshot(itemsCollection, (snapshot) => {
    allData = [];
    snapshot.forEach((docItem) => {
        allData.push({ id: docItem.id, ...docItem.data() });
    });
    renderContent(allData);
    updateStats(allData);
});

// Update Dashboard Counters
function updateStats(data) {
    document.getElementById("stat-projects-count").innerText = data.filter(i => i.category === 'projects').length;
    document.getElementById("stat-skills-count").innerText = data.filter(i => i.category === 'skills').length;
    document.getElementById("stat-education-count").innerText = data.filter(i => i.category === 'education').length;
}

// 2. RENDER TABLES & CARDS WITH EDIT/DELETE
function renderContent(data) {
    const eduBody = document.getElementById("educationTable");
    const skillBody = document.getElementById("skillsTable");
    const projGrid = document.getElementById("projectsGrid");

    if (eduBody) eduBody.innerHTML = "";
    if (skillBody) skillBody.innerHTML = "";
    if (projGrid) projGrid.innerHTML = "";

    data.forEach(item => {
        // Education & Skills Table Row
        if (item.category === 'education' || item.category === 'skills') {
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-900/60 transition";
            row.innerHTML = `
                <td class="p-3 font-semibold text-white">${item.title}</td>
                <td class="p-3 text-slate-400">${item.description}</td>
                <td class="p-3 text-right space-x-2">
                    <button onclick="window.editItem('${item.id}', '${item.category}', \`${escapeStr(item.title)}\`, \`${escapeStr(item.description)}\`)" class="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs rounded hover:bg-amber-500/40">Edit</button>
                    <button onclick="window.deleteItem('${item.id}')" class="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/40">Delete</button>
                </td>
            `;
            if (item.category === 'education' && eduBody) eduBody.appendChild(row);
            else if (item.category === 'skills' && skillBody) skillBody.appendChild(row);
        }

        // Projects Cards
        else if (item.category === 'projects' && projGrid) {
            const card = document.createElement("div");
            card.className = "p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between";
            
            let animClass = item.title.includes("Pet") ? "pet-bounce" : (item.title.includes("Traffic") ? "traffic-anim" : "animate-pulse");

            card.innerHTML = `
                <div>
                    <div class="flex items-start justify-between mb-2">
                        <h4 class="text-lg font-bold text-white">${item.title}</h4>
                        <span class="text-2xl ${animClass}">✨</span>
                    </div>
                    <p class="text-xs text-slate-300 mb-4 leading-relaxed">${item.description}</p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span class="px-2.5 py-1 bg-cyberDark text-neonCyan text-[10px] rounded font-mono">Firebase Synced</span>
                    <div class="space-x-1">
                        <button onclick="window.editItem('${item.id}', 'projects', \`${escapeStr(item.title)}\`, \`${escapeStr(item.description)}\`)" class="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs rounded hover:bg-amber-500/40">Edit</button>
                        <button onclick="window.deleteItem('${item.id}')" class="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/40">Delete</button>
                    </div>
                </div>
            `;
            projGrid.appendChild(card);
        }
    });

    if (window.lucide) window.lucide.createIcons();
}

function escapeStr(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// 3. CREATE & UPDATE MODALS
window.openModal = (category, id = '', title = '', desc = '') => {
    document.getElementById("crudModal").classList.remove("hidden");
    document.getElementById("modalCategory").value = category;
    document.getElementById("modalEditId").value = id;
    document.getElementById("modalTitleInput").value = title;
    document.getElementById("modalDescInput").value = desc;
    document.getElementById("modalTitle").innerText = id ? `Edit ${category}` : `Add ${category}`;
};

window.editItem = (id, category, title, desc) => {
    window.openModal(category, id, title, desc);
};

window.closeModal = () => {
    document.getElementById("crudModal").classList.add("hidden");
    document.getElementById("crudForm").reset();
};

document.getElementById("crudForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const category = document.getElementById("modalCategory").value;
    const id = document.getElementById("modalEditId").value;
    const title = document.getElementById("modalTitleInput").value.trim();
    const description = document.getElementById("modalDescInput").value.trim();

    if (id) {
        await updateDoc(doc(db, "portfolio_db", id), { category, title, description });
    } else {
        await addDoc(itemsCollection, { category, title, description, createdAt: Date.now() });
    }
    closeModal();
});

// 4. DELETE ITEM
window.deleteItem = async (id) => {
    if (confirm("Delete this entry from Firebase Cloud?")) {
        await deleteDoc(doc(db, "portfolio_db", id));
    }
};

// 5. INSTANT AUTO-COMPLETE SEARCH
const searchInput = document.getElementById("globalSearch");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        searchResults.classList.add("hidden");
        return;
    }

    const matches = allData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = `<div class="p-4 text-xs text-slate-500 text-center">No matching database records found</div>`;
    } else {
        searchResults.innerHTML = matches.map(item => `
            <div onclick="window.selectSearchResult('${item.category}')" class="p-3.5 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between">
                <div>
                    <h5 class="text-xs font-bold text-white">${item.title}</h5>
                    <p class="text-[11px] text-slate-400 line-clamp-1">${item.description}</p>
                </div>
                <span class="px-2 py-0.5 bg-slate-900 border border-slate-700 text-neonCyan text-[10px] uppercase rounded font-mono">${item.category}</span>
            </div>
        `).join('');
    }

    searchResults.classList.remove("hidden");
});

window.selectSearchResult = (category) => {
    searchResults.classList.add("hidden");
    searchInput.value = "";
    if (window.switchTab) window.switchTab(category);
};

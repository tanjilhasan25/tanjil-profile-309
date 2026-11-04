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

// DEFAULT DATA SEEDING (Saves initial items to Firebase if empty)
const DEFAULT_ITEMS = [
    // Projects
    { category: 'projects', title: 'Pet Papa 🐱', description: 'Full-featured mobile application for pet owners with automated nutrition tracking, veterinary booking, and health telemetry.', tag: 'Mobile App · Health' },
    { category: 'projects', title: 'Smart Traffic Management 🚸', description: 'Intelligent 4-way intersection coordinator featuring vehicle queue prediction and emergency green-wave overrides.', tag: 'AI & Vision · IoT' },
    { category: 'projects', title: 'FocusFlow 🛸', description: 'Futuristic 3D browser extension providing Pomodoro timers, deflection shields, ambient soundscapes, and analytics.', tag: '3D Extension · Work' },
    { category: 'projects', title: 'Ratio & Iconic Academy Hub 🎓', description: 'Comprehensive educational portals empowering thousands of students across Bangladesh with online programming bootcamps.', tag: 'EdTech · Platform' },
    
    // Skills
    { category: 'skills', title: 'Basic Programming & C', description: 'Strong understanding of logic structures, algorithm design, and core programming concepts.' },
    { category: 'skills', title: 'HTML & CSS', description: 'Semantic markup, accessible web components, and modern responsive layout styling.' },
    { category: 'skills', title: 'Java & Python', description: 'Object-oriented programming, data structures, and script automation.' },
    { category: 'skills', title: 'Web Development & Lovable', description: 'Building modern web prototypes and interactive interfaces with low-code & AI toolchains.' },
    { category: 'skills', title: 'Teaching & Mentorship', description: 'Extensive instruction experience across multiple coaching hubs and academies in Bangladesh.' },

    // Education
    { category: 'education', title: 'JSC · Adamjee Cantonment School', description: 'Junior School Certificate completed at Adamjee Cantonment School, Dhaka.' },
    { category: 'education', title: 'SSC & HSC · Ispahani Public School', description: 'Secondary & Higher Secondary Certificates from Ispahani Public School and College, Comilla.' },
    { category: 'education', title: 'Undergraduate CSE · IUB', description: 'Currently pursuing 4th year BSc in Computer Science and Engineering at Independent University, Bangladesh.' },
    { category: 'education', title: 'Non-CSE Courses', description: 'Completed foundation modules including Sociology and BDS Bangladesh 1971.' }
];

async function checkAndSeedDatabase() {
    const snapshot = await getDocs(itemsCollection);
    if (snapshot.empty) {
        console.log("Seeding default data to Firebase...");
        for (const item of DEFAULT_ITEMS) {
            await addDoc(itemsCollection, { ...item, createdAt: Date.now() });
        }
    }
}
checkAndSeedDatabase();

// 1. READ Data real-time from Firebase
onSnapshot(itemsCollection, (snapshot) => {
    allData = [];
    snapshot.forEach((docItem) => {
        allData.push({ id: docItem.id, ...docItem.data() });
    });
    renderContent(allData);
});

// 2. Render UI (Projects Grid + Education & Skills Tables)
function renderContent(data) {
    const eduBody = document.getElementById("educationTable");
    const skillBody = document.getElementById("skillsTable");
    const projGrid = document.getElementById("projectsGrid");

    eduBody.innerHTML = "";
    skillBody.innerHTML = "";
    projGrid.innerHTML = "";

    data.forEach(item => {
        // Table Rows for Education & Skills
        if (item.category === 'education' || item.category === 'skills') {
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-900/60 transition";
            row.innerHTML = `
                <td class="p-3 font-semibold text-white">${item.title}</td>
                <td class="p-3 text-slate-400">${item.description}</td>
                <td class="p-3 text-right space-x-2">
                    <button onclick="window.editItem('${item.id}', '${item.category}', \`${escapeQuotes(item.title)}\`, \`${escapeQuotes(item.description)}\`)" class="px-2 py-1 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/40">Edit</button>
                    <button onclick="window.deleteItem('${item.id}')" class="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40">Delete</button>
                </td>
            `;
            if (item.category === 'education') eduBody.appendChild(row);
            else skillBody.appendChild(row);
        }

        // Project Cards for Projects
        else if (item.category === 'projects') {
            const card = document.createElement("div");
            card.className = "p-6 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col justify-between";
            
            // Animation class based on title
            let animClass = "";
            if (item.title.includes("Pet Papa")) animClass = "pet-bounce";
            else if (item.title.includes("Traffic")) animClass = "traffic-anim";
            else if (item.title.includes("FocusFlow")) animClass = "animate-pulse";

            card.innerHTML = `
                <div>
                    <div class="flex items-start justify-between mb-2">
                        <h4 class="text-lg font-bold text-white">${item.title}</h4>
                        <span class="text-2xl ${animClass}">✨</span>
                    </div>
                    <p class="text-xs text-slate-300 mb-4 leading-relaxed">${item.description}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span class="px-2.5 py-1 bg-cyberDark text-neonCyan text-[10px] rounded font-mono">${item.tag || 'Engineering'}</span>
                    <div class="space-x-1">
                        <button onclick="window.editItem('${item.id}', 'projects', \`${escapeQuotes(item.title)}\`, \`${escapeQuotes(item.description)}\`)" class="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded hover:bg-amber-500/40">Edit</button>
                        <button onclick="window.deleteItem('${item.id}')" class="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/40">Delete</button>
                    </div>
                </div>
            `;
            projGrid.appendChild(card);
        }
    });

    if (window.lucide) window.lucide.createIcons();
}

function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// 3. Modal Controls for CREATE / UPDATE
window.openModal = (category, id = '', title = '', desc = '') => {
    document.getElementById("crudModal").classList.remove("hidden");
    document.getElementById("modalCategory").value = category;
    document.getElementById("modalEditId").value = id;
    document.getElementById("modalTitleInput").value = title;
    document.getElementById("modalDescInput").value = desc;
    document.getElementById("modalTitle").innerText = id ? `Edit ${category}` : `Add New ${category}`;
};

window.editItem = (id, category, title, desc) => {
    window.openModal(category, id, title, desc);
};

window.closeModal = () => {
    document.getElementById("crudModal").classList.add("hidden");
    document.getElementById("crudForm").reset();
};

// Form Submit (Create or Update)
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

// 4. DELETE
window.deleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this record from Firebase?")) {
        await deleteDoc(doc(db, "portfolio_db", id));
    }
};

// 5. Global Search Filter across Firebase Data
document.getElementById("globalSearch").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    renderContent(filtered);
});

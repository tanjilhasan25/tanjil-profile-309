import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const itemsCollection = collection(db, "portfolio_db");
let allData = [];

// 1. READ Data real-time from Firebase
onSnapshot(itemsCollection, (snapshot) => {
    allData = [];
    snapshot.forEach((docItem) => {
        allData.push({ id: docItem.id, ...docItem.data() });
    });
    renderTables(allData);
});

// 2. Render tables for Education, Skills, and Projects
function renderTables(data) {
    const eduBody = document.getElementById("educationTable");
    const skillBody = document.getElementById("skillsTable");
    const projBody = document.getElementById("projectsTable");

    eduBody.innerHTML = "";
    skillBody.innerHTML = "";
    projBody.innerHTML = "";

    data.forEach(item => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/60 transition";
        row.innerHTML = `
            <td class="p-3 font-semibold text-white">${item.title}</td>
            <td class="p-3 text-slate-400">${item.description}</td>
            <td class="p-3 text-right space-x-2">
                <button onclick="window.editItem('${item.id}', '${item.category}', '${item.title}', '${item.description}')" class="px-2 py-1 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/40">Edit</button>
                <button onclick="window.deleteItem('${item.id}')" class="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40">Delete</button>
            </td>
        `;

        if (item.category === 'education') eduBody.appendChild(row);
        else if (item.category === 'skills') skillBody.appendChild(row);
        else if (item.category === 'projects') projBody.appendChild(row);
    });
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

// 5. Global Search Filter
document.getElementById("globalSearch").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    renderTables(filtered);
});

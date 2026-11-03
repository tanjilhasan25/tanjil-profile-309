import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    deleteDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const itemsCollection = collection(db, "portfolio_items");

let localData = [];

// 1. READ (Real-time listener from Firebase)
onSnapshot(itemsCollection, (snapshot) => {
    localData = [];
    snapshot.forEach((docItem) => {
        localData.push({ id: docItem.id, ...docItem.data() });
    });
    renderTable(localData);
});

// 2. RENDER TABLE & SEARCH
function renderTable(dataArray) {
    const tableBody = document.getElementById("crudTableBody");
    tableBody.innerHTML = "";

    if (dataArray.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500">No data found in Firebase database.</td></tr>`;
        return;
    }

    dataArray.forEach(item => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-800/50 transition";
        row.innerHTML = `
            <td class="p-3 font-mono text-neonCyan uppercase">${item.category}</td>
            <td class="p-3 font-semibold text-white">${item.title}</td>
            <td class="p-3 text-slate-400">${item.detail}</td>
            <td class="p-3 text-right space-x-2">
                <button onclick="window.editItem('${item.id}', '${item.category}', '${item.title}', '${item.detail}')" class="px-2 py-1 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/40">Edit</button>
                <button onclick="window.deleteItem('${item.id}')" class="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 3. CREATE & UPDATE (Form Handler)
document.getElementById("crudForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const editId = document.getElementById("editId").value;
    const category = document.getElementById("categoryInput").value;
    const title = document.getElementById("titleInput").value.trim();
    const detail = document.getElementById("detailInput").value.trim();

    if (editId) {
        // UPDATE Operation
        const itemRef = doc(db, "portfolio_items", editId);
        await updateDoc(itemRef, { category, title, detail });
        resetForm();
    } else {
        // CREATE Operation
        await addDoc(itemsCollection, { category, title, detail, createdAt: Date.now() });
        resetForm();
    }
});

// 4. DELETE
window.deleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this entry from Firebase?")) {
        await deleteDoc(doc(db, "portfolio_items", id));
    }
};

// 5. START EDIT MODE
window.editItem = (id, category, title, detail) => {
    document.getElementById("editId").value = id;
    document.getElementById("categoryInput").value = category;
    document.getElementById("titleInput").value = title;
    document.getElementById("detailInput").value = detail;
    
    document.getElementById("submitBtn").innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Save Edit`;
    document.getElementById("cancelEditBtn").classList.remove("hidden");
};

// RESET FORM
function resetForm() {
    document.getElementById("editId").value = "";
    document.getElementById("crudForm").reset();
    document.getElementById("submitBtn").innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4"></i> Add Entry`;
    document.getElementById("cancelEditBtn").classList.add("hidden");
}

document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

// 6. SEARCH FILTER
document.getElementById("searchInput").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = localData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.detail.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    renderTable(filtered);
});
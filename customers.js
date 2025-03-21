import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
    const transactionsTable = document.getElementById('transactionsTable');
    const addCustomerBtn = document.getElementById('addCustomerBtn'); // Ensure this ID matches the button in your HTML

    if (!addCustomerBtn) {
        console.error("Add Customer button not found!");
        return;
    }

    addCustomerBtn.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent form submission

        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const town = document.getElementById('town').value.trim();

        if (!name || !phone || !town) {
            alert("Please fill all fields before adding a customer!");
            return;
        }

        const { data, error } = await supabase.from('customers').insert([{ name, phone, town }]);

        if (error) {
            console.error('Error adding customer:', error.message);
            alert("Failed to add customer: " + error.message);
            return;
        }

        alert("Customer added successfully!");
        fetchTransactions(); // Refresh the list after adding
    });

    async function fetchTransactions() {
        const { data: customers, error: customersError } = await supabase.from('customers').select('*');

        if (customersError) {
            console.error('Error fetching customers:', customersError.message);
            return;
        }

        transactionsTable.innerHTML = ""; // Clear table before adding new rows

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${customer.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customer.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customer.town}</td>
            `;
            transactionsTable.appendChild(row);
        });
    }

    fetchTransactions();
});
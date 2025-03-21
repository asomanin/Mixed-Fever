import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
    const customersTable = document.getElementById('customersTable');

    async function fetchCustomers() {
        const { data: customers, error } = await supabase
            .from('customers')
            .select('*');

        if (error) {
            console.error('Error fetching customers:', error.message);
            return;
        }

        customersTable.innerHTML = ""; // Clear table before adding new rows

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${customer.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customer.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap">${customer.town}</td>
            `;
            customersTable.appendChild(row);
        });
    }

    fetchCustomers();
});

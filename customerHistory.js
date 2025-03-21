import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
    const customerSelect = document.getElementById('customerSelect');
    const customerHistoryTable = document.getElementById('customerHistoryTable');

    async function fetchCustomers() {
        const { data: customers, error } = await supabase
            .from('customers')
            .select('*');

        if (error) {
            console.error('Error fetching customers:', error.message);
            return;
        }

        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
        });
    }

    async function fetchCustomerHistory(customerId) {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('customer_id', customerId);

        if (error) {
            console.error('Error fetching transactions:', error.message);
            return;
        }

        customerHistoryTable.innerHTML = ""; // Clear table before adding new rows

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.product_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.unit_price}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.total_amount}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.amount_paid}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.balance}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.payment_status}</td>
            `;
            customerHistoryTable.appendChild(row);
        });
    }

    customerSelect.addEventListener('change', function () {
        const customerId = customerSelect.value;
        if (customerId) {
            fetchCustomerHistory(customerId);
        } else {
            customerHistoryTable.innerHTML = ""; // Clear table if no customer is selected
        }
    });

    fetchCustomers();
});

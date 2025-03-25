import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
    const transactionsTable = document.getElementById('transactionsTable');

    async function fetchTransactions() {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false }); // Fetch transactions in descending order

        if (error) {
            console.error('Error fetching transactions:', error.message);
            return;
        }

        transactionsTable.innerHTML = ""; // Clear table before adding new rows

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${transaction.created_at}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.customer_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.contact_details}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.product_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.unit_price}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.total_amount}</td>                
                <td class="px-6 py-4 whitespace-nowrap">${transaction.amount_paid}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.balance}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.payment_status}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="delete-btn px-4 py-2 bg-red-500 text-white rounded" data-id="${transaction.id}">Delete</button>
                </td>
            `;
            transactionsTable.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const transactionId = event.target.getAttribute('data-id');
                const { error } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', transactionId);

                if (error) {
                    console.error('Error deleting transaction:', error.message);
                    return;
                }

                // Show success message
                alert('Transaction deleted successfully.');

                // Refresh the transactions table after deletion
                fetchTransactions();
            });
        });
    }

    fetchTransactions();
});
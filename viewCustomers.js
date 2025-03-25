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
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="delete-customer-btn px-4 py-2 bg-red-500 text-white rounded" data-id="${customer.id}">Delete</button>
                </td>
            `;
            customersTable.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-customer-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const customerId = event.target.getAttribute('data-id');
                const confirmDelete = confirm('Are you sure you want to delete this customer?');
                if (confirmDelete) {
                    await deleteCustomer(customerId);
                    // Remove the row from the table
                    event.target.closest('tr').remove();
                }
            });
        });
    }

    async function deleteCustomer(customerId) {
        // Fetch the customer's phone number
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('phone')
            .eq('id', customerId)
            .single();

        if (customerError) {
            console.error('Error fetching customer details:', customerError.message);
            alert('Failed to fetch customer details.');
            return;
        }

        // Check if the customer has any transactions with "owing" status
        const { data: transactions, error: transactionError } = await supabase
            .from('transactions')
            .select('payment_status')
            .eq('contact_details', customer.phone)
            .eq('payment_status', 'owing');

        if (transactionError) {
            console.error('Error checking transactions:', transactionError.message);
            alert('Failed to check customer transactions.');
            return;
        }

        if (transactions.length > 0) {
            alert('Customer cannot be deleted because they have outstanding payments.');
            return;
        }

        // Proceed to delete the customer
        const { error: deleteError } = await supabase
            .from('customers')
            .delete()
            .eq('id', customerId);

        if (deleteError) {
            console.error('Error deleting customer:', deleteError.message);
            alert('Failed to delete customer.');
            return;
        }

        alert('Customer deleted successfully.');
    }

    fetchCustomers();
});

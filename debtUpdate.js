import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
    const debtorsTable = document.getElementById('debtorsTable');

    async function fetchDebtors() {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('customer_name, contact_details, balance')
            .eq('payment_status', 'Owing');

        if (error) {
            console.error('Error fetching debtors:', error.message);
            return;
        }

        const debtorsMap = new Map();

        transactions.forEach(transaction => {
            if (debtorsMap.has(transaction.contact_details)) {
                debtorsMap.get(transaction.contact_details).balance += transaction.balance;
            } else {
                debtorsMap.set(transaction.contact_details, {
                    customer_name: transaction.customer_name,
                    contact_details: transaction.contact_details,
                    balance: transaction.balance
                });
            }
        });

        debtorsTable.innerHTML = ""; // Clear table before adding new rows

        debtorsMap.forEach(debtor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${debtor.customer_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${debtor.contact_details}</td>
                <td class="px-6 py-4 whitespace-nowrap">${debtor.balance.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="number" id="newPayment-${debtor.contact_details}" class="mt-1 block  px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="update-btn bg-blue-500 text-white px-4 py-2 rounded-md" data-contact="${debtor.contact_details}">Update</button>
                </td>
            `;
            debtorsTable.appendChild(row);
        });

        document.querySelectorAll('.update-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const contactDetails = this.getAttribute('data-contact');
                let newPayment = parseFloat(document.getElementById(`newPayment-${contactDetails}`).value);

                if (isNaN(newPayment) || newPayment <= 0) {
                    alert('Please enter a valid payment amount.');
                    return;
                }

                const debtor = debtorsMap.get(contactDetails);
                if (!debtor) {
                    alert('Debtor not found.');
                    return;
                }

                const updatedBalance = debtor.balance - newPayment;

                const { data: transactions, error: updateError } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('contact_details', contactDetails)
                    .eq('payment_status', 'Owing');

                if (updateError) {
                    console.error('Error fetching transactions:', updateError.message);
                    alert('Failed to fetch transactions.');
                    return;
                }

                for (const transaction of transactions) {
                    const transactionNewPayment = Math.min(newPayment, transaction.balance);
                    const transactionUpdatedBalance = transaction.balance - transactionNewPayment;

                    const { error: transactionUpdateError } = await supabase
                        .from('transactions')
                        .update({
                            amount_paid: transaction.amount_paid + transactionNewPayment,
                            balance: transactionUpdatedBalance
                        })
                        .eq('id', transaction.id);

                    if (transactionUpdateError) {
                        console.error('Error updating transaction:', transactionUpdateError.message);
                        alert('Failed to update payment.');
                        return;
                    }

                    newPayment -= transactionNewPayment;
                    if (newPayment <= 0) break;
                }

                alert('Payment updated successfully!');
                fetchDebtors(); // Refresh the list after updating
            });
        });
    }

    fetchDebtors();
});

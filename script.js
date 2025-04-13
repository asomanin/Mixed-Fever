// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker Registered'))
        .catch((error) => console.log('Service Worker Failed:', error));
}



import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", function () {
    // select elements only after DOM has loaded
    var customerName = document.getElementById('customerName');
    var contactDetails = document.getElementById('contactDetails');
    var totalAmount = document.getElementById('totalAmount');
    var productName = document.getElementById('productName');
    var quantity = document.getElementById('quantity');
    var unitPrice = document.getElementById('unitPrice');
    var amountDue = document.getElementById('amountDue');
    var amountPaid = document.getElementById('amountPaid');
    var balance = document.getElementById('balance');
    var paymentStatus = document.getElementById('paymentStatus');
    var submitBtn = document.getElementById("submitBtn");

    if (!submitBtn) {
        console.error("Submit button not found!");
        return;
    }

    async function fetchCustomers() {
        const { data: customers, error } = await supabase
            .from('customers')
            .select('*')
            .order('id', { ascending: true }); // Fetch customers in descending order

        if (error) {
            console.error('Error fetching customers:', error.message);
            return;
        }

        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id; // Use customer ID as the value
            option.textContent = customer.name;
            customerName.appendChild(option);
        });
    }

    customerName.addEventListener('change', async function () {
        const selectedCustomerId = customerName.value;
        const { data: customer, error } = await supabase
            .from('customers')
            .select('phone')
            .eq('id', selectedCustomerId)
            .single();

        if (error) {
            console.error('Error fetching customer details:', error.message);
            return;
        }

        contactDetails.value = customer.phone;
    });

    fetchCustomers();


    async function fetchProducts() {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: false }); // Fetch products in descending order

        if (error) {
            console.error('Error fetching products:', error.message);
            return;
        }

        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id; // Use product ID as the value
            option.textContent = product.product_name; // Display product name
            productName.appendChild(option);
        });

        // Update product quantity after transaction
        async function updateProductQuantity(productId, quantitySold) {
            const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', productId)
            .single();
            if (!product) {
                console.error('Product not found!');
                return;
            }

            const { error: decrementError } = await supabase
                .rpc('decrement_product_quantity', {
                    product_id: productId,
                    quantity_sold: quantitySold
                });

            if (decrementError) {
                console.error('Error updating product quantity:', decrementError.message);
            } else {
                console.log('Product quantity updated successfully');
            }
            if (fetchError) {
            console.error('Error fetching product quantity:', fetchError.message);
            return;
            }

            const newQuantity = product.quantity - quantitySold;

            const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', productId);

            if (updateError) {
            console.error('Error updating product quantity:', updateError.message);
            } else {
            console.log('Product quantity updated successfully');
            }
        }

        // Modify saveTransaction to update product quantity
        async function saveTransaction() {
            const selectedCustomerId = customerName.value;
            const selectedProductId = productName.value;
            const quantitySold = parseInt(quantity.value);

            const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('name, phone')
            .eq('id', selectedCustomerId)
            .single();

            if (customerError) {
            console.error('Error fetching customer details:', customerError.message);
            alert("Failed to fetch customer details!");
            return;
            }

            const transactionData = {
            customer_name: customer.name,
            contact_details: customer.phone,
            product_name: productName.value,
            quantity: quantitySold,
            unit_price: parseFloat(unitPrice.value),
            total_amount: parseFloat(totalAmount.value),
            amount_due: parseFloat(amountDue.value),
            amount_paid: parseFloat(amountPaid.value),
            balance: parseFloat(balance.value),
            payment_status: paymentStatus.value,
            created_at: new Date().toISOString() // Add the current date and time
            };

            const { data, error } = await supabase.from("transactions").insert([transactionData]);

            if (error) {
            console.error("Error inserting transaction:", error.message);
            alert("Failed to save transaction!");
            return;
            }

            console.log("Transaction saved:", data);
            alert("Transaction saved successfully!");

            // Update product quantity
            await updateProductQuantity(selectedProductId, quantitySold);

            // Clear necessary text boxes
            productName.value = '';
            quantity.value = '';
            unitPrice.value = '';
            totalAmount.value = '';
            amountDue.value = '';
            amountPaid.value = '';
            balance.value = '';
            paymentStatus.value = '';
        }
        // Clear existing options in the productName dropdown
        productName.innerHTML = '';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id; // Use product ID as the value
            option.textContent = product.product_name; // Display product name
            productName.appendChild(option);
        });
    }

    productName.addEventListener('change', async function () {
        const selectedProductId = productName.value;
        const { data: product, error } = await supabase
            .from('products')
            .select('selling_price')
            .eq('id', selectedProductId)
            .single();
            

        if (error) {
            console.error('Error fetching product details:', error.message);
            return;
        }

        unitPrice.value = product.selling_price;
    });

    fetchProducts();


    function calculateTotal() {
        var total = parseFloat(quantity.value) * parseFloat(unitPrice.value);
        if (!isNaN(total)) {
            totalAmount.value = total.toFixed(2);
            amountDue.value = total.toFixed(2);
        } else {
            totalAmount.value = '';
        }
    }

    function calculateBalance() {
        var calcBalance = parseFloat(totalAmount.value) - parseFloat(amountPaid.value);
        if (!isNaN(calcBalance)) {
            balance.value = calcBalance.toFixed(2);
            if (calcBalance < 0) {
                paymentStatus.value = 'Change';
            } else if (calcBalance === 0) {
                paymentStatus.value = 'Paid';
            } else {
                paymentStatus.value = 'Owing';
            }
        } else {
            balance.value = '';
            paymentStatus.value = '';
        }
    }

    quantity.addEventListener('input', calculateTotal);
    unitPrice.addEventListener('input', calculateTotal);
    amountPaid.addEventListener('input', calculateBalance);

    // Toggle navbar menu
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarMenu = document.getElementById('navbar-menu');

    // Function to save transaction
    async function saveTransaction() {
        const selectedCustomerId = customerName.value;
        const selectedProductId = productName.value;
        const quantitySold = parseInt(quantity.value);

        // Fetch customer details
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('name, phone')
            .eq('id', selectedCustomerId)
            .single();

        if (customerError) {
            console.error('Error fetching customer details:', customerError.message);
            alert("Failed to fetch customer details!");
            return;
        }

        // Fetch product details to get the current quantity
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', selectedProductId)
            .single();

        if (productError) {
            console.error('Error fetching product details:', productError.message);
            alert("Failed to fetch product details!");
            return;
        }

        if (product.quantity < quantitySold) {
            alert("Insufficient stock! Please reduce the quantity.");
            return;
        }

        // Prepare transaction data
        const transactionData = {
            customer_name: customer.name,
            contact_details: customer.phone,
            product_name: productName.options[productName.selectedIndex].text, // Get the product name from the dropdown
            quantity: quantitySold,
            unit_price: parseFloat(unitPrice.value),
            total_amount: parseFloat(totalAmount.value),
            amount_due: parseFloat(amountDue.value),
            amount_paid: parseFloat(amountPaid.value),
            balance: parseFloat(balance.value),
            payment_status: paymentStatus.value,
            created_at: new Date().toISOString() // Add the current date and time
        };

        // Insert transaction into the database
        const { data: transaction, error: transactionError } = await supabase
            .from("transactions")
            .insert([transactionData]);

        if (transactionError) {
            console.error("Error inserting transaction:", transactionError.message);
            alert("Failed to save transaction!");
            return;
        }

        // Deduct the sold quantity from the product's total quantity
        const newQuantity = product.quantity - quantitySold;

        // Update the product's quantity in the database
        const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', selectedProductId);

        if (updateError) {
            console.error('Error updating product quantity:', updateError.message);
            alert("Failed to update product quantity!");
            return;
        }

        console.log("Transaction saved:", transaction);
        alert("Transaction saved successfully!");

        // Clear necessary text boxes
        productName.value = '';
        quantity.value = '';
        unitPrice.value = '';
        totalAmount.value = '';
        amountDue.value = '';
        amountPaid.value = '';
        balance.value = '';
        paymentStatus.value = '';
    }

    

    // Attach click event to button
    submitBtn.addEventListener("click", saveTransaction);
});



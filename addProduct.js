import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
const productForm = document.getElementById('productTable'); // Ensure this ID matches the table in your HTML
    const addProductBtn = document.getElementById('submitProduct'); // Ensure this ID matches the button in your HTML

    if (!addProductBtn) {
        console.error("Add Product button not found!");
        return;
    }

    addProductBtn.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent form submission

        const productName = document.getElementById('productName').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value.trim(), 10);
        const costPrice = parseFloat(document.getElementById('costPrice').value.trim());
        const sellingPrice = parseFloat(document.getElementById('sellingPrice').value.trim());

        if (!productName || isNaN(quantity) || isNaN(costPrice) || isNaN(sellingPrice)) {
            alert("Please fill all fields with valid values before adding a product!");
            return;
        }

        // Insert into the correct table and columns
        const { data, error } = await supabase.from('products').insert([
            {
                product_name: productName,
                quantity: quantity,
                cost_price: costPrice,
                selling_price: sellingPrice,
            },
        ]);

        if (error) {
            console.error('Error adding product:', error.message);
            alert("Failed to add product: " + error.message);
            return;
        }

        alert("Product added successfully!");

        // Clear input fields
        document.getElementById('productName').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('costPrice').value = '';
        document.getElementById('sellingPrice').value = '';

        fetchProducts(); // Refresh the product list after adding
    });
    
});


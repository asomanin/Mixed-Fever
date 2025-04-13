import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async function () {
    const productTable = document.getElementById('productTable'); // Ensure this ID matches the table in your HTML

    async function fetchProducts() {
        const { data: products, error: productsError } = await supabase
            .from('products') // Correct table name
            .select('*')
            .order('id', { ascending: false }); // Fetch products in descending order

        if (productsError) {
            console.error('Error fetching products:', productsError.message);
            return;
        }

        if (!products || products.length === 0) {
            productTable.innerHTML = "<tr><td colspan='7' class='text-center'>No products available</td></tr>";
            return;
        }

        productTable.innerHTML = ""; // Clear table before adding new rows

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${product.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.created_at}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.product_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.cost_price}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.selling_price}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="edit-product-btn px-4 py-2 bg-blue-500 text-white rounded" data-id="${product.id}">Edit</button>
                    <button class="delete-product-btn px-4 py-2 bg-red-500 text-white rounded" data-id="${product.id}">Delete</button>
                </td>
            `;

            // Add event listener for the "Edit" button
            const editButton = row.querySelector('.edit-product-btn');
            editButton.addEventListener('click', function () {
                openEditModal(product); // Open the edit modal with product details
            });

            // Add event listener for the "Delete" button
            const deleteButton = row.querySelector('.delete-product-btn');
            deleteButton.addEventListener('click', async function () {
                const productId = deleteButton.getAttribute('data-id');
                const confirmDelete = confirm("Are you sure you want to delete this product?");
                if (!confirmDelete) {
                    return;
                }

                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);

                if (error) {
                    console.error('Error deleting product:', error.message);
                    alert("Failed to delete product: " + error.message);
                    return;
                }

                alert("Product deleted successfully!");
                fetchProducts(); // Refresh the product list after deletion
            });

            productTable.appendChild(row);
        });
    }

    function openEditModal(product) {
        // Create a modal for editing product details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 class="text-xl font-bold mb-4">Edit Product</h2>
                <form id="editProductForm">
                    <div class="mb-4">
                        <label for="editQuantity" class="block text-sm font-medium text-gray-700">Quantity:</label>
                        <input type="number" id="editQuantity" name="editQuantity" value="${product.quantity}" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div class="mb-4">
                        <label for="editPrice" class="block text-sm font-medium text-gray-700">Selling Price:</label>
                        <input type="number" id="editPrice" name="editPrice" value="${product.selling_price}" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div class="flex justify-end space-x-4">
                        <button type="button" id="cancelEdit" class="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const editProductForm = document.getElementById('editProductForm');
        editProductForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const newQuantity = parseInt(document.getElementById('editQuantity').value, 10);
            const newPrice = parseFloat(document.getElementById('editPrice').value);

            const { error } = await supabase
                .from('products')
                .update({ quantity: newQuantity, selling_price: newPrice })
                .eq('id', product.id);

            if (error) {
                console.error('Error updating product:', error.message);
                alert("Failed to update product: " + error.message);
                return;
            }

            alert("Product updated successfully!");
            document.body.removeChild(modal); // Close the modal
            fetchProducts(); // Refresh the product list
        });

        // Handle cancel button
        const cancelEdit = document.getElementById('cancelEdit');
        cancelEdit.addEventListener('click', function () {
            document.body.removeChild(modal); // Close the modal
        });
    }

    fetchProducts(); // Fetch products on page load
});

const apiBase = "http://127.0.0.1:5000";
let cart = [];

// Carregar produtos ao abrir
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();

    // Formulário de adicionar produto ao banco
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addProduct();
    });
});

// Carregar produtos do banco
async function loadProducts() {
    try {
        const response = await fetch(`${apiBase}/products`);
        const products = await response.json();

        const productList = document.getElementById('products');
        productList.innerHTML = '';

        products.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${product.name} - R$${product.price.toFixed(2)} (Estoque: ${product.stock})
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Adicionar ao Carrinho</button>
                <button onclick="deleteProduct(${product.id})">Excluir</button>
                <button onclick="showEditForm(${product.id}, '${product.name}', ${product.price}, ${product.stock})">Editar</button>
            `;
            productList.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error.message);
    }
}

// Adicionar produto ao banco
async function addProduct() {
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);

    try {
        const response = await fetch(`${apiBase}/add-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, stock })
        });

        if (!response.ok) throw new Error("Erro ao adicionar produto.");
        alert("Produto adicionado com sucesso!");
        document.getElementById('product-form').reset();
        loadProducts();
    } catch (error) {
        alert(error.message);
    }
}

// Deletar produto
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${apiBase}/delete-product/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Erro ao deletar produto.");
        loadProducts();
    } catch (error) {
        alert(error.message);
    }
}

// Editar produto
function showEditForm(id, name, price, stock) {
    const newName = prompt("Novo nome:", name);
    const newPrice = parseFloat(prompt("Novo preço:", price));
    const newStock = parseInt(prompt("Novo estoque:", stock));

    if (newName && !isNaN(newPrice) && !isNaN(newStock)) {
        updateProduct(id, newName, newPrice, newStock);
    }
}

async function updateProduct(id, name, price, stock) {
    try {
        const response = await fetch(`${apiBase}/update-product/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, stock })
        });

        if (!response.ok) throw new Error("Erro ao atualizar produto.");
        loadProducts();
    } catch (error) {
        alert(error.message);
    }
}

// === 🛒 Carrinho de Compras ===
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById('cart-items');
    cartList.innerHTML = '';

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} - R$${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartList.appendChild(li);
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Carrinho vazio.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`Total da compra: R$${total.toFixed(2)}`);
    cart = []; // esvazia carrinho após compra
    renderCart();
}

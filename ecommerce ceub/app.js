const CartUI = (() => { // Isso daqui vai fazer a interface do carrinho. Também encapsula toda a lógica de manipulação relacionado ao carrinho.

    // Elementos DOM privados
    const elements = {
        iconCart: document.querySelector('.iconCart'),
        cart: document.querySelector('.cart'),
        container: document.querySelector('.container'),
        close: document.querySelector('.close'),
        listCart: document.querySelector('.listCart'),
        totalQuantity: document.querySelector('.totalQuantity')
    };

    // Vai inicializar os event listeners
    function initEventListeners() {
        elements.iconCart.addEventListener('click', toggleCart);
        elements.close.addEventListener('click', closeCart);
    }

    // Alterna a visibilidade do carrinho
    function toggleCart() {
        if (elements.cart.style.right === '-100%') {
            openCart();
        } else {
            closeCart();
        }
    }

    // Abre o carrinho
    function openCart() {
        elements.cart.style.right = '0';
        elements.container.style.transform = 'translateX(-400px)';
    }

    // Fecha o carrinho
    function closeCart() {
        elements.cart.style.right = '-100%';
        elements.container.style.transform = 'translateX(0)';
    }

    // Atualiza a exibição do carrinho
    function updateCartDisplay(cartItems) {
        elements.listCart.innerHTML = '';
        let totalQuantity = 0;

        if (cartItems) {
            cartItems.forEach(product => {
                if (product) {
                    renderCartItem(product);
                    totalQuantity += product.quantity;
                }
            });
        }

        elements.totalQuantity.innerText = totalQuantity;
    }

    // Renderiza um item do carrinho
    function renderCartItem(product) {
        const newCart = document.createElement('div');
        newCart.classList.add('item');
        newCart.innerHTML = `
            <img src="${product.image}">
            <div class="content">
                <div class="name">${product.name}</div>
                <div class="price">R$${product.price}</div>
            </div>
            <div class="quantity">
                <button data-id="${product.id}" data-action="decrease">-</button>
                <span class="value">${product.quantity}</span>
                <button data-id="${product.id}" data-action="increase">+</button>
            </div>`;
        elements.listCart.appendChild(newCart);
    }

    // Expõe apenas os métodos necessários
    return {
        init: initEventListeners,
        updateDisplay: updateCartDisplay,
        closeCart: closeCart
    };
})();

/**
 * Módulo ProductUI - Responsável pela exibição dos produtos
 */
const ProductUI = (() => {
    // Elemento DOM privado
    const listProductHTML = document.querySelector('.listProduct');

    // Renderiza os produtos na página
    function renderProducts(products) {
        listProductHTML.innerHTML = '';

        if (products) {
            products.forEach(product => {
                renderProductItem(product);
            });
        }
    }

    // Renderiza um item de produto
    function renderProductItem(product) {
        const newProduct = document.createElement('div');
        newProduct.classList.add('item');
        newProduct.innerHTML = `
            <img src="${product.image}">
            <h2>${product.name}</h2>
            <div class="price">R$${product.price}</div>
            <button data-id="${product.id}" class="add-to-cart">Adicionar ao Carrinho</button>`;
        listProductHTML.appendChild(newProduct);
    }

    return {
        render: renderProducts
    };
})();


const CartManager = (() => { // Esse daqui é responsável pela lógica do carrinho.
    let listCart = [];
    let products = null;

    // Carrega produtos do JSON
    async function loadProducts() {
        try {
            const response = await fetch('product.json');
            products = await response.json();
            ProductUI.render(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Carrega o carrinho do cookie
    function loadCart() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('listCart='));
        if (cookieValue) {
            listCart = JSON.parse(cookieValue.split('=')[1]);
        }
        return [...listCart];
    }

    // Adiciona produto ao carrinho
    function addToCart(productId) {
        if (!products) return;

        const productCopy = JSON.parse(JSON.stringify(products));
        const productToAdd = productCopy.find(p => p.id == productId);

        if (!productToAdd) return;

        if (!listCart[productId]) {
            productToAdd.quantity = 1;
            listCart[productId] = productToAdd;
        } else {
            listCart[productId].quantity++;
        }

        saveCart();
    }

    // Altera quantidade de um produto no carrinho
    function changeQuantity(productId, operation) {
        if (!listCart[productId]) return;

        switch (operation) {
            case 'increase':
                listCart[productId].quantity++;
                break;
            case 'decrease':
                listCart[productId].quantity--;
                if (listCart[productId].quantity <= 0) {
                    delete listCart[productId];
                }
                break;
        }

        saveCart();
    }

    // Salva o carrinho no cookie
    function saveCart() {
        const expires = "expires=Thu, 31 Dec 2025 23:59:59 UTC";
        document.cookie = `listCart=${JSON.stringify(listCart)}; ${expires}; path=/;`;
        CartUI.updateDisplay(getCartItems());
    }

    // Obtém itens do carrinho
    function getCartItems() {
        return [...listCart];
    }

    return {
        loadProducts,
        loadCart,
        addToCart,
        changeQuantity,
        getCartItems
    };
})();


const EventManager = (() => { // Serve para centralizar o gerenciamento de eventos.
    function init() {
        // Event delegation para botões de adicionar ao carrinho
        document.querySelector('.listProduct').addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = e.target.getAttribute('data-id');
                CartManager.addToCart(productId);
            }
        });

        // Event delegation para botões de quantidade no carrinho
        document.querySelector('.listCart').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const productId = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                CartManager.changeQuantity(productId, action);
            }
        });
    }

    return {
        init
    };
})();


function initApp() { // Inicia a aplicação.
    CartUI.init();
    EventManager.init();
    CartManager.loadProducts();
    CartManager.loadCart();
    CartUI.updateDisplay(CartManager.getCartItems());
}

initApp();
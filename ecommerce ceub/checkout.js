const CartService = (() => { // Responsável pela lógica e manipulação do carrinho. Também irá encapsular o acesso de dados do carrinho através de cookies.
    let cartItems = [];
    
    // Carrega os itens do carrinho do cookie.
    function loadCart() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('listCart='));
        
        if (cookieValue) {
            cartItems = JSON.parse(cookieValue.split('=')[1]) || [];
        }
        return getCartItems();
    }
    
    // Retorna uma cópia dos itens do carrinho. Segue o princípio de imutabilidade.
    function getCartItems() {
        return [...cartItems];
    }
    
    // Calcula os totais do carrinho.
    function calculateTotals() {
        return cartItems.reduce((totals, product) => {
            if (product) {
                totals.quantity += product.quantity;
                totals.price += product.price * product.quantity;
            }
            return totals;
        }, { quantity: 0, price: 0 });
    }
    
    // Salva o carrinho no cookie.
    function saveCart(items) {
        cartItems = items;
        const expires = "expires=Thu, 31 Dec 2025 23:59:59 UTC";
        document.cookie = `listCart=${JSON.stringify(cartItems)}; ${expires}; path=/;`;
    }
    
    return { // Vai retornar as funções.
        loadCart,
        getCartItems,
        calculateTotals,
        saveCart
    };
})();


const CartRenderer = (() => { // Renderiza o carrinho na UI e encapsula toda a manipulação do DOM ao carrinho.
    // Seletores de elementos DOM.
    const selectors = {
        listContainer: '.returnCart .list',
        totalQuantity: '.totalQuantity',
        totalPrice: '.totalPrice'
    };
    
    // Cache de elementos DOM.
    let elements = {};
    
    // Inicializa os elementos DOM.
    function init() {
        elements.listContainer = document.querySelector(selectors.listContainer);
        elements.totalQuantity = document.querySelector(selectors.totalQuantity);
        elements.totalPrice = document.querySelector(selectors.totalPrice);
    }
    
    // Renderiza todos os itens do carrinho.
    function renderCart(items) {
        clearCart();
        
        const totals = CartService.calculateTotals();
        renderTotals(totals);
        
        if (items && items.length > 0) {
            items.forEach(product => {
                if (product) {
                    renderCartItem(product);
                }
            });
        }
    }
    
    // Renderiza um único item do carrinho.
    function renderCartItem(product) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.innerHTML = generateCartItemHTML(product);
        elements.listContainer.appendChild(itemElement);
    }
    
    // Gera o HTML para um item do carrinho.
    function generateCartItemHTML(product) {
        return `
            <img src="${product.image}">
            <div class="info">
                <div class="name">${product.name}</div>
                <div class="price">R$${product.price}</div>
            </div>
            <div class="quantity">${product.quantity}</div>
            <div class="returnPrice">R$${product.price * product.quantity}</div>
        `;
    }
    
    // Limpa o carrinho na UI.
    function clearCart() {
        elements.listContainer.innerHTML = '';
    }
    
    // Atualiza os totais na UI.
    function renderTotals(totals) {
        elements.totalQuantity.textContent = totals.quantity;
        elements.totalPrice.textContent = `R$${totals.price}`;
    }
    
    return { // Retorna as funções.
        init,
        renderCart
    };
})();

const CartController = (() => { // Serve para coordenar a interação entre serviço e renderização.
    // Inicializa o carrinho.
    function init() {
        CartRenderer.init();
        refreshCart();
    }
    
    // Atualiza o carrinho (carrega dados e renderiza).
    function refreshCart() {
        const cartItems = CartService.loadCart();
        CartRenderer.renderCart(cartItems);
    }
    
    return { // Retorna as funções.
        init,
        refreshCart
    };
})();

// Inicializa a aplicação.
document.addEventListener('DOMContentLoaded', () => {
    CartController.init();
});
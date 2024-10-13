import { cart, removeFromCart } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatCurrency } from './utils/money.js';
import { deleiveryOptions } from '../data/deleiveryOptions.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

let cartSummaryHTML = '';

cart.forEach((cartItem) => {
	const productId = cartItem.productId;

	// Use find() to get the matching product
	const matchingProduct = products.find((product) => product.id === productId);

	// Use find() to get the matching delivery option
	const deleiveryOption = deleiveryOptions.find(
		(option) => option.id === cartItem.deleiveryOptionId
	);

	// Calculate delivery date
	const today = dayjs();
	const deleiveryDate = today.add(deleiveryOption.deleiveryDays, 'days');
	const dateString = deleiveryDate.format('dddd, MMMM D');

	// Build cart item HTML
	cartSummaryHTML += `
		<div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
			<div class="delivery-date js-delivery-date-${matchingProduct.id}">Delivery date: ${dateString}</div>

			<div class="cart-item-details-grid">
				<img class="product-image" src="${matchingProduct.image}" />

				<div class="cart-item-details">
					<div class="product-name">${matchingProduct.name}</div>
					<div class="product-price">$${formatCurrency(matchingProduct.priceCents)}</div>
					<div class="product-quantity">
						<span> Quantity: <span class="quantity-label">${cartItem.quantity}</span> </span>
						<span class="update-quantity-link link-primary js-update-link">Update</span>
						<span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">Delete</span>
					</div>
				</div>

				<div class="delivery-options">
					<div class="delivery-options-title">Choose a delivery option:</div>
					${deleiveryOptionsHTML(matchingProduct, cartItem)}
				</div>
			</div>
		</div>
	`;
});

// Function to build delivery options HTML
function deleiveryOptionsHTML(matchingProduct, cartItem) {
	let html = '';
	deleiveryOptions.forEach((deleiveryOption) => {
		const today = dayjs();
		const deleiveryDate = today.add(deleiveryOption.deleiveryDays, 'days');
		const dateString = deleiveryDate.format('dddd, MMMM D');

		const priceString =
			deleiveryOption.priceCents === 0
				? 'FREE'
				: `$${formatCurrency(deleiveryOption.priceCents)} -`;

		// Check if the delivery option matches the one selected by the user
		const isChecked =
			deleiveryOption.id === cartItem.deleiveryOptionId ? 'checked' : '';

		// Correct the input name and checked status, and add an event listener for change
		html += `
			<div class="delivery-option">
				<input
					type="radio"
					class="delivery-option-input"
					name="delivery-option-${matchingProduct.id}"
					data-product-id="${matchingProduct.id}"
					data-delivery-days="${deleiveryOption.deleiveryDays}"
					${isChecked ? 'checked' : ''} />
				<div>
					<div class="delivery-option-date">${dateString}</div>
					<div class="delivery-option-price">${priceString} Shipping</div>
				</div>
			</div>
		`;
	});

	return html;
}

// Insert the cart summary into the DOM
document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

// Add event listeners for "Delete" buttons
document.querySelectorAll('.js-delete-link').forEach((link) => {
	link.addEventListener('click', () => {
		const productId = link.dataset.productId;
		removeFromCart(productId); // Remove the product from cart
		const container = document.querySelector(
			`.js-cart-item-container-${productId}`
		);
		container.remove(); // Remove the product from the DOM
	});
});

// Add event listeners for delivery option changes
document.querySelectorAll('.delivery-option-input').forEach((input) => {
	input.addEventListener('change', (event) => {
		const productId = event.target.dataset.productId;
		const deliveryDays = parseInt(event.target.dataset.deliveryDays);

		// Calculate new delivery date
		const today = dayjs();
		const newDeliveryDate = today
			.add(deliveryDays, 'days')
			.format('dddd, MMMM D');

		// Update the delivery date in the DOM
		const deliveryDateElement = document.querySelector(
			`.js-delivery-date-${productId}`
		);
		deliveryDateElement.textContent = `Delivery date: ${newDeliveryDate}`;
	});
});

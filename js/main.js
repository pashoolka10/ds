// js/main.js
// Единственный скрипт сайта GameCard.
//
// Что внутри:
//   1) данные магазина (справочники, товары, настройки фильтра);
//   2) общие функции (цена, названия характеристик);
//   3) каталог: фильтр, товары, пополнение Steam;
//   4) корзина (хранится в localStorage);
//   5) кнопка «Версия для печати» и год в подвале.
//
// Скрипт подключается на всех страницах с атрибутом defer и начинает работу
// после загрузки документа (DOMContentLoaded).

(function () {
	'use strict';

	/* ======================================================================
	   1. ДАННЫЕ
	   ====================================================================== */

	// Справочники: код характеристики -> текст на экране
	var PLATFORMS = {
		playstation: 'PlayStation',
		apple: 'Apple',
		steam: 'Steam',
		games: 'Игры'
	};

	var COUNTRIES = {
		india: 'Индия',
		turkey: 'Турция',
		usa: 'США',
		canada: 'Канада',
		russia: 'Россия'
	};

	// Группы фильтра: порядок в массиве = порядок блоков в панели фильтра.
	// key — характеристика товара, title — заголовок блока, values — варианты.
	var FILTERS = [
		{
			key: 'platform',
			title: 'Платформа',
			values: ['playstation', 'apple', 'steam', 'games']
		},
		{
			key: 'country',
			title: 'Страна',
			values: ['india', 'turkey', 'usa', 'canada', 'russia']
		},
		{
			key: 'nominal',
			title: 'Номинал',
			values: ['1000 INR', '2000 INR', '500 TRY', '1000 TRY', '25 USD', '100 USD',
				'15 CAD', '100 CAD', 'Стандартное издание', 'Deluxe издание']
		}
	];

	// Steam пополняется по логину: товаров у него нет, но в фильтре он есть
	var STEAM = 'steam';

	// Максимальная цена для ползунка «Цена»
	var MAX_PRICE = 12000;

	// Имя корзины в памяти браузера
	var CART_KEY = 'gamecard_cart';

	// Товары магазина. platform, country и nominal — характеристики для фильтра.
	var products = [
		{
			id: 'ps-in-1000',
			name: 'PlayStation Store Индия 1000 INR',
			platform: 'playstation',
			country: 'india',
			nominal: '1000 INR',
			price: 1190,
			oldPrice: 1490,
			rating: 4.9,
			popular: 100,
			image: 'images/ps-india-1000.jpg',
			description: 'Карта пополнения кошелька PSN для индийского региона. Подходит для покупки игр, подписок PS Plus и дополнений.'
		},
		{
			id: 'ps-in-2000',
			name: 'PlayStation Store Индия 2000 INR',
			platform: 'playstation',
			country: 'india',
			nominal: '2000 INR',
			price: 2290,
			oldPrice: 2690,
			rating: 4.9,
			popular: 92,
			image: 'images/ps-india-2000.jpg',
			description: 'Увеличенный номинал для индийского аккаунта. Хватает на крупную игру или несколько месяцев подписки.'
		},
		{
			id: 'ps-tr-500',
			name: 'PlayStation Store Турция 500 TRY',
			platform: 'playstation',
			country: 'turkey',
			nominal: '500 TRY',
			price: 1490,
			rating: 4.8,
			popular: 88,
			image: 'images/ps-turkey-500.svg',
			description: 'Турецкий регион PSN — один из самых дешёвых. Код приходит на e-mail и активируется в турецком аккаунте.'
		},
		{
			id: 'ps-tr-1000',
			name: 'PlayStation Store Турция 1000 TRY',
			platform: 'playstation',
			country: 'turkey',
			nominal: '1000 TRY',
			price: 2790,
			rating: 4.8,
			popular: 84,
			image: 'images/ps-turkey-1000.svg',
			description: 'Пополнение турецкого кошелька PSN на крупную сумму. Активация занимает не больше пары минут.'
		},
		{
			id: 'ap-us-25',
			name: 'Apple Gift Card США 25 USD',
			platform: 'apple',
			country: 'usa',
			nominal: '25 USD',
			price: 2690,
			rating: 4.9,
			popular: 95,
			image: 'images/apple-usa-25.jpg',
			description: 'Карта для американского Apple ID: App Store, iCloud, Apple Music, подписки и покупки внутри приложений.'
		},
		{
			id: 'ap-us-100',
			name: 'Apple Gift Card США 100 USD',
			platform: 'apple',
			country: 'usa',
			nominal: '100 USD',
			price: 9890,
			oldPrice: 10490,
			rating: 4.9,
			popular: 90,
			image: 'images/apple-usa-100.jpg',
			description: 'Большой номинал для американского аккаунта Apple. Удобно, если покупаете технику или платите за подписки на год.'
		},
		{
			id: 'ap-ca-15',
			name: 'Apple Gift Card Канада 15 CAD',
			platform: 'apple',
			country: 'canada',
			nominal: '15 CAD',
			price: 1190,
			rating: 4.7,
			popular: 70,
			image: 'images/apple-canada-15.jpg',
			description: 'Небольшая карта пополнения для канадского Apple ID. Подходит для подписок и покупок в App Store.'
		},
		{
			id: 'ap-ca-100',
			name: 'Apple Gift Card Канада 100 CAD',
			platform: 'apple',
			country: 'canada',
			nominal: '100 CAD',
			price: 7190,
			rating: 4.7,
			popular: 66,
			image: 'images/apple-canada-100.jpg',
			description: 'Максимальный номинал для канадского региона. Подходит для годовых подписок и крупных покупок.'
		},
		{
			id: 'game-gta6-std',
			name: 'GTA VI (PS5). Стандартное издание',
			platform: 'games',
			country: 'russia',
			nominal: 'Стандартное издание',
			price: 8990,
			oldPrice: 9490,
			rating: 5.0,
			popular: 98,
			image: 'images/gta6.jpg',
			description: 'Ключ активации Grand Theft Auto VI для PlayStation 5. Предзаказ: ключ приходит в день выхода игры.'
		},
		{
			id: 'game-gta6-deluxe',
			name: 'GTA VI (PS5). Deluxe Edition',
			platform: 'games',
			country: 'russia',
			nominal: 'Deluxe издание',
			price: 11490,
			rating: 5.0,
			popular: 74,
			image: 'images/gta6.jpg',
			description: 'Расширенное издание GTA VI: базовая игра, бонусные наборы и внутриигровая валюта для онлайн-режима.'
		}
	];

	/* ======================================================================
	   2. ОБЩИЕ ФУНКЦИИ
	   ====================================================================== */

	// Цена в удобном виде: 1190 -> «1 190 ₽»
	function formatPrice(value) {
		return value.toLocaleString('ru-RU') + ' ₽';
	}

	// Код характеристики -> название на экране: labelFor('country', 'india') -> «Индия»
	function labelFor(key, value) {
		if (key === 'platform') {
			return PLATFORMS[value];
		}
		if (key === 'country') {
			return COUNTRIES[value];
		}
		return value;
	}

	/* ======================================================================
	   3. КАТАЛОГ
	   ====================================================================== */

	// Что сейчас выбрано в фильтре, до какой цены и как сортировать
	var chosen = { platform: [], country: [], nominal: [] };
	var maxPrice = MAX_PRICE;
	var sortMode = 'popular';

	// Подходит ли товар фильтру.
	// changeKey и changeValue — необязательная подмена одного условия:
	// она нужна «умному фильтру», чтобы проверить ещё не выбранные значения.
	function isSuitable(product, changeKey, changeValue) {
		for (var i = 0; i < FILTERS.length; i++) {
			var key = FILTERS[i].key;
			var productValue = product[key];

			// для проверяемой группы берём не текущий выбор, а подставленное значение
			if (key === changeKey) {
				if (productValue !== changeValue) {
					return false;
				}
				continue;
			}

			var selected = chosen[key];

			// в этой группе ничего не выбрано — характеристика не важна
			if (selected.length === 0) {
				continue;
			}

			// выбрано что-то другое — товар не подходит
			if (selected.indexOf(productValue) === -1) {
				return false;
			}
		}

		// последняя проверка — цена
		return product.price <= maxPrice;
	}

	// Собрать подходящие товары и отсортировать их
	function filteredProducts() {
		var result = [];

		for (var i = 0; i < products.length; i++) {
			if (isSuitable(products[i])) {
				result.push(products[i]);
			}
		}

		if (sortMode === 'price-asc') {
			result.sort(function (a, b) { return a.price - b.price; });
		} else if (sortMode === 'price-desc') {
			result.sort(function (a, b) { return b.price - a.price; });
		} else if (sortMode === 'rating') {
			result.sort(function (a, b) { return b.rating - a.rating; });
		} else {
			result.sort(function (a, b) { return b.popular - a.popular; });
		}

		return result;
	}

	// Разметка одной карточки товара
	function productCard(product) {
		var oldPrice = '';

		// старая цена есть только у товаров со скидкой
		if (product.oldPrice) {
			oldPrice = ' <s class="old-price">' + formatPrice(product.oldPrice) + '</s>';
		}

		var html = '<article class="product-card fade-in">';

		html = html + '<img class="product-image" src="' + product.image + '" alt="' + product.name + '">';
		html = html + '<h3>' + product.name + '</h3>';
		html = html + '<p>' + product.description + '</p>';

		html = html + '<ul class="product-meta">';
		html = html + '<li>' + labelFor('platform', product.platform) + '</li>';
		html = html + '<li>' + labelFor('country', product.country) + '</li>';
		html = html + '<li>' + product.nominal + '</li>';
		html = html + '</ul>';

		html = html + '<p class="product-rating">★ ' + product.rating.toFixed(1) + '</p>';
		html = html + '<p class="product-bottom">';
		html = html + '<span class="price">' + formatPrice(product.price) + oldPrice + '</span>';
		html = html + '<button class="btn btn-add" type="button" data-id="' + product.id + '">В корзину</button>';
		html = html + '</p>';

		html = html + '</article>';

		return html;
	}

	// Нарисовать панель фильтра (чекбоксы и ползунок цены)
	function printFilters() {
		var html = '';

		for (var i = 0; i < FILTERS.length; i++) {
			var group = FILTERS[i];

			html = html + '<div class="filter-group">';
			html = html + '<h3>' + group.title + '</h3>';

			for (var j = 0; j < group.values.length; j++) {
				var value = group.values[j];
				var checked = '';

				if (chosen[group.key].indexOf(value) !== -1) {
					checked = ' checked';
				}

				html = html + '<label class="checkbox">';
				html = html + '<input class="filter-checkbox" type="checkbox" name="' + group.key +
					'" value="' + value + '"' + checked + '>';
				html = html + '<span>' + labelFor(group.key, value) + '</span>';
				html = html + '</label>';
			}

			html = html + '</div>';
		}

		// четвёртый критерий фильтрации — цена
		html = html + '<div class="filter-group">';
		html = html + '<h3>Цена, до <span id="price-value">' + formatPrice(maxPrice) + '</span></h3>';
		html = html + '<input class="range" type="range" id="price-range" min="500" max="' +
			MAX_PRICE + '" step="100" value="' + maxPrice + '">';
		html = html + '</div>';

		document.getElementById('filters').innerHTML = html;
	}

	// Прочитать, какие галочки стоят сейчас
	function readChosen() {
		for (var i = 0; i < FILTERS.length; i++) {
			var key = FILTERS[i].key;
			var boxes = document.querySelectorAll('.filter-checkbox[name="' + key + '"]');
			var values = [];

			for (var j = 0; j < boxes.length; j++) {
				if (boxes[j].checked) {
					values.push(boxes[j].value);
				}
			}

			chosen[key] = values;
		}
	}

	// Останется ли хоть один товар, если в группе key выбрать значение value
	function hasResult(key, value) {
		for (var i = 0; i < products.length; i++) {
			if (isSuitable(products[i], key, value)) {
				return true;
			}
		}
		return false;
	}

	// «Умный фильтр»: значения, которые дадут пустой список, делаем недоступными
	function updateAvailability() {
		var boxes = document.querySelectorAll('.filter-checkbox');

		for (var i = 0; i < boxes.length; i++) {
			var box = boxes[i];
			var available = true;

			// Steam не блокируем: товаров у него нет, но есть форма пополнения
			var isSteam = (box.name === 'platform' && box.value === STEAM);

			if (!isSteam && !box.checked) {
				available = hasResult(box.name, box.value);
			}

			box.disabled = !available;

			// серый зачёркнутый вид — класс на <label>, внутри которого чекбокс
			if (available) {
				box.parentNode.classList.remove('checkbox-disabled');
			} else {
				box.parentNode.classList.add('checkbox-disabled');
			}
		}
	}

	// Надпись «1 товар / 2 товара / 12 товаров»
	function productsTitle(count) {
		var lastTwo = count % 100;
		var last = count % 10;
		var word = 'товаров';

		if (lastTwo < 11 || lastTwo > 14) {
			if (last === 1) {
				word = 'товар';
			} else if (last >= 2 && last <= 4) {
				word = 'товара';
			}
		}

		return count + ' ' + word;
	}

	// Нарисовать товары, счётчик, блок Steam и заглушку «ничего не найдено»
	function printProducts() {
		var list = filteredProducts();
		var html = '';

		for (var i = 0; i < list.length; i++) {
			html = html + productCard(list[i]);
		}

		document.getElementById('products').innerHTML = html;

		// Steam пополняется по логину, поэтому вместо карточек показываем форму
		var steamChosen = (chosen.platform.indexOf(STEAM) !== -1);
		var onlySteam = (steamChosen && chosen.platform.length === 1);

		document.getElementById('steam-block').hidden = !steamChosen;

		// надпись над каталогом
		if (onlySteam) {
			document.getElementById('catalog-count').textContent = 'Пополнение Steam';
		} else {
			document.getElementById('catalog-count').textContent = productsTitle(list.length);
		}

		// заглушка, если ничего не нашлось
		document.getElementById('catalog-empty').hidden = (list.length > 0 || onlySteam);
	}

	// Прочитать один параметр из адреса страницы:
	// при адресе catalog.html?platform=steam вернёт 'steam'
	function getUrlParam(name) {
		var search = window.location.search;

		if (search.length === 0) {
			return '';
		}

		search = search.substring(1);
		var parts = search.split('&');

		for (var i = 0; i < parts.length; i++) {
			var pair = parts[i].split('=');

			if (pair[0] === name) {
				return pair[1];
			}
		}

		return '';
	}

	// Если в адресе были параметры фильтра — отметить их галочками
	function readUrlParams() {
		for (var i = 0; i < FILTERS.length; i++) {
			var key = FILTERS[i].key;
			var value = getUrlParam(key);

			if (value !== '') {
				chosen[key] = [value];
			}
		}
	}

	// Запуск каталога (если на странице есть блок товаров)
	function initCatalog() {
		var productsBox = document.getElementById('products');

		if (!productsBox) {
			return;
		}

		readUrlParams();
		printFilters();
		printProducts();
		updateAvailability();

		var filtersBox = document.getElementById('filters');

		// отметили или сняли галочку (панель перерисовывается, поэтому слушаем контейнер)
		filtersBox.addEventListener('change', function (event) {
			if (event.target.classList.contains('filter-checkbox')) {
				readChosen();
				printProducts();
				updateAvailability();
			}
		});

		// подвинули ползунок цены
		filtersBox.addEventListener('input', function (event) {
			if (event.target.id === 'price-range') {
				maxPrice = Number(event.target.value);
				document.getElementById('price-value').textContent = formatPrice(maxPrice);
				printProducts();
				updateAvailability();
			}
		});

		// сменили сортировку
		document.getElementById('sort').addEventListener('change', function (event) {
			sortMode = event.target.value;
			printProducts();
		});

		// нажали «Сбросить фильтры»
		document.getElementById('reset-filters').addEventListener('click', function () {
			chosen = { platform: [], country: [], nominal: [] };
			maxPrice = MAX_PRICE;
			sortMode = 'popular';
			document.getElementById('sort').value = 'popular';

			printFilters();
			printProducts();
			updateAvailability();
		});

		// кнопки «В корзину»: карточки создаются заново, поэтому слушаем контейнер
		productsBox.addEventListener('click', function (event) {
			var button = event.target.closest('.btn-add');

			if (button) {
				addToCart(button.getAttribute('data-id'));
			}
		});

		// форма пополнения Steam
		var steamForm = document.getElementById('steam-form');

		if (steamForm) {
			steamForm.addEventListener('submit', function (event) {
				event.preventDefault();

				if (!steamForm.checkValidity()) {
					steamForm.reportValidity();
					return;
				}

				var login = document.getElementById('steam-login').value;
				var amount = Number(document.getElementById('steam-amount').value);
				var success = document.getElementById('steam-success');

				success.textContent = 'Заявка принята: пополним аккаунт ' + login + ' на ' +
					amount.toLocaleString('ru-RU') + ' ₽ после подтверждения заказа.';
				success.hidden = false;

				steamForm.reset();
			});
		}
	}

	/* ======================================================================
	   4. КОРЗИНА
	   ====================================================================== */

	// Прочитать корзину. Товаров нет — вернём пустой объект
	function readCart() {
		var cart = {};

		try {
			var text = localStorage.getItem(CART_KEY);

			if (text !== null) {
				cart = JSON.parse(text);
			}
		} catch (error) {
			/* браузер может запретить localStorage — считаем корзину пустой */
			cart = {};
		}

		return cart;
	}

	// Сохранить корзину
	function writeCart(cart) {
		try {
			localStorage.setItem(CART_KEY, JSON.stringify(cart));
		} catch (error) {
			/* сохранить не получилось — продолжаем работу */
		}
	}

	// Найти товар по id среди товаров магазина
	function findProduct(id) {
		for (var i = 0; i < products.length; i++) {
			if (products[i].id === id) {
				return products[i];
			}
		}
		return null;
	}

	// Добавить одну штуку товара
	function addToCart(id) {
		var cart = readCart();

		if (cart[id] === undefined) {
			cart[id] = 1;
		} else {
			cart[id] = cart[id] + 1;
		}

		writeCart(cart);
	}

	// Изменить количество на +1 или -1
	function changeQuantity(id, delta) {
		var cart = readCart();

		if (cart[id] === undefined) {
			return;
		}

		cart[id] = cart[id] + delta;

		// стало меньше одной штуки — товар убираем совсем
		if (cart[id] < 1) {
			delete cart[id];
		}

		writeCart(cart);
	}

	// Удалить товар из корзины
	function removeFromCart(id) {
		var cart = readCart();
		delete cart[id];
		writeCart(cart);
	}

	// Очистить корзину (после оформления заказа)
	function clearCart() {
		writeCart({});
	}

	// Собрать список позиций корзины: [{ product, count, sum }]
	function cartItems() {
		var cart = readCart();
		var items = [];

		for (var id in cart) {
			var product = findProduct(id);

			// товара может уже не быть в списке — такую позицию пропускаем
			if (product !== null) {
				items.push({
					product: product,
					count: cart[id],
					sum: product.price * cart[id]
				});
			}
		}

		return items;
	}

	// Итоговая сумма заказа
	function cartTotal() {
		var items = cartItems();
		var total = 0;

		for (var i = 0; i < items.length; i++) {
			total = total + items[i].sum;
		}

		return total;
	}

	// Разметка одной позиции корзины
	function cartItemHtml(item) {
		var html = '<li class="cart-item">';

		html = html + '<img class="cart-image" src="' + item.product.image + '" alt="' + item.product.name + '">';
		html = html + '<div class="cart-info">';
		html = html + '<h3>' + item.product.name + '</h3>';
		html = html + '<p class="cart-meta">' + labelFor('platform', item.product.platform) +
			' • ' + labelFor('country', item.product.country) + ' • ' + item.product.nominal + '</p>';
		html = html + '<p class="cart-meta">' + formatPrice(item.product.price) + '</p>';
		html = html + '</div>';

		html = html + '<div class="cart-controls">';
		html = html + '<button class="qty-button" type="button" data-action="minus" data-id="' +
			item.product.id + '" aria-label="Уменьшить количество">−</button>';
		html = html + '<span>' + item.count + '</span>';
		html = html + '<button class="qty-button" type="button" data-action="plus" data-id="' +
			item.product.id + '" aria-label="Увеличить количество">+</button>';
		html = html + '</div>';

		html = html + '<p class="cart-sum">' + formatPrice(item.sum) + '</p>';
		html = html + '<button class="cart-remove" type="button" data-action="remove" data-id="' +
			item.product.id + '">Удалить</button>';

		html = html + '</li>';

		return html;
	}

	// Нарисовать корзину: список товаров, итог и нужные блоки
	function renderCart() {
		var list = document.getElementById('cart-list');

		// если корзины на странице нет, значит мы не на cart.html
		if (!list) {
			return;
		}

		var items = cartItems();

		// итог показываем во всех местах с атрибутом data-cart-total
		var totals = document.querySelectorAll('[data-cart-total]');

		for (var i = 0; i < totals.length; i++) {
			totals[i].textContent = formatPrice(cartTotal());
		}

		// пусто — показываем заглушку и прячем форму заказа; не пусто — наоборот
		var empty = (items.length === 0);

		document.getElementById('cart-empty').hidden = !empty;
		document.getElementById('order-block').hidden = empty;

		// сам список товаров
		var html = '';

		for (var j = 0; j < items.length; j++) {
			html = html + cartItemHtml(items[j]);
		}

		list.innerHTML = html;
	}

	// Запуск корзины: кнопки «+», «−», «Удалить» и форма заказа
	function initCart() {
		renderCart();

		var list = document.getElementById('cart-list');

		if (list) {
			list.addEventListener('click', function (event) {
				var button = event.target.closest('[data-action]');

				if (!button) {
					return;
				}

				var id = button.getAttribute('data-id');
				var action = button.getAttribute('data-action');

				if (action === 'plus') {
					changeQuantity(id, 1);
				}
				if (action === 'minus') {
					changeQuantity(id, -1);
				}
				if (action === 'remove') {
					removeFromCart(id);
				}

				renderCart();
			});
		}

		var form = document.getElementById('order-form');

		if (form) {
			form.addEventListener('submit', function (event) {
				event.preventDefault();

				if (!form.checkValidity()) {
					form.reportValidity();
					return;
				}

				var number = 1000 + Math.floor(Math.random() * 9000);
				var success = document.getElementById('order-success');

				success.textContent = 'Спасибо! Заказ №' + number +
					' принят. Код придёт на указанную почту в течение 5 минут.';
				success.hidden = false;

				form.reset();
				clearCart();
				renderCart();
			});
		}
	}

	/* ======================================================================
	   5. ПЕЧАТЬ И ГОД
	   ====================================================================== */

	// В HTML подключены два файла стилей: styles.css (включён) и print.css
	// с атрибутом media="not all" (загружен, но выключен). По нажатию кнопки
	// меняем значение media — вид страницы меняется без перезагрузки.
	function togglePrint() {
		var mainStyles = document.getElementById('main-styles');
		var printStyles = document.getElementById('print-styles');
		var buttons = document.querySelectorAll('[data-print-toggle]');
		var printOn = (printStyles.media === 'not all');

		if (printOn) {
			printStyles.media = 'all';
			mainStyles.media = 'not all';
		} else {
			printStyles.media = 'not all';
			mainStyles.media = 'all';
		}

		// текст на всех кнопках меняем на противоположный
		for (var i = 0; i < buttons.length; i++) {
			if (printOn) {
				buttons[i].textContent = 'Обычная версия';
			} else {
				buttons[i].textContent = 'Версия для печати';
			}
		}
	}

	function initPrintButton() {
		var buttons = document.querySelectorAll('[data-print-toggle]');

		for (var i = 0; i < buttons.length; i++) {
			buttons[i].addEventListener('click', togglePrint);
		}
	}

	// В HTML на месте года стоит заглушка — подставляем текущий год
	function printCurrentYear() {
		var year = document.getElementById('year');

		if (year) {
			year.textContent = new Date().getFullYear();
		}
	}

	/* ======================================================================
	   6. ЗАПУСК
	   ====================================================================== */

	document.addEventListener('DOMContentLoaded', function () {
		initCatalog();
		initCart();
		initPrintButton();
		printCurrentYear();
	});
})();

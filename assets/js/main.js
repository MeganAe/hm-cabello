(function () {
  const CART_KEY = "hmCabelloCartItems";
  const PROFILE_KEY = "hmCabelloProfile";
  const WHATSAPP_NUMBER = "243977565432"; // Standard Bukavu WhatsApp contact format

  const state = {
    cart: loadCart(),
    profile: loadProfile(),
    activeProduct: null,
  };

  // --- Profile Helpers ---
  function loadProfile() {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveProfile(profile) {
    state.profile = profile;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  // --- Cart Helpers ---
  function loadCart() {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    updateCartCount();
  }

  function cartCount() {
    return state.cart.reduce((total, item) => total + item.qty, 0);
  }

  function formatMoney(value) {
    return `${Number(value).toFixed(0)} $`;
  }

  function updateCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = String(cartCount());
    });
  }

  // --- DOM Injector for Modals/Drawers ---
  function ensureUi() {
    if (document.querySelector("[data-hm-ui]")) return;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="hm-overlay" data-hm-ui data-ui-overlay></div>

      <!-- Search Modal -->
      <div class="hm-modal rounded-xl" data-ui-search aria-hidden="true">
        <div class="p-8 md:p-10">
          <div class="flex items-center justify-between gap-6 mb-8">
            <h2 class="font-headline-md text-headline-md text-primary">Recherche</h2>
            <button class="text-primary" type="button" data-close-ui aria-label="Fermer"><span class="material-symbols-outlined">close</span></button>
          </div>
          <form class="flex gap-3" data-search-form>
            <input class="w-full bg-transparent border-b border-outline-variant py-4 font-body-md text-on-surface focus:border-primary focus:ring-0 outline-none placeholder:text-on-surface-variant/50" name="search" placeholder="Nom, texture, catégorie..." type="search" required />
            <button class="bg-primary text-white px-6 py-3 rounded-lg font-label-lg text-label-lg" type="submit">RECHERCHER</button>
          </form>
        </div>
      </div>

      <!-- Account / Profile Modal -->
      <div class="hm-modal rounded-xl" data-ui-account aria-hidden="true">
        <div class="p-8 md:p-10" data-account-content>
          <!-- Injected dynamically based on state.profile -->
        </div>
      </div>

      <!-- Quick View Modal -->
      <div class="hm-modal rounded-xl" data-ui-product aria-hidden="true">
        <div class="p-6 md:p-8" data-product-content></div>
      </div>

      <!-- Cart Drawer -->
      <aside class="hm-drawer" data-ui-cart aria-hidden="true">
        <div class="p-6 md:p-8 min-h-full flex flex-col">
          <div class="flex items-center justify-between gap-6 mb-8">
            <h2 class="font-headline-md text-headline-md text-primary">Panier</h2>
            <button class="text-primary" type="button" data-close-ui aria-label="Fermer"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="space-y-5 flex-1 overflow-y-auto max-h-[60vh] no-scrollbar" data-cart-items></div>
          <div class="border-t border-outline-variant/60 pt-6 mt-auto">
            <div class="flex items-center justify-between font-label-lg text-label-lg text-primary mb-6">
              <span>Total</span>
              <span data-cart-total>0 FC</span>
            </div>
            <a class="block text-center bg-primary text-white px-8 py-4 rounded-lg font-label-lg text-label-lg tracking-widest uppercase hover:opacity-90 transition-all duration-300" href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener" data-cart-whatsapp>COMMANDER VIA WHATSAPP</a>
          </div>
        </div>
      </aside>

      <div class="hm-toast rounded-lg" data-ui-toast></div>
    `,
    );

    document
      .querySelectorAll("[data-close-ui], [data-ui-overlay]")
      .forEach((button) => {
        button.addEventListener("click", closeUi);
      });

    document
      .querySelector("[data-search-form]")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get("search").trim();
        if (query) {
          window.location.href = `boutique.html?search=${encodeURIComponent(query)}`;
        }
      });

    renderProfileModal();
  }

  function showToast(message) {
    ensureUi();
    const toast = document.querySelector("[data-ui-toast]");
    toast.textContent = message;
    toast.classList.add("is-open");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-open");
    }, 2600);
  }

  function closeUi() {
    document.querySelector("[data-ui-overlay]")?.classList.remove("is-open");
    document.querySelectorAll(".hm-modal, .hm-drawer").forEach((panel) => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    });
  }

  function openPanel(selector) {
    ensureUi();
    closeUi();
    document.querySelector("[data-ui-overlay]").classList.add("is-open");
    const panel = document.querySelector(selector);
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
  }

  // --- Profile Render ---
  function renderProfileModal() {
    const container = document.querySelector("[data-account-content]");
    if (!container) return;

    if (state.profile) {
      container.innerHTML = `
        <div class="flex items-center justify-between gap-6 mb-8">
          <h2 class="font-headline-md text-headline-md text-primary">Mon Compte</h2>
          <button class="text-primary" type="button" data-close-ui aria-label="Fermer"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="space-y-6">
          <div class="bg-surface-container-low p-6 rounded-lg border border-outline-variant/30">
            <h3 class="font-label-lg text-primary uppercase mb-4">Informations de Livraison</h3>
            <p class="font-body-md text-on-surface mb-2"><strong class="text-primary">Nom :</strong> ${state.profile.name}</p>
            <p class="font-body-md text-on-surface mb-2"><strong class="text-primary">Téléphone :</strong> ${state.profile.phone}</p>
            <p class="font-body-md text-on-surface"><strong class="text-primary">Adresse :</strong> ${state.profile.address}</p>
          </div>
          <p class="font-body-md text-on-surface-variant text-sm">Ces informations seront ajoutées à votre message WhatsApp lors de la commande pour accélérer la livraison à Bukavu.</p>
          <div class="flex gap-4 pt-4">
            <button class="bg-primary text-white px-8 py-3 rounded-lg font-label-lg text-label-lg hover:opacity-90" type="button" data-edit-profile>MODIFIER LES INFOS</button>
            <button class="border border-outline text-on-surface-variant px-8 py-3 rounded-lg font-label-lg text-label-lg hover:border-primary hover:text-primary" type="button" data-delete-profile>EFFACER</button>
          </div>
        </div>
      `;
      container
        .querySelector("[data-close-ui]")
        .addEventListener("click", closeUi);
      container
        .querySelector("[data-edit-profile]")
        .addEventListener("click", () => {
          renderProfileForm(state.profile);
        });
      container
        .querySelector("[data-delete-profile]")
        .addEventListener("click", () => {
          saveProfile(null);
          renderProfileModal();
          showToast("Informations de compte supprimées.");
        });
    } else {
      renderProfileForm(null);
    }
  }

  function renderProfileForm(profile) {
    const container = document.querySelector("[data-account-content]");
    if (!container) return;

    container.innerHTML = `
      <div class="flex items-center justify-between gap-6 mb-8">
        <h2 class="font-headline-md text-headline-md text-primary">Informations de livraison</h2>
        <button class="text-primary" type="button" data-close-ui aria-label="Fermer"><span class="material-symbols-outlined">close</span></button>
      </div>
      <p class="font-body-md text-on-surface-variant mb-6 text-sm">Configurez votre adresse de livraison à Bukavu pour commander facilement via WhatsApp.</p>
      <form class="space-y-6" data-profile-form>
        <div>
          <input class="w-full bg-transparent border-b border-outline-variant py-3 font-body-md text-on-surface focus:border-primary focus:ring-0 outline-none placeholder:text-on-surface-variant/50" name="name" placeholder="Nom complet" type="text" value="${profile ? profile.name : ""}" required />
        </div>
        <div>
          <input class="w-full bg-transparent border-b border-outline-variant py-3 font-body-md text-on-surface focus:border-primary focus:ring-0 outline-none placeholder:text-on-surface-variant/50" name="phone" placeholder="Numéro de téléphone (ex: +243...)" type="tel" value="${profile ? profile.phone : ""}" required />
        </div>
        <div>
          <input class="w-full bg-transparent border-b border-outline-variant py-3 font-body-md text-on-surface focus:border-primary focus:ring-0 outline-none placeholder:text-on-surface-variant/50" name="address" placeholder="Adresse complète à Bukavu (ex: Place Mulamba, RDC)" type="text" value="${profile ? profile.address : ""}" required />
        </div>
        <div class="flex gap-4 pt-4">
          <button class="bg-primary text-white px-8 py-3 rounded-lg font-label-lg text-label-lg hover:opacity-90" type="submit">ENREGISTRER</button>
          ${profile ? `<button class="border border-outline text-on-surface-variant px-8 py-3 rounded-lg font-label-lg text-label-lg" type="button" data-cancel-edit>ANNULER</button>` : ""}
        </div>
      </form>
    `;
    container
      .querySelector("[data-close-ui]")
      .addEventListener("click", closeUi);
    if (profile) {
      container
        .querySelector("[data-cancel-edit]")
        .addEventListener("click", () => {
          renderProfileModal();
        });
    }

    container
      .querySelector("[data-profile-form]")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const newProfile = {
          name: data.get("name").trim(),
          phone: data.get("phone").trim(),
          address: data.get("address").trim(),
        };
        saveProfile(newProfile);
        renderProfileModal();
        renderCart(); // Refresh WhatsApp link with new profile data
        showToast("Coordonnées de livraison enregistrées !");
      });
  }

  // --- Cart Actions ---
  function addToCart(product) {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }
    saveCart();
    renderCart();
    showToast(`${product.title} ajouté au panier.`);
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter((item) => item.id !== id);
    saveCart();
    renderCart();
  }

  function changeQuantity(id, delta) {
    const item = state.cart.find((entry) => entry.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
      renderCart();
    }
  }

  function orderMessage() {
    let clientStr = "";
    if (state.profile) {
      clientStr = `*Client :* ${state.profile.name}\n*Téléphone :* ${state.profile.phone}\n*Adresse :* ${state.profile.address}\n\n`;
    } else {
      clientStr = "*(Coordonnées de livraison non configurées)*\n\n";
    }

    if (!state.cart.length) {
      return "Bonjour HM CABELLO, je souhaite passer une commande.";
    }

    const lines = state.cart.map((item) => {
      return `- *${item.title}* x${item.qty} (${formatMoney(item.price * item.qty)})`;
    });

    const total = state.cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    return `Bonjour HM CABELLO, je souhaite passer une commande :\n\n${clientStr}*Articles :*\n${lines.join("\n")}\n\n*Total :* ${formatMoney(total)}\n\nMerci de me recontacter pour confirmer la livraison.`;
  }

  function renderCart() {
    ensureUi();
    const list = document.querySelector("[data-cart-items]");
    const totalNode = document.querySelector("[data-cart-total]");
    const whatsapp = document.querySelector("[data-cart-whatsapp]");
    const total = state.cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    if (!state.cart.length) {
      list.innerHTML =
        '<p class="font-body-md text-body-md text-on-surface-variant text-center py-8">Votre panier est vide.</p>';
    } else {
      list.innerHTML = state.cart
        .map(
          (item) => `
          <div class="flex gap-4 border-b border-outline-variant/30 pb-5">
            <img class="w-16 h-20 object-cover bg-surface-container rounded" src="${item.image}" alt="${item.title}" />
            <div class="flex-1">
              <h3 class="font-headline-md text-[16px] leading-tight text-on-surface">${item.title}</h3>
              <p class="font-label-lg text-label-lg text-primary mt-1 font-bold">${formatMoney(item.price)}</p>
              <div class="flex items-center gap-3 mt-3">
                <button class="w-8 h-8 border border-outline-variant text-primary rounded flex items-center justify-center hover:bg-primary/5" type="button" data-cart-minus="${item.id}">-</button>
                <span class="font-body-md text-on-surface font-semibold">${item.qty}</span>
                <button class="w-8 h-8 border border-outline-variant text-primary rounded flex items-center justify-center hover:bg-primary/5" type="button" data-cart-plus="${item.id}">+</button>
                <button class="ml-auto font-label-sm text-label-sm text-on-surface-variant hover:text-primary" type="button" data-cart-remove="${item.id}">RETIRER</button>
              </div>
            </div>
          </div>
        `,
        )
        .join("");
    }

    totalNode.textContent = formatMoney(total);
    whatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage())}`;

    list.querySelectorAll("[data-cart-minus]").forEach((button) => {
      button.addEventListener("click", () => {
        changeQuantity(button.dataset.cartMinus, -1);
      });
    });
    list.querySelectorAll("[data-cart-plus]").forEach((button) => {
      button.addEventListener("click", () => {
        changeQuantity(button.dataset.cartPlus, 1);
      });
    });
    list.querySelectorAll("[data-cart-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        removeFromCart(button.dataset.cartRemove);
      });
    });
  }

  // --- Quick View Modal ---
  function openQuickView(product) {
    state.activeProduct = product;
    ensureUi();

    let detailsStr = "";
    if (product.length || product.texture || product.density) {
      detailsStr = `
        <div class="flex flex-wrap gap-2 mb-6">
          ${product.length ? `<span class="bg-surface-container-high px-3 py-1 rounded text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">${product.length} POUCES</span>` : ""}
          ${product.texture ? `<span class="bg-surface-container-high px-3 py-1 rounded text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">${product.texture}</span>` : ""}
          ${product.density ? `<span class="bg-surface-container-high px-3 py-1 rounded text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">${product.density} DENSITÉ</span>` : ""}
        </div>
      `;
    }

    document.querySelector("[data-product-content]").innerHTML = `
      <div class="flex items-center justify-between gap-6 mb-6">
        <h2 class="font-headline-md text-headline-md text-primary">Aperçu rapide</h2>
        <button class="text-primary" type="button" data-close-ui aria-label="Fermer"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
        <img class="w-full aspect-[3/4] object-cover bg-surface-container rounded-xl shadow-lg" src="${product.image}" alt="${product.title}" />
        <div>
          <h3 class="font-headline-md text-headline-md text-on-surface mb-3">${product.title}</h3>
          <p class="font-label-lg text-headline-md text-primary font-bold mb-4">${formatMoney(product.price)}</p>
          ${detailsStr}
          <p class="font-body-md text-on-surface-variant mb-8 leading-relaxed">${product.description || "Un produit authentique HM CABELLO sélectionné avec le plus grand soin."}</p>
          <button class="w-full bg-primary text-white px-8 py-4 rounded-lg font-label-lg text-label-lg hover:opacity-90 transition-all uppercase tracking-widest" type="button" data-add-active-product>AJOUTER AU PANIER</button>
        </div>
      </div>
    `;

    document
      .querySelector("[data-product-content] [data-close-ui]")
      .addEventListener("click", closeUi);
    document
      .querySelector("[data-add-active-product]")
      .addEventListener("click", () => {
        addToCart(state.activeProduct);
        closeUi();
      });

    openPanel("[data-ui-product]");
  }

  // --- Dynamic Grid Renderer ---
  function renderProductsGrid(container, productsList) {
    if (!container) return;

    if (!productsList.length) {
      container.innerHTML = `
        <div class="col-span-full text-center py-20">
          <span class="material-symbols-outlined text-outline text-5xl mb-4">search_off</span>
          <p class="font-headline-md text-primary mb-2">Aucun produit trouvé</p>
          <p class="font-body-md text-on-surface-variant">Essayez de modifier vos filtres ou termes de recherche.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = productsList
      .map(
        (product) => `
      <div class="group flex flex-col product-card p-4 bg-white/40 border border-outline-variant/10 rounded-2xl transition-all duration-300 hover:shadow-lg hover:bg-white" data-id="${product.id}">
        <div class="relative overflow-hidden aspect-[3/4] mb-4 bg-surface-container-low rounded-xl">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${product.image}" alt="${product.title}" />
          ${product.tag ? `<div class="absolute top-4 left-4 bg-primary text-white font-label-sm text-[10px] px-3 py-1 rounded-full tracking-widest uppercase">${product.tag}</div>` : ""}
          <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
            <button class="w-full py-3 bg-white text-primary font-label-lg text-label-lg shadow-xl translate-y-10 group-hover:translate-y-0 transition-transform duration-500 rounded-lg uppercase tracking-wider" type="button" data-action="quick-view">Aperçu rapide</button>
          </div>
        </div>
        <div class="px-1 flex-grow flex flex-col justify-between">
          <div>
            <h3 class="font-headline-md text-[18px] leading-snug text-on-surface mb-2 line-clamp-1">${product.title}</h3>
            <div class="flex justify-between items-center mb-4">
              <span class="font-label-lg text-label-lg text-primary font-bold">${formatMoney(product.price)}</span>
              ${product.length ? `<span class="font-label-sm text-label-sm text-secondary uppercase tracking-widest">${product.length}" Pouces</span>` : ""}
            </div>
          </div>
          <button class="w-full bg-primary text-white font-label-lg py-3 rounded-lg hover:bg-primary-container transition-colors uppercase tracking-widest text-[12px]" type="button" data-action="add-to-cart">Ajouter au panier</button>
        </div>
      </div>
    `,
      )
      .join("");

    // Bind action events
    container.querySelectorAll(".product-card").forEach((card) => {
      const pid = card.dataset.id;
      const product = productsList.find((p) => p.id === pid);
      if (!product) return;

      card
        .querySelector('[data-action="quick-view"]')
        ?.addEventListener("click", () => {
          openQuickView(product);
        });
      card
        .querySelector('[data-action="add-to-cart"]')
        ?.addEventListener("click", () => {
          addToCart(product);
        });
    });
  }

  // --- Dynamic Pages Inits ---

  // 1. Homepage (index.html)
  function initHomepage() {
    const path = window.location.pathname;
    const isHomepage =
      path.includes("index.html") || path.endsWith("/") || path === "";
    if (!isHomepage) return;
    const featuredContainer = document.querySelector("[data-products-grid]");
    if (!featuredContainer) return;

    // Show 8 products: Best Sellers, Nouveaux and Bijoux
    const featured = PRODUCTS.filter(
      (p) =>
        p.tag === "Best Seller" || p.tag === "Nouveau" || p.tag === "Bijoux",
    ).slice(0, 8);
    renderProductsGrid(featuredContainer, featured);
  }

  // 2. Perruques Page (perruques.html)
  function initPerruquesPage() {
    if (!window.location.pathname.includes("perruques.html")) return;
    const grid = document.querySelector("[data-products-grid]");
    if (!grid) return;

    const filterButtons = document.querySelectorAll("[data-filter-bar] button");
    let activeFilter = "TOUT VOIR";

    function filterWigs() {
      let filtered = PRODUCTS.filter((p) => p.category === "perruque");
      if (activeFilter !== "TOUT VOIR") {
        const key = activeFilter.toLowerCase();
        filtered = filtered.filter((p) => {
          if (key.includes("lace front")) return p.subCategory === "Lace Front";
          if (key.includes("full lace")) return p.subCategory === "Full Lace";
          if (key.includes("360")) return p.subCategory === "360 Wigs";
          if (key.includes("glueless")) return p.subCategory === "Glueless";
          return true;
        });
      }
      renderProductsGrid(grid, filtered);
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => {
          b.classList.remove("text-primary", "border-b-2", "border-primary");
          b.classList.add("text-on-surface-variant");
        });
        btn.classList.remove("text-on-surface-variant");
        btn.classList.add("text-primary", "border-b-2", "border-primary");

        activeFilter = btn.textContent.trim();
        filterWigs();
      });
    });

    filterWigs(); // Initial render
  }

  // 3. Tissages Page (tissages.html)
  function initTissagesPage() {
    if (!window.location.pathname.includes("tissages.html")) return;
    const grid = document.querySelector("[data-products-grid]");
    if (!grid) return;

    // Render all tissages (Lace & finitions section)
    const tissages = PRODUCTS.filter((p) => p.category === "tissage");
    renderProductsGrid(grid, tissages);
  }

  // 4. Exposition Page (exposition.html) — Lookbook sans prix
  function initExpositionPage() {
    if (!window.location.pathname.includes("exposition.html")) return;
    const gallery = document.querySelector("[data-expo-gallery]");
    if (!gallery) return;

    const items =
      typeof EXPOSITION_ITEMS !== "undefined" ? EXPOSITION_ITEMS : [];
    let currentFilter = "all";
    let activeIndex = 0;
    let filteredItems = [...items];

    const filterButtons = document.querySelectorAll(
      "[data-expo-filters] button",
    );
    const countDisplay = document.querySelector("[data-expo-count]");

    // Lightbox elements
    const lightbox = document.getElementById("expoLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxCategory = document.getElementById("lightboxCategory");
    const lightboxIndex = document.getElementById("lightboxIndex");
    const closeBtn = document.getElementById("closeLightbox");
    const prevBtn = document.getElementById("prevLightbox");
    const nextBtn = document.getElementById("nextLightbox");

    function renderGallery() {
      filteredItems = items.filter((item) => {
        if (currentFilter === "all") return true;
        return item.category === currentFilter;
      });

      if (countDisplay) {
        countDisplay.textContent = `${filteredItems.length} créations d'exposition`;
      }

      gallery.innerHTML = filteredItems
        .map(
          (item, idx) => `
        <div class="gallery-item group relative overflow-hidden rounded-xl bg-surface-container-high/40 border border-outline-variant/30 cursor-pointer transition-all duration-300 hover:shadow-xl" data-index="${idx}">
          <div class="relative overflow-hidden bg-black/5">
            <img
              src="${item.image}"
              alt="${item.title}"
              loading="lazy"
              class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div class="gallery-overlay absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
              <span class="inline-block self-start font-label-sm text-[10px] uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2.5 py-1 rounded mb-2 font-semibold">
                ${item.badge}
              </span>
              <h3 class="font-headline-md text-base md:text-lg text-white mb-1.5 leading-snug">
                ${item.title}
              </h3>
              <p class="font-body-md text-xs text-white/80 line-clamp-2 mb-3">
                ${item.description}
              </p>
              <div class="flex items-center gap-2 text-xs font-label-sm text-secondary-fixed">
                <span class="material-symbols-outlined text-[16px]">zoom_in</span>
                <span>Cliquer pour agrandir</span>
              </div>
            </div>
          </div>
        </div>
      `,
        )
        .join("");

      gallery.querySelectorAll(".gallery-item").forEach((card) => {
        card.addEventListener("click", () => {
          const idx = parseInt(card.dataset.index, 10);
          openLightbox(idx);
        });
      });
    }

    function openLightbox(index) {
      if (!lightbox || !filteredItems[index]) return;
      activeIndex = index;
      const item = filteredItems[activeIndex];

      lightboxImg.src = item.image;
      lightboxImg.alt = item.title;
      lightboxTitle.textContent = item.title;
      lightboxCategory.textContent = `${item.badge} — ${item.description}`;
      lightboxIndex.textContent = `${activeIndex + 1} / ${filteredItems.length}`;

      lightbox.classList.add("is-active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    function showPrev() {
      if (filteredItems.length === 0) return;
      activeIndex =
        (activeIndex - 1 + filteredItems.length) % filteredItems.length;
      openLightbox(activeIndex);
    }

    function showNext() {
      if (filteredItems.length === 0) return;
      activeIndex = (activeIndex + 1) % filteredItems.length;
      openLightbox(activeIndex);
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => {
          b.classList.remove("text-primary", "border-b-2", "border-primary");
          b.classList.add("text-on-surface-variant");
        });
        btn.classList.remove("text-on-surface-variant");
        btn.classList.add("text-primary", "border-b-2", "border-primary");

        currentFilter = btn.dataset.filter || "all";
        renderGallery();
      });
    });

    closeBtn?.addEventListener("click", closeLightbox);
    prevBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      showPrev();
    });
    nextBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      showNext();
    });

    lightbox?.addEventListener("click", (e) => {
      if (
        e.target === lightbox ||
        e.target.classList.contains("lightbox-modal")
      ) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox?.classList.contains("is-active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });

    renderGallery(); // Initial render
  }

  // 5. Bijoux Page (bijoux.html)
  function initBijouxPage() {
    const grid = document.querySelector("[data-bijoux-grid]");
    if (!grid || !window.location.pathname.includes("bijoux.html")) return;

    const filterButtons = document.querySelectorAll(
      "[data-bijoux-filter] button",
    );
    let activeFilter = "TOUT";

    function filterJewelry() {
      let filtered = PRODUCTS.filter((p) => p.category === "bijoux");
      if (activeFilter !== "TOUT") {
        const key = activeFilter.toLowerCase();
        filtered = filtered.filter((p) =>
          p.subCategory.toLowerCase().includes(key.slice(0, 4)),
        );
      }
      renderProductsGrid(grid, filtered);
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => {
          b.classList.remove("text-primary", "border-b-2", "border-primary");
          b.classList.add("text-on-surface-variant");
        });
        btn.classList.remove("text-on-surface-variant");
        btn.classList.add("text-primary", "border-b-2", "border-primary");

        activeFilter = btn.textContent.trim();
        filterJewelry();
      });
    });

    filterJewelry();
  }

  // 6. Boutique Catalog (boutique.html)
  function initBoutiqueCatalog() {
    if (!window.location.pathname.includes("boutique.html")) return;
    const grid = document.querySelector("[data-products-grid]");
    if (!grid) return;

    // Filters refs
    const categoryCheckboxes = document.querySelectorAll(
      "aside input[type='checkbox']",
    );
    const textureRadios = document.querySelectorAll(
      "aside input[type='radio']",
    );
    const lengthButtons = document.querySelectorAll(
      "[data-length-filters] button",
    );
    const priceRange = document.querySelector("[data-price-range]");
    const priceDisplay = document.querySelector("[data-price-display]");
    const sortSelect = document.querySelector("[data-sort-select]");
    const countText = document.querySelector("[data-catalog-count]");
    const applyFiltersButton = document.querySelector("[data-apply-filters]");

    // Mobile Filter Content refs
    const filterToggle = document.querySelector("[data-filter-toggle]");
    const filterContent = document.querySelector("[data-filter-content]");

    if (filterToggle && filterContent) {
      filterToggle.addEventListener("click", () => {
        const isCollapsed = filterContent.classList.toggle("hidden");
        filterToggle.querySelector("span:last-child").textContent = isCollapsed
          ? "FILTRER & TRIER"
          : "MASQUER LES FILTRES";
      });
    }

    let selectedCategories = [];
    let selectedTexture = "";
    let selectedLengthGroup = "";
    let maxPrice = 300;
    let searchQuery =
      new URLSearchParams(window.location.search)
        .get("search")
        ?.toLowerCase() || "";

    // Sync search input if searched
    if (searchQuery) {
      showToast(`Résultats de recherche pour "${searchQuery}"`);
    }

    // Length logic
    lengthButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        lengthButtons.forEach((b) => {
          b.classList.remove(
            "border-primary",
            "text-primary",
            "bg-surface-container",
          );
          b.classList.add("border-outline-variant", "text-on-surface-variant");
        });

        const txt = btn.textContent.trim();
        if (selectedLengthGroup === txt) {
          selectedLengthGroup = ""; // toggle off
        } else {
          selectedLengthGroup = txt;
          btn.classList.remove(
            "border-outline-variant",
            "text-on-surface-variant",
          );
          btn.classList.add(
            "border-primary",
            "text-primary",
            "bg-surface-container",
          );
        }
        applyAllFilters();
      });
    });

    if (priceRange) {
      priceRange.addEventListener("input", (e) => {
        maxPrice = Number(e.target.value);
        if (priceDisplay) {
          priceDisplay.textContent = `${formatMoney(maxPrice)}`;
        }
        applyAllFilters();
      });
    }

    categoryCheckboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        selectedCategories = [];
        categoryCheckboxes.forEach((input) => {
          if (input.checked) {
            const label = input
              .closest("label")
              .textContent.trim()
              .toLowerCase();
            selectedCategories.push(label);
          }
        });
        applyAllFilters();
      });
    });

    textureRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        selectedTexture = "";
        textureRadios.forEach((input) => {
          if (input.checked) {
            selectedTexture = input
              .closest("label")
              .textContent.trim()
              .toLowerCase();
          }
        });
        applyAllFilters();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        applyAllFilters();
      });
    }

    if (applyFiltersButton) {
      applyFiltersButton.addEventListener("click", () => {
        applyAllFilters();
        if (window.innerWidth < 768 && filterContent) {
          // Collapse on mobile after applying
          filterContent.classList.add("hidden");
          filterToggle.querySelector("span:last-child").textContent =
            "FILTRER & TRIER";
        }
      });
    }

    function lengthMatches(productLength) {
      if (!selectedLengthGroup) return true;
      if (!productLength) return false; // for items without length (jewelry)
      if (selectedLengthGroup.includes("12-16"))
        return productLength >= 12 && productLength <= 16;
      if (selectedLengthGroup.includes("18-22"))
        return productLength >= 18 && productLength <= 22;
      if (selectedLengthGroup.includes("24-28"))
        return productLength >= 24 && productLength <= 28;
      if (selectedLengthGroup.includes("30")) return productLength >= 30;
      return true;
    }

    function categoryMatches(product) {
      if (!selectedCategories.length) return true;
      return selectedCategories.some((catLabel) => {
        if (catLabel.includes("perruque"))
          return product.category === "perruque";
        if (catLabel.includes("tissage")) return product.category === "tissage";
        if (catLabel.includes("clip")) return product.category === "clip";
        if (catLabel.includes("bijou")) return product.category === "bijoux";
        if (catLabel.includes("lace"))
          return (
            product.title.toLowerCase().includes("lace") ||
            product.description.toLowerCase().includes("lace")
          );
        return false;
      });
    }

    function applyAllFilters() {
      let filtered = PRODUCTS.filter((product) => {
        // Category Filter
        const catOk = categoryMatches(product);
        // Length Filter
        const lenOk = lengthMatches(product.length);
        // Texture Filter
        const textOk =
          !selectedTexture ||
          (product.texture &&
            product.texture.toLowerCase().includes(selectedTexture));
        // Price Filter
        const priceOk = product.price <= maxPrice;
        // Search Filter
        const searchStr =
          `${product.title} ${product.description} ${product.category}`.toLowerCase();
        const searchOk = !searchQuery || searchStr.includes(searchQuery);

        return catOk && lenOk && textOk && priceOk && searchOk;
      });

      // Sorting — use selectedIndex: 0=Récents, 1=Prix↑, 2=Prix↓, 3=Populaires
      const sortIdx = sortSelect ? sortSelect.selectedIndex : 0;
      if (sortIdx === 1) {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortIdx === 2) {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortIdx === 3) {
        filtered.sort(
          (a, b) =>
            (b.tag === "Best Seller" ? 1 : 0) -
            (a.tag === "Best Seller" ? 1 : 0),
        );
      }

      // Render the catalog grid
      renderProductsGrid(grid, filtered);

      if (countText) {
        countText.textContent = `Affichage de ${filtered.length} produits`;
      }
    }

    applyAllFilters(); // Initial render
  }

  // --- Mobile Menu Toggle ---
  function setupMobileMenu() {
    document.querySelectorAll("[data-mobile-toggle]").forEach((button) => {
      const header = button.closest("header");
      const panel = header?.querySelector("[data-mobile-panel]");
      const icon = button.querySelector("[data-mobile-icon]");
      if (!panel || !icon) return;

      button.addEventListener("click", () => {
        const isOpen = panel.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
        icon.textContent = isOpen ? "close" : "menu";
      });

      panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          panel.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");
          icon.textContent = "menu";
        });
      });
    });
  }

  // --- Header Panel Actions ---
  function setupHeaderActions() {
    updateCartCount();
    renderCart();

    document.querySelectorAll('[data-action="search"]').forEach((button) => {
      button.addEventListener("click", () => {
        openPanel("[data-ui-search]");
      });
    });

    document.querySelectorAll('[data-action="account"]').forEach((button) => {
      button.addEventListener("click", () => {
        renderProfileModal();
        openPanel("[data-ui-account]");
      });
    });

    document.querySelectorAll('[data-action="cart"]').forEach((button) => {
      button.addEventListener("click", () => {
        renderCart();
        openPanel("[data-ui-cart]");
      });
    });
  }

  // --- Contact page WhatsApp Form Integration ---
  function setupContactForm() {
    document.querySelectorAll("form").forEach((form) => {
      if (form.hasAttribute("data-search-form")) return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = data.get("name") || "";
        const email = data.get("email") || "";
        const subject = data.get("subject") || "";
        const message = data.get("message") || "";
        const text = `Bonjour HM CABELLO,\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`;

        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener",
        );
        showToast("Votre message est prêt dans WhatsApp.");
      });
    });
  }

  // --- Global Initializations ---
  document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();
    setupHeaderActions();
    setupContactForm();

    // Init page-specific behaviors
    initHomepage();
    initPerruquesPage();
    initTissagesPage();
    initExpositionPage();
    initBijouxPage();
    initBoutiqueCatalog();

    // Smooth fade scroll intersections — only for sections that start below viewport
    const observerOptions = { threshold: 0.08 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-8");
          observer.unobserve(entry.target); // stop watching once revealed
        }
      });
    }, observerOptions);

    document.querySelectorAll("section").forEach((section) => {
      // Skip sections that are already in the viewport or contain the product grid
      const rect = section.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      const hasProductGrid = section.querySelector(
        "[data-products-grid], [data-bijoux-grid]",
      );
      if (isInView || hasProductGrid) return;

      section.classList.add(
        "transition-all",
        "duration-700",
        "opacity-0",
        "translate-y-8",
      );
      observer.observe(section);
    });
  });
})();

import { component } from "picoapp";
import { Liquid } from "liquidjs";
import _ from "lodash";
import { moneyFiltersPlugin } from "../modules/filterliquid";
import { fetchCart, updateDrawerLineItem } from "../utils/cartFunctions";
import debounce from "../utils/debounce";
import setToLocalStorage from "../components/setToLocaleStorage";
import beforeCheckout from "../components/upsellPage";
import { giveSpinner, removeSpinner } from "../utils/spinner";
const engine = new Liquid();
engine.plugin(moneyFiltersPlugin);

export default component((node, ctx) => {
  const { id } = node.dataset;
  const triggers = [
    ...document.querySelectorAll(`[href="/cart"]`),
    ...document.querySelectorAll("[data-floating-cart]"),
    ...document.querySelectorAll("[data-add-cart]"),
    ...document.querySelectorAll("[data-cart-count]"),
  ];
  const closeBtns = node.querySelectorAll("[data-drawer-close]");
  const secondDrawer = node.querySelector("[data-drawer-items]");
  const closeSecondDrawer = node.querySelector("[data-drawer-second-close]");
  const dataSubmitCart = node.querySelector("[data-submit-cart]");
  const content_items = node.querySelector("[data-drawer-items-scroll]");
  const subtotal_el = node.querySelector("[data-original-total-price]");
  const shipping_el = node.querySelector("[data-original-total-shipping]");
  const grand_total_el = node.querySelector(
    "[data-original-total-grand-total]"
  );
  const crateBagBtns = document.querySelectorAll("[date-create-bag]");

  let cart_data = {};

  const container = node;
  const config = {
    id: id,
    close: ".drawer-close",
    openClass: "drawer-open",
    closingClass: "drawer-closing",
    activeDrawer: "drawer-is-open",
  };

  ctx.on("drawer:show", (state) => {
    document
      .querySelector("[data-drawer-cart--upsell]")
      .setAttribute("opened", false);
    document.querySelector(".drawer-cart-inner").setAttribute("hide", false);

    setTimeout(() => {
      let hh =
        document.querySelector(".drawer_footer_shopAdjust").clientHeight + 120;
      // console.log(hh)
      document.querySelector(
        ".drawer_content_shopAdjust"
      ).style.minHeight = `calc(100% - ${hh}px)`;
    }, 500);
  });

  ctx.on("drawer:upsell", (state) => {
    document
      .querySelector("[data-drawer-cart--upsell]")
      .setAttribute("opened", true);
    document.querySelector(".drawer-cart-inner").setAttribute("hide", true);

    let hh =
      document.querySelector(".drawer_footer_shopAdjust---upsell")
        .clientHeight + 120;
    document.querySelector(
      ".sa-upsell-wrapper"
    ).style.minHeight = `calc(100% - ${hh}px)`;
    document.querySelector(
      ".sa-cross_sell-wrapper"
    ).style.minHeight = `calc(100% - ${hh}px)`;
  });

  ctx.on("drawer:back", ({ step }) => {
    let button_back = document.querySelector("[data-drawer-back]");
    if (Number(step) == 1) {
      open();
      button_back.setAttribute("data-step", 0);
    } else if (Number(step) == 2) {
      const found = cart_data.items.find((cart) => {
        if (
          cart.properties?.hasOwnProperty("ID") &&
          cart.properties?.hasOwnProperty("Name")
        ) {
          return cart;
        }

        return false;
      });
      let has_pkg =
        document.querySelectorAll(".sa-upsell-item") &&
        document.querySelectorAll(".sa-upsell-item").length
          ? true
          : false;
      if (found && has_pkg) {
        document
          .querySelector("[data-drawer-upsell]")
          .querySelector(".btn-text").innerHTML = "videre";
        document
          .querySelector(".sa-upsell-offer")
          .setAttribute("opened", "true");
        document
          .querySelector(".sa-upsell-offer__detail")
          .setAttribute("opened", "false");
        button_back.setAttribute("data-step", 1);

        let hh =
          document.querySelector(".drawer_footer_shopAdjust---upsell")
            .clientHeight + 120;
        document.querySelector(
          ".sa-upsell-wrapper"
        ).style.minHeight = `calc(100% - ${hh}px)`;
      } else {
        open();
      }
    } else {
      open();
    }
  });

  ctx.on("drawer:cart", (state) => {
    ctx.hydrate({ cart: cart_data, cartTotal: cart_data.total_price });
    const { cart } = ctx.getState();
    //console.log('carts', cart)
    //console.log('state', state)
  });

  ctx.on("drawer:updated", (state) => {
    ctx.emit("cart:updated", { cartTotal: cart_data.total_price });
    ctx.emit("drawer:cart");
    //console.log('refferer',document)
    //console.log('window',window)
    purchaseLimitHandler();
    let isFromCheckout = localStorage.getItem("checkout");
    ///console.log('is from checkout', isFromCheckout);
    localStorage.setItem("checkout", false);

    if (isFromCheckout == true || isFromCheckout == "true") {
      document.querySelectorAll("[data-submit-cart]").forEach((btn) => {
        btn.querySelector(".btn-text").innerHTML = "Gå til kurv";
      });

      document.querySelectorAll("[data-submit-cart]").forEach((btn) => {
        btn.querySelector(".btn-text").innerHTML = "Gå til kurv";
      });
    }
  });

  ctx.on("drawer:updateItems", (state) => {
    const { bag } = ctx.getState();

    if (bag) {
      let bag_id = bag.properties.ID;
      let bag_name = `${bag.properties.Name}`;
      let total = cart_data.items.map((list) => {
        if (
          list.properties?.hasOwnProperty("ID") &&
          list.properties.ID == bag.properties.ID
        ) {
          return list.final_line_price;
        }
        return 0;
      });

      total = _.sum(total) / 100;

      const bags = document.querySelectorAll("[data-restore-bag]");
      bags.forEach((b) => {
        b.dataset.id = bag_id;
      });

      engine
        .parseAndRender("{{total | money : cart.currency }}", {
          cart: cart_data,
          total: total,
          bag_name: bag_name,
        })
        .then((html) => {
          document.querySelector("[data-line-item-price]").innerHTML = html;
          document.querySelector("[data-bag-name]").innerHTML = bag_name;
        })
        .then(() => {
          ctx.emit("drawer:updated");
        });
    }
  });

  const purchaseLimitHandler = (e) => {
    const purchaseLimit = Number(theme.settings.purchaseLimit);
    const { cartTotal, cart } = ctx.getState();
    ctx.emit("cart:updated", { cartTotal, event: e });
    //check if cart includes any gift items

    const giftItems = cart.items.filter(
      (item) =>
        item.properties?.hasOwnProperty("_is_gift") &&
        item.properties._is_gift === "true"
    );

    if (purchaseLimit <= cartTotal || giftItems.length > 0) {
      dataSubmitCart.removeAttribute("disabled");
      node
        .querySelector("[ data-minimum-purchase-alert]")
        .classList.add("is--hidden");
    } else {
      dataSubmitCart.setAttribute("disabled", true);
      node
        .querySelector("[ data-minimum-purchase-alert]")
        .classList.remove("is--hidden");
    }

    let countDown = purchaseLimit - cartTotal;

    if (countDown > 0) {
      engine
        .parseAndRender(
          "<strong>{{countdown | divided_by: 100 | money : cart.currency | remove: ',00'}}</strong>",
          {
            cart: cart_data,
            countdown: countDown,
          }
        )
        .then((html) => {
          node.querySelector("[data-countdown-amount]").innerHTML = html;
        });

      node.querySelector("[data-countdown]").classList.remove("is--hidden");
    } else {
      node.querySelector("[data-countdown]").classList.add("is--hidden");
      let hh =
        document.querySelector(".drawer_footer_shopAdjust").clientHeight + 120;
      document.querySelector(
        ".drawer_content_shopAdjust"
      ).style.minHeight = `calc(100% - ${hh}px)`;
    }
  };

  const restoreBag = (bagId) => {
    let bag = [];
    let obj = {};
    // console.log(bagId)
    cart_data.items.forEach((list) => {
      if (
        list.properties?.hasOwnProperty("ID") &&
        list.properties.ID == bagId
      ) {
        const item = {
          bag_id: bagId,
          bagName: list.properties.Name,
          amount: list.properties.Amount,
          count: list.quantity,
          id: list.id,
          img: list.image,
          initPrice: list.price,
          initWeight: list.grams,
          price: Number(list.price * list.quantity),
          title: list.title,
          weight: Number(list.grams * list.quantity),
        };

        obj[list.key] = 0;
        bag.push(item);
      }
    });

    updateDrawerLineItem(obj, node).then((data) => {
      setToLocalStorage(null, bag);
      hideItems();
      close();
      /*
            const successModal = document.querySelector('[data-success-modal]')
            const namePromptModal = node.querySelector('[data-name-prompt]')
            namePromptModal.classList.remove('is--visible')
            successModal.classList.remove('is--visible')
            */

      closeModal();
      ctx.emit("cart:changed");
      location.href = "/collections/bland-selv-slik";
      /*
            if (location.pathname.includes('collections/bland-selv-slik') == false) {
                location.href = '/collections/bland-selv-slik'
            } 
            else {
                //clean();

                ctx.emit('products:refetch');
            }
            */
    });
  };

  const closeModal = () => {
    const successModal = document.querySelector("[data-success-modal]");
    if (successModal != null) successModal.classList.remove("is--visible");
    const namePromptInput = node.querySelector("[data-name-prompt-input]");
    const namePromptModal = document.querySelector("[data-name-prompt]");
    if (namePromptModal != null) {
      namePromptModal.classList.remove("is--visible");
    }

    if (namePromptInput != null) {
      namePromptModal.value = "";
    }

    const menuMobile = document.querySelector(".mobile-menu--open");
    if (menuMobile != null) menuMobile.classList.remove("mobile-menu--open");

    //data-sticky-total-btn
    const sticky = document.querySelector("[data-sticky-bar]");
    if (sticky != null) {
      sticky.classList.add("translate-y-full");
    }

    /*
        const list_items = document.querySelectorAll('[data-item-inner]');
        list_items.forEach(item => {
            if (item != null) item.classList.remove('is--selected')
        })

        const wrappers = document.querySelectorAll('[data-qty-wrapper]');
        wrappers.forEach(item => {
            if (item != null) item.classList.remove('is--visible')
        })
        */
    // ctx.emit('products:reload');

    // data-qty-wrapper
  };

  const createOverlay = () => {
    document.documentElement.classList.add("drawer_locked");
    if (document.querySelectorAll(".drawer_overlay").length == 0) {
      const elm = document.createElement("div");
      elm.classList.add("drawer_overlay");
      document.body.appendChild(elm);
    }
  };

  const removeOverlay = () => {
    document.documentElement.classList.remove("drawer_locked");
    document.querySelectorAll(".drawer_overlay").forEach((e) => e.remove());
  };

  const close = () => {
    hideItems();
    node.classList.remove("opened");
    removeOverlay();
  };

  const drawer_loader = (show, doc = content_items) => {
    if (doc.querySelector(".drawer_loading") == null && show) {
      const elm = document.createElement("div");
      elm.classList.add("drawer_loading");
      doc.prepend(elm);
    } else {
      doc.querySelectorAll(".drawer_loading").forEach((e) => e.remove());
    }
  };

  const re_init = async () => {
    const editBtns = document.querySelectorAll("[data-edit-cart-btn]");
    const deleteBtns = document.querySelectorAll("[data-remove-cart-btn]");

    const plusBtns = document.querySelectorAll("[data-cartItem-qty-plus]");
    const minusBtns = document.querySelectorAll("[data-cartItem-qty-minus]");

    if (plusBtns != null) {
      plusBtns.forEach((btn, idx) => {
        const itemId = btn.dataset.key;

        const objs = {};
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const currentQuantitys = document.querySelectorAll(
            "[data-cartItem-quantity]"
          );
          let currentQuantity = Number(
            currentQuantitys[idx].dataset.cartitemQuantity
          );
          objs[itemId] = currentQuantity + 1;

          currentQuantitys[idx].dataset.cartitemQuantity = objs[itemId];
          // console.log(currentQuantitys[idx].dataset)
        });

        btn.addEventListener(
          "click",
          debounce(function () {
            //drawer_loader(true, node.querySelector('.drawer-cart-inner'));
            updateDrawerLineItem(objs).then((data) => {
              render_cart();
            });
          }, 500)
        );
      });
    }

    if (minusBtns != null) {
      minusBtns.forEach((btn, idx) => {
        const itemId = btn.dataset.key;

        const objs = {};
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const currentQuantitys = document.querySelectorAll(
            "[data-cartItem-quantity]"
          );
          let currentQuantity = Number(
            currentQuantitys[idx].dataset.cartitemQuantity
          );
          objs[itemId] = currentQuantity - 1;
          if (objs[itemId] <= 0) {
            objs[itemId] = 0;
          }
          currentQuantitys[idx].dataset.cartitemQuantity = objs[itemId];
        });

        btn.addEventListener(
          "click",
          debounce(function () {
            updateDrawerLineItem(objs).then((data) => {
              render_cart();
            });
          }, 500)
        );
      });
    }

    if (editBtns != null) {
      editBtns.forEach((btn) => {
        const itemId = btn.dataset.id;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          showItems(itemId, node);
        });
      });
    }

    if (deleteBtns != null) {
      deleteBtns.forEach((btn) => {
        const itemId = btn.dataset.prop;
        btn.addEventListener("click", (e) => {
          deleteBag(itemId, node);
        });
      });
    }
  };

  const deleteBag = (id, node) => {
    let obj = {};
    cart_data.items.forEach((list) => {
      if (list.properties?.hasOwnProperty("ID") && list.properties.ID == id) {
        obj[list.key] = 0;
      } else {
        if (list?.id && list.id == id) {
          obj[list.key] = 0;
        }
      }
    });

    updateDrawerLineItem(obj, node).then((data) => {
      render_cart();
      hideItems();
    });
  };

  const update_sub_price = async (cart_item) => {
    ctx.emit("drawer:updateItems", { bag: cart_item });
  };

  const render_cart = async (cart_item) => {
    await render();
    await update_sub_price(cart_item);
    ctx.emit("drawer:show");
  };

  const render = async () => {
    drawer_loader(true, node.querySelector("#sl-cartjs-items"));

    const cart = await fetchCart();
    const subProducts = [];
    const products = [];
    const items = [];

    if (cart.item_count <= 0) hideItems();

    // ctx.hydrate({ cart: cart });
    ctx.emit("cart:fired", { cart: cart });

    cart.items.forEach((item) => {
      if (item.properties?.hasOwnProperty("ID")) {
        let subItems = [];
        let final_line_price = 0;
        cart.items.forEach((list) => {
          if (
            list.properties?.hasOwnProperty("ID") &&
            list.properties.ID == item.properties.ID
          ) {
            subItems.push(list);
            final_line_price += parseFloat(list.final_line_price);
          }
        });

        if (!items.includes(item.properties.ID)) {
          items.push(item.properties.ID);
          const { properties } = item;
          products.push({
            ...properties,
            image: item.image,
            items: subItems,
            price: final_line_price / 100,
          });
        }
      } else {
        item.items = [];
        item.price = item.final_line_price / 100;
        item.ID = item.id;
        products.push(item);
      }
    });

    cart.products = products;
    const CartTemplateSelector = document.querySelector("#sl-CartTemplate");
    const cartAjaxSelector = document.querySelector("#sl-cartjs-items");
    cart_data = cart;
    //console.log(cart.items)
    const listenCart = () => {
      return engine
        .parseAndRender(CartTemplateSelector.innerHTML, { cart: cart })
        .then((html) => (cartAjaxSelector.innerHTML = html))
        .then(() => {
          re_init();
        });
    };

    listenCart()
      .then(() => {
        //update shipping
        const { shippingPrice, shippingPriceLimit } = theme.settings;

        let shipping_amount = shippingPrice;
        if (
          cart.original_total_price > shippingPriceLimit ||
          cart.item_count <= 0
        )
          shipping_amount = 0;

        const total = cart.original_total_price + shipping_amount;

        engine
          .parseAndRender(
            "{{cart.items_subtotal_price | divided_by: 100 | money : cart.currency }}",
            {
              cart: cart_data,
            }
          )
          .then((html) => (subtotal_el.innerHTML = html));

        engine
          .parseAndRender(
            "{{shippingPrice | divided_by: 100  | money : cart.currency }}",
            {
              cart: cart_data,
              shippingPrice: shipping_amount,
            }
          )
          .then((html) => (shipping_el.innerHTML = html));

        engine
          .parseAndRender(
            "{{total | divided_by: 100  | money : cart.currency }}",
            {
              cart: cart_data,
              total: total,
            }
          )
          .then((html) => (grand_total_el.innerHTML = html));
      })
      .then(() => {
        drawer_loader(false, node.querySelector("#sl-cartjs-items"));
      })
      .then(() => {
        // console.log('render cart')
        let ads = document.querySelector(".announcements ").clientHeight;
        if (ads <= 10) ads = 50;
        let hh =
          document.querySelector(".drawer_footer_shopAdjust").clientHeight +
          70 +
          ads;
        document.querySelector(
          ".drawer_content_shopAdjust"
        ).style.minHeight = `calc(100% - ${hh}px)`;
        ctx.emit("drawer:updated");
      })
      .catch(() => {
        ctx.emit("drawer:updated");
      });
  };

  const open = () => {
    render().then(() => {
      const { cart: oldCart } = ctx.getState();
      if (
        cart_data?.item_count != oldCart?.item_count ||
        cart_data?.total_price != oldCart?.total_price ||
        cart_data?.total_weight != oldCart?.total_weight
      ) {
        //clean products when cart changed
        clean();
      }
    });
    hideItems();
    node.classList.add("opened");
    createOverlay();
    closeModal();
    // console.log(ctx.getState())
    ctx.emit("drawer:show");
  };

  const toggle = () => {
    if (!node.classList.contains(config.activeDrawer)) open();
    else close();
  };

  const clean = () => {
    return location.pathname.includes("collections/bland-selv-slik") != false
      ? ctx.emit("products:fetched", ctx.getState())
      : false;
  };

  const showItems = async (id, node) => {
    drawer_loader(true);
    await renderItems(id, node);

    secondDrawer.setAttribute("aria-hidden", "false");
    node.classList.add("second-opened");
    setTimeout(function () {
      drawer_loader(false);
    }, 500);
  };

  const callback_item = () => {
    const lineItems = document.querySelectorAll("[data-line-items]");
    const itemQtyMinusBtns = document.querySelectorAll("[data-cart-qty-minus]");
    const itemQtyPlusBtns = document.querySelectorAll("[data-cart-qty-plus]");
    const itemQtyElem = node.querySelectorAll("[data-cart-qty-elem]");
    const itemAmountElem = node.querySelectorAll("[data-cart-amount-elem]");
    const deleteElems = node.querySelectorAll("[data-remove-cart-line]");
    const restoreBtns = node.querySelectorAll("[data-restore-bag]");
    const { allProducts } = ctx.getState();

    restoreBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bag_id = btn.dataset.id;
        restoreBag(bag_id);
      });
    });

    lineItems.forEach((item, i) => {
      let obj = {};
      const itemId = item.dataset.line;
      const bagId = item.dataset.bag;
      let cart_item = cart_data.items.find((t) => t.key == itemId);
      let currentQuantity = Number(item.dataset.quantity);
      const weight = Number(cart_item.grams);
      let stk = 0;
      if (cart_item.properties?.hasOwnProperty("Amount")) {
        stk = cart_item.properties["Amount"];
      }

      let current_product;

      if (stk <= 0 && allProducts) {
        current_product = allProducts.find(
          (product) => product.handle == cart_item.handle
        );
      }

      if (current_product) {
        const amountTag = current_product.tags?.find((tag) =>
          tag.includes("amount__")
        );
        stk =
          amountTag === undefined
            ? 4
            : Number(amountTag.replace("amount__", ""));
      }

      let currentWeight = currentQuantity * weight;

      stk = stk === 0 ? 4 : stk;

      const itemQtyMinusBtn = item.querySelector("[data-cart-qty-minus]");
      const itemQtyPlusBtn = item.querySelector("[data-cart-qty-plus]");
      itemAmountElem[i].innerHTML = currentQuantity * stk;
      itemQtyMinusBtn.addEventListener("click", (e) => {
        if (currentQuantity <= 1) {
          // If it's the last line-item in the bag -> remove the intire bag
          //const getBagProp = item.parentNode.dataset.listItemIdentifier // Get the name prop of bag
          //const bagToRemove = candyItems.find(candyItem => candyItem.dataset.candybagItemId === getBagProp) // Find the correct bag
          //const listItemCount = item.parentNode.childElementCount // Check childElementCount of parent ul

          // if (listItemCount === 1) bagToRemove.parentNode.removeChild(bagToRemove) // Remove entire bag

          if (cart_item.properties?.hasOwnProperty("ID")) {
            if (cart_item.properties["ID"] === bagId) {
              item.parentNode.removeChild(item);
              obj[itemId] = 0;
            }
          }
        } else {
          currentQuantity -= 1;
          currentWeight = currentQuantity * weight;
          itemQtyElem[i].innerHTML = currentWeight;
          itemAmountElem[i].innerHTML = currentQuantity * stk;
          obj[itemId] = currentQuantity;
        }
      });

      itemQtyMinusBtn.addEventListener(
        "click",
        debounce(function () {
          updateDrawerLineItem(obj).then((data) => {
            render_cart(cart_item);
          });
        }, 500)
      );

      itemQtyPlusBtn.addEventListener("click", (e) => {
        currentQuantity += 1;
        currentWeight = currentQuantity * weight;
        itemQtyElem[i].innerHTML = currentWeight;
        itemAmountElem[i].innerHTML = currentQuantity * stk;
        obj[itemId] = currentQuantity;
      });

      itemQtyPlusBtn.addEventListener(
        "click",
        debounce(function () {
          drawer_loader(true, node.querySelector("#sl-cartjs-items"));
          updateDrawerLineItem(obj).then((data) => {
            render_cart(cart_item);
          });
        }, 500)
      );

      deleteElems[i].addEventListener(
        "click",
        debounce(function () {
          obj[itemId] = 0;
          item.parentNode.removeChild(item);
          drawer_loader(true, node.querySelector("#sl-cartjs-items"));
          updateDrawerLineItem(obj).then((data) => {
            render_cart(cart_item);
          });
        }, 500)
      );
    });
  };

  const renderItems = async (id, node) => {
    let items = [];
    cart_data.products.forEach((product) => {
      if (product.ID == id) {
        items = product.items;
        ctx.emit("drawer:updateItems", {
          bag: { properties: product },
        });
      }
    });

    // console.log(cart_data.products)

    const CartTemplateSelector = document.querySelector(
      "#sl-CartTemplate-items"
    );
    const cartAjaxSelector = document.querySelector("#sub-products");
    cartAjaxSelector.classList.add("progress");
    return engine
      .parseAndRender(CartTemplateSelector.innerHTML, {
        cart: cart_data,
        items: items,
        subtotal: 10,
        bag_id: id,
      })
      .then((html) => (cartAjaxSelector.innerHTML = html))
      .then(() => {
        cartAjaxSelector.classList.remove("progress");
        callback_item();
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const hideItems = (id, node) => {
    secondDrawer.setAttribute("aria-hidden", "true");
    if (node) node.classList.remove("second-opened");
    else
      document.querySelector("#drawer-cart").classList.remove("second-opened");
  };

  const get_poses = (cart) => {
    let ps = [];
    cart.items.forEach((item) => {
      if (item?.properties?.ID && !ps.includes(item.properties.ID)) {
        ps.push(item.properties.ID);
      }
    });

    return ps;
  };

  closeBtns.forEach((closeBtn) => {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  });

  closeSecondDrawer.addEventListener("click", (e) => {
    e.preventDefault();
    hideItems();
  });

  dataSubmitCart.addEventListener("click", (e) => {
    e.preventDefault();
    hideItems();
  });

  if (crateBagBtns.length) {
    crateBagBtns.forEach((crateBagBtn) => {
      crateBagBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // console.log(location)
        window.localStorage.removeItem("candybag");
        hideItems();
        closeModal();
        close();
        if (
          location.pathname.includes("collections/bland-selv-slik") == false
        ) {
          location.href = "/collections/bland-selv-slik";
        }
      });
    });
  }

  if (triggers.length) {
    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // console.log('open drawer')
        e.preventDefault();
        open();
      });
    });
  }

  document.addEventListener("click", (e) => {
    const classes = e.target.classList;
    if (classes.contains("drawer_2_content_product_minusOne_shopAdjust")) {
      return;
    }

    if (classes.contains("cart__icon__style")) {
      return;
    }

    if (classes.contains("cart-icons")) {
      return;
    }

    if (
      !container.contains(e.target) &&
      !triggers.includes(e.target) &&
      !e.target.classList.contains("minusOne_shopAdjust")
    ) {
      close();
    }
  });

  document.querySelectorAll('[name="checkout"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      giveSpinner(btn);
      let first = true;
      let poses = get_poses(cart_data);
      let items = document.querySelectorAll(".sa-upsell-item");
      const found = cart_data.items.find((item) => {
        return item?.properties?.name == "Pak";
      });

      if (found) first = false;

      if (poses.length > 0 && first && items.length) {
        items[0].classList.add("selected");
        items[0].querySelector('[type="radio"]').checked = true;
        let _json = items[0].querySelector("script").textContent;
        const __product = JSON.parse(_json);
        let formData = {
          items: [
            {
              id: __product["variants"][0].id,
              quantity: poses.length,
              properties: {
                name: "Pak",
                value: true,
              },
            },
          ],
        };
        //console.log('name=checkout ---clicked')
        //set properties
        fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then((response) => {
            return response.json();
          })
          .then((c) => {
            fetchCart()
              .then((latest_cart) => {
                ctx.emit("cart:fired", latest_cart);
                return latest_cart;
              })
              .then((latest_cart) => {
                removeSpinner(btn);
                beforeCheckout(latest_cart);
              });
          });
      } else {
        ctx.emit("cart:fired", cart_data);
        removeSpinner(btn);
        beforeCheckout(cart_data);
      }
    });
  });

  document.querySelectorAll("[data-drawer-back]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      ctx.emit("drawer:back", { step: btn.getAttribute("data-step") });
    });
  });

  let params = new URLSearchParams(document.location.search);
  //console.log(params.get('open'))
  if (params.get("open")) {
    open();
  }
});

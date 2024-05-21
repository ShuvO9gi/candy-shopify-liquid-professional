import { component } from "picoapp";
import { getDuplicateProducts } from "../utils/arrays";
import { setUrlParams, deleteUrlParams } from "../utils/urls";
import setToLocalStorage from "../components/setToLocaleStorage";
import plusCandy from "../components/plusCandy";
import minusCandy from "../components/minusCandy";
import totalKilogramsCalculator from "../components/totalKilogramsCalculator";
import createItemsArray from "../components/createItemsArray";
import submitBagToCart from "../components/submitBagToCart";
import successPopup from "../components/successPopup";
import visualCandyBag from "../components/visualCandyBag";
import createUniqueId from "../components/createUniqueId";
import infoIcon from "../components/infoIcon";
import { getStorage, saveStorage } from "../utils/storage";
import lazySizes from "lazysizes";

const imgUrlDefault =
  "//cdn.shopify.com/s/files/1/0555/3461/6756/files/slikeks-logo-2022.png";

export default component((node, ctx) => {
  /**
   * Toggle filter on mobile
   * test
   */
  const filterDrawer = document.querySelector("[data-filter-drawer]");
  const filterButtons = document.querySelectorAll("[data-filter-button]");
  const closeFilterButton = document.querySelector("[data-filter-close] span");

  filterButtons.forEach((filterButton) => {
    filterButton.addEventListener("click", (e) => {
      e.preventDefault();
      filterDrawer.classList.remove("-translate-x-full");
      filterButton.classList.add("hidden");
      //filterDrawer.classList.remove('hideOnDesktop');
    });
  });

  closeFilterButton.addEventListener("click", (e) => {
    e.preventDefault();
    filterDrawer.classList.add("-translate-x-full");
    filterButtons.forEach((filterButton) => {
      e.preventDefault();
      filterButton.classList.remove("hidden");
    });
    //filterDrawer.classList.add('hideOnDesktop');
  });

  /**
   * Fetch products
   */

  const {
    handle,
    totalProducts,
    paginate,
    priceLimit,
    itemWidth,
    minusIcon,
    plusIcon,
  } = JSON.parse(node.querySelector("[data-config]").dataset.config);

  const loops = Math.ceil(totalProducts / 1000);
  const productListElem = node.querySelector("[data-product-list]");
  const loadMoreBtn = node.querySelector("[data-load-more]");
  const visualBagElem = node.querySelector("[data-visual-bag]");
  const visualBagToggleBtns = node.querySelectorAll("[data-toggle-visual-bag]");
  const visualBagWrapper = node.querySelector("[data-visual-bag-wrapper]");
  const visualBagInner = node.querySelector("[data-visual-bag-inner]");
  const closeVisualBagBtn = node.querySelector("[data-close-visual-bag]");
  const submitBtns = node.querySelectorAll("[data-submit-button]");

  let { currentPage } = JSON.parse(
    node.querySelector("[data-config]").dataset.config
  );
  let currentOffset = paginate * currentPage;

  const fetchProducts = async () => {
    let i = 0;
    let fetchedProducts = [];
    let error = false;

    do {
      const response = await fetch(
        `/collections/${handle}?page=${i}&view=data`
      ).then((r) => r.json());
      fetchedProducts = [...fetchedProducts, ...response];
      i++;
    } while (i < loops);

    if (fetchedProducts) saveStorage(fetchedProducts);
    ctx.emit("products:fetched", { allProducts: fetchedProducts });
  };

  ctx.on("products:reload", (state) => {
    window.localStorage.removeItem("candybag");
    fromLocalStorage = JSON.parse(window.localStorage.getItem("candybag"));
    const itemInners = node.querySelectorAll("[data-item-inner]");
    itemInners.forEach((wrapper, i) => {
      wrapper.classList.remove("is--selected");
      wrapper
        .querySelector("[data-qty-wrapper]")
        .classList.remove("is--visible");
      wrapper.querySelector("[data-amount-container]").classList.add("hidden");
    });
  });

  ctx.on("products:clean", (state) => {
    window.localStorage.removeItem("candybag");
  });

  ctx.on("products:refetch", (state) => {
    fetchProducts();
  });

  fetchProducts();

  const decodeHtml = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const addToCardEventListeners = () => {
    const itemInners = node.querySelectorAll("[data-item-inner]");
    const addToBagBtns = node.querySelectorAll("[data-add-to-bag]");
    const addToBagImages = node.querySelectorAll("[data-add-to-bag-img]");
    const productCardBubbles = node.querySelectorAll(
      "[data-product-card-bubble]"
    );
    const infoIcons = node.querySelectorAll("[data-info-icon]");
    const infoModal = node.querySelector("[data-info-modal]");
    const infoModalImage = node.querySelector("[data-info-modal-image]");
    const infoModalTitle = node.querySelector("[data-info-modal-title]");
    const infoModalDescription = node.querySelector(
      "[data-info-modal-description]"
    );
    const productCardItems = node.querySelectorAll("[data-product-card-item]");
    const infoCloseBtns = node.querySelectorAll("[data-close-info]");
    const qtyWrappers = [...node.querySelectorAll("[data-qty-wrapper]")];
    const amountContainers = node.querySelectorAll("[data-amount-container]");
    const amountElems = node.querySelectorAll("[data-amount-elem]");
    const minusBtns = node.querySelectorAll("[data-qty-minus]");
    const plusBtns = node.querySelectorAll("[data-qty-plus]");
    const qtyCountElems = node.querySelectorAll("[data-qty-amount]");
    const stickyFilterBtn = node.querySelector("[data-sticky-filter-btn]");

    let candyBag = [];
    const itemCount = 0;
    const totalCount = 0;

    let fromLocalStorage = JSON.parse(window.localStorage.getItem("candybag"));
    //console.log('fromLocalStorage', fromLocalStorage)
    //console.log('candyBag', candyBag)
    // If localeStorage is not empty, update the amount selected
    if (fromLocalStorage !== null) {
      const idArray = fromLocalStorage.map((storageItem) => storageItem.id);
      const qtyIdArray = qtyWrappers.map((qtyWrapper) =>
        Number(qtyWrapper.dataset.qtyId)
      );

      candyBag = fromLocalStorage;

      if (candyBag.length > 0) {
        submitBtns.forEach((submitBtn) => {
          submitBtn.innerHTML = theme.strings.blandSelv.buyMore;
        });

        totalKilogramsCalculator(
          candyBag,
          itemCount,
          totalCount,
          priceLimit,
          submitBtns
        );
      }

      Array.prototype.diff = function (arr2) {
        const ret = [];
        for (const i in this) {
          if (arr2.indexOf(this[i]) > -1) {
            ret.push(this[i]);
          }
        }
        return ret;
      };

      if (qtyIdArray.diff(idArray).length > 0) {
        qtyIdArray.diff(idArray).forEach((id) => {
          qtyWrappers.forEach((wrapper, i) => {
            if (Number(wrapper.dataset.qtyId) === id) {
              wrapper.classList.add("is--visible");
              const { count, amount, price, weight } = fromLocalStorage.find(
                (storageItem) => storageItem.id === id
              );
              // qtyCountElems[i].innerHTML = ` ${price / 100} `;
              qtyCountElems[i].innerHTML = ` ${weight} `;
              itemInners[i]?.classList.add("is--selected");
              amountElems[i] != undefined
                ? (amountElems[i].innerHTML = amount * count)
                : "";
              amountContainers[i] != undefined
                ? amountContainers[i].classList.remove("hidden")
                : "";
              productCardBubbles[i] != undefined
                ? productCardBubbles[i].classList.remove("opacity-0")
                : "";
            }
          });
        });
      }

      visualCandyBag(
        visualBagWrapper,
        visualBagElem,
        visualBagToggleBtns,
        candyBag,
        priceLimit,
        fromLocalStorage
      );
    }

    const addToBag = (elem, i) => {
      const { id, price, weight, amount, title, image } = elem.dataset;
      const candy = {};

      candy.title = title;
      candy.id = Number(id);
      candy.price = Number(price);
      candy.initPrice = Number(price);
      candy.initWeight = Number(weight);
      candy.weight = Number(weight);
      candy.amount = Number(amount);
      candy.count = 1;
      candy.img = image;

      // Make sure you can't add additional candy by clicking on image again
      const identicalCandy = candyBag.find(
        (candyItem) => candyItem.title === title
      );
      if (identicalCandy !== undefined) {
        return;
      }

      candyBag.push(candy);

      qtyWrappers[i].classList.add("is--visible");
      itemInners[i]?.classList.add("is--selected");
      amountContainers[i]?.classList.remove("hidden");
      productCardBubbles[i].classList.remove("opacity-0");
      console.log("heeee");
      if (candyBag.length <= 1) {
        submitBtns.forEach((submitBtn) => {
          submitBtn.innerHTML = theme.strings.blandSelv.buyMore;
        });
      }

      var isGift = document.getElementById("GiftChecker").value;

      totalKilogramsCalculator(
        candyBag,
        itemCount,
        totalCount,
        priceLimit,
        submitBtns,
        isGift == "gift"
      );
      setToLocalStorage(fromLocalStorage, candyBag);
      visualCandyBag(
        visualBagWrapper,
        visualBagElem,
        visualBagToggleBtns,
        candyBag,
        priceLimit,
        fromLocalStorage
      );
    };

    // Add candy to bag via button
    addToBagBtns.forEach((btn, i) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        addToBag(btn, i);
      });
    });

    // Add candy to bag via image
    addToBagImages.forEach((img, i) => {
      img.addEventListener("click", (e) => {
        e.preventDefault();
        addToBag(img, i);
      });
    });

    const selectProduct = () => {
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      const isSelectProduct = searchParams.get("select-product");
      if (isSelectProduct === "true") {
        addToBagBtns[0].click();
      }
    };

    selectProduct();

    // Add amount to bag
    plusBtns.forEach((plusBtn, i) => {
      plusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // productCardBubbles[i].classList.add('opacity-0');
        plusCandy(
          addToBagBtns,
          candyBag,
          qtyCountElems,
          amountContainers,
          amountElems,
          i
        );
        setToLocalStorage(fromLocalStorage, candyBag);
        visualCandyBag(
          visualBagWrapper,
          visualBagElem,
          visualBagToggleBtns,
          candyBag,
          priceLimit,
          fromLocalStorage
        );
        totalKilogramsCalculator(
          candyBag,
          itemCount,
          totalCount,
          priceLimit,
          submitBtns
        );
        productCardBubbles[i].classList.remove("opacity-0");
      });
    });

    // Remove amount form bag
    minusBtns.forEach((minusBtn, i) => {
      minusBtn.addEventListener("click", (e) => {
        e.preventDefault();
        minusCandy(
          addToBagBtns,
          qtyWrappers,
          candyBag,
          qtyCountElems,
          amountContainers,
          amountElems,
          itemInners,
          submitBtns,
          i
        );
        setToLocalStorage(fromLocalStorage, candyBag);
        visualCandyBag(
          visualBagWrapper,
          visualBagElem,
          visualBagToggleBtns,
          candyBag,
          priceLimit,
          fromLocalStorage
        );
        if (candyBag.length > 0) {
          totalKilogramsCalculator(
            candyBag,
            itemCount,
            totalCount,
            priceLimit,
            submitBtns
          );
        }
      });
    });

    // Toggle visual bag
    visualBagToggleBtns.forEach((visualBagToggleBtn) => {
      visualBagToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        visualBagWrapper.classList.remove("pointer-events-none");
        visualBagInner.classList.remove("translate-y-[200%]");
        stickyFilterBtn.classList.add("hidden");
      });
    });

    closeVisualBagBtn.addEventListener("click", () => {
      visualBagWrapper.classList.add("pointer-events-none");
      visualBagInner.classList.add("translate-y-[200%]");
      stickyFilterBtn.classList.remove("hidden");
    });

    // Submit the bag to cart
    submitBtns.forEach((submitBtn) => {
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Prompt to add name
        candyBag = JSON.parse(window.localStorage.getItem("candybag"));
        const namePromptModal = node.querySelector("[data-name-prompt]");
        const namePromptClose = node.querySelector("[data-name-prompt-close]");
        const namePromptInput = node.querySelector("[data-name-prompt-input]");
        const finalSubmit = node.querySelector("[data-final-submit]");
        const bag = candyBag.find((bag) => bag?.bagName);
        if (bag) {
          const identifier = bag.bag_id;
          const items = createItemsArray(candyBag, bag.bagName, identifier);
          // namePromptInput.value = bag.bagName;
          if (items.length > 0) {
            // Submit the list to the cart
            submitBagToCart(items, successPopup, namePromptModal);
            namePromptModal.classList.remove("is--visible");
            namePromptInput.value = "";

            ctx.emit("cart:changed");
          }

          return;
        } else {
          namePromptModal.classList.add("is--visible");
          namePromptClose.addEventListener("click", () => {
            namePromptModal.classList.remove("is--visible");
          });

          document
            .querySelector("[data-name-prompt-skip]")
            .addEventListener("click", () => {
              namePromptModal.classList.remove("is--visible");
            });
        }

        // Add eventlistener to finalSubmit
        finalSubmit.addEventListener("click", (e) => {
          e.preventDefault();
          const name = namePromptInput.value;
          const identifier = createUniqueId();
          const note = document.getElementById("CartNoteDrawer")?.value || "";
          const note2 = document.getElementById("CartNoteDrawer2")?.value || "";
          const note3 = document.getElementById("CartNoteDrawer3")?.value || "";
          const { cart: activeCarts } = ctx.getState();

          const found = activeCarts.items.find((cart) => {
            if (cart.properties?.hasOwnProperty("ID")) {
              if (cart.properties["Name"] === name) {
                return cart;
              }
            }

            return false;
          });

          if (found) {
            //show modal to replace name
            const strings = theme.strings.blandSelv.rename;

            node.querySelector("[data-ask-rename-headline]").innerHTML =
              decodeHtml(strings.title);
            node.querySelector("[data-ask-rename-description]").innerHTML =
              decodeHtml(strings.description);
            node.querySelector("[data-ask-rename-submit]").innerHTML =
              decodeHtml(strings.accept);
            node.querySelector("[data-ask-rename-decline]").innerHTML =
              decodeHtml(strings.decline);

            setTimeout(() => {
              namePromptModal.classList.remove("is--visible");
            }, 600);

            setTimeout(() => {
              const renamePromptModal = node.querySelector(
                "[data-ask-rename-prompt]"
              );

              if (node.querySelectorAll("[data-ask-rename-title]")) {
                node
                  .querySelectorAll("[data-ask-rename-title]")
                  .forEach((item) => {
                    item.innerHTML = `"${name}"`;
                  });
              }

              renamePromptModal.classList.add("is--visible");

              node
                .querySelector("[data-ask-rename-prompt-close]")
                .addEventListener("click", () => {
                  renamePromptModal.classList.remove("is--visible");
                });

              node
                .querySelector("[data-ask-rename-submit]")
                .addEventListener("click", () => {
                  renamePromptModal.classList.remove("is--visible");
                  // add to cart  with same name
                  const items = createItemsArray(
                    candyBag,
                    name,
                    found.properties["ID"],
                    note,
                    note2,
                    note3
                  );
                  if (items.length > 0) {
                    // Submit the list to the cart
                    submitBagToCart(items, successPopup, namePromptModal);
                    namePromptModal.classList.remove("is--visible");
                    namePromptInput.value = "";

                    ctx.emit("cart:changed");
                  }

                  return;
                });

              node
                .querySelector("[data-ask-rename-decline]")
                .addEventListener("click", () => {
                  renamePromptModal.classList.remove("is--visible");
                  namePromptModal.classList.remove("is--visible");
                  // show prompt name
                  namePromptModal.classList.add("is--visible");
                  return;
                });
            }, 500);

            return;
          }

          // check in name input is blank
          // if it is, show message that says the user needs to type ind his/her name
          if (name === "") {
            console.log("Du skal indtaste dit navn");
          } else {
            // else create array with items incl. the name as a property
            const items = createItemsArray(
              candyBag,
              name,
              identifier,
              note,
              note2,
              note3
            );
            if (items.length > 0) {
              // Submit the list to the cart
              submitBagToCart(items, successPopup, namePromptModal);
              namePromptModal.classList.remove("is--visible");
              namePromptInput.value = "";

              ctx.emit("cart:changed");
            }
          }
        });
      });
    });

    /**
     * Open info modals
     */
    infoIcons.forEach((icon, index) => {
      icon.addEventListener("click", () => {
        console.log(productCardItems);
        const { description, image } = productCardItems[index].dataset;
        const infoTitle = description.split("---")[0];
        const infoDescription = description.split("---")[1];

        infoModalImage.setAttribute("src", image);
        infoModalTitle.innerHTML = infoTitle;
        infoModalDescription.innerHTML = infoDescription;
        infoModal.classList.add("is--visible");
      });
    });

    /**
     * Close info modals
     */
    infoCloseBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        infoModal.classList.remove("is--visible");
        infoModalDescription.innerHTML = "";
      });
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        infoModal.classList.remove("is--visible");
        infoModalDescription.innerHTML = "";
      }
    });
  };

  /**
   * Create productc item
   */
  const createCollectionItem = (product) => {
    const { title, images, variants, price, description, vendor, tags } =
      product;

    const imgUrl = images[0];
    const { id } = variants[0];
    const amountTag = tags?.find((tag) => tag.includes("amount__")); // Find tag to control the amount each candy that's put in the bag
    const amount =
      amountTag === undefined ? 4 : Number(amountTag.replace("amount__", "")); // If no tag is found, set the default amount to 4
    const weightTag = tags?.find((tag) => tag.includes("weight__")); // Find tag to control the weight each candy that's put in the bag
    const weight =
      weightTag === undefined ? 20 : Number(weightTag.replace("weight__", "")); // If no tag is found, set the default amount to 20

    return ` 
      <div class="candyBox relative twb-select-none" data-product-card-item data-product-item-id="${id}" data-description='${description}' data-image="${imgUrl}">
        <div class="" data-item-inner>
          <div class="absolute top-0 twb-right-4 text-pink cursor-pointer z-10" data-info-icon>${infoIcon()}</div>
          <div data-product-card-bubble>
            <div class="candyBoxImage cursor-pointer" data-add-to-bag-img data-id="${id}" data-amount="${amount}" data-price="${price}" data-weight="${weight}" data-title="${title}" data-image="${imgUrl}">
              <img data-sizes="auto"
              data-src="${imgUrl}"
              src="${imgUrl}"
              data-srcset="${imgUrl}" class="lazyload" data-image="${imgUrl}" style="width: 100%">
            </div>
          </div>
          <div class="candyBoxBuySection">
            <div class="candyBoxBuySectionContent">
              <div class="candyBoxName type-style-card-h">${title}</div>
              <div class="candyBoxBrand type-style-card-h-subhead">${
                theme.strings.blandSelv.from
              } <span>${vendor.toLowerCase()}</span></div>
              <button class="candyBoxBuyButton type-style-button-text" data-add-to-bag data-id="${id}" data-amount="${amount}" data-price="${price}" data-weight="${weight}" data-title="${title}" data-image="${imgUrl}"> ${
      theme.strings.blandSelv.addToBag
    } </button>
            </div>
          </div>
          <div class="candyBoxBuySection-clicked" data-qty-wrapper data-qty-id="${id}">
            <div class="candyBoxBuySectionContent">
              <div class="candyBoxName type-style-card-h">${title}</div>
              <div class="candyBoxBrand type-style-card-h-subhead">${
                theme.strings.blandSelv.from
              } <span>${vendor.toLowerCase()}</span></div>
              <div class="candyBoxBuyButtonClicked">
                <div data-qty-minus class="buttonMinusPlus cursor-pointer">
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="26" height="26" rx="13" fill="#FFAD05"/><rect x="7" y="14" width="2" height="12" rx="0.5" transform="rotate(-90 7 14)" fill="white"/></svg>
                </div>
                <div class="candySizes" tracking-wide>
                  <div class="candySizesAmount type-style-card-desc-bold" data-amount-container>${
                    theme.strings.blandSelv.ca_stk
                  } <span data-amout-stick data-amount-elem>${amount}</span> ${
      theme.strings.blandSelv.stks
    }</div>
                  <div class="candySizesAmountBorder"></div>
                  <div class="candySizesWeigth type-style-card-desc-regular"><span class="mx-[3px]" data-qty-amount data-init-weight="${weight}" data-init-price="${price}">${weight}</span> ${
      theme.strings.blandSelv.gram
    }</div>
                </div>
                <div data-qty-plus class="buttonMinusPlus cursor-pointer">
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="26" height="26" rx="13" transform="matrix(-1 0 0 1 26 0)" fill="#FFAD05"/><rect x="12" y="7" width="2" height="12" rx="0.5" fill="white"/><rect x="7" y="14" width="2" height="12" rx="0.5" transform="rotate(-90 7 14)" fill="white"/></svg>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    `;
  };

  function replaceHyphensWithSpaces(productName) {
    const words = productName.split("-");
    if (words.length > 1 && words[0] === "") {
      words[1] = "-" + words[1];
      words.shift();
    }
    const modifiedProductName = words.join(" ").toLowerCase();
    return modifiedProductName;
  }

  const renderProducts = (products) => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    let productName = searchParams.get("product");

    if (productName) {
      productName = replaceHyphensWithSpaces(productName);

      const productId = products.findIndex((product) => {
        return product.title.toLowerCase() === productName;
      });

      if (productId !== -1) {
        const foundProduct = products.splice(productId, 1)[0];
        products.unshift(foundProduct);
      }
    }

    const productsToRender = products.slice(0, currentOffset);

    if (products.length > currentOffset) loadMoreBtn.style.display = "block";
    else loadMoreBtn.style.display = "none";

    let results =
      productsToRender.length > 0
        ? productsToRender.reduce((markup, product) => {
            markup += createCollectionItem(product);
            return markup;
          }, "")
        : "<p>Ingen produkter</p>";

    lazySizes.init();
    return results;
  };

  ctx.on("products:fetched", (state) => {
    /**
     * Create filter objects for each filter (eg 'type' and 'tags')
     */
    const filterItems = [...node.querySelectorAll("[data-filter-item]")];

    const getAllFilterTypes = filterItems.map(
      (item) => item.dataset.filterType
    );
    const getUniqueFilterTypes = [...new Set(getAllFilterTypes)];
    const filters = [];

    getUniqueFilterTypes.forEach((filterType) => {
      const filterObj = {
        type: filterType,
      };

      filters.push(filterObj);
    });

    /**
     * Loop through filter objects
     */
    const allFilters = [];
    let hasFilters = false;

    filters.forEach((filter, i) => {
      const items = filterItems.filter(
        (item) => item.dataset.filterType === filter.type
      );

      filter.items = items;

      // find url parameters
      const findUrlFilterParams = (params) => {
        const paramArray = decodeURIComponent(params).split("|");

        hasFilters = true;

        ctx.hydrate({ hasFilters });

        paramArray.forEach((param) => {
          if (param != "")
            filter.items
              .find((item) => item.dataset.filterId === param)
              .classList.add("is--active");
        });
      };

      const urlParams = new URLSearchParams(location.search);

      for (const entry of urlParams.entries()) {
        if (filter.type == entry[0] && entry[1] != "") {
          findUrlFilterParams(entry[1]);
        }
      }

      ctx.on("filter:start", (state) => {
        const activeItems = items.filter((item) =>
          item.classList.contains("is--active")
        );
        const activeTypes = activeItems.map((i) => i.dataset.filterId);

        filter.activeItems = activeItems;
        filter.activeTypes = activeTypes;
        filter.allProducts = state.allProducts;

        filter.filteredItems =
          activeItems.length > 0
            ? filter.allProducts.filter((product) => {
                activeTypes.forEach((type) => {
                  // console.log('product filtet type', product[filter.type]);
                });
                if (
                  activeTypes.filter((type) =>
                    product[filter.type].includes(type)
                  ).length > 0
                )
                  return product;
              })
            : filter.allProducts;

        if (allFilters.find((a) => a.type === filter.type)) {
          allFilters[allFilters.findIndex((a) => a.type === filter.type)] =
            filter;
        } else {
          allFilters.push(filter);
        }

        if (i === filters.length - 1) {
          ctx.emit("products:filtered", { allFilters, hasFilters: true });
        }
      });
    });

    ctx.on("products:filtered", (state) => {
      let renderThese = [];
      const { allFilters } = state;

      allFilters.forEach((filter) => {
        const { filteredItems } = filter;
        renderThese = [...renderThese, ...filteredItems];
        setUrlParams([
          { name: filter.type, value: filter.activeTypes.join("|") },
        ]);
      });

      renderThese = getDuplicateProducts([...renderThese], allFilters.length);
      const unique = [...new Set(renderThese)];

      ctx.emit("products:ready", { renderThese: unique });

      productListElem.innerHTML = renderProducts(unique);

      addToCardEventListeners();
    });

    filterItems.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("is--active");
        ctx.emit("filter:start");
      });
    });

    if (state.hasFilters) ctx.emit("filter:start");
    else productListElem.innerHTML = renderProducts(state.allProducts);

    addToCardEventListeners();

    loadMoreBtn.addEventListener("click", (e) => {
      e.preventDefault();

      currentPage++;
      currentOffset = paginate * currentPage;
      ctx.emit("filter:start");
      setUrlParams([{ name: "page", value: currentPage }]);
    });
  });

  const filterSearch = document.getElementById("filter-search");
  const filterSearchIcon = document.getElementById("filter-search-icon");
  const filterSearchError = document.getElementById("filter-search-error");

  function performSearch() {
    const searchItem = filterSearch.value.replace(/-/g, " ").toLowerCase();
    const allProducts = ctx.getState().allProducts;

    const productId = allProducts.findIndex((product) => {
      return product.title.toLowerCase() === searchItem;
    });

    if (productId !== -1) {
      const foundProduct = allProducts.splice(productId, 1)[0];
      allProducts.unshift(foundProduct);
      closeFilterButton.click();
    } else {
      filterSearchError.style.padding = "10px";
      filterSearchError.innerHTML = "Product not found!";
    }

    deleteUrlParams("product");
    ctx.emit("filter:start", { allProducts: allProducts });
  }

  filterSearch.addEventListener("keydown", (e) => {
    filterSearchError.style.padding = "0";
    filterSearchError.innerHTML = "";
    if (e.key === "Enter") {
      performSearch();
    }
  });

  filterSearchIcon.addEventListener("click", performSearch);
});

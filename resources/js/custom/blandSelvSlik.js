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
  const mixAgainButton = document.getElementById("mixAgain");
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

  //Define current pathname
  const currentPath = window.location.pathname;

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
        fromLocalStorage,
        ctx
      );
    }

    const addToBag = (elem, i) => {
      console.log(elem.dataset);
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

      // const { cart: activeCarts } = ctx.getState();
      // console.log({activeCarts});
      // const itemTitles= activeCarts.items.map((item) => item.title);
      // if(["pack in bag", "pack in bowl"].includes(title) && (itemTitles.includes("pack in bag") || itemTitles.includes("pack in bowl"))){
      //   return ;
      // }

      if (title === "pack in bag" || title === "pack in bowl") {
        candyBag = candyBag.filter(
          (item) =>
            item.title !== "pack in bag" && item.title !== "pack in bowl"
        );
      }

      var isGift = document.getElementById("GiftChecker")?.value;

      // Make sure you can't add additional candy by clicking on image again
      const identicalCandy = candyBag.find(
        (candyItem) => candyItem.title === title
      );
      if (identicalCandy !== undefined) {
        return;
      }
      candyBag.push(candy);
      const bagNBowlItem = candyBag.find(
        (item) => item.title === "pack in bag" || item.title === "pack in bowl"
      );

      if (!isGift && candyBag && candyBag.length && !bagNBowlItem) {
        let bagNBowlDataFromStorage = JSON.parse(
          window.localStorage.getItem("bagNBowlData")
        );

        if (!bagNBowlDataFromStorage) {
          bagNBowlDataFromStorage = {
            amount: 1,
            initPrice: 0,
            initWeight: 20,
            price: 0,
            title: "pack in bag",
            weight: 20,
            count: 1,
            id: 47811321463115,
            img: "//www.slikekspressen.dk/cdn/shop/files/73fd3a59-eecf-42b9-9b50-8da0c2904713.png?v=1717052550",
          };
        }

        candyBag.push(bagNBowlDataFromStorage);
      }

      qtyWrappers[i].classList.add("is--visible");
      itemInners[i]?.classList.add("is--selected");
      amountContainers[i]?.classList.remove("hidden");
      productCardBubbles[i].classList.remove("opacity-0");
      if (candyBag.length <= 1) {
        submitBtns.forEach((submitBtn) => {
          submitBtn.innerHTML = theme.strings.blandSelv.buyMore;
        });
      }

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
        fromLocalStorage,
        ctx
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

    mixAgainButton?.addEventListener("click", (e) => {
      e.preventDefault();
      window.localStorage.removeItem("candybag");
      //ctx.emit("products:refetch");
      if (!(currentPath === "/collections/bland-selv-slik"))
        ctx.emit("products:refetch");

      const successModal = document.querySelector("[data-success-modal]");

      successModal.classList.remove("is--visible");
      document.querySelector("[data-gram-elem]").innerHTML = "";
      document.querySelector("[data-gram-elem-mobile]").innerHTML = "";
      document.querySelector("[data-total-price-elem]").innerHTML = "";
      document.querySelector("[data-total-price-elem-mobile]").innerHTML = "";
      document.querySelector("[data-visual-bag]").innerHTML = "";
    });

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
          fromLocalStorage,
          ctx
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
          fromLocalStorage,
          ctx
        );
        if (candyBag.length > 0) {
          totalKilogramsCalculator(
            candyBag,
            itemCount,
            totalCount,
            priceLimit,
            submitBtns
          );
        } else {
          node
            .querySelector("[data-submit-button]")
            .setAttribute("disabled", true);
        }
        // ctx.emit("products:fetched", ctx.getState());
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
        var candyBag = JSON.parse(window.localStorage.getItem("candybag"));
        const namePromptModal = node.querySelector("[data-name-prompt]");
        const expiredPromptModal = node.querySelector(
          "[data-expired-items-prompt]"
        );
        const namePromptClose = node.querySelector("[data-name-prompt-close]");
        const namePromptInput = node.querySelector("[data-name-prompt-input]");
        const finalSubmit = node.querySelector("[data-final-submit]");
        const bag = candyBag?.find((bag) => bag?.bagName);
        if (bag) {
          const identifier = bag.bag_id;
          const items = createItemsArray(candyBag, bag.bagName, identifier);
          // namePromptInput.value = bag.bagName;
          if (items.length > 0) {
            // Submit the list to the cart
            submitBagToCart(
              items,
              successPopup,
              namePromptModal,
              expiredPromptModal
            );
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
          var candyBag = JSON.parse(window.localStorage.getItem("candybag"));
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
                    submitBagToCart(
                      items,
                      successPopup,
                      namePromptModal,
                      submitBagToCart
                    );
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
              const isPickNMix = items.find((item) =>
                item.properties._bag_type.includes("pick_and_mix")
              );
              if (isPickNMix) {
                const bagNBowlItem = items.find(
                  (item) => item.properties.name === "Pak"
                );
                if (!bagNBowlItem) {
                  document.body.classList.add("openbagNbowl");
                  return;
                }
              }
              submitBagToCart(
                items,
                successPopup,
                namePromptModal,
                submitBagToCart
              );
              namePromptModal.classList.remove("is--visible");
              namePromptInput.value = "";

              ctx.emit("cart:changed");
            }
          }
          node.querySelector("[data-gram-elem]").innerHTML = "";
          node.querySelector("[data-gram-elem-mobile]").innerHTML = "";
          node.querySelector("[data-total-price-elem]").innerHTML = "";
          node.querySelector("[data-total-price-elem-mobile]").innerHTML = "";
          node
            .querySelector("[data-submit-button]")
            .setAttribute("disabled", true);
        });
      });
    });

    /**
     * Open info modals
     */
    infoIcons.forEach((icon, index) => {
      icon.addEventListener("click", () => {
        const { description, image, productMetafields } =
          productCardItems[index].dataset;
        console.log("productMetafields", productMetafields);
        // const infoTitle = description.split("---")[0];
        // const infoDescription = description.split("---")[1];

        const decodedMetafieldsString = decodeURIComponent(productMetafields);
        const metafields = JSON.parse(decodedMetafieldsString);
        console.log("Parsed metafields:", metafields);

        infoModalImage.setAttribute("src", image);
        // infoModalTitle.innerHTML = infoTitle;
        // infoModalDescription.innerHTML = infoDescription;
        infoModalTitle.innerHTML = `${
          metafields.subtitle || "No Title Available"
        }`;

        // Function to decode HTML entities
        function decodeHTMLEntities(text) {
          const txt = document.createElement("textarea");
          txt.innerHTML = text;
          return txt.value;
        }

        // Decode and parse the ingredients_HTML
        const ingredientsHTMLString = decodeHTMLEntities(
          metafields.ingrediensHTML
        );
        console.log("ingredientshtmlstring", ingredientsHTMLString);

        let ingredientsData;

        try {
          ingredientsData = JSON.parse(ingredientsHTMLString);
        } catch (error) {
          console.error("Error parsing ingredients HTML:", error);
        }

        // Rich Text Rendering Function
        function renderRichText(richText) {
          const container = document.createElement("div");

          // Ensure richText is properly structured
          if (!richText || !Array.isArray(richText.children)) {
            console.error(
              "Rich text data is missing or has an incorrect format:",
              richText
            );
            return "";
          }

          // Iterate over children in the rich text structure
          richText.children.forEach((child, childIndex) => {
            if (child.type === "paragraph") {
              const p = document.createElement("p");
              // p.style.textAlign = "justify";

              if (childIndex === 2) {
                p.style.marginTop = "10px";
              }

              if (Array.isArray(child.children)) {
                child.children.forEach((subChild) => {
                  if (subChild.type === "text") {
                    const textNode = document.createTextNode(
                      subChild.value || ""
                    );
                    if (subChild.bold) {
                      const boldText = document.createElement("strong");
                      boldText.appendChild(textNode);
                      p.appendChild(boldText);
                    } else {
                      p.appendChild(textNode);
                    }
                  } else if (subChild.type === "link") {
                    const link = document.createElement("a");
                    link.href = subChild.url || "#";
                    link.target = subChild.target || "_self";
                    link.textContent = subChild.children[0]?.value || "Link";
                    p.appendChild(link);
                  }
                });
              }
              container.appendChild(p);
            }
          });

          return container.innerHTML; // Return the generated HTML
        }

        // Render the ingredients in the modal description
        infoModalDescription.innerHTML = `
        <p></p>
            <h5>Indhold</h5>
            <p id="data-a" data-mce-fragment="1">${renderRichText(
              ingredientsData
            )}</p>
            <!-- <div>
                <br>
                <a href="https://www.slikekspressen.dk/pages/info-om-allergener" target="_blank">Tryk her</a>
                hvis du vil se mere om hvordan vi håndterer allergener
                <br><br>
            </div> -->
            <h5>Næringsværdi <small data-mce-fragment="1">pr. 100g</small></h5>
            <div>
                <table style="width:80%;">
                    <tbody>
                        <tr>
                            <td><strong>Energi</strong></td>
                            <td>
                            <span>${metafields.energy_kj_100g || "0.0"} kj / ${
          metafields.energy_kcal_100g || "0.0"
        } kcal</span>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Fedt</strong></td>
                            <td><span>${
                              metafields.fat_g || "0.0"
                            }&nbsp;g</span></td>
                        </tr>
                        <tr>
                            <td>- Heraf mættet</td>
                            <td><span>${
                              metafields.of_which_saturates_g || "0.0"
                            }&nbsp;g</span></td>
                        </tr>
                        <tr>
                            <td><strong>Kulhydrat</strong></td>
                            <td><span>${
                              metafields.carbohydrate_g_100g || "0.0"
                            }&nbsp;g</span></td>
                        </tr>
                        <tr>
                            <td>- Heraf sukkerarter</td>
                            <td><span>${
                              metafields.of_which_sugars_g || "0.0"
                            }&nbsp;g</span></td>
                        </tr>
                        <tr>
                            <td><strong>Protein</strong></td>
                            <td><span>${
                              metafields.protein_g_100g || "0.0"
                            }&nbsp;g</span></td>
                        </tr>
                        <tr>
                            <td><strong>Salt</strong></td>
                            <td><span>${
                              metafields.salt_g_100g || "0.0"
                            }&nbsp;g</span></td>
                        </tr>
                    </tbody>
                </table>
                <br>
                <h5 data-mce-fragment="1">Slikbeskrivelse</h5>
                <div class="naerring" data-mce-fragment="1" style="text-align:"justify";">
                  This space for candy description
                    <!-- ${description} -->
                </div>
                <p>&nbsp;</p>
            </div>
        `;
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
    console.log("createCollectionItem", product);
    const {
      title,
      images,
      variants,
      price,
      description,
      vendor,
      tags,
      metafields,
    } = product;
    console.log("metafields", metafields);

    const imgUrl = images[0];
    const { id } = variants[0];
    const amountTag = tags?.find((tag) => tag.includes("amount__")); // Find tag to control the amount each candy that's put in the bag
    const amount =
      amountTag === undefined ? 4 : Number(amountTag.replace("amount__", "")); // If no tag is found, set the default amount to 4
    const weightTag = tags?.find((tag) => tag.includes("weight__")); // Find tag to control the weight each candy that's put in the bag
    const weight =
      weightTag === undefined ? 20 : Number(weightTag.replace("weight__", "")); // If no tag is found, set the default amount to 20

    return ` 
      <div class="candyBox relative twb-select-none" data-product-card-item data-product-item-id="${id}" data-description='${description}' data-image="${imgUrl}" data-product-metafields='${encodeURIComponent(
      JSON.stringify(metafields)
    )}'>
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
              <button class="candyBoxBuyButton candyBoxBuyButtonPnM type-style-button-text" data-add-to-bag data-id="${id}" data-amount="${amount}" data-price="${price}" data-weight="${weight}" data-title="${title}" data-image="${imgUrl}"> ${
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

  // Scroll method
  const filterWrapper = document.querySelector(".filter-items-wrapper");
  const filterItems = document.querySelector(".filter-items");
  const leftScroll = document.querySelector(".left-scroll");

  // Show/Hide Scroll Icons based on scroll position
  const updateScrollIcons = () => {
    const maxScrollLeft = filterItems.scrollWidth - filterWrapper?.clientWidth;
    if (filterWrapper?.scrollLeft > 0) {
      leftScroll?.classList.remove("hidden");
    } else {
      leftScroll?.classList.add("hidden");
    }

    if (filterWrapper?.scrollLeft < maxScrollLeft) {
      rightScroll?.classList.remove("hidden");
    } else {
      rightScroll?.classList.add("hidden");
    }
  };

  // Scroll left and right
  if (leftScroll && rightScroll && filterWrapper) {
    leftScroll.addEventListener("click", () => {
      filterWrapper.scrollBy({ left: -200, behavior: "smooth" });
    });

    rightScroll.addEventListener("click", () => {
      filterWrapper.scrollBy({ left: 200, behavior: "smooth" });
    });
  }

  // Detect swipe gestures for touch devices
  let isDown = false;
  let startX;
  let scrollLeft;

  filterWrapper?.addEventListener("mousedown", (e) => {
    isDown = true;
    filterWrapper.classList.add("active");
    startX = e.pageX - filterWrapper.offsetLeft;
    scrollLeft = filterWrapper.scrollLeft;
  });

  filterWrapper?.addEventListener("mouseleave", () => {
    isDown = false;
    filterWrapper.classList.remove("active");
  });

  filterWrapper?.addEventListener("mouseup", () => {
    isDown = false;
    filterWrapper.classList.remove("active");
  });

  filterWrapper?.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - filterWrapper.offsetLeft;
    const walk = (x - startX) * 3; // Increase scroll speed
    filterWrapper.scrollLeft = scrollLeft - walk;
  });

  filterWrapper?.addEventListener("scroll", updateScrollIcons);

  // Initialize scroll icons visibility
  updateScrollIcons();

  //Toggle style for selected item
  document.addEventListener("DOMContentLoaded", () => {
    const selectedItems = document.querySelectorAll(".selected-item");

    selectedItems.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("selected");
      });
    });
  });

  const renderProducts = (products) => {
    console.log("renderProducts", products);
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

    let categoryIds = [];
    let categoryName = [];
    let categoryMap = {};

    filters.forEach((filter, i) => {
      const items = filterItems.filter(
        (item) => item.dataset.filterType === filter.type
      );

      filter.items = items;
      const categoryTopBars = [...node.querySelectorAll(".selected-item")];

      // find url parameters
      const findUrlFilterParams = (params) => {
        const paramArray = decodeURIComponent(params).split("|");

        hasFilters = true;

        ctx.hydrate({ hasFilters });

        paramArray.forEach((param) => {
          if (param != "") {
            const filterItem = filter.items.find(
              (item) => item.dataset.filterId === param
            );

            filterItem.classList.add("is--active");

            categoryTopBars.forEach((item) => {
              if (item.dataset.filterId === param) {
                item.click();
              }
            });

            categoryIds.push(param);
            categoryName.push(filterItem.dataset.filterName);
            categoryMap[param] = filterItem.dataset.filterName;
          }
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

        console.log("length", filter.allProducts.length);

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

    //Swiper initializer
    const initializeSwipers = () => {
      document.querySelectorAll(".swiper-container").forEach((container) => {
        new Swiper(container, {
          slidesPerView: 2,
          spaceBetween: 0,
          loop: false,
          speed: 50,
          freeMode: true,
          freeModeMomentumRatio: 0.5,
          touchRatio: 1.5,
          //grabCursor: true,
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
          breakpoints: {
            426: {
              slidesPerView: 2,
            },
          },
          on: {
            slideChange: function () {
              let maxTranslate = this.maxTranslate();
              let currentTranslate = this.translate;

              // Prevent swiper from moving too far
              if (currentTranslate < maxTranslate) {
                this.setTranslate(maxTranslate);
              } else if (currentTranslate > 0) {
                this.setTranslate(0);
              }
            },
          },
        });
      });
    };

    // Import product tags name and id from json file
    const filterJson = document.querySelectorAll("[data-filter-json-name]");
    const filterNameAll = document.querySelectorAll(
      "[data-filter-json-name-all]"
    );

    filterJson.forEach((item) => {
      const filterName = item.dataset.filterName;
      const filterId = item.dataset.filterId;

      categoryName.push(filterName);
      categoryName = [...new Set(categoryName)];
      categoryIds.push(filterId);
      categoryIds = [...new Set(categoryIds)];

      categoryMap[filterId] = filterName;
    });

    const categoryMapAll = {};

    filterNameAll.forEach((item) => {
      const filterName = item.dataset.filterName;
      const filterId = item.dataset.filterId;
      categoryMapAll[filterId] = filterName;
    });

    const isMobileView = window.innerWidth <= 480;

    //Categorized filtering
    const categorizedProducts = (products) => {
      let categorizedHTML = "";

      console.log({ categoryIds });
      categoryIds.forEach((category) => {
        const showCategory = categoryMap[category];

        const filteredProducts = products.filter((product) =>
          product.tags.includes(category)
        );

        if (filteredProducts.length > 0) {
          if (!isMobileView) {
            categorizedHTML += `
              <h2 class="font-bold text-3xl pl-4 capitalize" style="padding-bottom: 36px; text-wrap: nowrap;">${showCategory}</h2>
              <div class="candyItems candyFiltered">
                ${renderProducts(filteredProducts)}
              </div>
            `;
          } else {
            categorizedHTML += `
              <h2 class="font-bold text-3xl pl-4 capitalize" style="padding-bottom: 36px; text-wrap: nowrap;">${showCategory}</h2>
              <div class="candyFiltered swiper-container">
                <div class="swiper-wrapper">
                  ${filteredProducts
                    .map(
                      (product) => `
                    <div class="swiper-slide" style="width: auto;">
                      ${renderProducts([product])}
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `;
          }
        }
      });

      const uncategorizedProducts = products.filter(
        (product) => !product.tags.some((tag) => categoryIds.includes(tag))
      );

      if (uncategorizedProducts.length > 0) {
        if (!isMobileView) {
          categorizedHTML += `
            <h2 class="font-bold text-3xl pl-4 capitalize" style="padding-bottom: 36px; text-wrap: nowrap;">Other</h2>
            <div class="candyItems candyFiltered">
            ${renderProducts(uncategorizedProducts)}
            </div>
          `;
        } else {
          categorizedHTML += `
            <h2 class="font-bold text-3xl pl-4 capitalize" style="padding-bottom: 36px; text-wrap: nowrap;">Other</h2>
            <div class="candyFiltered swiper-container">
              <div class="swiper-wrapper">
                ${uncategorizedProducts
                  .map(
                    (product) => `
                  <div class="swiper-slide" style="width: auto;">
                    ${renderProducts([product])}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `;
        }
      }
      return categorizedHTML;
    };

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

      const currentPath = window.location.pathname;
      if (currentPath === "/collections/bland-selv-slik") {
        const isAnyFilterActive = allFilters.some(
          (filter) => filter.activeTypes.length > 0
        );

        if (isAnyFilterActive) {
          const filteredProducts = allFilters[0]?.activeTypes
            .map((title) => {
              const showTitle = categoryMapAll[title];

              let filteredProductsHTML = "";
              const filteredItems = unique.filter((item) =>
                item.tags.includes(title)
              );
              if (filteredItems.length > 0) {
                if (!isMobileView) {
                  filteredProductsHTML += `
                  <h2 class="font-bold text-3xl pl-4 capitalize" style="padding-bottom: 36px; text-wrap: nowrap;">${showTitle}</h2>
                  <div class="candyItems candyFiltered">
                  ${renderProducts(filteredItems)}
                  </div>
                `;
                } else {
                  filteredProductsHTML += `
                  <h2 class="font-bold text-3xl pl-4 capitalize" style="padding-bottom: 36px; text-wrap: nowrap;">${showTitle}</h2>
                  <div class="candyFiltered swiper-container">
                    <div class="swiper-wrapper">
                    ${filteredItems
                      .map(
                        (product) => `
                      <div class="swiper-slide">
                        ${renderProducts([product])}
                      </div>
                    `
                      )
                      .join("")}
                    </div>
                  </div>
                `;
                }
              }

              return filteredProductsHTML;
            })
            .join("");

          productListElem.innerHTML = filteredProducts;
          if (isMobileView) initializeSwipers();
        } else {
          productListElem.innerHTML = categorizedProducts(state.allProducts);
          if (isMobileView) initializeSwipers();
        }
      } else {
        productListElem.innerHTML = renderProducts(state.allProducts);
      }

      //if (isMobileView) initializeSwipers();
      addToCardEventListeners();
    });

    filterItems.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("is--active");
        ctx.emit("filter:start");
      });
    });

    console.log("state", state);

    // if (state.hasFilters) ctx.emit("filter:start");
    // else productListElem.innerHTML = renderProducts(state.allProducts);

    if (state.hasFilters) {
      console.log("has filters");
      ctx.emit("filter:start");
    } else {
      // Check the current path
      const currentPath = window.location.pathname;

      if (currentPath === "/collections/bland-selv-slik") {
        productListElem.innerHTML = categorizedProducts(state.allProducts);
        if (isMobileView) initializeSwipers();
      } else {
        productListElem.innerHTML = renderProducts(state.allProducts);
      }
    }

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
      if (filterSearchError && filterSearchError.style) {
        filterSearchError.style.padding = "10px";
        filterSearchError.innerHTML = "Product not found!";
      }
    }

    deleteUrlParams("product");
    ctx.emit("filter:start", { allProducts: allProducts });
  }

  if (!(currentPath === "/collections/bland-selv-slik")) {
    filterSearch.addEventListener("keydown", (e) => {
      if (filterSearchError && filterSearchError.style) {
        filterSearchError.style.padding = "0";
        filterSearchError.innerHTML = "";
      }
      if (e.key === "Enter") {
        performSearch();
      }
    });

    if (filterSearchIcon)
      filterSearchIcon.addEventListener("click", performSearch);
  }
});

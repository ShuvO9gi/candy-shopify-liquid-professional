import { component } from 'picoapp'
import { getDuplicateProducts } from '../utils/arrays'
import { setUrlParams } from '../utils/urls'
import { formatMoney } from '../utils/currency'
import closeIcon from '../components/closeIcon'

export default component((node, ctx) => {
  /**
   * Fetch products
   */
   const { handle, totalProducts, paginate } = JSON.parse(node.querySelector('[data-config]').dataset.config)
   const loops = Math.ceil(totalProducts / 1000)
   const productListElem = node.querySelector('[data-product-list]')
   const loadMoreBtn = node.querySelector('[data-load-more]')
 
   let { currentPage } = JSON.parse(node.querySelector('[data-config]').dataset.config)
   let currentOffset = paginate * currentPage
 
   const fetchProducts = async () => {
     let i = 0
     let fetchedProducts = []
 
     do {
       const response = await fetch(`/collections/${handle}?page=${i}&view=data`).then(r => r.json())
       fetchedProducts = [...fetchedProducts, ...response]
       i ++
     } while (i < loops)
 
     ctx.emit('products:fetched', ({ allProducts: fetchedProducts }))
   }
   fetchProducts()

   /**
   * Create productc item
   */
  const createCollectionItem = (product) => {
    const { title, images, variants, price, compare_at_price, description, handle } = product
    const imgUrl = images[0]
    const id = variants[0].id
    const url = `/products/${handle}`
    const onSale = compare_at_price > price ? true : false

    return `
      <li class="flex w-1/2 pt-5 pl-5 md:w-1/3 lg:w-1/4">
        <div class="product-card relative w-full h-full">
          <a class="absolute top-0 left-0 w-full h-full z-20" href="${url}"></a>
          <div class="product-card__inner flex flex-col relative h-full pr-3 sm:pr-5  pb-3 sm:pb-5 pl-3 sm:pl-5" data-item-inner>
            <img class="relative w-11/12 mt-0 mb-5 mx-auto z-10" src="${imgUrl}" alt="${title}">

            <p class="product-card--title text-center mt-0 mb-2 font-subheading font-semibold">${title}</p>
            ${onSale ? '<div class="flex item-center justify-center"><p class="mb-5 text-center font-body font-normal">'+ formatMoney(price) +'</p> <p class="old-price ml-2 line-through text-grey">'+ formatMoney(compare_at_price) +'</p></div>' : '<p class="mb-5 text-center font-body font-normal">'+ formatMoney(price) +'</p>'}

            <div class="product-card__btn-wrapper relative h-10 mt-auto">
              <button class="btn relative z-10 w-full h-full" type="button" data-add-to-bag data-id="${id}" data-price="${price}" data-title="${title}" data-image="${imgUrl}"><span>${theme.strings.seeProduct}</span></button>
            </div>
          </div>
        </div>
        <div class="product-card__info fixed top-0 left-0 w-full h-screen flex items-center justify-center z-50">
          <div class="product-card__info__inner max-w-xl relative p-9 rounded-md bg-white shadow-custom">
            <div class="product-card__info__wrapper">
              <div class="absolute top-4 right-4 cursor-pointer" data-close-info>${closeIcon()}</div>
              ${description !== '' ? description : ''}
            </div>
          </div>
        </div>
      </li> 
    `
  }

  const renderProducts = (products) => {
    const productsToRender = products.slice(0, currentOffset)

    if (ctx.getState().allProducts.length > currentOffset) loadMoreBtn.style.display = 'block'
    else loadMoreBtn.style.display = 'none'

    return productsToRender.length > 0
      ? productsToRender.reduce((markup, product) => {
          markup += createCollectionItem(product);
          return markup;
      }, '') : `<p>Ingen produkter</p>`;
  }

  ctx.on('products:fetched', state => {
    /**
    * Create filter objects for each filter (eg 'type' and 'tags')
    */
   const filterItems = [...node.querySelectorAll('[data-filter-item]')]

   const getAllFilterTypes = filterItems.map(item => item.dataset.filterType)
   const getUniqueFilterTypes = [... new Set(getAllFilterTypes)]
   const filters = []
   
   getUniqueFilterTypes.forEach(filterType => {
     const filterObj = {
       type: filterType
     }

     filters.push(filterObj)
   })

   /**
    * Loop through filter objects
    */
   const allFilters = []
   let hasFilters = false

   filters.forEach((filter, i) => {
     const items = filterItems.filter(item => item.dataset.filterType === filter.type)

     filter.items = items

     // find url parameters
     const findUrlFilterParams = (params) => {
         const paramArray = decodeURIComponent(params).split('|')
         
         hasFilters = true

         ctx.hydrate({ hasFilters })

         paramArray.forEach(param => {
             if (param != "") filter.items.find(item => item.dataset.filterId === param).classList.add('is--active')
         })
     }

     const urlParams = new URLSearchParams(location.search)
       
     for (const entry of urlParams.entries()) {
       if (filter.type == entry[0] && entry[1] != "") {
         findUrlFilterParams(entry[1])
       }
     }

     ctx.on('filter:start', state => {
         const activeItems = items.filter(item => item.classList.contains('is--active'))
         const activeTypes = activeItems.map(i => i.dataset.filterId)

         filter.activeItems = activeItems
         filter.activeTypes = activeTypes
         filter.allProducts = state.allProducts
         
         filter.filteredItems = activeItems.length > 0 ? filter.allProducts.filter(product => {
           if (activeTypes.filter(type => product[filter.type].includes(type)).length > 0) return product
         }) : filter.allProducts

         if (allFilters.find(a => a.type === filter.type)) {
             allFilters[allFilters.findIndex(a => a.type === filter.type)] = filter  
         } else {
             allFilters.push(filter)
         }

         if (i === (filters.length - 1)) {
           ctx.emit('products:filtered', ({ allFilters: allFilters, hasFilters: true }))
         }
     })
   })

   ctx.on('products:filtered', state => {
     let renderThese = []
     const { allFilters } = state

     allFilters.forEach(filter => {
       const { filteredItems } = filter
       renderThese = [...renderThese, ...filteredItems]
       setUrlParams([{ name: filter.type, value: filter.activeTypes.join('|') }])
     })

     renderThese = getDuplicateProducts([...renderThese], allFilters.length)
     let unique = [... new Set(renderThese)]

     ctx.emit('products:ready', ({ renderThese: unique }))
     
     productListElem.innerHTML = renderProducts(unique)
   })

   filterItems.forEach(item => {
     item.addEventListener('click', () => {
       item.classList.toggle('is--active')
       ctx.emit('filter:start')
     })
   })

   if (state.hasFilters) ctx.emit('filter:start')
   else productListElem.innerHTML = renderProducts(state.allProducts)

   loadMoreBtn.addEventListener('click', e => {
      e.preventDefault()

      currentPage ++
      currentOffset = paginate * currentPage
      ctx.emit('filter:start')
      setUrlParams([{ name: 'page', value: currentPage }])
    })
  })

  /**
   * Toggle filter on mobile
   */
  const filterDrawer = node.querySelector('[data-filter-drawer]')
  const filterButton = node.querySelector('[data-filter-button]')
  const closeFilterButton = node.querySelector('[data-filter-close]')

  filterButton.addEventListener('click', e => {
    e.preventDefault()
    filterDrawer.classList.add('is--open')
  })

  closeFilterButton.addEventListener('click', e => {
    e.preventDefault()
    filterDrawer.classList.remove('is--open')
  })
})
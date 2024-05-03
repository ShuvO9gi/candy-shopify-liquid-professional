export function getDuplicates(array){
  var map = new Map();
  array.forEach(a => map.set(a, (map.get(a) || 0) + 1))
  return array.filter(a => map.get(a) > 1)
}

export function getDuplicateProducts(array, integer){
  return array.filter( p => {
    const duplicates = array.filter( d => d.id === p.id )
    if( duplicates.length === integer ) return p 
  })
}

export function sortArray (array, order, key) {

  array.sort( function (a, b) {
    var A = a[key], B = b[key]
    
    if (order.indexOf(A) > order.indexOf(B)) {
      return 1
    } else {
      return -1
    }
  })
  
  return array
}

export function getUnique(array){
  return array.filter((item, pos) => array.indexOf(item) === pos)
}
export function setUrlParams(parameters) {
  let url = new URL(window.location.href);
  let params = new URLSearchParams(url.search.slice(1));

  parameters.forEach(({ name, value }) => {
    if (value != "") params.set(name, encodeURIComponent(value));
    else params.delete(name);
  });

  //window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)

  // If no parameters are left, remove the '?'
  const newSearch = params.toString();
  if (newSearch) {
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newSearch}`
    );
  } else {
    window.history.replaceState({}, "", url.pathname);
  }
}

export function deleteUrlParams(paramName) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  params.delete(paramName);
  // url.search = params.toString();
  // window.history.replaceState(null, null, url.href);

  const newSearch = params.toString();
}

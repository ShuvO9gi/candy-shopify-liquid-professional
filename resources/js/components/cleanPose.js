import { component } from "picoapp";
import setToLocalStorage from "./setToLocaleStorage";

export default component((node, ctx) => {
  node.addEventListener("click", (e) => {
    // e.preventDefault();
    // console.log('click on me')
    setToLocalStorage(null, []);
    //ctx.emit("products:refetch");

    const currentPath = window.location.pathname;
    if (!(currentPath === "/collections/bland-selv-slik"))
      ctx.emit("products:refetch");
  });
});

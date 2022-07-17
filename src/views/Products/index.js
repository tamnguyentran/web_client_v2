import React, { lazy } from "react";
// import './style.css'
import { Switch, Route, Redirect, useParams } from "react-router-dom";

const ProductGroup = lazy(() => import("./ProductGroup"));
const Product = lazy(() => import("./Product"));
const ProductAdd = lazy(() => import("./ProductAdd"));

function Child() {
  let { link } = useParams();
  console.log("link-", link);
  switch (link) {
    case "product-group":
      return <ProductGroup />;
    case "product":
      return <Product />;
    case "add-product":
      return <ProductAdd />;
    default:
      break;
  }
}

const Products = () => {
  return (
    <>
      <Switch>
        <Route path="/page/products/:link" children={<Child />} />
        <Redirect
          to={{ pathname: "./products/product", state: { from: "/" } }}
        />
      </Switch>
    </>
  );
};

export default Products;

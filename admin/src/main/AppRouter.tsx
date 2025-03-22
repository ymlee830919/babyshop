import { createBrowserRouter } from "react-router-dom";

import NotFound from "./NotFound";
import Layout from "./Layout";

import Home from "../pages/Home";
import ProductsGrid from "../pages/ProductsGrid";
import NewProduct from "../pages/products/NewProduct";
import EditProduct from "../pages/products/EditProduct";
import AccountsGrid from "../pages/AccountsGrid";
import Categories from "../pages/Categories";
import ProductVariantsGrid from "../pages/ProductVariantsGrid";
import NewVariant from "../pages/variants/NewVariant";
import EditVariant from "../pages/variants/EditVariant";
import ProductInfo from "../pages/products/ProductInfo";
import NewSet from "../pages/products/NewSet";
import EditSet from "../pages/products/EditSet";
import ReviewLinks from "../pages/ReviewLinks";

const AppRouter = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		errorElement: <NotFound />,
		children: [
			{
				index: true,
				element: <Home />,
				errorElement: <NotFound />,
			},
			{
				path: "/accounts",
				element: <AccountsGrid />,
			},
			{
				path: "/categories",
				element: <Categories />,
			},
			{
				path: "/products",
				element: <ProductsGrid />,
			},
			{
				path: "/products/new",
				element: <NewProduct />,
			},
			{
				path: "/products/new-set",
				element: <NewSet />,
			},
			{
				path: "/products/:id/edit",
				element: <EditProduct />,
			},
			{
				path: "/products/:id/edit-set",
				element: <EditSet />,
			},
			{
				path: "/products/:productId",
				element: <ProductInfo />,
			},
			{
				path: "/products/:productId/variants",
				element: <ProductVariantsGrid />,
			},
			{
				path: "/products/:productId/variants/new",
				element: <NewVariant />,
			},
			{
				path: "/products/:productId/variants/:variantId/edit",
				element: <EditVariant />,
			},
			{
				path: "/links",
				element: <ReviewLinks />,
			},
		],
	},
]);

export default AppRouter;
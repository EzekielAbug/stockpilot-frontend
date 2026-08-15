import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Register from './Register.jsx'
import Dashboard from './Dashboard.jsx'
import './index.css'
import Products from './Products.jsx'
import AddProduct from './AddProduct.jsx'
import EditProduct from './EditProduct.jsx'
import Warehouses from './Warehouses.jsx'
import Inventory from './Inventory.jsx'
import Orders from './Orders.jsx'
import Suppliers from './Suppliers.jsx'
import Customers from './Customers.jsx'
import PurchaseOrders from './PurchaseOrders.jsx'
import LandingPage from './LandingPage.jsx'
import Layout from './Layout.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (No Sidebar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<Register />} />

        {/* AUTHENTICATED ROUTES (With Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/purchases" element={<PurchaseOrders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/customers" element={<Customers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { formatPrice } from "@/utils/numberFormat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddCustomerModal } from "@/components/modals/AddCustomerModal";
import { EditCustomerModal } from "@/components/modals/EditCustomerModal";
import { type z } from "zod";
import { type customerSchema } from "@/server/db/schema";
import { type productSchema } from "@/server/db/schema";

export default function CashierDashboard() {
  const router = useRouter();

  const { data: products, refetch } = api.products.fetchAll.useQuery(undefined, {
    retry: false
  });

  const user = api.session.read.useQuery(undefined, {
    retry: false
  });

  useEffect(() => {
    if (user.error || user.isError) {
      router.push("/login");
    }
    else if (user.isLoading) {
      return;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [addedProducts, setAddedProducts] = useState<Array<z.infer<typeof productSchema.select> & { quantity: number }>>([]);
  const [payment, setPayment] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<z.infer<typeof customerSchema.select> | null>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);

  const handleAddProduct = (productId: number) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const currentStock = Number(product.stock);
      const existingProduct = addedProducts.find(p => p.id === productId);

      // If product already exists, check if adding one more would exceed stock
      if (existingProduct) {
        if (existingProduct.quantity >= currentStock) {
          toast.error(`Not enough stock available. Current stock: ${currentStock}`);
          return;
        }
        setAddedProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      }
      else {
        // For new products, check if there's any stock available
        if (currentStock <= 0) {
          toast.error("Product is out of stock!");
          return;
        }
        setAddedProducts(prevProducts => [...prevProducts, { ...product, quantity: 1 }]);
      }
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setAddedProducts(prevProducts =>
      prevProducts.filter(product => product.id !== productId)
    );
  };

  const handleDecreaseQuantity = (productId: number) => {
    setAddedProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId
          ? { ...p, quantity: p.quantity > 1 ? p.quantity - 1 : 1 }
          : p
      )
    );
  };

  const handleClearCart = () => {
    if (addedProducts.length === 0) {
      toast.error("Cart is already empty");
      return;
    }
    setAddedProducts([]);
    setPayment("");
    toast.success("Cart cleared");
  };

  const handleLogout = api.session.remove.useMutation({
    onSuccess: () => {
      router.push("/login");
      toast.success("Logout successful");
    }
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customers = api.customers.fetchAll.useQuery(undefined, {
    retry: false
  });

  const handleAddCustomerSuccess = async () => {
    await customers.refetch();
  };

  const total = addedProducts.reduce((sum, product) => {
    return sum + (Number(product.price) * product.quantity);
  }, 0);

  const cashback = payment ? Number(payment) - total : 0;

  const sortedProducts = filteredProducts?.reduce<{
    inStock: typeof filteredProducts
    outOfStock: typeof filteredProducts
  }>(
    (acc, product) => {
      const stock = Number(product.stock);
      if (stock > 0) {
        acc.inStock.push(product);
      }
      else {
        acc.outOfStock.push(product);
      }
      return acc;
    },
    { inStock: [], outOfStock: [] }
  );

  const filteredCustomers = customers.data?.filter(customer =>
    customer.name?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const createSale = api.sales.create.useMutation({
    onSuccess: async () => {
      toast.success("Payment completed successfully");
      setAddedProducts([]);
      setPayment("");
      setSelectedCustomer(null);
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleCompletePayment = () => {
    if (!user.data?.id) {
      toast.error("Cashier data not found");
      return;
    }

    const saleDetails = addedProducts.map(product => ({
      productId: product.id,
      quantity: product.quantity.toString(),
      price: product.price ?? "0"
    }));

    createSale.mutate({
      data: {
        sale: {
          totalPrice: total.toString(),
          userId: user.data.id,
          customerId: selectedCustomer?.id
        },
        saleDetails: saleDetails
      }
    });
  };

  const handleCustomerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab") && filteredCustomers?.length === 1 && !selectedCustomer) {
      const customer = filteredCustomers[0];
      setSelectedCustomer({
        id: customer!.id,
        name: customer!.name,
        createdAt: customer!.createdAt,
        updatedAt: customer!.updatedAt,
        phone: customer!.phone,
        address: customer!.address
      });
      setCustomerSearch("");
    }
  };

  return (
    <div className="fixed inset-0 flex w-screen h-screen overflow-hidden bg-gray-100">
      <div className="w-[70%] flex flex-col bg-white shadow-lg">
        <div className="bg-white z-20 p-6 pb-4 shadow-sm">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Product Catalog</h1>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <div className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-w-0">
              {sortedProducts?.inStock.map(product => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-4">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h2 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h2>
                      <p className="text-base sm:text-lg font-bold text-blue-600 break-all">
                        Rp.
                        {" "}
                        {formatPrice(Number(product.price))}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product.id)}
                      className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}

              {(sortedProducts?.outOfStock.length ?? 0) > 0 && (
                <>
                  <div className="col-span-full mt-8 mb-4">
                    <div className="flex items-center gap-4">
                      <hr className="flex-1 border-gray-200" />
                      <span className="text-gray-500 text-sm font-medium">Out of Stock</span>
                      <hr className="flex-1 border-gray-200" />
                    </div>
                  </div>

                  {sortedProducts?.outOfStock.map(product => (
                    <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h2 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h2>
                          <p className="text-base sm:text-lg font-bold text-blue-600 break-all">
                            Rp.
                            {" "}
                            {formatPrice(Number(product.price))}
                          </p>
                        </div>
                        <button
                          disabled
                          className="mt-4 w-full py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
          <div className="flex gap-6 items-center">
            <div className="w-1/4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-600">Cashier:</h2>
                  <p className="font-semibold text-gray-800">{user.data?.name}</p>
                </div>
                <button
                  onClick={() => handleLogout.mutate()}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="w-3/4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-gray-600">Customer</h2>
                <div className="flex gap-2">
                  {selectedCustomer && (
                    <button
                      onClick={() => setIsEditCustomerModalOpen(true)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <span>✎</span>
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>Add Customer</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                {customerSearch && !selectedCustomer && (
                  <div className="absolute bottom-full left-0 right-0 z-50 w-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filteredCustomers?.length === 0
                      ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No customers found
                          </div>
                        )
                      : (
                          filteredCustomers?.map(customer => (
                            <button
                              key={customer.id}
                              onClick={() => {
                                setSelectedCustomer({
                                  id: customer.id,
                                  name: customer.name,
                                  createdAt: customer.createdAt,
                                  updatedAt: customer.updatedAt,
                                  phone: customer.phone,
                                  address: customer.address
                                });
                                setCustomerSearch("");
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              {customer.name}
                            </button>
                          ))
                        )}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={selectedCustomer ? selectedCustomer.name : customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomer(null);
                    }}
                    onKeyDown={handleCustomerKeyDown}
                    placeholder="Search customer..."
                    className="w-full p-2 pr-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {selectedCustomer && (
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[30%] min-w-[300px] flex flex-col bg-white border-l border-gray-200 shadow-lg">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
          <button
            onClick={handleClearCart}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Clear Cart
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[330px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 text-gray-600 w-[35%]">Product</th>
                <th className="border-b border-gray-200 px-3 py-2 text-gray-600 w-[35%]">Price</th>
                <th className="border-b border-gray-200 px-3 py-2 text-gray-600 text-center w-[10%]">Qty</th>
                <th className="border-b border-gray-200 px-3 py-2 text-gray-600 w-[20%]"></th>
              </tr>
            </thead>
            <tbody>
              {addedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border-b border-gray-200 px-3 py-2 text-gray-800">{product.name}</td>
                  <td className="border-b border-gray-200 px-3 py-2 text-gray-800 text-sm">
                    Rp.
                    {" "}
                    {formatPrice(Number(product.price))}
                  </td>
                  <td className="border-b border-gray-200 px-3 py-2 text-center text-gray-800">{product.quantity}</td>
                  <td className="border-b border-gray-200 px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDecreaseQuantity(product.id)}
                        className="w-7 h-7 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAddProduct(product.id)}
                        className="w-7 h-7 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="w-7 h-7 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total:</span>
              <span className="font-bold text-lg text-gray-800">
                Rp.
                {" "}
                {formatPrice(total)}
              </span>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Payment Amount
              </label>
              <input
                type="number"
                value={payment}
                onChange={e => setPayment(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter payment amount"
              />
            </div>
            {payment && (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-gray-600">Cashback:</span>
                <span className={`font-bold ${cashback >= 0 ? "text-green-600" : "text-red-600"}`}>
                  Rp.
                  {" "}
                  {formatPrice(Math.abs(cashback))}
                </span>
              </div>
            )}
            <button
              disabled={!payment || Number(payment) < total || createSale.status === "pending"}
              onClick={handleCompletePayment}
              className="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {createSale.status === "pending" ? "Processing..." : "Complete Payment"}
            </button>
          </div>
        </div>
      </div>
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
      {selectedCustomer && (
        <EditCustomerModal
          isOpen={isEditCustomerModalOpen}
          onClose={() => setIsEditCustomerModalOpen(false)}
          onSuccess={handleAddCustomerSuccess}
          customerId={selectedCustomer.id}
          initialData={{
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            address: selectedCustomer.address
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

import Link from "next/link";

import PasswordChangeModal from "@/app/components/password-change-modal";

import OrderDetailsModal from "@/app/components/order-details-modal";

import ProductReviewModal from "@/app/components/product-review-modal";

import {
  Loader,
  ChartLine,
  UserRoundKey,
  UserRoundMinus,
  UserRoundX,
  Eye,
  Star,
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [user, setUser] = useState<any>(null);

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [orders, setOrders] = useState<any[]>([]);

  const [order, setOrder] = useState<any>(null);

  const [ratings, setRatings] = useState<any>({});

  const [comments, setComments] = useState<any>({});

  const [passwordChangeModal, setPasswordChangeModal] = useState(false);

  const [orderDetailsModal, setOrderDetailsModal] = useState(false);

  const [productReviewModal, setProductReviewModal] = useState(false);

  async function fetchAccount() {
    setLoading(true);

    try {
      const response = await fetch("/api/account");

      if (!response.ok) {
        router.replace("/sign-up");

        return;
      }

      const data = await response.json();

      setUser(data.user);

      setOrders(data.orders);
    } catch {
      setError(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchAccount();
  }, []);

  function openPasswordChangeModal() {
    setPasswordChangeModal(true);
  }

  function closePasswordChangeModal() {
    setPassword("");

    setConfirmPassword("");

    setPasswordChangeModal(false);
  }

  function openOrderDetailsModal(order: any) {
    setOrder(order);

    setOrderDetailsModal(true);
  }

  function closeOrderDetailsModal() {
    setOrder(null);

    setOrderDetailsModal(false);
  }

  function openProductReviewModal(order: any) {
    setOrder(order);

    setProductReviewModal(true);
  }

  function closeProductReviewModal() {
    setOrder(null);

    setRatings({});

    setComments({});

    setProductReviewModal(false);
  }

  async function changePassword(event: any) {
    event.preventDefault();

    if (password.length < 8) {
      alert("Password Must Be At Least Eight Characters Long");

      return;
    }

    if (!/[a-z]/.test(password)) {
      alert("Password Must Have At Least One Lowercase Letter");

      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Password Must Have At Least One Uppercase Letter");

      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Password Must Have At Least One Number");

      return;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      alert("Password Must Have At Least One Special Symbol");

      return;
    }

    if (/\s/.test(password)) {
      alert("Password Can't Contain Spaces");

      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords Don't Match");

      return;
    }

    const response = await fetch("/api/account", {
      method: "PATCH",
      body: JSON.stringify({ password: password }),
    });

    if (!response.ok) {
      alert("Failed To Change Password");

      return;
    }

    closePasswordChangeModal();

    alert("Password Changed Successfully");
  }

  async function deleteAccount() {
    if (!confirm("Are You Sure You Want To Delete Your Account?")) {
      return;
    }

    const response = await fetch("/api/account", {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed To Delete Account");

      return;
    }

    alert("Account Deleted Successfully");

    await fetch("/api/sign-out", {
      method: "POST",
    });

    router.push("/");
  }

  async function signOut() {
    const response = await fetch("/api/sign-out", {
      method: "POST",
    });

    if (!response.ok) {
      alert("Failed To Sign Out");

      return;
    }

    router.push("/");
  }

  async function reviewProduct(event: any, items: any[]) {
    event.preventDefault();

    const selected = items.some((item: any) => ratings[item.product]);

    if (!selected) {
      alert("Please Rate At Least One Product");

      return;
    }

    for (const item of items) {
      if (!ratings[item.product]) {
        continue;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          product: item.product,
          rating: ratings[item.product],
          comment: comments[item.product],
        }),
      });

      if (!response.ok) {
        alert("Failed To Create Review");

        return;
      }
    }

    closeProductReviewModal();

    alert(
      items.filter((item: any) => ratings[item.product]).length === 1
        ? "Review Submitted Successfully"
        : "Reviews Submitted Successfully",
    );
  }

  function setRating(product: string, rating: number) {
    setRatings((ratings: any) => ({
      ...ratings,
      [product]: rating,
    }));
  }

  function setComment(product: string, comment: string) {
    setComments((comments: any) => ({
      ...comments,
      [product]: comment,
    }));
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-1">
        <Loader className="h-4 w-4 animate-spin" />

        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Failed To Load Page
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0d0d0d] text-xl font-bold">
          {user.name.charAt(0)}
        </div>

        <div>
          <div className="font-bold whitespace-nowrap">{user.name}</div>

          <div>{user.email}</div>
        </div>
      </div>

      <div className="flex items-start gap-4">
        {user.admin && (
          <Link
            href="/admin/dashboard"
            className="flex cursor-pointer flex-wrap items-center justify-center gap-1 text-center focus:outline-none"
          >
            <ChartLine className="h-4 w-4" />

            <div>Admin Dashboard</div>
          </Link>
        )}

        {user.admin && <div className="w-px self-stretch bg-[#1a1a1a]" />}

        <button
          onClick={openPasswordChangeModal}
          className="flex cursor-pointer flex-wrap items-center justify-center gap-1 focus:outline-none"
        >
          <UserRoundKey className="h-4 w-4" />

          <div>Change Password</div>
        </button>

        <div className="w-px self-stretch bg-[#1a1a1a]" />

        <button
          onClick={deleteAccount}
          className="flex cursor-pointer flex-wrap items-center justify-center gap-1 focus:outline-none"
        >
          <UserRoundMinus className="h-4 w-4" />

          <div>Delete Account</div>
        </button>

        <div className="w-px self-stretch bg-[#1a1a1a]" />

        <button
          onClick={signOut}
          className="flex cursor-pointer flex-wrap items-center justify-center gap-1 focus:outline-none"
        >
          <UserRoundX className="h-4 w-4" />

          <div>Sign Out</div>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">No Orders</div>
      ) : (
        <div className="overflow-x-auto border border-[#1a1a1a] bg-[#0d0d0d]">
          <table className="w-full">
            <thead className="border-b border-[#1a1a1a]">
              <tr>
                <th className="p-4">№</th>

                <th className="p-4">Status</th>

                <th className="p-4">Tracking</th>

                <th className="p-4">Carrier</th>

                <th className="p-4">Delivery</th>

                <th className="p-4">Payment</th>

                <th className="p-4">Quantity</th>

                <th className="p-4">Total</th>

                <th className="p-4">Created</th>

                <th className="p-4">Updated</th>

                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1a1a1a]">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-4 text-center">{order.number}</td>

                  <td className="p-4 text-center">{order.status}</td>

                  <td className="p-4 text-center">{order.tracking || "-"}</td>

                  <td className="p-4 text-center whitespace-nowrap">
                    {order.carrier}
                  </td>

                  <td className="p-4 text-center">{order.delivery}</td>

                  <td className="p-4 text-center">{order.payment}</td>

                  <td className="p-4 text-center">{order.quantity}</td>

                  <td className="p-4 text-center whitespace-nowrap">
                    <div>
                      {order.total.toFixed(2)} {order.currency}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(order.created).toLocaleDateString()}</div>

                    <div>{new Date(order.created).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4 text-center">
                    <div>{new Date(order.updated).toLocaleDateString()}</div>

                    <div>{new Date(order.updated).toLocaleTimeString()}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => openOrderDetailsModal(order)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openProductReviewModal(order)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PasswordChangeModal
        passwordChangeModal={passwordChangeModal}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        changePassword={changePassword}
        closePasswordChangeModal={closePasswordChangeModal}
      />

      <OrderDetailsModal
        orderDetailsModal={orderDetailsModal}
        order={order}
        closeOrderDetailsModal={closeOrderDetailsModal}
      />

      <ProductReviewModal
        productReviewModal={productReviewModal}
        order={order}
        ratings={ratings}
        setRating={setRating}
        comments={comments}
        setComment={setComment}
        reviewProduct={reviewProduct}
        closeProductReviewModal={closeProductReviewModal}
      />
    </div>
  );
}

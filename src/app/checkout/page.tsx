"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Apple,
  Check,
  CreditCard,
  Fingerprint,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders, type Order, type ShipMethod } from "@/store/orders";
import { useAddresses } from "@/store/addresses";
import { usePayments, type CardBrand } from "@/store/payments";
import {
  cardDigits,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  isFutureExpiry,
  isValidCardNumber,
  parseExpiry,
} from "@/lib/card";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";

const steps = ["Address", "Shipping", "Payment", "Review"] as const;

type Address = {
  first: string;
  last: string;
  email: string;
  address: string;
  city: string;
  postal: string;
  country: string;
};

const emptyAddress: Address = {
  first: "",
  last: "",
  email: "",
  address: "",
  city: "",
  postal: "",
  country: "",
};

type PayField = "number" | "holder" | "expiry" | "cvc" | "paypal" | "upi";

const UPI_PATTERN = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

function brandLabel(brand: CardBrand) {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pm, setPm] = useState<"card" | "paypal" | "apple" | "upi">("card");
  const [ship, setShip] = useState<ShipMethod>("standard");
  const [addr, setAddr] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, boolean>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);

  // Payment step state. The full card number and CVC live only in this
  // component's state and are discarded with it — never persisted.
  const [payErrors, setPayErrors] = useState<Partial<Record<PayField, string>>>(
    {},
  );
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [payWith, setPayWith] = useState("new"); // saved-card id or "new"
  const [saveCard, setSaveCard] = useState(true);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [upiId, setUpiId] = useState("");

  // Persisted-store reads in render must be hydration-gated (SSR mismatch).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const paymentItems = usePayments((s) => s.items);
  const savedCards = hydrated ? paymentItems : [];

  const { lines } = useCart();
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
  const shipping = {
    standard: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING,
    express: 14,
    sameday: 29,
  }[ship];
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (lines.length === 0 && !placedId) router.replace("/cart");
  }, [lines.length, placedId, router]);

  // Prefill from the default saved address once, client-side only
  // (persisted stores are not available during SSR).
  useEffect(() => {
    const def = useAddresses.getState().items.find((i) => i.isDefault);
    if (!def) return;
    setAddr((a) => {
      const untouched = Object.values(a).every((v) => !v.trim());
      if (!untouched) return a;
      return {
        first: def.first,
        last: def.last,
        email: def.email,
        address: def.address,
        city: def.city,
        postal: def.postal,
        country: def.country,
      };
    });
  }, []);

  // Pre-select the default saved card once the payments store hydrates.
  useEffect(() => {
    if (!hydrated) return;
    const def = usePayments.getState().items.find((i) => i.isDefault);
    if (def) setPayWith((cur) => (cur === "new" ? def.id : cur));
  }, [hydrated]);

  // Prefill the PayPal email from the address step once it's available,
  // without overwriting anything the user typed themselves.
  useEffect(() => {
    setPaypalEmail((v) => (v.trim() ? v : addr.email));
  }, [addr.email]);

  const setField =
    (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAddr((a) => ({ ...a, [key]: value }));
      setErrors((er) => ({ ...er, [key]: false }));
    };

  const clearPayError = (k: PayField) =>
    setPayErrors((er) => (er[k] ? { ...er, [k]: undefined } : er));

  const validateAddress = () => {
    const missing: Partial<Record<keyof Address, boolean>> = {};
    (Object.keys(addr) as (keyof Address)[]).forEach((k) => {
      if (!addr[k].trim()) missing[k] = true;
    });
    setErrors(missing);
    return Object.keys(missing).length === 0;
  };

  const validatePayment = () => {
    const e: Partial<Record<PayField, string>> = {};
    if (pm === "card") {
      const usingSaved =
        payWith !== "new" &&
        usePayments.getState().items.some((c) => c.id === payWith);
      if (!usingSaved) {
        if (payWith !== "new") setPayWith("new"); // selected card was removed
        if (!isValidCardNumber(cardDigits(cardNumber)))
          e.number = "Enter a valid card number";
        if (!cardHolder.trim()) e.holder = "This field is required";
        const exp = parseExpiry(cardExpiry);
        if (!exp) e.expiry = "Enter expiry as MM / YY";
        else if (!isFutureExpiry(exp.month, exp.year))
          e.expiry = "This card has expired";
        if (!/^\d{3,4}$/.test(cardCvc)) e.cvc = "Enter the 3–4 digit code";
      }
    } else if (pm === "paypal") {
      if (!/\S+@\S+\.\S+/.test(paypalEmail.trim()))
        e.paypal = "Enter a valid email address";
    } else if (pm === "upi") {
      if (!UPI_PATTERN.test(upiId.trim()))
        e.upi = "Enter a valid UPI ID like name@bank";
    }
    setPayErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep = (s: number) =>
    s === 0 ? validateAddress() : s === 2 ? validatePayment() : true;

  const placeOrder = () => {
    if (submitting) return;
    if (!validateAddress()) {
      setStep(0);
      return;
    }
    if (!validatePayment()) {
      setStep(2);
      return;
    }
    const id = `NX-${Date.now().toString(36).toUpperCase()}`;
    const order: Order = {
      id,
      placedAt: new Date().toISOString(),
      lines: lines.map((l) => ({
        id: String(l.id),
        slug: l.slug,
        name: l.name,
        price: l.price,
        image: l.image,
        quantity: l.quantity,
      })),
      subtotal,
      shipping,
      tax,
      total,
      ship,
      address: { ...addr },
      status: "processing",
    };
    useOrders.getState().addOrder(order);
    const saved = useAddresses.getState().items;
    const alreadySaved = saved.some(
      (s) =>
        s.address.trim().toLowerCase() === addr.address.trim().toLowerCase() &&
        s.postal.trim().toLowerCase() === addr.postal.trim().toLowerCase(),
    );
    if (saved.length === 0 || !alreadySaved) {
      useAddresses.getState().add({ ...addr, label: "Home" });
    }
    // Save the new card if asked to — brand + last4 only, never the full
    // number or CVC, which are discarded with the rest of the form state.
    if (pm === "card" && payWith === "new" && saveCard) {
      const digits = cardDigits(cardNumber);
      const exp = parseExpiry(cardExpiry);
      if (exp) {
        usePayments.getState().add({
          brand: detectBrand(digits),
          last4: digits.slice(-4),
          expMonth: exp.month,
          expYear: exp.year,
          holder: cardHolder.trim(),
        });
      }
    }
    setPlacedId(id);
    setSubmitting(true);
    useCart.getState().clear();
    router.push(`/order/success?o=${id}&ship=${ship}`);
  };

  if (lines.length === 0 && !placedId) {
    return (
      <div className="pt-24 md:pt-32">
        <div className="container">
          <div className="grid place-items-center rounded-3xl border border-border bg-card p-20 text-center backdrop-blur-xl">
            <p className="text-sm text-text-2">
              Your cart is empty — taking you back to your bag…
            </p>
          </div>
        </div>
      </div>
    );
  }

  const shipOptions: {
    id: ShipMethod;
    label: string;
    desc: string;
    price: string;
    hint?: string;
  }[] = [
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? {
          id: "standard",
          label: "Standard",
          desc: "3–5 business days",
          price: "Free",
          hint: `Orders over $${FREE_SHIPPING_THRESHOLD} ship free`,
        }
      : {
          id: "standard",
          label: "Standard",
          desc: "3–5 business days",
          price: `$${STANDARD_SHIPPING}`,
          hint: `Add $${Math.ceil(FREE_SHIPPING_THRESHOLD - subtotal)} more for free delivery`,
        },
    { id: "express", label: "Express", desc: "1–2 business days", price: "$14" },
    { id: "sameday", label: "Same-day", desc: "Within 4 hours", price: "$29" },
  ];

  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">Almost yours</div>
            <h1 className="section-title mt-2">
              Secure <span className="text-gradient-brand">checkout</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-2">
            <Lock size={13} /> Encrypted with bank-grade security
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 backdrop-blur-xl md:p-8">
            <div className="mb-6 flex items-center justify-between gap-2">
              {steps.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  disabled={i > step}
                  onClick={() => {
                    if (i < step) setStep(i);
                  }}
                  className="flex flex-1 items-center gap-2 disabled:cursor-default"
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ring-1 transition ${
                      i <= step
                        ? "bg-gradient-brand text-white ring-white/20"
                        : "bg-card text-text-2 ring-border"
                    }`}
                  >
                    {i < step ? <Check size={13} /> : i + 1}
                  </span>
                  <span
                    className={`text-sm ${i === step ? "text-text" : "text-text-2"}`}
                  >
                    {s}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="flex-1 border-t border-dashed border-border" />
                  )}
                </button>
              ))}
            </div>

            {step === 0 && (
              <FormSection title="Shipping address">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="First name"
                    placeholder="Alex"
                    value={addr.first}
                    onChange={setField("first")}
                    error={errors.first}
                  />
                  <Input
                    label="Last name"
                    placeholder="Vance"
                    value={addr.last}
                    onChange={setField("last")}
                    error={errors.last}
                  />
                  <Input
                    label="Email"
                    placeholder="you@email.com"
                    className="md:col-span-2"
                    value={addr.email}
                    onChange={setField("email")}
                    error={errors.email}
                  />
                  <Input
                    label="Address"
                    placeholder="221B Baker Street"
                    className="md:col-span-2"
                    value={addr.address}
                    onChange={setField("address")}
                    error={errors.address}
                  />
                  <Input
                    label="City"
                    placeholder="London"
                    value={addr.city}
                    onChange={setField("city")}
                    error={errors.city}
                  />
                  <Input
                    label="Postal code"
                    placeholder="NW1 6XE"
                    value={addr.postal}
                    onChange={setField("postal")}
                    error={errors.postal}
                  />
                  <Input
                    label="Country"
                    placeholder="United Kingdom"
                    className="md:col-span-2"
                    value={addr.country}
                    onChange={setField("country")}
                    error={errors.country}
                  />
                </div>
              </FormSection>
            )}

            {step === 1 && (
              <FormSection title="Shipping method">
                {shipOptions.map((o) => (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ship"
                        checked={ship === o.id}
                        onChange={() => setShip(o.id)}
                        className="accent-primary-500"
                      />
                      <Truck size={16} className="text-primary-300" />
                      <div>
                        <div className="text-sm font-medium">{o.label}</div>
                        <div className="text-xs text-text-2">{o.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={
                          o.price === "Free"
                            ? "text-sm font-semibold text-success"
                            : "text-sm font-semibold"
                        }
                      >
                        {o.price}
                      </div>
                      {o.hint && (
                        <div className="mt-0.5 text-[11px] text-text-2">
                          {o.hint}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </FormSection>
            )}

            {step === 2 && (
              <FormSection title="Payment">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { id: "card", Icon: CreditCard, label: "Card" },
                    { id: "paypal", Icon: ShieldCheck, label: "PayPal" },
                    { id: "apple", Icon: Apple, label: "Apple Pay" },
                    { id: "upi", Icon: Smartphone, label: "UPI" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPm(p.id as typeof pm);
                        setPayErrors({});
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        pm === p.id
                          ? "border-primary-400 bg-primary-500/10 ring-2 ring-primary-400/30"
                          : "border-border bg-card hover:border-text/20"
                      }`}
                    >
                      <p.Icon size={16} className="text-primary-300" />
                      <div className="mt-2 text-sm font-medium">{p.label}</div>
                    </button>
                  ))}
                </div>
                {pm === "card" && (
                  <>
                    {savedCards.length > 0 && (
                      <div className="space-y-2">
                        {savedCards.map((c) => (
                          <label
                            key={c.id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                              payWith === c.id
                                ? "border-primary-400 bg-primary-500/10"
                                : "border-border bg-card hover:border-text/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="paycard"
                                checked={payWith === c.id}
                                onChange={() => setPayWith(c.id)}
                                className="accent-primary-500"
                              />
                              <CreditCard
                                size={16}
                                className="text-primary-300"
                              />
                              <div>
                                <div className="text-sm font-medium">
                                  {brandLabel(c.brand)} •••• {c.last4}
                                </div>
                                <div className="text-xs text-text-2">
                                  Exp {String(c.expMonth).padStart(2, "0")}/
                                  {String(c.expYear % 100).padStart(2, "0")}
                                </div>
                              </div>
                            </div>
                            {c.isDefault && (
                              <span className="chip chip-success">
                                <Check size={11} /> Default
                              </span>
                            )}
                          </label>
                        ))}
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                            payWith === "new"
                              ? "border-primary-400 bg-primary-500/10"
                              : "border-border bg-card hover:border-text/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paycard"
                            checked={payWith === "new"}
                            onChange={() => setPayWith("new")}
                            className="accent-primary-500"
                          />
                          <span className="text-sm font-medium">
                            Use a new card
                          </span>
                        </label>
                      </div>
                    )}
                    {(savedCards.length === 0 || payWith === "new") && (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            label="Card number"
                            placeholder="4242 4242 4242 4242"
                            className="md:col-span-2"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              setCardNumber(formatCardNumber(e.target.value));
                              clearPayError("number");
                            }}
                            error={!!payErrors.number}
                            errorText={payErrors.number}
                            trailing={
                              detectBrand(cardDigits(cardNumber)) !== "card"
                                ? brandLabel(detectBrand(cardDigits(cardNumber)))
                                : undefined
                            }
                          />
                          <Input
                            label="Cardholder"
                            placeholder="Alex Vance"
                            autoComplete="cc-name"
                            value={cardHolder}
                            onChange={(e) => {
                              setCardHolder(e.target.value);
                              clearPayError("holder");
                            }}
                            error={!!payErrors.holder}
                            errorText={payErrors.holder}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="Expiry"
                              placeholder="MM / YY"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              maxLength={7}
                              value={cardExpiry}
                              onChange={(e) => {
                                setCardExpiry(formatExpiry(e.target.value));
                                clearPayError("expiry");
                              }}
                              error={!!payErrors.expiry}
                              errorText={payErrors.expiry}
                            />
                            <Input
                              label="CVC"
                              placeholder="123"
                              type="password"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              maxLength={4}
                              value={cardCvc}
                              onChange={(e) => {
                                setCardCvc(
                                  e.target.value.replace(/\D/g, "").slice(0, 4),
                                );
                                clearPayError("cvc");
                              }}
                              error={!!payErrors.cvc}
                              errorText={payErrors.cvc}
                            />
                          </div>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-2">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="accent-primary-500"
                          />
                          Save this card for next time
                        </label>
                      </>
                    )}
                    <div className="text-xs text-text-2">Powered by Stripe</div>
                  </>
                )}
                {pm === "paypal" && (
                  <>
                    <Input
                      label="PayPal email"
                      placeholder="you@email.com"
                      type="email"
                      autoComplete="email"
                      value={paypalEmail}
                      onChange={(e) => {
                        setPaypalEmail(e.target.value);
                        clearPayError("paypal");
                      }}
                      error={!!payErrors.paypal}
                      errorText={payErrors.paypal}
                    />
                    <p className="text-xs text-text-2">
                      You&apos;ll be redirected to PayPal to approve this
                      payment.
                    </p>
                  </>
                )}
                {pm === "upi" && (
                  <>
                    <Input
                      label="UPI ID"
                      placeholder="name@bank"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        clearPayError("upi");
                      }}
                      error={!!payErrors.upi}
                      errorText={payErrors.upi}
                    />
                    <p className="text-xs text-text-2">
                      You&apos;ll get a collect request in your UPI app to
                      approve this payment.
                    </p>
                  </>
                )}
                {pm === "apple" && (
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <Fingerprint
                      size={16}
                      className="shrink-0 text-primary-300"
                    />
                    <p className="text-sm text-text-2">
                      You&apos;ll confirm with Face ID or Touch ID when the
                      Apple Pay sheet opens.
                    </p>
                  </div>
                )}
              </FormSection>
            )}

            {step === 3 && (
              <FormSection title="Review your order">
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-text-2">
                  Please review your details. By completing this purchase you
                  agree to NexCart&apos;s Terms and Privacy Policy.
                </div>
              </FormSection>
            )}

            <div className="mt-8 flex justify-between">
              <button
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="btn btn-ghost btn-sm disabled:opacity-40"
              >
                Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateStep(step)) setStep((s) => s + 1);
                  }}
                  className="btn btn-primary"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={submitting}
                  className="btn btn-primary disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Placing
                      order…
                    </>
                  ) : (
                    <>Place order · {formatPrice(total)}</>
                  )}
                </button>
              )}
            </div>
          </div>

          <aside className="self-start rounded-3xl border border-border bg-card p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-widest text-text-2">
              Order summary
            </div>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-card">
                    <Image src={l.image} alt={l.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{l.name}</div>
                    <div className="text-xs text-text-2">× {l.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPrice(l.price * l.quantity)}
                  </div>
                </li>
              ))}
              {lines.length === 0 && (
                <li className="text-sm text-text-2">Your cart is empty.</li>
              )}
            </ul>
            <div className="my-4 h-px bg-card-2" />
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : formatPrice(shipping)}
              />
              <Row label="Tax" value={formatPrice(tax)} />
            </div>
            <div className="my-4 h-px bg-card-2" />
            <Row label="Total" value={formatPrice(total)} bold />

            <div className="mt-5 space-y-2 text-xs text-text-2">
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-emerald-400" /> Secure 256-bit
                encrypted checkout
              </div>
              <Link
                href="/terms"
                className="flex items-center gap-2 transition hover:text-text"
              >
                <RotateCcw size={13} className="text-emerald-400" /> Free 7-day
                returns · full refund guarantee
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 text-sm font-semibold">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({
  label,
  error,
  errorText,
  trailing,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: boolean;
  errorText?: string;
  trailing?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
        {label}
      </span>
      <span className="relative block">
        <input
          {...rest}
          aria-invalid={error || undefined}
          className={`w-full rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400/20 ${
            trailing ? "pr-20" : ""
          } ${error ? "border-rose-500/50" : "border-border"}`}
        />
        {trailing && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-text-2">
            {trailing}
          </span>
        )}
      </span>
      {error && (
        <span className="mt-1 block text-xs text-rose-300">
          {errorText ?? "This field is required"}
        </span>
      )}
    </label>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-text" : "text-text-2"}>{label}</span>
      <span className={bold ? "font-display text-lg font-semibold" : ""}>
        {value}
      </span>
    </div>
  );
}

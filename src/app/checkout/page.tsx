"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Apple,
  Check,
  CreditCard,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";

const steps = ["Address", "Shipping", "Payment", "Review"] as const;

type ShipMethod = "standard" | "express" | "sameday";

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

  const setField =
    (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAddr((a) => ({ ...a, [key]: value }));
      setErrors((er) => ({ ...er, [key]: false }));
    };

  const validateAddress = () => {
    const missing: Partial<Record<keyof Address, boolean>> = {};
    (Object.keys(addr) as (keyof Address)[]).forEach((k) => {
      if (!addr[k].trim()) missing[k] = true;
    });
    setErrors(missing);
    return Object.keys(missing).length === 0;
  };

  const validateStep = (s: number) => (s === 0 ? validateAddress() : true);

  const placeOrder = () => {
    if (submitting) return;
    if (!validateAddress()) {
      setStep(0);
      return;
    }
    const id = `NX-${Date.now().toString(36).toUpperCase()}`;
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
                      onClick={() => setPm(p.id as typeof pm)}
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        label="Card number"
                        placeholder="4242 4242 4242 4242"
                        className="md:col-span-2"
                      />
                      <Input label="Cardholder" placeholder="Alex Vance" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Expiry" placeholder="MM / YY" />
                        <Input label="CVC" placeholder="123" />
                      </div>
                    </div>
                    <div className="text-xs text-text-2">Powered by Stripe</div>
                  </>
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
                    <Image src={l.image} alt={l.name} fill className="object-cover" />
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
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: boolean;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
        {label}
      </span>
      <input
        {...rest}
        aria-invalid={error || undefined}
        className={`w-full rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400/20 ${
          error ? "border-rose-500/50" : "border-border"
        }`}
      />
      {error && (
        <span className="mt-1 block text-xs text-rose-300">
          This field is required
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
